import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:window_manager/window_manager.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/providers/auth_provider.dart';
import 'features/dashboard/presentation/providers/dashboard_provider.dart';
import 'features/exam/presentation/providers/exam_provider.dart';
import 'features/auth/presentation/pages/login_page.dart';
import 'features/auth/presentation/pages/splash_page.dart';
import 'features/dashboard/presentation/pages/dashboard_page.dart';
import 'features/exam/presentation/pages/exam_session_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Platform specific window setup
  try {
    await windowManager.ensureInitialized();
    WindowOptions windowOptions = const WindowOptions(
      size: Size(375, 812), // iPhone X/11 dimensions
      center: true,
      backgroundColor: Colors.transparent,
      skipTaskbar: false,
      titleBarStyle: TitleBarStyle.normal,
    );
    windowManager.waitUntilReadyToShow(windowOptions, () async {
      await windowManager.show();
      await windowManager.focus();
    });
  } catch (e) {
    debugPrint('WindowManager not supported on this platform');
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
        ChangeNotifierProvider(create: (_) => ExamProvider()),
      ],
      child: const TenExamApp(),
    ),
  );
}

class TenExamApp extends StatelessWidget {
  const TenExamApp({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    final router = GoRouter(
      initialLocation: '/splash',
      refreshListenable: authProvider,
      redirect: (context, state) {
        final status = authProvider.status;
        final matchedLocation = state.matchedLocation;

        debugPrint('[Router] Status: $status, Location: $matchedLocation');

        // 1. Jika status masih Unknown (sedang init di Splash), tetap di Splash
        if (status == AuthStatus.unknown) return '/splash';

        // 2. Jika tidak terautentikasi dan tidak di halaman Login, lempar ke Login
        if (status == AuthStatus.unauthenticated && matchedLocation != '/login') {
          return '/login';
        }

        // 3. Jika terautentikasi tapi masih di Login atau Splash, lempar ke Dashboard
        if (status == AuthStatus.authenticated && 
           (matchedLocation == '/login' || matchedLocation == '/splash')) {
          return '/dashboard';
        }

        return null;
      },
      routes: [
        GoRoute(
          path: '/splash',
          builder: (context, state) => const SplashPage(),
        ),
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginPage(),
        ),
        GoRoute(
          path: '/exam/:id',
          builder: (context, state) {
            final id = int.parse(state.pathParameters['id']!);
            return ExamSessionPage(examId: id);
          },
        ),
        GoRoute(
          path: '/dashboard',
          builder: (context, state) => const DashboardPage(),
        ),
      ],
    );

    return MaterialApp.router(
      title: 'TenExam Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: router,
    );
  }
}
