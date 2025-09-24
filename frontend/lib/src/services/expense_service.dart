import 'dart:convert';
import '../models/expense_model.dart';
import 'api_service.dart';
import '../utils/constants.dart';

class ExpenseService {
  final ApiService _apiService = ApiService();

  Future<List<Expense>> getExpenses() async {
    final response = await _apiService.get(ApiEndpoints.expenses);

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Expense.fromJson(json)).toList();
    } else {
      throw Exception('Error al obtener expensas: ${response.statusCode}');
    }
  }

  Future<Expense> createExpense(Map<String, dynamic> expenseData) async {
    final response = await _apiService.post(
      ApiEndpoints.expenses,
      expenseData,
    );

    if (response.statusCode == 201) {
      return Expense.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Error al crear expensa: ${response.statusCode}');
    }
  }

  Future<Expense> updateExpense(
      String id, Map<String, dynamic> expenseData) async {
    final response = await _apiService.put(
      '${ApiEndpoints.expenses}/$id',
      expenseData,
    );

    if (response.statusCode == 200) {
      return Expense.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Error al actualizar expensa: ${response.statusCode}');
    }
  }

  Future<void> deleteExpense(String id) async {
    final response = await _apiService.delete('${ApiEndpoints.expenses}/$id');

    if (response.statusCode != 200) {
      throw Exception('Error al eliminar expensa: ${response.statusCode}');
    }
  }

  Future<Map<String, dynamic>> getExpenseStats() async {
    final response = await _apiService.get('${ApiEndpoints.expenses}/stats');

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Error al obtener estadísticas: ${response.statusCode}');
    }
  }
}
