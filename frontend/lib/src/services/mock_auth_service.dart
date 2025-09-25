class MockAuthService {
  Future<Map<String, dynamic>> login(String email, String password) async {
    // Simular delay de red
    await Future.delayed(const Duration(seconds: 2));

    print('🔐 Mock auth recibió: $email / $password');

    // Validar credenciales mock
    Map<String, dynamic>? userData;

    if (email == 'admin@consorcio.com' && password == 'admin123') {
      userData = {
        'id': '1',
        'name': 'Administrador',
        'email': 'admin@consorcio.com',
        'role': 'ADMIN',
        'buildingId': 'building_123',
        'createdAt': '2024-01-01T00:00:00.000Z', // ← Agregar
        'updatedAt': '2024-01-01T00:00:00.000Z'
      };
    } else if (email == 'residente@consorcio.com' &&
        password == 'residente123') {
      userData = {
        'id': '2',
        'name': 'Residente Ejemplo',
        'email': 'residente@consorcio.com',
        'role': 'RESIDENT',
        'buildingId': 'building_123',
        'createdAt': '2024-01-01T00:00:00.000Z', // ← Agregar
        'updatedAt': '2024-01-01T00:00:00.000Z'
      };
    } else if (email == 'mantenimiento@consorcio.com' &&
        password == 'mantenimiento123') {
      userData = {
        'id': '3',
        'name': 'Técnico Mantenimiento',
        'email': 'mantenimiento@consorcio.com',
        'role': 'MAINTENANCE',
        'buildingId': 'building_123',
        'createdAt': '2024-01-01T00:00:00.000Z', // ← Agregar
        'updatedAt': '2024-01-01T00:00:00.000Z'
      };
    }

    if (userData != null) {
      // ESTRUCTURA CORRECTA que espera AuthProvider
      return {
        'success': true,
        'message': 'Login exitoso',
        'data': {
          'accessToken':
              'mock_jwt_token_${DateTime.now().millisecondsSinceEpoch}',
          'refreshToken': 'mock_refresh_token',
          'user': userData,
        }
      };
    } else {
      throw Exception(
          'Credenciales inválidas. Usa: admin@consorcio.com/admin123, residente@consorcio.com/residente123 o mantenimiento@consorcio.com/mantenimiento123');
    }
  }

  // También actualiza el register para consistencia
  Future<Map<String, dynamic>> register(String name, String email,
      String password, String role, String? buildingId) async {
    await Future.delayed(const Duration(seconds: 2));

    return {
      'success': true,
      'message': 'Registro exitoso',
      'data': {
        'accessToken':
            'mock_jwt_token_${DateTime.now().millisecondsSinceEpoch}',
        'refreshToken': 'mock_refresh_token',
        'user': {
          'id': '${DateTime.now().millisecondsSinceEpoch}',
          'name': name,
          'email': email,
          'role': role,
          'buildingId': buildingId,
          'createdAt': DateTime.now().toIso8601String(), // ← Agregar
          'updatedAt': DateTime.now().toIso8601String(), // ← Agregar
        }
      }
    };
  }

  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    await Future.delayed(const Duration(seconds: 1));

    return {
      'success': true,
      'data': {
        'accessToken':
            'mock_refreshed_token_${DateTime.now().millisecondsSinceEpoch}',
      }
    };
  }

  Future<void> logout(String accessToken) async {
    await Future.delayed(const Duration(milliseconds: 500));
  }
}
