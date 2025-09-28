import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';
import '../services/api_service.dart'; // USAR TU ApiService
import '../utils/constants.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService(); // USAR TU SERVICIO
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  User? _user;
  bool _isAuthenticated = false;
  bool _isLoading = true;
  String? _error;
  String _errorMessage = '';

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get errorMessage => _errorMessage;

  // ✅ CAMBIAR A FALSE PARA USAR API REAL
  static const bool useMock = false;

  Future<void> initialize() async {
    try {
      final token = await _storage.read(key: AppConstants.accessTokenKey);
      final userJson = await _storage.read(key: AppConstants.userKey);

      if (token != null && userJson != null) {
        _user = User.fromJson(jsonDecode(userJson));
        _isAuthenticated = true;

        // Verificar token válido con API real
        if (!useMock) {
          await _validateToken();
        }
      } else {
        _isAuthenticated = false;
      }
    } catch (e) {
      print('❌ Error en initialize: $e');
      await _clearAuthData();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    try {
      _setLoading(true);
      _error = null;
      _errorMessage = '';

      print('🔐 Iniciando login con: $email');

      Map<String, dynamic> response;

      if (useMock) {
        response = await _mockLogin(email, password);
      } else {
        // ✅ USAR TU ApiService PARA LOGIN REAL
        response = await _realLogin(email, password);
      }

      print('📨 Respuesta recibida: $response');

      // ✅ ADAPTAR A LA ESTRUCTURA DE TU BACKEND
      if (response['access_token'] == null && response['accessToken'] == null) {
        throw Exception('No se recibió token de acceso');
      }

      if (response['user'] == null) {
        throw Exception('No se recibieron datos de usuario');
      }

      await _saveAuthData(response);
      _user = User.fromJson(response['user']);
      _isAuthenticated = true;
      _errorMessage = '';

      print('✅ Login exitoso: ${_user?.email}');
      notifyListeners();
    } catch (e) {
      _handleError(e);
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  // ✅ LOGIN REAL CON TU BACKEND
  Future<Map<String, dynamic>> _realLogin(String email, String password) async {
    try {
      final response = await _apiService.post('/auth/login', {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data;
      } else {
        throw Exception('Error ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      print('❌ Error en _realLogin: $e');
      rethrow;
    }
  }

  // ✅ MÉTODO MOCK (para testing)
  Future<Map<String, dynamic>> _mockLogin(String email, String password) async {
    await Future.delayed(const Duration(seconds: 2));

    if (email != 'admin@consorcio.com' && email != 'residente@consorcio.com') {
      throw Exception('Credenciales inválidas');
    }

    return {
      'access_token': 'mock_jwt_token_${DateTime.now().millisecondsSinceEpoch}',
      'user': {
        'id': 'user_${email.split('@')[0]}',
        'name': email.contains('admin') ? 'Administrador' : 'Residente',
        'email': email,
        'role': email.contains('admin') ? 'ADMIN' : 'RESIDENT',
        'buildingId': 'building_1',
        'isActive': true,
        'createdAt': DateTime.now().toIso8601String(),
      }
    };
  }

  Future<void> register(String name, String email, String password, String role,
      String? buildingId) async {
    try {
      _setLoading(true);
      _error = null;
      _errorMessage = '';

      Map<String, dynamic> response;

      if (useMock) {
        response = await _mockRegister(name, email, password, role, buildingId);
      } else {
        response = await _realRegister(name, email, password, role, buildingId);
      }

      if ((response['access_token'] == null &&
              response['accessToken'] == null) ||
          response['user'] == null) {
        throw Exception('Respuesta inválida del servidor');
      }

      await _saveAuthData(response);
      _user = User.fromJson(response['user']);
      _isAuthenticated = true;
      _errorMessage = '';
      notifyListeners();
    } catch (e) {
      _handleError(e);
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  // ✅ REGISTER REAL CON TU BACKEND
  Future<Map<String, dynamic>> _realRegister(String name, String email,
      String password, String role, String? buildingId) async {
    try {
      final response = await _apiService.post('/auth/register', {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
        'buildingId': buildingId,
      });

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data;
      } else {
        throw Exception('Error ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      print('❌ Error en _realRegister: $e');
      rethrow;
    }
  }

  // ✅ MÉTODO MOCK (para testing)
  Future<Map<String, dynamic>> _mockRegister(String name, String email,
      String password, String role, String? buildingId) async {
    await Future.delayed(const Duration(seconds: 2));

    return {
      'access_token':
          'mock_jwt_token_register_${DateTime.now().millisecondsSinceEpoch}',
      'user': {
        'id': 'user_${DateTime.now().millisecondsSinceEpoch}',
        'name': name,
        'email': email,
        'role': role,
        'buildingId': buildingId ?? 'building_1',
        'isActive': true,
        'createdAt': DateTime.now().toIso8601String(),
      }
    };
  }

  Future<void> logout() async {
    try {
      if (!useMock) {
        await _apiService.post('/auth/logout', {});
      }
    } catch (e) {
      print('⚠️ Error en logout: $e');
    } finally {
      await _clearAuthData();
    }
  }

  Future<void> _validateToken() async {
    try {
      if (!useMock) {
        final response = await _apiService.get('/auth/me');
        if (response.statusCode == 200) {
          final userData = jsonDecode(response.body);
          _user = User.fromJson(userData);
          await _storage.write(
              key: AppConstants.userKey, value: jsonEncode(userData));
        } else {
          throw Exception('Token inválido');
        }
      }
    } catch (e) {
      print('⚠️ Error validando token: $e');
      await _clearAuthData();
    }
  }

  // ✅ MÉTODO AUXILIAR: Guardar datos de autenticación
  Future<void> _saveAuthData(Map<String, dynamic> authData) async {
    final token = authData['access_token'] ?? authData['accessToken'];
    final user = authData['user'];

    if (token != null) {
      await _storage.write(key: AppConstants.accessTokenKey, value: token);
    }

    if (user != null) {
      await _storage.write(key: AppConstants.userKey, value: jsonEncode(user));
    }

    final refreshToken = authData['refresh_token'] ?? authData['refreshToken'];
    if (refreshToken != null) {
      await _storage.write(
          key: AppConstants.refreshTokenKey, value: refreshToken);
    }
  }

  Future<void> _clearAuthData() async {
    await _storage.deleteAll();
    _user = null;
    _isAuthenticated = false;
    _error = null;
    _errorMessage = '';
    notifyListeners();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _handleError(dynamic e) {
    _error = e.toString().replaceAll('Exception: ', '');
    _errorMessage = e.toString().replaceAll('Exception: ', '');
    print('❌ Error de autenticación: $_errorMessage');
    notifyListeners();
  }

  void clearError() {
    _error = null;
    _errorMessage = '';
    notifyListeners();
  }
}
