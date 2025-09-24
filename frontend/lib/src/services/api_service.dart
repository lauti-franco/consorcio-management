import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/constants.dart';

class ApiService {
  static const String baseUrl = AppConstants.apiBaseUrl;
  final FlutterSecureStorage storage = const FlutterSecureStorage();

  // Resto del código igual...
  Future<Map<String, String>> _getHeaders() async {
    final token = await storage.read(key: AppConstants.accessTokenKey);
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<http.Response> get(String endpoint) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );

    return _handleResponse(response, () => get(endpoint));
  }

  Future<http.Response> post(String endpoint, dynamic data) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(data),
    );

    return _handleResponse(response, () => post(endpoint, data));
  }

  Future<http.Response> put(String endpoint, dynamic data) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(data),
    );

    return _handleResponse(response, () => put(endpoint, data));
  }

  Future<http.Response> delete(String endpoint) async {
    final headers = await _getHeaders();
    final response = await http.delete(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );

    return _handleResponse(response, () => delete(endpoint));
  }

  Future<http.Response> _handleResponse(
    http.Response response,
    Future<http.Response> Function() retryRequest,
  ) async {
    if (response.statusCode == 401) {
      final refreshSuccess = await _refreshToken();
      if (refreshSuccess) {
        return retryRequest();
      } else {
        throw Exception('Authentication failed');
      }
    }

    if (response.statusCode >= 400) {
      throw HttpException(
        'HTTP ${response.statusCode}: ${response.reasonPhrase}',
      );
    }

    return response;
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken =
          await storage.read(key: AppConstants.refreshTokenKey);
      if (refreshToken == null) return false;

      final response = await http.post(
        Uri.parse('$baseUrl${ApiEndpoints.refresh}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': refreshToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await storage.write(
            key: AppConstants.accessTokenKey, value: data['accessToken']);
        await storage.write(
            key: AppConstants.refreshTokenKey, value: data['refreshToken']);
        return true;
      } else {
        await storage.deleteAll();
        return false;
      }
    } catch (e) {
      await storage.deleteAll();
      return false;
    }
  }
}

class HttpException implements Exception {
  final String message;

  HttpException(this.message);

  @override
  String toString() => 'HttpException: $message';
}
