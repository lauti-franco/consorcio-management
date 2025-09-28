import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/constants.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  static String get baseUrl => AppConstants.apiBaseUrl;
  final FlutterSecureStorage storage = const FlutterSecureStorage();

  // ✅ AÑADIR método init
  static Future<void> init() async {
    // Inicialización si es necesaria - puede estar vacío
    if (kDebugMode) {
      print('🔄 ApiService inicializado - Base URL: $baseUrl');
    }
  }

  // ✅ CORREGIR método _getHeaders
  Future<Map<String, String>> _getHeaders() async {
    final token = await storage.read(key: AppConstants.accessTokenKey);
    final headers = {
      'Content-Type': 'application/json',
    };

    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  // ✅ MÉTODOS HTTP MEJORADOS
  Future<http.Response> get(String endpoint) async {
    try {
      final headers = await _getHeaders();
      final response = await http
          .get(
            Uri.parse('$baseUrl$endpoint'),
            headers: headers,
          )
          .timeout(
            const Duration(seconds: 15),
            onTimeout: () => http.Response('Timeout', 408),
          );

      return _handleResponse(response, () => get(endpoint));
    } catch (e) {
      if (kDebugMode) {
        print('❌ GET Error: $e');
      }
      rethrow;
    }
  }

  Future<http.Response> post(String endpoint, dynamic data) async {
    try {
      final headers = await _getHeaders();
      final response = await http
          .post(
            Uri.parse('$baseUrl$endpoint'),
            headers: headers,
            body: jsonEncode(data),
          )
          .timeout(
            const Duration(seconds: 15),
            onTimeout: () => http.Response('Timeout', 408),
          );

      return _handleResponse(response, () => post(endpoint, data));
    } catch (e) {
      if (kDebugMode) {
        print('❌ POST Error: $e');
      }
      rethrow;
    }
  }

  Future<http.Response> put(String endpoint, dynamic data) async {
    try {
      final headers = await _getHeaders();
      final response = await http
          .put(
            Uri.parse('$baseUrl$endpoint'),
            headers: headers,
            body: jsonEncode(data),
          )
          .timeout(
            const Duration(seconds: 15),
            onTimeout: () => http.Response('Timeout', 408),
          );

      return _handleResponse(response, () => put(endpoint, data));
    } catch (e) {
      if (kDebugMode) {
        print('❌ PUT Error: $e');
      }
      rethrow;
    }
  }

  Future<http.Response> delete(String endpoint) async {
    try {
      final headers = await _getHeaders();
      final response = await http
          .delete(
            Uri.parse('$baseUrl$endpoint'),
            headers: headers,
          )
          .timeout(
            const Duration(seconds: 15),
            onTimeout: () => http.Response('Timeout', 408),
          );

      return _handleResponse(response, () => delete(endpoint));
    } catch (e) {
      if (kDebugMode) {
        print('❌ DELETE Error: $e');
      }
      rethrow;
    }
  }

  // ✅ MANEJO DE RESPUESTAS MEJORADO
  Future<http.Response> _handleResponse(
    http.Response response,
    Future<http.Response> Function() retryRequest,
  ) async {
    if (kDebugMode) {
      print('📡 HTTP ${response.statusCode} - ${response.request?.url}');
    }

    switch (response.statusCode) {
      case 200:
      case 201:
        return response;

      case 401:
        final refreshSuccess = await _refreshToken();
        if (refreshSuccess) {
          return retryRequest();
        } else {
          throw HttpException('Authentication failed - Please login again');
        }

      case 400:
        throw HttpException('Bad Request: ${_extractErrorMessage(response)}');

      case 403:
        throw HttpException('Forbidden: Access denied');

      case 404:
        throw HttpException('Not Found: ${response.request?.url}');

      case 408:
        throw HttpException('Request timeout');

      case 500:
        throw HttpException('Server Error: ${_extractErrorMessage(response)}');

      default:
        throw HttpException(
            'HTTP ${response.statusCode}: ${response.reasonPhrase}');
    }
  }

  // ✅ MÉTODO PARA EXTRAER MENSAJES DE ERROR
  String _extractErrorMessage(http.Response response) {
    try {
      final data = jsonDecode(response.body);
      return data['message'] ?? data['error'] ?? response.body;
    } catch (e) {
      return response.body;
    }
  }

  // ✅ REFRESH TOKEN MEJORADO
  Future<bool> _refreshToken() async {
    try {
      final refreshToken =
          await storage.read(key: AppConstants.refreshTokenKey);
      if (refreshToken == null) return false;

      final response = await http
          .post(
            Uri.parse('$baseUrl${ApiEndpoints.refresh}'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'refreshToken': refreshToken}),
          )
          .timeout(
            const Duration(seconds: 10),
            onTimeout: () => http.Response('Timeout', 408),
          );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await storage.write(
          key: AppConstants.accessTokenKey,
          value: data['access_token'] ?? data['accessToken'],
        );

        if (data['refresh_token'] != null || data['refreshToken'] != null) {
          await storage.write(
            key: AppConstants.refreshTokenKey,
            value: data['refresh_token'] ?? data['refreshToken'],
          );
        }

        if (kDebugMode) {
          print('🔄 Token refreshed successfully');
        }
        return true;
      } else {
        await storage.deleteAll();
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Token refresh error: $e');
      }
      await storage.deleteAll();
      return false;
    }
  }

  // ✅ MÉTODO PARA VERIFICAR CONEXIÓN
  Future<bool> checkConnection() async {
    try {
      final response = await http
          .get(
            Uri.parse('$baseUrl${ApiEndpoints.auth}'),
          )
          .timeout(const Duration(seconds: 5));

      return response.statusCode < 400;
    } catch (e) {
      return false;
    }
  }

  // ✅ MÉTODO PARA LIMPIAR TOKENS
  Future<void> clearTokens() async {
    await storage.delete(key: AppConstants.accessTokenKey);
    await storage.delete(key: AppConstants.refreshTokenKey);
  }
}

class HttpException implements Exception {
  final String message;

  HttpException(this.message);

  @override
  String toString() => 'HttpException: $message';
}

// ✅ CLASE HELPER PARA MANEJO FÁCIL DE RESPUESTAS
class ApiResponse {
  static dynamic parse(http.Response response) {
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw HttpException('Failed to parse response: ${response.statusCode}');
    }
  }

  static List<dynamic> parseList(http.Response response) {
    final data = parse(response);
    return data is List ? data : [data];
  }

  static Map<String, dynamic> parseObject(http.Response response) {
    final data = parse(response);
    return data is Map<String, dynamic> ? data : {'data': data};
  }
}
