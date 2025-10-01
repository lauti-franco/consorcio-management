// lib/src/services/document_service.dart
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../models/document.dart';
import 'api_service.dart';
import '../utils/constants.dart';

class DocumentService {
  static const String _baseEndpoint = '/documents';

  static Future<bool> uploadDocument({
    required File file,
    required int consorcioId,
    String category = 'general',
    List<String> tags = const [],
  }) async {
    try {
      final ApiService api = ApiService();

      final fileBytes = await file.readAsBytes();
      final fileName = file.path.split('/').last;

      final request = http.MultipartRequest(
        'POST',
        Uri.parse('${ApiService.baseUrl}$_baseEndpoint/upload'),
      );

      request.files.add(http.MultipartFile.fromBytes(
        'file',
        fileBytes,
        filename: fileName,
      ));

      request.fields['consorcioId'] = consorcioId.toString();
      request.fields['category'] = category;
      if (tags.isNotEmpty) {
        request.fields['tags'] = tags.join(',');
      }

      final token = await api.storage.read(key: AppConstants.accessTokenKey);
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      // ✅ Reemplazar print por debugPrint para producción
      debugPrint('❌ Error uploading document: $e');
      return false;
    }
  }

  static Future<List<Document>> getDocuments({int? consorcioId}) async {
    try {
      final ApiService api = ApiService();
      final endpoint = consorcioId != null
          ? '$_baseEndpoint?consorcioId=$consorcioId'
          : _baseEndpoint;

      final response = await api.get(endpoint);
      final data = ApiResponse.parseList(response);

      return data.map((json) => Document.fromJson(json)).toList();
    } catch (e) {
      debugPrint('❌ Error fetching documents: $e');
      return [];
    }
  }

  static Future<http.Response> downloadDocument(int documentId) async {
    final ApiService api = ApiService();
    return await api.get('$_baseEndpoint/$documentId/download');
  }

  static Future<bool> deleteDocument(int documentId) async {
    try {
      final ApiService api = ApiService();
      final response = await api.delete('$_baseEndpoint/$documentId');
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('❌ Error deleting document: $e');
      return false;
    }
  }

  static Future<List<Document>> searchDocuments(
    String query, {
    String? category,
    int? consorcioId,
  }) async {
    try {
      final ApiService api = ApiService();
      final params = ['query=$query'];

      if (category != null) params.add('category=$category');
      if (consorcioId != null) params.add('consorcioId=$consorcioId');

      final endpoint = '$_baseEndpoint/search?${params.join('&')}';
      final response = await api.get(endpoint);
      final data = ApiResponse.parseList(response);

      return data.map((json) => Document.fromJson(json)).toList();
    } catch (e) {
      debugPrint('❌ Error searching documents: $e');
      return [];
    }
  }

  static Future<List<Document>> getDocumentsByCategory(
    String category, {
    int? consorcioId,
  }) async {
    try {
      final ApiService api = ApiService();
      final endpoint = consorcioId != null
          ? '$_baseEndpoint/category/$category?consorcioId=$consorcioId'
          : '$_baseEndpoint/category/$category';

      final response = await api.get(endpoint);
      final data = ApiResponse.parseList(response);

      return data.map((json) => Document.fromJson(json)).toList();
    } catch (e) {
      debugPrint('❌ Error fetching documents by category: $e');
      return [];
    }
  }
}
