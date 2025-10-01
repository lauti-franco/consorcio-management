// lib/src/screens/resident/resident_dashboard.dart
import 'package:flutter/material.dart';
import '../../widgets/common/dashboard_base.dart';

class ResidentDashboard extends StatelessWidget {
  const ResidentDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return DashboardBase(
      title: 'Panel Residente',
      role: 'RESIDENT',
      tabs: [
        DashboardTab(
          icon: Icons.receipt,
          label: 'Mis Expensas',
          content: _buildExpensesTab(),
        ),
        DashboardTab(
          icon: Icons.folder,
          label: 'Documentos',
          content: Container(
            // ✅ PRUEBA SIMPLE
            color: Colors.blue[50],
            child: const Center(
              child: Text(
                '🎉 ¡PESTAÑA DOCUMENTOS FUNCIONA!',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ),
        DashboardTab(
          icon: Icons.support,
          label: 'Reclamos',
          content: _buildTicketsTab(),
        ),
        DashboardTab(
          icon: Icons.history,
          label: 'Historial',
          content: _buildHistoryTab(),
        ),
      ],
    );
  }

  Widget _buildExpensesTab() {
    return const Center(child: Text('Mis Expensas y Pagos'));
  }

  Widget _buildTicketsTab() {
    return const Center(child: Text('Crear y Ver Reclamos'));
  }

  Widget _buildHistoryTab() {
    return const Center(child: Text('Historial de Pagos y Reclamos'));
  }
}
