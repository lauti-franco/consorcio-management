class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? buildingId;
  final DateTime? createdAt; // ← Hacer nullable
  final DateTime? updatedAt; // ← Hacer nullable

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.buildingId,
    this.createdAt, // ← Ahora nullable
    this.updatedAt, // ← Ahora nullable
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '', // ← Manejar null
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'USER',
      buildingId: json['buildingId']?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) // ← Usar tryParse
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt']) // ← Usar tryParse
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'buildingId': buildingId,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  bool get isAdmin => role == 'ADMIN';
  bool get isMaintenance => role == 'MAINTENANCE';
  bool get isResident => role == 'RESIDENT';
}
