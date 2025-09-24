class AppConstants {
  static const String appName = 'Consorcio App';

  // Para Android emulator usar: http://10.0.2.2:3000/api
  // Para iOS/Desktop usar: http://localhost:3000/api
  static const String apiBaseUrl = 'http://10.0.2.2:3000/api';

  // Storage keys
  static const String accessTokenKey = 'accessToken';
  static const String refreshTokenKey = 'refreshToken';
  static const String userKey = 'user';
  static const String themeKey = 'theme';

  // Date formats
  static const String dateFormat = 'dd/MM/yyyy';
  static const String dateTimeFormat = 'dd/MM/yyyy HH:mm';

  // App settings
  static const double defaultPadding = 16.0;
  static const double defaultBorderRadius = 8.0;
}

class ApiEndpoints {
  static const String auth = '/auth';
  static const String login = '$auth/login';
  static const String register = '$auth/register';
  static const String refresh = '$auth/refresh';
  static const String logout = '$auth/logout';

  static const String users = '/users';
  static const String buildings = '/buildings';
  static const String expenses = '/expenses';
  static const String payments = '/payments';
  static const String tickets = '/tickets';
  static const String tasks = '/tasks';
  static const String files = '/files';
}

class AppColors {
  static const int primaryColor = 0xFF2196F3;
  static const int secondaryColor = 0xFFFF9800;
  static const int successColor = 0xFF4CAF50;
  static const int warningColor = 0xFFFFC107;
  static const int errorColor = 0xFFF44336;
  static const int infoColor = 0xFF2196F3;
}
