import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';
import '../services/mock_auth_service.dart';
import '../utils/constants.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final MockAuthService _mockAuthService = MockAuthService();
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

  // Cambiar a false cuando quieras usar la API real
  static const bool useMock = true;

  Future<void> initialize() async {
    try {
      final token = await _storage.read(key: AppConstants.accessTokenKey);
      final userJson = await _storage.read(key: AppConstants.userKey);

      if (token != null && userJson != null) {
        _user = User.fromJson(jsonDecode(userJson));
        _isAuthenticated = true;

        // Verificar token válido
        await _validateToken();
      } else {
        _isAuthenticated = false;
      }
    } catch (e) {
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
        response = await _mockAuthService.login(email, password);
      } else {
        response = await _authService.login(email, password);
      }

      print('📨 Respuesta recibida: $response');

      // ✅ VERIFICACIÓN CORREGIDA para ambas estructuras
      Map<String, dynamic> authData;

      if (useMock) {
        // Para MOCK: los datos están dentro de 'data'
        if (response['data'] == null) {
          throw Exception(
              'Respuesta inválida del servidor - No hay campo data');
        }
        authData = response['data'];
      } else {
        // Para REAL: los datos están en el root
        authData = response;
      }

      // ✅ Ahora verificar con la estructura correcta
      if (authData['accessToken'] == null) {
        throw Exception('Respuesta inválida del servidor - No hay accessToken');
      }

      if (authData['user'] == null) {
        throw Exception('Respuesta inválida del servidor - No hay user');
      }

      await _storage.write(
          key: AppConstants.accessTokenKey, value: authData['accessToken']);
      await _storage.write(
          key: AppConstants.refreshTokenKey,
          value: authData['refreshToken'] ?? '');
      await _storage.write(
          key: AppConstants.userKey, value: jsonEncode(authData['user']));

      _user = User.fromJson(authData['user']);
      _isAuthenticated = true;
      _errorMessage = '';

      print('✅ Login exitoso: ${_user?.email}');
      notifyListeners();
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      print('❌ Error en login: $_errorMessage');
      notifyListeners();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> register(String name, String email, String password, String role,
      String? buildingId) async {
    try {
      _setLoading(true);
      _error = null;
      _errorMessage = '';

      Map<String, dynamic> response;

      if (useMock) {
        response = await _mockAuthService.register(
            name, email, password, role, buildingId);
      } else {
        response = await _authService.register(
            name, email, password, role, buildingId);
      }

      // ✅ Misma lógica corregida
      Map<String, dynamic> authData = useMock ? response['data'] : response;

      if (authData['accessToken'] == null || authData['user'] == null) {
        throw Exception('Respuesta inválida del servidor');
      }

      await _storage.write(
          key: AppConstants.accessTokenKey, value: authData['accessToken']);
      await _storage.write(
          key: AppConstants.refreshTokenKey,
          value: authData['refreshToken'] ?? '');
      await _storage.write(
          key: AppConstants.userKey, value: jsonEncode(authData['user']));

      _user = User.fromJson(authData['user']);
      _isAuthenticated = true;
      _errorMessage = '';
      notifyListeners();
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    try {
      final token = await _storage.read(key: AppConstants.accessTokenKey);
      if (token != null) {
        if (useMock) {
          await _mockAuthService.logout(token);
        } else {
          await _authService.logout(token);
        }
      }
    } catch (e) {
      // Ignorar errores en logout
      print('⚠️ Error en logout: $e');
    } finally {
      await _clearAuthData();
    }
  }

  Future<void> _validateToken() async {
    try {
      final refreshToken =
          await _storage.read(key: AppConstants.refreshTokenKey);
      if (refreshToken != null) {
        Map<String, dynamic> response;

        if (useMock) {
          response = await _mockAuthService.refreshToken(refreshToken);
        } else {
          response = await _authService.refreshToken(refreshToken);
        }

        // ✅ Misma lógica corregida
        Map<String, dynamic> authData = useMock ? response['data'] : response;

        if (authData['accessToken'] != null) {
          await _storage.write(
              key: AppConstants.accessTokenKey, value: authData['accessToken']);
        }
      }
    } catch (e) {
      print('⚠️ Error validando token: $e');
      await _clearAuthData();
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

  void clearError() {
    _error = null;
    _errorMessage = '';
    notifyListeners();
  }

  // Método para cambiar entre mock y real sin reiniciar la app
  void toggleMockMode(bool useMockMode) {
    // Note: necesitarías reiniciar la app para que este cambio tome efecto completamente
    print('🔁 Modo mock: $useMockMode');
  }
}
