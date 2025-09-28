import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../models/expense_model.dart';
import '../utils/constants.dart';

class ExpenseProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Expense> _expenses = [];
  List<Expense> _filteredExpenses = [];
  Expense? _selectedExpense;
  bool _isLoading = false;
  String? _error;
  String _currentFilter = 'all';

  // GETTERS
  List<Expense> get expenses => _expenses;
  List<Expense> get filteredExpenses => _filteredExpenses;
  Expense? get selectedExpense => _selectedExpense;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get currentFilter => _currentFilter;

  // ESTADÍSTICAS
  double get totalAmount =>
      _expenses.fold(0, (sum, expense) => sum + expense.amount);
  double get paidAmount => _getExpensesByStatus('PAID')
      .fold(0, (sum, expense) => sum + expense.amount);
  double get pendingAmount => _getExpensesByStatus('OPEN')
      .fold(0, (sum, expense) => sum + expense.amount);
  double get overdueAmount =>
      _getOverdueExpenses().fold(0, (sum, expense) => sum + expense.amount);

  int get totalCount => _expenses.length;
  int get paidCount => _getExpensesByStatus('PAID').length;
  int get pendingCount => _getExpensesByStatus('OPEN').length;
  int get overdueCount => _getOverdueExpenses().length;

  // ✅ CARGAR EXPENSAS DESDE EL BACKEND
  Future<void> loadExpenses({String? buildingId, String? unitId}) async {
    try {
      _setLoading(true);
      _error = null;

      String endpoint = ApiEndpoints.expenses;
      if (buildingId != null) {
        endpoint = ApiEndpoints.expensesByBuilding(buildingId);
      }

      final response = await _apiService.get(endpoint);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> expensesData = data is List ? data : [data];

        _expenses = expensesData
            .map((expenseJson) => Expense.fromJson(expenseJson))
            .toList();
        _applyFilter(_currentFilter);

        if (kDebugMode) {
          print('✅ Expenses loaded: ${_expenses.length}');
        }
      } else {
        throw Exception('Failed to load expenses: ${response.statusCode}');
      }
    } catch (e) {
      _error = e.toString();
      _expenses = _getMockExpenses(); // Fallback para desarrollo
      _applyFilter(_currentFilter);

      if (kDebugMode) {
        print('❌ Error loading expenses: $e');
      }
    } finally {
      _setLoading(false);
    }
  }

  // ✅ CARGAR EXPENSA ESPECÍFICA
  Future<void> loadExpenseById(String id) async {
    try {
      _setLoading(true);
      _error = null;

      final response = await _apiService.get('${ApiEndpoints.expenses}/$id');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _selectedExpense = Expense.fromJson(data);
      } else {
        throw Exception('Failed to load expense: ${response.statusCode}');
      }
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) {
        print('❌ Error loading expense: $e');
      }
    } finally {
      _setLoading(false);
    }
  }

  // ✅ CREAR NUEVA EXPENSA
  Future<bool> createExpense(Map<String, dynamic> expenseData) async {
    try {
      _setLoading(true);
      _error = null;

      final response =
          await _apiService.post(ApiEndpoints.expenses, expenseData);

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final newExpense = Expense.fromJson(data);

        _expenses.add(newExpense);
        _applyFilter(_currentFilter);

        if (kDebugMode) {
          print('✅ Expense created: ${newExpense.concept}');
        }

        notifyListeners();
        return true;
      } else {
        throw Exception('Failed to create expense: ${response.statusCode}');
      }
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) {
        print('❌ Error creating expense: $e');
      }
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ✅ ACTUALIZAR EXPENSA
  Future<bool> updateExpense(String id, Map<String, dynamic> updates) async {
    try {
      _setLoading(true);
      _error = null;

      final response =
          await _apiService.put('${ApiEndpoints.expenses}/$id', updates);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final updatedExpense = Expense.fromJson(data);

        final index = _expenses.indexWhere((expense) => expense.id == id);
        if (index != -1) {
          _expenses[index] = updatedExpense;
        }

        if (_selectedExpense?.id == id) {
          _selectedExpense = updatedExpense;
        }

        _applyFilter(_currentFilter);

        if (kDebugMode) {
          print('✅ Expense updated: ${updatedExpense.concept}');
        }

        notifyListeners();
        return true;
      } else {
        throw Exception('Failed to update expense: ${response.statusCode}');
      }
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) {
        print('❌ Error updating expense: $e');
      }
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ✅ ELIMINAR EXPENSA
  Future<bool> deleteExpense(String id) async {
    try {
      _setLoading(true);
      _error = null;

      final response = await _apiService.delete('${ApiEndpoints.expenses}/$id');

      if (response.statusCode == 200) {
        _expenses.removeWhere((expense) => expense.id == id);

        if (_selectedExpense?.id == id) {
          _selectedExpense = null;
        }

        _applyFilter(_currentFilter);

        if (kDebugMode) {
          print('🗑️ Expense deleted: $id');
        }

        notifyListeners();
        return true;
      } else {
        throw Exception('Failed to delete expense: ${response.statusCode}');
      }
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) {
        print('❌ Error deleting expense: $e');
      }
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ✅ FILTRAR EXPENSAS
  void filterExpenses(String filter) {
    _currentFilter = filter;
    _applyFilter(filter);
    notifyListeners();
  }

  void _applyFilter(String filter) {
    switch (filter) {
      case 'all':
        _filteredExpenses = _expenses;
        break;
      case 'paid':
        _filteredExpenses = _getExpensesByStatus('PAID');
        break;
      case 'pending':
        _filteredExpenses = _getExpensesByStatus('OPEN');
        break;
      case 'overdue':
        _filteredExpenses = _getOverdueExpenses();
        break;
      default:
        _filteredExpenses = _expenses;
    }
  }

  List<Expense> _getExpensesByStatus(String status) {
    return _expenses.where((expense) => expense.status == status).toList();
  }

  List<Expense> _getOverdueExpenses() {
    final now = DateTime.now();
    return _expenses
        .where((expense) =>
            expense.status == 'OPEN' && expense.dueDate.isBefore(now))
        .toList();
  }

  // ✅ BUSCAR EXPENSAS
  void searchExpenses(String query) {
    if (query.isEmpty) {
      _applyFilter(_currentFilter);
    } else {
      _filteredExpenses = _expenses
          .where((expense) =>
              expense.concept.toLowerCase().contains(query.toLowerCase()) ||
              expense.id.toLowerCase().contains(query.toLowerCase()))
          .toList();
    }
    notifyListeners();
  }

  // ✅ SELECCIONAR EXPENSA
  void selectExpense(Expense? expense) {
    _selectedExpense = expense;
    notifyListeners();
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

  void clearSelection() {
    _selectedExpense = null;
    notifyListeners();
  }

  // ✅ DATOS MOCK PARA DESARROLLO
  List<Expense> _getMockExpenses() {
    return [
      Expense(
        id: '1',
        concept: 'Expensas Ordinarias Enero 2024',
        amount: 15000.50,
        dueDate: DateTime(2024, 1, 10),
        status: 'PAID',
        type: 'ORDINARY',
        buildingId: '1',
        unitId: '101',
        createdAt: DateTime(2024, 1, 1),
        updatedAt: DateTime(2024, 1, 5),
      ),
      Expense(
        id: '2',
        concept: 'Fondo de Reserva - Mantenimiento Ascensores',
        amount: 5000.00,
        dueDate: DateTime(2024, 2, 15),
        status: 'OPEN',
        type: 'EXTRAORDINARY',
        buildingId: '1',
        unitId: null, // Expensa general del edificio
        createdAt: DateTime(2024, 1, 15),
        updatedAt: DateTime(2024, 1, 15),
      ),
      Expense(
        id: '3',
        concept: 'Expensas Ordinarias Febrero 2024',
        amount: 15200.00,
        dueDate: DateTime(2024, 2, 10),
        status: 'OPEN',
        type: 'ORDINARY',
        buildingId: '1',
        unitId: '101',
        createdAt: DateTime(2024, 2, 1),
        updatedAt: DateTime(2024, 2, 1),
      ),
    ];
  }
}
