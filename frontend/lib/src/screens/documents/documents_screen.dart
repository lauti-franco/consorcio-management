// lib/src/screens/documents/documents_screen.dart
import 'package:flutter/material.dart';

import '../../widgets/documents/document_upload.dart';
import '../../widgets/documents/document_list.dart';

class DocumentsScreen extends StatelessWidget {
  final int? consorcioId;

  const DocumentsScreen({super.key, this.consorcioId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de Documentos'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Sección de subida
            DocumentUpload(
                consorcioId:
                    consorcioId ?? 1), // TODO: Obtener consorcioId real
            const SizedBox(height: 24),

            // Título de lista
            const Text(
              'Documentos Existentes',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),

            // Lista de documentos
            Expanded(
              child: DocumentList(consorcioId: consorcioId),
            ),
          ],
        ),
      ),
    );
  }
}
