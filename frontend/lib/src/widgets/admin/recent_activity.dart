import 'package:flutter/material.dart';

class RecentActivity extends StatelessWidget {
  final List<dynamic> activities;

  const RecentActivity({super.key, required this.activities});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Actividad Reciente',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            TextButton(
              onPressed: () {
                // Navigator.pushNamed(context, '/activity-log');
              },
              child: const Text('Ver todo'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Card(
          child: activities.isEmpty
              ? _buildEmptyState()
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: activities.length,
                  separatorBuilder: (context, index) =>
                      const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final activity = activities[index];
                    return _buildActivityItem(context, activity, index);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return const Padding(
      padding: EdgeInsets.all(32.0),
      child: Column(
        children: [
          Icon(Icons.history, size: 48, color: Colors.grey),
          SizedBox(height: 8),
          Text('No hay actividad reciente'),
        ],
      ),
    );
  }

  Widget _buildActivityItem(
      BuildContext context, Map<String, dynamic> activity, int index) {
    final theme = Theme.of(context);

    return ListTile(
      leading: _getActivityIcon(activity['type']),
      title: Text(
        activity['description'] ?? 'Actividad sin descripción',
        style: theme.textTheme.bodyMedium,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      subtitle: Text(
        _formatTimestamp(activity['timestamp']),
        style: theme.textTheme.bodySmall?.copyWith(
          color: theme.colorScheme.onSurface.withAlpha(150),
        ),
      ),
      trailing: Text(
        activity['user'] ?? 'Sistema',
        style: theme.textTheme.bodySmall?.copyWith(
          fontWeight: FontWeight.w500,
        ),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
    );
  }

  Widget _getActivityIcon(String? type) {
    Color color;
    IconData icon;

    switch (type?.toUpperCase()) {
      case 'EXPENSE_CREATED':
        color = Colors.green;
        icon = Icons.receipt;
        break;
      case 'TICKET_RESOLVED':
        color = Colors.blue;
        icon = Icons.support_agent;
        break;
      case 'TASK_COMPLETED':
        color = Colors.orange;
        icon = Icons.assignment_turned_in;
        break;
      case 'PAYMENT_RECEIVED':
        color = Colors.green;
        icon = Icons.payment;
        break;
      case 'USER_REGISTERED':
        color = Colors.purple;
        icon = Icons.person_add;
        break;
      default:
        color = Colors.grey;
        icon = Icons.notifications;
    }

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: color, size: 18),
    );
  }

  String _formatTimestamp(String? timestamp) {
    if (timestamp == null) return 'Hace un momento';

    try {
      final dateTime = DateTime.parse(timestamp);
      final now = DateTime.now();
      final difference = now.difference(dateTime);

      if (difference.inMinutes < 1) return 'Hace un momento';
      if (difference.inMinutes < 60) return 'Hace ${difference.inMinutes} min';
      if (difference.inHours < 24) return 'Hace ${difference.inHours} h';
      if (difference.inDays < 7) return 'Hace ${difference.inDays} días';

      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    } catch (e) {
      return 'Fecha inválida';
    }
  }
}
