import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/expense_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/admin/expense_list_item.dart';
import '../../widgets/common/empty_state.dart';
import '../../widgets/common/loading_indicator.dart';
import '../../models/expense_model.dart';

class ExpensesManagementScreen extends StatefulWidget {
  const ExpensesManagementScreen({super.key});

  @override
  State<ExpensesManagementScreen> createState() =>
      _ExpensesManagementScreenState();
}

class _ExpensesManagementScreenState extends State<ExpensesManagementScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedFilter = 'all';

  @override
  void initState() {
    super.initState();
    _loadExpenses();
  }

  void _loadExpenses() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final expenseProvider =
          Provider.of<ExpenseProvider>(context, listen: false);
      expenseProvider.loadExpenses();
    });
  }

  @override
  Widget build(BuildContext context) {
    final expenseProvider = Provider.of<ExpenseProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de Expensas'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _loadExpenses(),
          ),
        ],
      ),
      body: Column(
        children: [
          // FILTROS Y BÚSQUEDA
          _buildFiltersSection(expenseProvider),

          // ESTADÍSTICAS RÁPIDAS
          _buildStatsSection(expenseProvider),

          // LISTA DE EXPENSAS
          Expanded(
            child: _buildExpensesList(expenseProvider),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () =>
            _showCreateExpenseDialog(context, expenseProvider, authProvider),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildFiltersSection(ExpenseProvider provider) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // BARRA DE BÚSQUEDA
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Buscar expensas...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: IconButton(
                icon: const Icon(Icons.clear),
                onPressed: () {
                  _searchController.clear();
                  provider.searchExpenses('');
                },
              ),
            ),
            onChanged: (value) => provider.searchExpenses(value),
          ),
          const SizedBox(height: 12),

          // FILTROS RÁPIDOS
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterChip('Todas', 'all', provider),
                _buildFilterChip('Pagadas', 'paid', provider),
                _buildFilterChip('Pendientes', 'pending', provider),
                _buildFilterChip('Vencidas', 'overdue', provider),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(
      String label, String value, ExpenseProvider provider) {
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: FilterChip(
        label: Text(label),
        selected: _selectedFilter == value,
        onSelected: (selected) {
          setState(() {
            _selectedFilter = value;
          });
          provider.filterExpenses(value);
        },
      ),
    );
  }

  Widget _buildStatsSection(ExpenseProvider provider) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildStatItem('Total',
                '\$${provider.totalAmount.toStringAsFixed(2)}', Colors.blue),
            _buildStatItem('Pagadas',
                '\$${provider.paidAmount.toStringAsFixed(2)}', Colors.green),
            _buildStatItem(
                'Pendientes',
                '\$${provider.pendingAmount.toStringAsFixed(2)}',
                Colors.orange),
            _buildStatItem('Vencidas',
                '\$${provider.overdueAmount.toStringAsFixed(2)}', Colors.red),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildExpensesList(ExpenseProvider provider) {
    if (provider.isLoading) {
      return const LoadingIndicator(message: 'Cargando expensas...');
    }

    if (provider.error != null) {
      return EmptyState(
        icon: Icons.error,
        title: 'Error al cargar',
        message: provider.error!,
        actionText: 'Reintentar',
        onAction: () => _loadExpenses(),
      );
    }

    if (provider.filteredExpenses.isEmpty) {
      return EmptyState(
        icon: Icons.receipt,
        title: 'No hay expensas',
        message: _selectedFilter == 'all'
            ? 'No se encontraron expensas'
            : 'No hay expensas ${_getFilterLabel(_selectedFilter)}',
        actionText: 'Crear primera expensa',
        onAction: () => _showCreateExpenseDialog(context, provider,
            Provider.of<AuthProvider>(context, listen: false)),
      );
    }

    return ListView.builder(
      itemCount: provider.filteredExpenses.length,
      itemBuilder: (context, index) {
        final expense = provider.filteredExpenses[index];
        return ExpenseListItem(
          expense: expense,
          onTap: () => _showExpenseDetails(context, expense, provider),
          onEdit: () => _showEditExpenseDialog(context, expense, provider),
          onDelete: () => _confirmDeleteExpense(context, expense, provider),
        );
      },
    );
  }

  String _getFilterLabel(String filter) {
    switch (filter) {
      case 'paid':
        return 'pagadas';
      case 'pending':
        return 'pendientes';
      case 'overdue':
        return 'vencidas';
      default:
        return '';
    }
  }

  void _showExpenseDetails(
      BuildContext context, Expense expense, ExpenseProvider provider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(expense.concept),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Monto: \$${expense.amount.toStringAsFixed(2)}'),
              Text('Vencimiento: ${_formatDate(expense.dueDate)}'),
              Text('Estado: ${_getStatusText(expense.status)}'),
              Text('Tipo: ${expense.type}'),
              if (expense.period != null) Text('Período: ${expense.period}'),
              const SizedBox(height: 16),
              const Text('Pagos:',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              ...expense.payments.map((payment) => ListTile(
                    title: Text('\$${payment.amount.toStringAsFixed(2)}'),
                    subtitle: Text(
                        '${payment.method} - ${_formatDate(payment.date)}'),
                  )),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  void _showCreateExpenseDialog(BuildContext context,
      ExpenseProvider expenseProvider, AuthProvider authProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Nueva Expensa'),
        content: const Text('Formulario de creación de expensa - Próximamente'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Funcionalidad en desarrollo')),
              );
            },
            child: const Text('Crear'),
          ),
        ],
      ),
    );
  }

  void _showEditExpenseDialog(
      BuildContext context, Expense expense, ExpenseProvider provider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Editar Expensa'),
        content: const Text('Formulario de edición - Próximamente'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Funcionalidad en desarrollo')),
              );
            },
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }

  void _confirmDeleteExpense(
      BuildContext context, Expense expense, ExpenseProvider provider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Eliminar Expensa'),
        content:
            Text('¿Estás seguro de eliminar la expensa "${expense.concept}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await provider.deleteExpense(expense.id);
              if (success && context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                      content: Text('Expensa "${expense.concept}" eliminada')),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'PAID':
        return 'Pagada';
      case 'OPEN':
        return 'Pendiente';
      case 'OVERDUE':
        return 'Vencida';
      default:
        return status;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
