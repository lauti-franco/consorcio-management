// lib/src/widgets/documents/document_list.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/documents_provider.dart';
import '../../models/document.dart';
import 'document_item.dart';

class DocumentList extends StatelessWidget {
  final int? consorcioId;

  const DocumentList({super.key, this.consorcioId});

  @override
  Widget build(BuildContext context) {
    return Consumer<DocumentsProvider>(
      builder: (context, documentsProvider, child) {
        // ✅ Null-safety corregido
        if (documentsProvider.loading) {
          return const Center(child: CircularProgressIndicator());
        }

        if (documentsProvider.error != null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Error: ${documentsProvider.error}'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () =>
                      documentsProvider.loadDocuments(consorcioId: consorcioId),
                  child: const Text('Reintentar'),
                ),
              ],
            ),
          );
        }

        final documents = documentsProvider.documents;

        if (documents.isEmpty) {
          return const Center(
            child: Text(
              'No hay documentos disponibles',
              style: TextStyle(color: Colors.grey),
            ),
          );
        }

        return ListView.builder(
          itemCount: documents.length,
          itemBuilder: (context, index) {
            final document = documents[index];
            return DocumentItem(
              document: document,
              onDelete: () => _deleteDocument(context, document),
            );
          },
        );
      },
    );
  }

  Future<void> _deleteDocument(BuildContext context, Document document) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Eliminar Documento'),
        content: Text('¿Estás seguro de eliminar ${document.fileName}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      // ✅ Null-safety corregido
      final documentsProvider =
          Provider.of<DocumentsProvider>(context, listen: false);
      final success = await documentsProvider.deleteDocument(document.id);

      if (success && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Documento eliminado')),
        );
      }
    }
  }
}
