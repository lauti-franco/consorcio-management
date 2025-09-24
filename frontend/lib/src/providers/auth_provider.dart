import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';
import '../utils/constants.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  User? _user;
  bool _isAuthenticated = false;
  bool _isLoading = true;
  String? _error;

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> initialize() async {
    try {
      final token = await _storage.read(key: AppConstants.accessTokenKey);
      final userJson = await _storage.read(key: AppConstants.userKey);

      if (token != null && userJson != null) {
        _user = User.fromJson(jsonDecode(userJson));
        _isAuthenticated = true;

        // Verificar token válido
        await _validateToken();
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

      final response = await _authService.login(email, password);

      await _storage.write(
          key: AppConstants.accessTokenKey, value: response['accessToken']);
      await _storage.write(
          key: AppConstants.refreshTokenKey, value: response['refreshToken']);
      await _storage.write(
          key: AppConstants.userKey, value: jsonEncode(response['user']));

      _user = User.fromJson(response['user']);
      _isAuthenticated = true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
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

      final response =
          await _authService.register(name, email, password, role, buildingId);

      await _storage.write(
          key: AppConstants.accessTokenKey, value: response['accessToken']);
      await _storage.write(
          key: AppConstants.refreshTokenKey, value: response['refreshToken']);
      await _storage.write(
          key: AppConstants.userKey, value: jsonEncode(response['user']));

      _user = User.fromJson(response['user']);
      _isAuthenticated = true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    try {
      final token = await _storage.read(key: AppConstants.accessTokenKey);
      if (token != null) {
        await _authService.logout(token);
      }
    } catch (e) {
      // Ignorar errores en logout
    } finally {
      await _clearAuthData();
    }
  }

  Future<void> _validateToken() async {
    try {
      final refreshToken =
          await _storage.read(key: AppConstants.refreshTokenKey);
      if (refreshToken != null) {
        await _authService.refreshToken(refreshToken);
      }
    } catch (e) {
      await _clearAuthData();
    }
  }

  Future<void> _clearAuthData() async {
    await _storage.deleteAll();
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
