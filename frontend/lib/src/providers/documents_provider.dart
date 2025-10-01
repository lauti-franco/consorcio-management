// lib/src/providers/documents_provider.dart
import 'dart:io';
import 'package:flutter/foundation.dart';
import '../models/document.dart';
import '../services/document_service.dart';

class DocumentsProvider with ChangeNotifier {
  List<Document> _documents = [];
  bool _loading = false;
  String? _error;
  String? _currentCategory;
  int? _currentConsorcioId;

  List<Document> get documents => _documents;
  bool get loading => _loading;
  String? get error => _error;
  String? get currentCategory => _currentCategory;
  int? get currentConsorcioId => _currentConsorcioId;

  Future<void> loadDocuments({
    int? consorcioId,
    String? category,
    bool forceRefresh = false,
  }) async {
    if (!forceRefresh && _loading) return;

    _loading = true;
    _error = null;
    _currentConsorcioId = consorcioId;
    _currentCategory = category;
    notifyListeners();

    try {
      if (category != null && category.isNotEmpty) {
        _documents = await DocumentService.getDocumentsByCategory(
          category,
          consorcioId: consorcioId,
        );
      } else {
        _documents =
            await DocumentService.getDocuments(consorcioId: consorcioId);
      }
    } catch (e) {
      _error = 'Error al cargar documentos';
      if (kDebugMode) {
        print('Error loading documents: $e');
      }
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> uploadDocument({
    required File file, // ✅ File ahora está importado
    required int consorcioId,
    String category = 'general',
    List<String> tags = const [],
  }) async {
    _loading = true;
    notifyListeners();

    final success = await DocumentService.uploadDocument(
      file: file,
      consorcioId: consorcioId,
      category: category,
      tags: tags,
    );

    if (success) {
      await loadDocuments(
        consorcioId: _currentConsorcioId ?? consorcioId,
        category: _currentCategory,
        forceRefresh: true,
      );
    } else {
      _error = 'Error al subir el documento';
    }

    _loading = false;
    notifyListeners();
    return success;
  }

  Future<bool> deleteDocument(int documentId) async {
    final success = await DocumentService.deleteDocument(documentId);

    if (success) {
      _documents.removeWhere((doc) => doc.id == documentId);
      notifyListeners();
    }

    return success;
  }

  Future<void> searchDocuments(String query) async {
    if (query.isEmpty) {
      await loadDocuments(
        consorcioId: _currentConsorcioId,
        category: _currentCategory,
      );
      return;
    }

    _loading = true;
    notifyListeners();

    try {
      _documents = await DocumentService.searchDocuments(
        query,
        category: _currentCategory,
        consorcioId: _currentConsorcioId,
      );
    } catch (e) {
      _error = 'Error al buscar documentos';
      if (kDebugMode) {
        print('Error searching documents: $e');
      }
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  Future<void> refresh() async {
    await loadDocuments(
      consorcioId: _currentConsorcioId,
      category: _currentCategory,
      forceRefresh: true,
    );
  }
}
