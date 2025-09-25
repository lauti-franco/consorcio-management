// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'app.dart';
import 'src/providers/auth_provider.dart';
import 'src/providers/theme_provider.dart';
import 'src/providers/expense_provider.dart';
import 'src/providers/ticket_provider.dart';
import 'src/services/storage_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializar servicios
  await StorageService.init();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => ThemeProvider()),
        ChangeNotifierProvider(create: (context) => AuthProvider()),
        ChangeNotifierProvider(create: (context) => ExpenseProvider()),
        ChangeNotifierProvider(create: (context) => TicketProvider()),
      ],
      child: const ConsorcioApp(),
    ),
  );
}
