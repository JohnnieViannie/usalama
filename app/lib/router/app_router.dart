import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:movara_shift_hub/client/client_root_shell.dart';
import 'package:movara_shift_hub/guard/guard_root_shell.dart';
import 'package:movara_shift_hub/models/app_session.dart';
import 'package:movara_shift_hub/models/user_role.dart';
import 'package:movara_shift_hub/providers/providers.dart';
import 'package:movara_shift_hub/screens/auth/login_screen.dart';
import 'package:movara_shift_hub/screens/auth/signup_screen.dart';
import 'package:movara_shift_hub/screens/splash_screen.dart';

/// Notifies [GoRouter] when [authNotifierProvider] changes.
class _AuthRefresh extends ChangeNotifier {
  _AuthRefresh(this._ref) {
    _ref.listen<AppSession?>(
      authNotifierProvider,
      (previous, next) => notifyListeners(),
    );
  }

  final Ref _ref;
}

final _authRefreshProvider = Provider<_AuthRefresh>((ref) {
  final n = _AuthRefresh(ref);
  ref.onDispose(n.dispose);
  return n;
});

final appRouterProvider = Provider<GoRouter>((ref) {
  final refresh = ref.watch(_authRefreshProvider);
  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: refresh,
    redirect: (context, state) {
      final path = state.matchedLocation;
      final session = ref.read(authNotifierProvider);

      if (path == '/splash') return null;

      if (session == null) {
        return (path == '/login' || path == '/signup') ? null : '/login';
      }

      if (path == '/login' || path == '/signup') {
        return session.isGuard ? '/guard' : '/client';
      }

      if (session.role == UserRole.guard && path.startsWith('/client')) {
        return '/guard';
      }
      if (session.role == UserRole.client && path.startsWith('/guard')) {
        return '/client';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: '/guard',
        builder: (context, state) => const GuardRootShell(),
      ),
      GoRoute(
        path: '/client',
        builder: (context, state) => const ClientRootShell(),
      ),
    ],
  );
});
