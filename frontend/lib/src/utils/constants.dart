import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

class AppConstants {
  static const String appName = 'Consorcio Management';

  // ✅ CONFIGURACIÓN MEJORADA PARA DIFERENTES ENTORNOS
  static String get apiBaseUrl {
    if (kIsWeb) {
      // Para web - usar localhost o dominio real
      return 'http://localhost:3000/api';
    } else if (Platform.isAndroid) {
      // Para Android emulador
      return 'http://10.0.2.2:3000/api';
    } else if (Platform.isIOS) {
      // Para iOS simulator
      return 'http://localhost:3000/api';
    } else {
      // Para dispositivos reales - usar IP real del servidor
      return 'http://192.168.1.100:3000/api'; // ← CAMBIAR POR TU IP
    }
  }

  // Timeouts
  static const int connectTimeout = 15000;
  static const int receiveTimeout = 15000;

  // ✅ STORAGE KEYS - MANTENER COMPATIBILIDAD
  static const String accessTokenKey = 'accessToken';
  static const String refreshTokenKey = 'refreshToken';
  static const String userKey = 'user';
  static const String themeKey = 'theme';
  static const String currentBuildingKey = 'currentBuilding'; // ← AÑADIR

  // Date formats
  static const String dateFormat = 'dd/MM/yyyy';
  static const String dateTimeFormat = 'dd/MM/yyyy HH:mm';
  static const String apiDateFormat = 'yyyy-MM-dd'; // ← AÑADIR para API

  // Design system
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  static const double defaultBorderRadius = 12.0;
  static const double cardElevation = 2.0;

  // Animation durations
  static const Duration shortAnimationDuration = Duration(milliseconds: 200);
  static const Duration mediumAnimationDuration = Duration(milliseconds: 300);
  static const Duration longAnimationDuration = Duration(milliseconds: 500);

  // ✅ NUEVAS CONSTANTES PARA ROLES
  static const List<String> userRoles = [
    'RESIDENT',
    'MAINTENANCE',
    'ADMIN',
    'SUPER_ADMIN'
  ];

  // Estados comunes
  static const List<String> expenseStatuses = [
    'DRAFT',
    'OPEN',
    'PAID',
    'OVERDUE',
    'CANCELLED'
  ];

  static const List<String> ticketStatuses = [
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CANCELLED'
  ];
}

class ApiEndpoints {
  // Auth endpoints
  static const String auth = '/auth';
  static const String login = '$auth/login';
  static const String register = '$auth/register';
  static const String refresh = '$auth/refresh';
  static const String logout = '$auth/logout';
  static const String profile = '$auth/me'; // ← CORREGIR: tu backend usa /me
  static const String changePassword = '$auth/change-password';

  // ✅ ENDPOINTS ACTUALIZADOS PARA TU BACKEND
  static const String users = '/users';
  static const String buildings = '/buildings';
  static const String units = '/units';
  static const String expenses = '/expenses';
  static const String payments = '/payments';
  static const String tickets = '/tickets';
  static const String tasks = '/tasks';
  static const String files = '/files';
  static const String subscriptions = '/subscriptions';

  // Endpoints parametrizados MEJORADOS
  static String userById(String id) => '$users/$id';
  static String buildingById(String id) => '$buildings/$id';
  static String unitsByBuilding(String buildingId) =>
      '$buildings/$buildingId/units';
  static String expensesByBuilding(String buildingId) =>
      '$buildings/$buildingId/expenses';
  static String paymentsByUser(String userId) => '$users/$userId/payments';
  static String ticketsByBuilding(String buildingId) =>
      '$buildings/$buildingId/tickets';
  static String tasksByBuilding(String buildingId) =>
      '$buildings/$buildingId/tasks';

