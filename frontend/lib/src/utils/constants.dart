// lib/constants.dart
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

class AppConstants {
  static const String appName = 'Consorcio Management';

  // Configuración de URLs para diferentes plataformas
  static String get apiBaseUrl {
    if (kIsWeb) {
      // Para web, usar localhost o tu dominio
      return 'http://localhost:3000/api';
    } else if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000/api';
    } else {
      // iOS, Desktop, etc.
      return 'http://localhost:3000/api';
    }
  }

  // Timeouts
  static const int connectTimeout = 15000;
  static const int receiveTimeout = 15000;

  // Storage keys
  static const String accessTokenKey = 'accessToken';
  static const String refreshTokenKey = 'refreshToken';
  static const String userKey = 'user';
  static const String themeKey = 'theme';

  // Date formats
  static const String dateFormat = 'dd/MM/yyyy';
  static const String dateTimeFormat = 'dd/MM/yyyy HH:mm';

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
}

class ApiEndpoints {
  static const String auth = '/auth';
  static const String login = '$auth/login';
  static const String register = '$auth/register';
  static const String refresh = '$auth/refresh';
  static const String logout = '$auth/logout';
  static const String profile = '$auth/profile';

  static const String users = '/users';
  static const String buildings = '/buildings';
  static const String expenses = '/expenses';
  static const String payments = '/payments';
  static const String tickets = '/tickets';
  static const String tasks = '/tasks';
  static const String files = '/files';

  // Endpoints parametrizados
  static String userById(String id) => '$users/$id';
  static String buildingById(String id) => '$buildings/$id';
  static String expensesByBuilding(String buildingId) =>
      '$buildings/$buildingId/expenses';
  static String paymentsByUser(String userId) => '$users/$userId/payments';
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
}
