import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
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
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return MaterialApp(
          title: 'Consorcio App',
          theme: themeProvider.currentTheme,
          home: const AppWrapper(),
          debugShowCheckedModeBanner: false,
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('es', 'AR'),
            Locale('en', 'US'),
          ],
          locale: const Locale('es', 'AR'),
        );
      },
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
    // Usar WidgetsBinding para asegurar que el context esté disponible
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        // Mostrar splash screen mientras carga
        if (authProvider.isLoading) {
          return const SplashScreen();
        }

        // Mostrar login si no está autenticado
        if (!authProvider.isAuthenticated) {
          return const LoginScreen();
        }

        // Redirigir según el rol - CORREGIR VALORES DEL ENUM
        return _buildDashboardByRole(authProvider.user?.role);
      },
    );
  }

  Widget _buildDashboardByRole(String? role) {
    // Usar los valores exactos del enum de tu backend
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return const AdminDashboard();
      case 'MAINTENANCE':
        return const MaintenanceDashboard();
      case 'RESIDENT':
        return const ResidentDashboard();
      case 'SUPER_ADMIN': // AÑADIR para super administradores
        return const AdminDashboard();
      default:
        return const LoginScreen(); // Rol no reconocido
    }
  }
}
