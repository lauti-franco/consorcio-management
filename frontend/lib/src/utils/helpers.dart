import 'package:intl/intl.dart';

class Helpers {
  static String formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      symbol: '\$',
      decimalDigits: 2,
    );
    return formatter.format(amount);
  }

  static String formatDate(DateTime date, {String format = 'dd/MM/yyyy'}) {
    return DateFormat(format).format(date);
  }

  static String getStatusText(String status) {
    switch (status) {
      case 'OPEN':
        return 'Abierto';
      case 'PAID':
        return 'Pagado';
      case 'OVERDUE':
        return 'Vencido';
      case 'PENDING':
        return 'Pendiente';
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'COMPLETED':
        return 'Completado';
      case 'RESOLVED':
        return 'Resuelto';
      default:
        return status;
    }
  }

  static String getRoleText(String role) {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'MAINTENANCE':
        return 'Mantenimiento';
      case 'RESIDENT':
        return 'Residente';
      default:
        return role;
    }
  }

  static bool isEmailValid(String email) {
    final regex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    return regex.hasMatch(email);
  }
}
