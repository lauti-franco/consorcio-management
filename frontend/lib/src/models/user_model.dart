class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? buildingId;
  final String? phone; // ← AÑADIR campo del schema
  final String? avatar; // ← AÑADIR campo del schema
  final bool isActive; // ← AÑADIR campo del schema
  final DateTime? createdAt;
  final DateTime? updatedAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.buildingId,
    this.phone, // ← Nuevo campo
    this.avatar, // ← Nuevo campo
    this.isActive = true, // ← Valor por defecto
    this.createdAt,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'RESIDENT', // ← Cambiar valor por defecto
      buildingId: json['buildingId']?.toString(),
      phone: json['phone']?.toString(), // ← Nuevo campo
      avatar: json['avatar']?.toString(), // ← Nuevo campo
      isActive: json['isActive'] ?? true, // ← Nuevo campo
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'])
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
      'phone': phone, // ← Nuevo campo
      'avatar': avatar, // ← Nuevo campo
      'isActive': isActive, // ← Nuevo campo
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  // ✅ GETTERS para verificación de roles
  bool get isAdmin => role.toUpperCase() == 'ADMIN';
  bool get isMaintenance => role.toUpperCase() == 'MAINTENANCE';
  bool get isResident => role.toUpperCase() == 'RESIDENT';
  bool get isSuperAdmin => role.toUpperCase() == 'SUPER_ADMIN';

  // ✅ MÉTODO para mostrar nombre del rol
  String get roleName {
    switch (role.toUpperCase()) {
      case 'SUPER_ADMIN':
        return 'Super Administrador';
      case 'ADMIN':
        return 'Administrador';
      case 'MAINTENANCE':
        return 'Mantenimiento';
      case 'RESIDENT':
        return 'Residente';
      default:
        return 'Usuario';
    }
  }

  // ✅ MÉTODO COPY-WITH para actualizaciones
  User copyWith({
    String? id,
    String? name,
    String? email,
    String? role,
    String? buildingId,
    String? phone,
    String? avatar,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      buildingId: buildingId ?? this.buildingId,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  String toString() {
    return 'User(id: $id, name: $name, email: $email, role: $role, buildingId: $buildingId)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is User && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
