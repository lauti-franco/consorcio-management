import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'app.dart';
import 'src/providers/auth_provider.dart';
import 'src/providers/theme_provider.dart';
import 'src/providers/expense_provider.dart';
import 'src/providers/ticket_provider.dart';
import 'src/providers/building_provider.dart';
import 'src/providers/dashboard_provider.dart';
import 'src/providers/documents_provider.dart'; // ✅ NUEVO IMPORT
import 'src/services/storage_service.dart';
import 'src/services/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializar servicios
  await StorageService.init();
  await ApiService.init();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => ThemeProvider()),
        ChangeNotifierProvider(create: (context) => AuthProvider()),
        ChangeNotifierProvider(create: (context) => ExpenseProvider()),
        ChangeNotifierProvider(create: (context) => TicketProvider()),
        ChangeNotifierProvider(create: (context) => DashboardProvider()),
        ChangeNotifierProvider(create: (context) => BuildingProvider()),
        ChangeNotifierProvider(
            create: (context) => DocumentsProvider()), // ✅ NUEVO PROVIDER
      ],
      child: const ConsorcioApp(),
    ),
  );
}
