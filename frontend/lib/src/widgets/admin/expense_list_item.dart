import 'package:flutter/material.dart';
import '../../models/expense_model.dart';

class ExpenseListItem extends StatelessWidget {
  final Expense expense;
  final VoidCallback onTap;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const ExpenseListItem({
    super.key,
    required this.expense,
    required this.onTap,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // ✅ CORRECCIÓN: Verificar manualmente si está vencida
    final isOverdue =
        expense.status == 'OPEN' && expense.dueDate.isBefore(DateTime.now());

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListTile(
        leading: _buildStatusIcon(expense.status, isOverdue),
        title: Text(
          expense.concept,
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w500,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '\$${expense.amount.toStringAsFixed(2)}',
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              'Vence: ${_formatDate(expense.dueDate)}',
              style: theme.textTheme.bodySmall?.copyWith(
                color: isOverdue
                    ? Colors.red
                    : theme.colorScheme.onSurface.withAlpha(150),
              ),
            ),
            if (expense.period != null) ...[
              const SizedBox(height: 2),
              Text(
                'Período: ${expense.period}',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withAlpha(150),
                ),
              ),
            ],
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Badge de estado
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: _getStatusColor(expense.status, isOverdue),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                _getStatusText(expense.status, isOverdue),
                style: theme.textTheme.labelSmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 8),
            // Menú de acciones
            PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert),
              onSelected: (value) => _handleMenuAction(value, context),
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'view',
                  child: Row(
                    children: [
                      Icon(Icons.visibility, size: 20),
                      SizedBox(width: 8),
                      Text('Ver detalles'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'edit',
                  child: Row(
                    children: [
                      Icon(Icons.edit, size: 20),
                      SizedBox(width: 8),
                      Text('Editar'),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'delete',
                  child: Row(
                    children: [
                      Icon(Icons.delete, size: 20, color: Colors.red),
                      const SizedBox(width: 8),
                      Text(
                        'Eliminar',
                        style: TextStyle(color: Colors.red),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
        onTap: onTap,
      ),
    );
  }

  Widget _buildStatusIcon(String status, bool isOverdue) {
    Color color;
    IconData icon;

    switch (status) {
      case 'PAID':
        color = Colors.green;
        icon = Icons.check_circle;
        break;
      case 'OVERDUE':
        color = Colors.red;
        icon = Icons.warning;
        break;
      case 'OPEN':
        color = isOverdue ? Colors.red : Colors.orange;
        icon = isOverdue ? Icons.warning : Icons.pending;
        break;
      default:
        color = Colors.grey;
        icon = Icons.receipt;
    }

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: color, size: 20),
    );
  }

  Color _getStatusColor(String status, bool isOverdue) {
    switch (status) {
      case 'PAID':
        return Colors.green;
      case 'OVERDUE':
        return Colors.red;
      case 'OPEN':
        return isOverdue ? Colors.red : Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(String status, bool isOverdue) {
    switch (status) {
      case 'PAID':
        return 'Pagada';
      case 'OVERDUE':
        return 'Vencida';
      case 'OPEN':
        return isOverdue ? 'Vencida' : 'Pendiente';
      default:
        return status;
    }
  }

  void _handleMenuAction(String action, BuildContext context) {
    switch (action) {
      case 'view':
        onTap();
        break;
      case 'edit':
        onEdit();
        break;
      case 'delete':
        onDelete();
        break;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }
}
