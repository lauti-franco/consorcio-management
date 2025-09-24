import 'package:flutter/material.dart';
import '../models/expense_model.dart';
// Eliminamos la importación no usada

class ExpenseProvider with ChangeNotifier {
  // Comentamos o eliminamos el campo no usado
  // final ApiService _apiService = ApiService();

  List<Expense> _expenses = [];
  bool _isLoading = false;

  List<Expense> get expenses => _expenses;
  bool get isLoading => _isLoading;

  Future<void> loadExpenses() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Simular llamada a la API
      await Future.delayed(const Duration(seconds: 1));

      // Datos de ejemplo (en producción vendrían de la API)
      _expenses = [
        Expense(
          id: '1',
          concept: 'Expensas Ordinarias Enero',
          amount: 15000.50,
          dueDate: DateTime(2024, 1, 10),
          status: 'PAID',
          buildingId: '1',
          createdAt: DateTime(2024, 1, 1),
          payments: [
            Payment(
              id: '1',
              amount: 15000.50,
              date: DateTime(2024, 1, 5),
              method: 'transfer',
              expenseId: '1',
              userId: '1',
              receiptUrl: 'https://example.com/receipt1',
            ),
          ],
        ),
        Expense(
          id: '2',
          concept: 'Expensas Extraordinarias',
          amount: 5000.00,
          dueDate: DateTime(2024, 1, 15),
          status: 'OPEN',
          buildingId: '1',
          createdAt: DateTime(2024, 1, 1),
          payments: [],
        ),
      ];
    } catch (e) {
      // Manejar error
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
