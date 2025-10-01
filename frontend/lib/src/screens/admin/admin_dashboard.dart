// lib/src/screens/admin/admin_dashboard.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/expense_provider.dart';
import '../../providers/documents_provider.dart'; // ✅ NUEVO IMPORT
import '../../models/expense_model.dart';
import '../../widgets/common/dashboard_base.dart';
import '../../widgets/admin/stats_grid.dart';
import '../../widgets/admin/quick_actions.dart';
import '../../widgets/admin/recent_activity.dart';
import '../../screens/admin/expenses_management_screen.dart';
import '../../screens/documents/documents_screen.dart'; // ✅ NUEVO IMPORT
import '../../widgets/admin/expense_list_item.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  void _loadDashboardData() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final dashboardProvider =
          Provider.of<DashboardProvider>(context, listen: false);
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final expenseProvider =
          Provider.of<ExpenseProvider>(context, listen: false);
      final documentsProvider =
          Provider.of<DocumentsProvider>(context, listen: false); // ✅ NUEVO

      dashboardProvider.loadDashboardData(authProvider.user?.id);
      expenseProvider.loadExpenses();
      documentsProvider
          .loadDocuments(); // ✅ NUEVO: Cargar documentos al iniciar
    });
  }

  @override
  Widget build(BuildContext context) {
    final dashboardProvider = Provider.of<DashboardProvider>(context);

    return DashboardBase(
      title: 'Panel Administrador',
      role: 'ADMIN',
      tabs: [
        DashboardTab(
          icon: Icons.dashboard,
          label: 'Dashboard',
          content: _buildDashboardTab(dashboardProvider),
        ),
        DashboardTab(
          icon: Icons.receipt,
          label: 'Expensas',
          content: _buildExpensesTab(),
        ),
        DashboardTab(
          // ✅ NUEVO TAB DE DOCUMENTOS
          icon: Icons.folder,
          label: 'Documentos',
          content: _buildDocumentsTab(),
        ),
        DashboardTab(
          icon: Icons.assignment,
          label: 'Tareas',
          content: _buildTasksTab(dashboardProvider),
        ),
        DashboardTab(
          icon: Icons.support,
          label: 'Reclamos',
          content: _buildTicketsTab(dashboardProvider),
        ),
      ],
    );
  }

  // ✅ NUEVO MÉTODO PARA DOCUMENTOS
  Widget _buildDocumentsTab() {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(
          value: Provider.of<DocumentsProvider>(context),
        ),
      ],
      child: const DocumentsScreen(
          consorcioId: 1), // TODO: Obtener consorcioId real
    );
  }

  // ... (el resto de tus métodos existentes se mantienen IGUAL)
  Widget _buildExpensesTab() {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(
            value: Provider.of<ExpenseProvider>(context)),
        ChangeNotifierProvider.value(value: Provider.of<AuthProvider>(context)),
      ],
      child: const ExpensesManagementScreen(),
    );
  }

  Widget _buildDashboardTab(DashboardProvider provider) {
    if (provider.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          StatsGrid(stats: provider.dashboardStats),
          const SizedBox(height: 24),
          QuickActions(
            onActionSelected: (action) => _handleQuickAction(action, context),
          ),
          const SizedBox(height: 24),
          RecentActivity(activities: provider.recentActivities),
          const SizedBox(height: 24),
          _buildBuildingsSection(provider),
          const SizedBox(height: 24),
          _buildRecentExpensesSection(),
        ],
      ),
    );
  }

  // ... (mantener todos tus métodos existentes sin cambios)
  Widget _buildRecentExpensesSection() {
    return Consumer<ExpenseProvider>(
      builder: (context, expenseProvider, child) {
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Expensas Recientes',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    TextButton(
                      onPressed: () {},
                      child: const Text('Ver todas'),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (expenseProvider.isLoading)
                  const Center(child: CircularProgressIndicator())
                else if (expenseProvider.expenses.isEmpty)
                  const EmptyState(
                    icon: Icons.receipt,
                    title: 'No hay expensas',
                    message: 'Aún no se han creado expensas',
                  )
                else
                  Column(
                    children: expenseProvider.expenses.take(3).map((expense) {
                      return ExpenseListItem(
                        expense: expense,
                        onTap: () => _showExpenseDetails(expense),
                        onEdit: () => _showEditExpenseDialog(expense),
                        onDelete: () => _confirmDeleteExpense(expense),
                      );
                    }).toList(),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTasksTab(DashboardProvider provider) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Gestión de Tareas',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          Expanded(
            child: provider.tasks.isEmpty
                ? const Center(child: Text('No hay tareas asignadas'))
                : ListView.builder(
                    itemCount: provider.tasks.length,
                    itemBuilder: (context, index) {
                      final task = provider.tasks[index];
                      return _buildTaskItem(task);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildTicketsTab(DashboardProvider provider) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Gestión de Reclamos',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          Expanded(
            child: provider.tickets.isEmpty
                ? const Center(child: Text('No hay reclamos para mostrar'))
                : ListView.builder(
                    itemCount: provider.tickets.length,
                    itemBuilder: (context, index) {
                      final ticket = provider.tickets[index];
                      return _buildTicketItem(ticket);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildBuildingsSection(DashboardProvider provider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Tus Edificios',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            provider.buildings.isEmpty
                ? const Text('No tienes edificios asignados')
                : Column(
                    children: provider.buildings.map((building) {
                      return ListTile(
                        leading: const Icon(Icons.apartment),
                        title: Text(building['name'] ?? 'Sin nombre'),
                        subtitle: Text(building['address'] ?? 'Sin dirección'),
                        trailing: Chip(
                          label: Text('${building['unitCount'] ?? 0} unidades'),
                        ),
                      );
                    }).toList(),
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskItem(Map<String, dynamic> task) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: const Icon(Icons.assignment),
        title: Text(task['title'] ?? 'Sin título'),
        subtitle: Text(task['description'] ?? 'Sin descripción'),
        trailing: Chip(
          label: Text(task['status'] ?? 'PENDIENTE'),
        ),
      ),
    );
  }

  Widget _buildTicketItem(Map<String, dynamic> ticket) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: const Icon(Icons.support_agent),
        title: Text(ticket['title'] ?? 'Sin título'),
        subtitle: Text(ticket['description'] ?? 'Sin descripción'),
        trailing: Chip(
          label: Text(ticket['status'] ?? 'ABIERTO'),
          backgroundColor: _getStatusColor(ticket['status']),
        ),
      ),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
      case 'RESOLVED':
        return Colors.green.shade100;
      case 'PENDING':
      case 'OPEN':
        return Colors.orange.shade100;
      case 'OVERDUE':
      case 'CANCELLED':
        return Colors.red.shade100;
      default:
        return Colors.grey.shade100;
    }
  }

  void _showExpenseDetails(Expense expense) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(expense.concept),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Monto: \$${expense.amount.toStringAsFixed(2)}'),
              Text('Vencimiento: ${_formatDate(expense.dueDate)}'),
              Text('Estado: ${_getStatusText(expense.status)}'),
              Text('Tipo: ${expense.type}'),
              if (expense.period != null) Text('Período: ${expense.period}'),
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

  void _showEditExpenseDialog(Expense expense) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Editar Expensa'),
        content: const Text('Funcionalidad de edición en desarrollo'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  void _confirmDeleteExpense(Expense expense) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Eliminar Expensa'),
        content: Text('¿Estás seguro de eliminar "${expense.concept}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () async {
              final expenseProvider =
                  Provider.of<ExpenseProvider>(context, listen: false);
              final success = await expenseProvider.deleteExpense(expense.id);

              if (context.mounted) {
                Navigator.pop(context);
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                        content:
                            Text('Expensa "${expense.concept}" eliminada')),
                  );
                }
              }
            },
            child: const Text('Eliminar', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _handleQuickAction(String action, BuildContext context) {
    switch (action) {
      case 'create_expense':
        _showCreateExpenseQuickDialog();
        break;
      case 'create_ticket':
        // TODO: Implementar creación de ticket
        break;
      case 'add_building':
        // TODO: Implementar agregar edificio
        break;
      case 'generate_report':
        // TODO: Implementar generación de reporte
        break;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Acción: $action')),
    );
  }

  void _showCreateExpenseQuickDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Crear Expensa Rápida'),
        content:
            const Text('¿Quieres crear una expensa ordinaria para este mes?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Redirigiendo a creación de expensa...')),
              );
            },
            child: const Text('Crear'),
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
}

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: Colors.grey),
            const SizedBox(height: 16),
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(message, style: Theme.of(context).textTheme.bodyMedium),
          ],
        ),
      ),
    );
  }
}
