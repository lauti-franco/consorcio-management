import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/constants.dart'; // ← AÑADIR import

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _obscurePassword = true; // ← AÑADIR para toggle de contraseña

  @override
  void initState() {
    super.initState();
    _setupTestCredentials(); // ← AÑADIR para testing
  }

  // ✅ MÉTODO PARA CREDENCIALES DE PRUEBA
  void _setupTestCredentials() {
    // Solo en desarrollo - pre-llenar credenciales de prueba
    if (!const bool.fromEnvironment('dart.vm.product')) {
      _emailController.text = 'admin@consorcio.com';
      _passwordController.text = 'password123';
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final theme = Theme.of(context);

    // ✅ MEJORAR la redirección automática
    if (authProvider.isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _redirectByRole(authProvider.user?.role);
      });
    }

    return Scaffold(
      backgroundColor: theme.colorScheme.surface,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 40),

                // ✅ MEJORAR logo/icono
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: theme.primaryColor.withAlpha(25),
                    shape: BoxShape.circle,
                  ),
                  child:
                      const Icon(Icons.apartment, size: 60, color: Colors.blue),
                ),

                const SizedBox(height: 32),

                // ✅ MEJORAR título
                Text(
                  AppConstants.appName,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.primary,
                  ),
                ),

                const SizedBox(height: 8),

                Text(
                  'Inicia sesión en tu cuenta',
                  style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.colorScheme.onSurface.withAlpha(178)),
                ),

                const SizedBox(height: 32),

                // ✅ MEJORAR mensaje de error
                if (authProvider.errorMessage.isNotEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red[50],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline,
                            color: Colors.red, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            authProvider.errorMessage,
                            style: const TextStyle(color: Colors.red),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, size: 16),
                          onPressed: authProvider.clearError,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                      ],
                    ),
                  ),

                if (authProvider.errorMessage.isNotEmpty)
                  const SizedBox(height: 16),

                // ✅ MEJORAR campo email
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    hintText: 'tu@email.com',
                    prefixIcon: Icon(Icons.email_outlined),
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return AppStrings.requiredField;
                    }
                    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
                        .hasMatch(value)) {
                      return AppStrings.invalidEmail;
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 16),

                // ✅ MEJORAR campo contraseña con toggle
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'Contraseña',
                    hintText: 'Ingresa tu contraseña',
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility
                            : Icons.visibility_off,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                    border: const OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return AppStrings.requiredField;
                    }
                    if (value.length < 6) {
                      return AppStrings.invalidPassword;
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 24),

                // ✅ MEJORAR botón de login
                authProvider.isLoading
                    ? const CircularProgressIndicator()
                    : SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: _login,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: theme.colorScheme.primary,
                            foregroundColor: theme.colorScheme.onPrimary,
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Text(
                            'Iniciar Sesión',
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ),

                // ✅ AÑADIR enlace de registro
                const SizedBox(height: 20),
                TextButton(
                  onPressed: () {
                    // Navigator.pushNamed(context, '/register');
                    _showRegisterInfo(context); // ← Temporal para testing
                  },
                  child: Text(
                    '¿No tienes cuenta? Regístrate aquí',
                    style: TextStyle(color: theme.colorScheme.primary),
                  ),
                ),

                // ✅ AÑADIR información de testing
                if (!const bool.fromEnvironment('dart.vm.product'))
                  _buildTestInfo(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ✅ MÉTODO PARA INFO DE TESTING
  Widget _buildTestInfo(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 32),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Credenciales de prueba:',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 8),
          Text('Admin: admin@consorcio.com / password123'),
          Text('Residente: residente@consorcio.com / password123'),
        ],
      ),
    );
  }

  // ✅ MEJORAR método de login
  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    // Ocultar teclado
    FocusScope.of(context).unfocus();

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.login(
        _emailController.text.trim(),
        _passwordController.text,
      );

      // ✅ MOSTRAR feedback de éxito
      if (authProvider.isAuthenticated) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('¡Bienvenido ${authProvider.user?.name}!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      // El error ya se maneja en el AuthProvider
    }
  }

  // ✅ MEJORAR redirección por rol
  void _redirectByRole(String? role) {
    // Usar Navigator para reemplazar la pantalla actual
    switch (role?.toUpperCase()) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        Navigator.pushReplacementNamed(context, '/admin');
        break;
      case 'MAINTENANCE':
        Navigator.pushReplacementNamed(context, '/maintenance');
        break;
      case 'RESIDENT':
        Navigator.pushReplacementNamed(context, '/resident');
        break;
      default:
        Navigator.pushReplacementNamed(context, '/home');
    }
  }

  // ✅ MÉTODO TEMPORAL para info de registro
  void _showRegisterInfo(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Registro'),
        content: const Text(
            'La funcionalidad de registro estará disponible pronto.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
