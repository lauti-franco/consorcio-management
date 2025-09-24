import 'package:flutter/material.dart';
import '../../widgets/common/dashboard_base.dart';

class AdminDashboard extends StatelessWidget {
  const AdminDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return DashboardBase(
      title: 'Panel Administrador',
      role: 'ADMIN',
      tabs: [
        DashboardTab(
          icon: Icons.dashboard,
          label: 'Dashboard',
          content: _buildDashboardTab(),
        ),
        DashboardTab(
          icon: Icons.receipt,
          label: 'Expensas',
          content: _buildExpensesTab(),
        ),
        DashboardTab(
          icon: Icons.assignment,
          label: 'Tareas',
          content: _buildTasksTab(),
        ),
        DashboardTab(
          icon: Icons.support,
          label: 'Reclamos',
          content: _buildTicketsTab(),
        ),
      ],
    );
  }

  Widget _buildDashboardTab() {
    return const Center(
        child: Text('Dashboard Admin - Gráficos y estadísticas'));
  }

  Widget _buildExpensesTab() {
    return const Center(child: Text('Gestión de Expensas'));
  }

  Widget _buildTasksTab() {
    return const Center(child: Text('Gestión de Tareas'));
  }

  Widget _buildTicketsTab() {
    return const Center(child: Text('Gestión de Reclamos'));
  }
}
