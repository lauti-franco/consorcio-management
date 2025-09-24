import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'src/providers/auth_provider.dart';
import 'src/providers/theme_provider.dart';
import 'src/screens/auth/login_screen.dart';
import 'src/screens/auth/splash_screen.dart';
import 'src/screens/admin/admin_dashboard.dart';
import 'src/screens/maintenance/maintenance_dashboard.dart';
import 'src/screens/resident/resident_dashboard.dart';

class ConsorcioApp extends StatelessWidget {
  const ConsorcioApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);

    return MaterialApp(
      title: 'Consorcio App',
      theme: themeProvider.currentTheme,
      home: const AppWrapper(),
      debugShowCheckedModeBanner: false,
      supportedLocales: const [
        Locale('es', 'AR'),
        Locale('en', 'US'),
      ],
    );
  }
}

class AppWrapper extends StatefulWidget {
  const AppWrapper({super.key});

  @override
  State<AppWrapper> createState() => _AppWrapperState();
}

class _AppWrapperState extends State<AppWrapper> {
  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.initialize();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    if (authProvider.isLoading) {
      return const SplashScreen();
    }

    if (!authProvider.isAuthenticated) {
      return const LoginScreen();
    }

    // Mostrar dashboard según el rol
    switch (authProvider.user?.role) {
      case 'ADMIN':
        return const AdminDashboard();
      case 'MAINTENANCE':
        return const MaintenanceDashboard();
      case 'RESIDENT':
        return const ResidentDashboard();
      default:
        return const LoginScreen();
    }
  }
}
