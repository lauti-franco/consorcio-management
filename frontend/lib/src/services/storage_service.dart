// lib/src/services/storage_service.dart
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class StorageService {
  static late SharedPreferences _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Métodos genéricos
  static Future<bool> setString(String key, String value) =>
      _prefs.setString(key, value);
  static String getString(String key, [String defaultValue = '']) =>
      _prefs.getString(key) ?? defaultValue;

  // Métodos específicos de la app
  static Future<bool> saveToken(String token) =>
      setString(AppConstants.accessTokenKey, token);
  static String getToken() => getString(AppConstants.accessTokenKey);

  static Future<bool> saveUser(String userJson) =>
      setString(AppConstants.userKey, userJson);
  static String getUser() => getString(AppConstants.userKey);

  static Future<bool> clearAll() => _prefs.clear();
}
