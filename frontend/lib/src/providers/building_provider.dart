import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class BuildingProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<dynamic> _buildings = [];
  dynamic _currentBuilding;
  bool _isLoading = false;
  String? _error;

  List<dynamic> get buildings => _buildings;
  dynamic get currentBuilding => _currentBuilding;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadBuildings() async {
    try {
      _setLoading(true);
      _error = null;

      final response = await _apiService.get(ApiEndpoints.buildings);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _buildings = data is List ? data : [data];

        if (kDebugMode) {
          print('🏢 Buildings loaded: ${_buildings.length}');
        }
      } else {
        throw Exception('Failed to load buildings: ${response.statusCode}');
      }
    } catch (e) {
      _error = e.toString();
      _buildings = [];

      if (kDebugMode) {
        print('❌ Error loading buildings: $e');
      }
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadBuildingById(String id) async {
    try {
      _setLoading(true);
      _error = null;

      final response = await _apiService.get(ApiEndpoints.buildingById(id));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _currentBuilding = data;

        if (kDebugMode) {
          print('🏢 Building loaded: ${_currentBuilding['name']}');
        }
      } else {
        throw Exception('Failed to load building: ${response.statusCode}');
      }
    } catch (e) {
      _error = e.toString();
      _currentBuilding = null;

      if (kDebugMode) {
        print('❌ Error loading building: $e');
      }
    } finally {
      _setLoading(false);
    }
  }

  Future<void> createBuilding(Map<String, dynamic> buildingData) async {
    try {
      _setLoading(true);
      _error = null;

      final response =
          await _apiService.post(ApiEndpoints.buildings, buildingData);

      if (response.statusCode == 201) {
        final newBuilding = jsonDecode(response.body);
        _buildings.add(newBuilding);

        if (kDebugMode) {
          print('✅ Building created: ${newBuilding['name']}');
        }

        notifyListeners();
      } else {
        throw Exception('Failed to create building: ${response.statusCode}');
      }
    } catch (e) {
      _error = e.toString();

      if (kDebugMode) {
        print('❌ Error creating building: $e');
      }
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> updateBuilding(String id, Map<String, dynamic> updates) async {
    try {
      _setLoading(true);
      _error = null;

      final response =
          await _apiService.put(ApiEndpoints.buildingById(id), updates);

      if (response.statusCode == 200) {
        final updatedBuilding = jsonDecode(response.body);

        // Actualizar en la lista
        final index = _buildings.indexWhere((b) => b['id'] == id);
        if (index != -1) {
          _buildings[index] = updatedBuilding;
        }

        // Actualizar building actual si es el mismo
        if (_currentBuilding != null && _currentBuilding['id'] == id) {
          _currentBuilding = updatedBuilding;
        }

        if (kDebugMode) {
          print('✅ Building updated: ${updatedBuilding['name']}');
        }

        notifyListeners();
      } else {
        throw Exception('Failed to update building: ${response.statusCode}');
      }
    } catch (e) {
      _error = e.toString();

      if (kDebugMode) {
        print('❌ Error updating building: $e');
      }
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> deleteBuilding(String id) async {
    try {
      _setLoading(true);
      _error = null;

      final response = await _apiService.delete(ApiEndpoints.buildingById(id));

      if (response.statusCode == 200) {
        _buildings.removeWhere((b) => b['id'] == id);

        if (_currentBuilding != null && _currentBuilding['id'] == id) {
          _currentBuilding = null;
        }

        if (kDebugMode) {
          print('🗑️ Building deleted: $id');
        }

        notifyListeners();
      } else {
        throw Exception('Failed to delete building: ${response.statusCode}');
      }
    } catch (e) {
      _error = e.toString();

      if (kDebugMode) {
        print('❌ Error deleting building: $e');
      }
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<Map<String, dynamic>> getBuildingStats(String buildingId) async {
    try {
      final response =
          await _apiService.get(ApiEndpoints.buildingStats(buildingId));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load stats: ${response.statusCode}');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Error loading building stats: $e');
      }
      rethrow;
    }
  }

  void setCurrentBuilding(dynamic building) {
    _currentBuilding = building;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void clearBuildings() {
    _buildings = [];
    _currentBuilding = null;
    notifyListeners();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Método para buscar edificios por nombre
  List<dynamic> searchBuildings(String query) {
    if (query.isEmpty) return _buildings;

    return _buildings.where((building) {
      final name = building['name']?.toString().toLowerCase() ?? '';
      final address = building['address']?.toString().toLowerCase() ?? '';
      return name.contains(query.toLowerCase()) ||
          address.contains(query.toLowerCase());
    }).toList();
  }

  // Método para obtener edificios por usuario
  List<dynamic> getBuildingsByUser(String userId) {
    return _buildings.where((building) {
      return building['ownerId'] == userId || building['managerId'] == userId;
    }).toList();
  }
}
