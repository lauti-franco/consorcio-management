// lib/src/models/document.dart
class Document {
  final int id;
  final String fileName;
  final String fileType;
  final int fileSize;
  final DateTime uploadDate;
  final String category;
  final int consorcioId;
  final List<String> tags;
  final String? downloadUrl;
  final String? previewUrl;

  Document({
    required this.id,
    required this.fileName,
    required this.fileType,
    required this.fileSize,
    required this.uploadDate,
    required this.category,
    required this.consorcioId,
    required this.tags,
    this.downloadUrl,
    this.previewUrl,
  });

  factory Document.fromJson(Map<String, dynamic> json) {
    return Document(
      id: json['id'] ?? 0,
      fileName: json['fileName'] ?? '',
      fileType: json['fileType'] ?? '',
      fileSize: json['fileSize'] ?? 0,
      uploadDate: json['uploadDate'] != null
          ? DateTime.parse(json['uploadDate'])
          : DateTime.now(),
      category: json['category'] ?? 'general',
      consorcioId: json['consorcioId'] ?? 0,
      tags: List<String>.from(json['tags'] ?? []),
      downloadUrl: json['downloadUrl'],
      previewUrl: json['previewUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fileName': fileName,
      'fileType': fileType,
      'fileSize': fileSize,
      'uploadDate': uploadDate.toIso8601String(),
      'category': category,
      'consorcioId': consorcioId,
      'tags': tags,
      'downloadUrl': downloadUrl,
      'previewUrl': previewUrl,
    };
  }

  String get fileSizeFormatted {
    if (fileSize < 1024) return '$fileSize B';
    if (fileSize < 1048576) return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    return '${(fileSize / 1048576).toStringAsFixed(1)} MB';
  }

  String get fileIcon {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'zip':
      case 'rar':
        return '📦';
      default:
        return '📎';
    }
  }

  bool get isImage {
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp']
        .contains(fileType.toLowerCase());
  }

  bool get isPdf {
    return fileType.toLowerCase() == 'pdf';
  }
}
