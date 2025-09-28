import 'package:flutter/material.dart';
import '../../utils/constants.dart';

class StatsGrid extends StatelessWidget {
  final Map<String, dynamic> stats;

  const StatsGrid({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.2,
      children: [
        _buildStatCard(
          context,
          'Residentes',
          stats['totalResidents']?.toString() ?? '0',
          Icons.people,
          AppColors.infoColor,
        ),
        _buildStatCard(
          context,
          'Tickets Activos',
          stats['activeTickets']?.toString() ?? '0',
          Icons.support_agent,
          AppColors.warningColor,
        ),
        _buildStatCard(
          context,
          'Expensas Pendientes',
          stats['pendingExpenses']?.toString() ?? '0',
          Icons.payment,
          AppColors.secondaryColor,
        ),
        _buildStatCard(
          context,
          'Ingresos Mensuales',
          '\$${(stats['monthlyRevenue']?.toDouble() ?? 0).toStringAsFixed(2)}',
          Icons.attach_money,
          AppColors.successColor,
        ),
        _buildStatCard(
          context,
          'Edificios',
          stats['totalBuildings']?.toString() ?? '0',
          Icons.apartment,
          AppColors.primaryColor,
        ),
        _buildStatCard(
          context,
          'Tasa Ocupación',
          '${(stats['occupancyRate']?.toDouble() ?? 0).toStringAsFixed(1)}%',
          Icons.percent,
          AppColors.successColor,
        ),
      ],
    );
  }

  Widget _buildStatCard(BuildContext context, String title, String value,
      IconData icon, int color) {
    final theme = Theme.of(context);

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Color(color).withAlpha(30),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: Color(color), size: 20),
                ),
                if (_getTrendIcon(title) != null)
                  Icon(_getTrendIcon(title),
                      color: _getTrendColor(title), size: 16),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
            Text(
              title,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withAlpha(150),
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  IconData? _getTrendIcon(String title) {
    switch (title) {
      case 'Ingresos Mensuales':
        return Icons.trending_up;
      case 'Tickets Activos':
        return Icons.trending_down;
      default:
        return null;
    }
  }

  Color? _getTrendColor(String title) {
    switch (title) {
      case 'Ingresos Mensuales':
        return Colors.green;
      case 'Tickets Activos':
        return Colors.red;
      default:
        return null;
    }
  }
}
