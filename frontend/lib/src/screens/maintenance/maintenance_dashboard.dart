import 'package:flutter/material.dart';
import '../../widgets/common/dashboard_base.dart';

class MaintenanceDashboard extends StatelessWidget {
  const MaintenanceDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return DashboardBase(
      title: 'Panel Mantenimiento',
      role: 'MAINTENANCE',
      tabs: [
        DashboardTab(
          icon: Icons.assignment,
          label: 'Mis Tareas',
          content: _buildTasksTab(),
        ),
        DashboardTab(
          icon: Icons.photo_camera,
          label: 'Subir Fotos',
          content: _buildPhotosTab(),
        ),
      ],
    );
  }

  Widget _buildTasksTab() {
    return const Center(child: Text('Lista de Tareas Asignadas'));
  }

  Widget _buildPhotosTab() {
    return const Center(child: Text('Subir Fotos de Trabajos'));
  }
}
