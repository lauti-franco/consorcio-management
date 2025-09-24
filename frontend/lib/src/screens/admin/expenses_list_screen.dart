import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/expense_provider.dart';
import '../../widgets/admin/expense_card.dart';
// Eliminamos la importación no usada

class ExpensesListScreen extends StatefulWidget {
  const ExpensesListScreen({super.key});

  @override
  State<ExpensesListScreen> createState() => _ExpensesListScreenState();
}

class _ExpensesListScreenState extends State<ExpensesListScreen> {
  @override
  void initState() {
    super.initState();
    _loadExpenses();
  }

  Future<void> _loadExpenses() async {
    await Provider.of<ExpenseProvider>(context, listen: false).loadExpenses();
  }

  @override
  Widget build(BuildContext context) {
    final expenseProvider = Provider.of<ExpenseProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de Expensas'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // Navegar a crear expensa
            },
          ),
        ],
      ),
      body: expenseProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : expenseProvider.expenses.isEmpty
              ? const Center(child: Text('No hay expensas registradas'))
              : ListView.builder(
                  itemCount: expenseProvider.expenses.length,
                  itemBuilder: (context, index) {
                    final expense = expenseProvider.expenses[index];
                    return ExpenseCard(
                      expense: expense,
                      onTap: () {
                        // Navegar a detalle
                      },
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Crear nueva expensa
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
