// lib/src/widgets/documents/document_item.dart
import 'package:flutter/material.dart';
import '../../models/document.dart';

class DocumentItem extends StatelessWidget {
  final Document document;
  final VoidCallback onDelete;

  const DocumentItem({
    super.key,
    required this.document,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      child: ListTile(
        leading: Text(
          document.fileIcon,
          style: const TextStyle(fontSize: 24),
        ),
        title: Text(
          document.fileName,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${document.fileSizeFormatted} • ${document.category}'),
            Text(
              'Subido: ${_formatDate(document.uploadDate)}',
              style: const TextStyle(fontSize: 12),
            ),
          ],
        ),
        trailing: IconButton(
          icon: const Icon(Icons.delete, color: Colors.red),
          onPressed: onDelete,
        ),
        onTap: () {
          // TODO: Implementar vista/descarga de documento
          _showDocumentOptions(context);
        },
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _showDocumentOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.download),
            title: const Text('Descargar documento'),
            onTap: () {
              Navigator.pop(context);
              // TODO: Implementar descarga
            },
          ),
          ListTile(
            leading: const Icon(Icons.preview),
            title: const Text('Vista previa'),
            onTap: () {
              Navigator.pop(context);
              // TODO: Implementar vista previa
            },
          ),
          ListTile(
            leading: const Icon(Icons.share),
            title: const Text('Compartir'),
            onTap: () {
              Navigator.pop(context);
              // TODO: Implementar compartir
            },
          ),
        ],
      ),
    );
  }
}
