// lib/src/widgets/documents/document_upload.dart
import 'dart:io'; // ✅ Agregar este import para File
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import '../../providers/documents_provider.dart';

class DocumentUpload extends StatefulWidget {
  final int consorcioId;

  const DocumentUpload({super.key, required this.consorcioId});

  @override
  State<DocumentUpload> createState() => _DocumentUploadState();
}

class _DocumentUploadState extends State<DocumentUpload> {
  PlatformFile? _selectedFile;
  String _category = 'general';
  final List<String> _categories = [
    'general',
    'facturas',
    'contratos',
    'reglamentos',
    'asambleas',
    'presupuestos'
  ];

  Future<void> _pickFile() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: [
          'pdf',
          'doc',
          'docx',
          'xls',
          'xlsx',
          'jpg',
          'jpeg',
          'png'
        ],
      );

      if (result != null && result.files.isNotEmpty) {
        setState(() {
          _selectedFile = result.files.first;
        });
      }
    } catch (e) {
      _showError('Error al seleccionar archivo: $e');
    }
  }

  Future<void> _uploadFile() async {
    if (_selectedFile == null) return;

    final documentsProvider =
        Provider.of<DocumentsProvider>(context, listen: false);

    // ✅ File ahora está disponible por el import
    final success = await documentsProvider.uploadDocument(
      file: File(_selectedFile!.path!),
      consorcioId: widget.consorcioId,
      category: _category,
    );

    if (success && context.mounted) {
      _showSuccess('Documento subido exitosamente');
      setState(() {
        _selectedFile = null;
      });
    } else if (context.mounted) {
      _showError('Error al subir documento');
    }
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Subir Documento',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),

            // Selector de categoría - CORREGIDO
            DropdownButtonFormField<String>(
              value: _category,
              // ✅ Corregido: usar initialValue en lugar de value
              onChanged: (String? newValue) {
                setState(() {
                  _category = newValue!;
                });
              },
              items: _categories.map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(value),
                );
              }).toList(),
              decoration: const InputDecoration(
                labelText: 'Categoría',
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 16),

            // Selector de archivo
            OutlinedButton(
              onPressed: _pickFile,
              child: const Text('Seleccionar Archivo'),
            ),

            if (_selectedFile != null) ...[
              const SizedBox(height: 16),
              Text(
                'Archivo seleccionado: ${_selectedFile!.name}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Text('Tamaño: ${_formatFileSize(_selectedFile!.size)}'),
              const SizedBox(height: 16),
              Consumer<DocumentsProvider>(
                builder: (context, documentsProvider, child) {
                  return ElevatedButton(
                    onPressed: documentsProvider.loading ? null : _uploadFile,
                    child: documentsProvider.loading
                        ? const CircularProgressIndicator()
                        : const Text('Subir Documento'),
                  );
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatFileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1048576) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '${(bytes / 1048576).toStringAsFixed(1)} MB';
  }
}
