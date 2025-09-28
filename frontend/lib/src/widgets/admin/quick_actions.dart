import 'package:flutter/material.dart';
import '../../utils/constants.dart';

class QuickActions extends StatelessWidget {
  final Function(String) onActionSelected;

  const QuickActions({super.key, required this.onActionSelected});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Acciones Rápidas',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 4,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 0.8,
          children: [
            _buildActionItem(
              context,
              Icons.receipt,
              'Crear Expensa',
              AppColors.primaryColor,
              'create_expense',
            ),
            _buildActionItem(
              context,
              Icons.support_agent,
              'Nuevo Ticket',
              AppColors.warningColor,
              'create_ticket',
            ),
            _buildActionItem(
              context,
              Icons.apartment,
              'Agregar Edificio',
              AppColors.infoColor,
              'add_building',
            ),
            _buildActionItem(
              context,
              Icons.assignment,
              'Nueva Tarea',
              AppColors.secondaryColor,
              'create_task',
            ),
            _buildActionItem(
              context,
              Icons.bar_chart,
              'Generar Reporte',
              AppColors.successColor,
              'generate_report',
            ),
            _buildActionItem(
              context,
              Icons.notifications,
              'Enviar Aviso',
              AppColors.errorColor,
              'send_notification',
            ),
            _buildActionItem(
              context,
              Icons.people,
              'Agregar Usuario',
              AppColors.infoColor,
              'add_user',
            ),
            _buildActionItem(
              context,
              Icons.settings,
              'Configuración',
              AppColors.textSecondary,
              'settings',
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionItem(BuildContext context, IconData icon, String label,
      int color, String action) {
    return InkWell(
      onTap: () => onActionSelected(action),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        margin: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(178),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Color(color).withAlpha(30),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: Color(color), size: 24),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4.0),
              child: Text(
                label,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
