import 'package:flutter/material.dart';
import '../../models/expense_model.dart';
import '../../utils/helpers.dart';

class ExpenseCard extends StatelessWidget {
  final Expense expense;
  final VoidCallback? onTap;

  const ExpenseCard({super.key, required this.expense, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: _getStatusColor(expense.status),
            shape: BoxShape.circle,
          ),
          child: Icon(
            _getStatusIcon(expense.status),
            color: Colors.white,
            size: 20,
          ),
        ),
        title: Text(expense.concept),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Vence: ${Helpers.formatDate(expense.dueDate)}'),
            Text('Estado: ${Helpers.getStatusText(expense.status)}'),
          ],
        ),
        trailing: Text(
          Helpers.formatCurrency(expense.amount),
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        onTap: onTap,
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PAID':
        return Colors.green;
      case 'OVERDUE':
        return Colors.red;
      case 'OPEN':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'PAID':
        return Icons.check_circle;
      case 'OVERDUE':
        return Icons.error;
      case 'OPEN':
        return Icons.pending;
      default:
        return Icons.help;
    }
  }
}
