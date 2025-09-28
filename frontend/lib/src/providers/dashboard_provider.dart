import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class DashboardProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  // ESTADO DEL PROVIDER
  bool _isLoading = false;
  String? _error;

  // DATOS DEL DASHBOARD
  Map<String, dynamic> _dashboardStats = {};
  List<dynamic> _recentActivities = [];
  List<dynamic> _buildings = [];
  List<dynamic> _expenses = [];
  List<dynamic> _tasks = [];
  List<dynamic> _tickets = [];

  // GETTERS
  bool get isLoading => _isLoading;
  String? get error => _error;
  Map<String, dynamic> get dashboardStats => _dashboardStats;
  List<dynamic> get recentActivities => _recentActivities;
  List<dynamic> get buildings => _buildings;
  List<dynamic> get expenses => _expenses;
  List<dynamic> get tasks => _tasks;
  List<dynamic> get tickets => _tickets;

  // ESTADÍSTICAS CALCULADAS
  int get totalBuildings => _buildings.length;
  int get totalResidents => _dashboardStats['totalResidents'] ?? 0;
  int get activeTickets => _dashboardStats['activeTickets'] ?? 0;
  int get pendingExpensesCount => _dashboardStats['pendingExpenses'] ?? 0;
  int get paidExpensesCount => _dashboardStats['paidExpenses'] ?? 0;
  int get overdueExpensesCount => _dashboardStats['overdueExpenses'] ?? 0;
  double get monthlyRevenue =>
      _dashboardStats['monthlyRevenue']?.toDouble() ?? 0.0;
  double get totalPendingAmount =>
      _dashboardStats['totalPendingAmount']?.toDouble() ?? 0.0;

  // ✅ CARGAR TODOS LOS DATOS DEL DASHBOARD
  Future<void> loadDashboardData(String? userId) async {
    try {
      _setLoading(true);
      _error = null;

      // Cargar datos en paralelo para mejor performance
      await Future.wait([
        _loadDashboardStats(userId),
        _loadBuildings(userId),
        _loadRecentActivities(userId),
        _loadRecentExpenses(userId),
        _loadRecentTasks(userId),
        _loadRecentTickets(userId),
      ]);

      if (kDebugMode) {
        print('📊 Dashboard data loaded successfully');
        print('🏢 Buildings: ${_buildings.length}');
        print('💰 Expenses: ${_expenses.length}');
        print('🎫 Tickets: ${_tickets.length}');
        print('📋 Tasks: ${_tasks.length}');
      }
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) {
        print('❌ Error loading dashboard data: $e');
      }
    } finally {
      _setLoading(false);
    }
  }

  // ✅ CARGAR ESTADÍSTICAS PRINCIPALES
  Future<void> _loadDashboardStats(String? userId) async {
    try {
      final response = await _apiService.get('/dashboard/stats');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _dashboardStats = data is Map<String, dynamic> ? data : {};
      } else {
        throw Exception(
            'Failed to load dashboard stats: ${response.statusCode}');
      }
    } catch (e) {
      // Si falla la API, usar datos mock para desarrollo
      _dashboardStats = _getMockStats();
      if (kDebugMode) {
        print('⚠️ Using mock stats: $e');
      }
    }
  }

  // ✅ CARGAR EDIFICIOS DEL USUARIO
  Future<void> _loadBuildings(String? userId) async {
    try {
      final endpoint =
          userId != null ? '/users/$userId/buildings' : ApiEndpoints.buildings;

      final response = await _apiService.get(endpoint);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _buildings = data is List ? data : [data];
      }
    } catch (e) {
      _buildings = _getMockBuildings();
      if (kDebugMode) {
        print('⚠️ Using mock buildings: $e');
      }
    }
  }

  // ✅ CARGAR ACTIVIDAD RECIENTE
  Future<void> _loadRecentActivities(String? userId) async {
    try {
      final response = await _apiService.get('/dashboard/activities');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _recentActivities = data is List ? data : [data];
      }
    } catch (e) {
      _recentActivities = _getMockActivities();
      if (kDebugMode) {
        print('⚠️ Using mock activities: $e');
      }
    }
  }

  // ✅ CARGAR EXPENSAS RECIENTES
  Future<void> _loadRecentExpenses(String? userId) async {
    try {
      final response =
          await _apiService.get('${ApiEndpoints.expenses}?limit=10');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _expenses = data is List ? data : [data];
      }
    } catch (e) {
      _expenses = _getMockExpenses();
      if (kDebugMode) {
        print('⚠️ Using mock expenses: $e');
      }
    }
  }

  // ✅ CARGAR TAREAS RECIENTES
  Future<void> _loadRecentTasks(String? userId) async {
    try {
      final response = await _apiService.get('${ApiEndpoints.tasks}?limit=10');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _tasks = data is List ? data : [data];
      }
    } catch (e) {
      _tasks = _getMockTasks();
      if (kDebugMode) {
        print('⚠️ Using mock tasks: $e');
      }
    }
  }

  // ✅ CARGAR TICKETS RECIENTES
  Future<void> _loadRecentTickets(String? userId) async {
    try {
      final response =
          await _apiService.get('${ApiEndpoints.tickets}?limit=10');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _tickets = data is List ? data : [data];
      }
    } catch (e) {
      _tickets = _getMockTickets();
      if (kDebugMode) {
        print('⚠️ Using mock tickets: $e');
      }
    }
  }

  // ✅ ACTUALIZAR DATOS
  Future<void> refreshData(String? userId) async {
    await loadDashboardData(userId);
  }

  // ✅ MÉTODOS AUXILIARES
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  // ✅ DATOS MOCK PARA DESARROLLO (eliminar en producción)
  Map<String, dynamic> _getMockStats() {
    return {
      'totalResidents': 45,
      'activeTickets': 8,
      'pendingExpenses': 15,
      'paidExpenses': 120,
      'overdueExpenses': 3,
      'monthlyRevenue': 12500.00,
      'totalPendingAmount': 3500.00,
      'occupancyRate': 85.5,
    };
  }

  List<dynamic> _getMockBuildings() {
    return [
      {
        'id': '1',
        'name': 'Edificio Central',
        'address': 'Av. Principal 123',
        'unitCount': 25,
        'isActive': true,
      },
      {
        'id': '2',
        'name': 'Torre Norte',
        'address': 'Calle Secundaria 456',
        'unitCount': 20,
        'isActive': true,
      }
    ];
  }

  List<dynamic> _getMockActivities() {
    return [
      {
        'id': '1',
        'type': 'EXPENSE_CREATED',
        'description': 'Nueva expensa creada',
        'timestamp':
            DateTime.now().subtract(const Duration(hours: 1)).toIso8601String(),
        'user': 'Sistema',
      },
      {
        'id': '2',
        'type': 'TICKET_RESOLVED',
        'description': 'Ticket de mantenimiento resuelto',
        'timestamp':
            DateTime.now().subtract(const Duration(hours: 3)).toIso8601String(),
        'user': 'Juan Pérez',
      }
    ];
  }

  List<dynamic> _getMockExpenses() {
    return [
      {
        'id': '1',
        'concept': 'Expensas Ordinarias Enero',
        'amount': 15000.00,
        'status': 'PAID',
        'dueDate':
            DateTime.now().add(const Duration(days: 15)).toIso8601String(),
      },
      {
        'id': '2',
        'concept': 'Fondo de Reserva',
        'amount': 5000.00,
        'status': 'PENDING',
        'dueDate':
            DateTime.now().add(const Duration(days: 5)).toIso8601String(),
      }
    ];
  }

  List<dynamic> _getMockTasks() {
    return [
      {
        'id': '1',
        'title': 'Revisión ascensores',
        'description': 'Mantenimiento preventivo mensual',
        'status': 'COMPLETED',
        'priority': 'HIGH',
      },
      {
        'id': '2',
        'title': 'Limpieza tanque de agua',
        'description': 'Limpieza trimestral programada',
        'status': 'PENDING',
        'priority': 'MEDIUM',
      }
    ];
  }

  List<dynamic> _getMockTickets() {
    return [
      {
        'id': '1',
        'title': 'Ascensor atascado',
        'description': 'Ascensor del piso 3 no funciona',
        'status': 'IN_PROGRESS',
        'priority': 'URGENT',
      },
      {
        'id': '2',
        'title': 'Fuga de agua',
        'description': 'Fuga en baño del piso 2',
        'status': 'OPEN',
        'priority': 'HIGH',
      }
    ];
  }
}