  // ✅ NUEVOS ENDPOINTS ESPECÍFICOS
  static String buildingStats(String buildingId) =>
      '$buildings/$buildingId/stats';
  static String userBuildings(String userId) => '$users/$userId/buildings';
  static String expensePayments(String expenseId) =>
      '$expenses/$expenseId/payments';
}

class AppColors {
  // Colores primarios
  static const int primaryColor = 0xFF2196F3;
  static const int primaryDark = 0xFF1976D2;
  static const int primaryLight = 0xFFBBDEFB;

  // Colores secundarios
  static const int secondaryColor = 0xFFFF9800;
  static const int secondaryDark = 0xFFF57C00;
  static const int secondaryLight = 0xFFFFE0B2;

  // ✅ COLORES POR ROL
  static const int adminColor = 0xFF2196F3;
  static const int maintenanceColor = 0xFFFF9800;
  static const int residentColor = 0xFF4CAF50;
  static const int superAdminColor = 0xFF9C27B0;

  // Colores de estado
  static const int successColor = 0xFF4CAF50;
  static const int successLight = 0xFFC8E6C9;
  static const int warningColor = 0xFFFFC107;
  static const int warningLight = 0xFFFFECB3;
  static const int errorColor = 0xFFF44336;
  static const int errorLight = 0xFFFFCDD2;
  static const int infoColor = 0xFF2196F3;
  static const int infoLight = 0xFFB3E5FC;

  // Colores neutros
  static const int backgroundColor = 0xFFFAFAFA;
  static const int surfaceColor = 0xFFFFFFFF;
  static const int onSurface = 0xFF000000;
  static const int disabledColor = 0xFF9E9E9E;
  static const int borderColor = 0xFFE0E0E0;

  // Colores de texto
  static const int textPrimary = 0xFF212121;
  static const int textSecondary = 0xFF757575;
  static const int textHint = 0xFFBDBDBD;

  // ✅ MÉTODO PARA OBTENER COLOR POR ROL
  static int getColorByRole(String role) {
    switch (role.toUpperCase()) {
      case 'SUPER_ADMIN':
        return superAdminColor;
      case 'ADMIN':
        return adminColor;
      case 'MAINTENANCE':
        return maintenanceColor;
      case 'RESIDENT':
        return residentColor;
      default:
        return primaryColor;
    }
  }
}

class AppStrings {
  // Mensajes de error comunes
  static const String networkError = 'Error de conexión. Verifica tu internet.';
  static const String serverError = 'Error del servidor. Intenta más tarde.';
  static const String unauthorized =
      'Sesión expirada. Inicia sesión nuevamente.';
  static const String notFound = 'Recurso no encontrado.';
  static const String unknownError = 'Error inesperado.';

  // Mensajes de éxito
  static const String loginSuccess = 'Inicio de sesión exitoso';
  static const String registerSuccess = 'Registro exitoso';
  static const String saveSuccess = 'Guardado exitosamente';
  static const String deleteSuccess = 'Eliminado exitosamente';

  // Textos de validación
  static const String requiredField = 'Este campo es requerido';
  static const String invalidEmail = 'Email inválido';
  static const String invalidPassword = 'Contraseña demasiado corta';
  static const String passwordsNotMatch = 'Las contraseñas no coinciden';

  // ✅ NUEVOS MENSAJES ESPECÍFICOS
  static const String noBuildings = 'No tienes edificios asignados';
  static const String noExpenses = 'No hay expensas para mostrar';
  static const String noTickets = 'No hay tickets para mostrar';
  static const String loading = 'Cargando...';
  static const String retry = 'Reintentar';

  // Nombres de roles en español
  static String getRoleName(String role) {
    switch (role.toUpperCase()) {
      case 'SUPER_ADMIN':
        return 'Super Administrador';
      case 'ADMIN':
        return 'Administrador';
      case 'MAINTENANCE':
        return 'Personal de Mantenimiento';
      case 'RESIDENT':
        return 'Residente';
      default:
        return 'Usuario';
    }
  }
}
