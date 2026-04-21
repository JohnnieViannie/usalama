import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:movara_shift_hub/local_db/app_database.dart';
import 'package:movara_shift_hub/models/app_session.dart';
import 'package:movara_shift_hub/services/auth_service.dart';
import 'package:movara_shift_hub/services/location_service.dart';
import 'package:movara_shift_hub/services/repository.dart';
import 'package:movara_shift_hub/services/secure_store.dart';
import 'package:movara_shift_hub/services/sync_service.dart';

/// Overridden in [main] after opening SQLite.
final databaseProvider = Provider<AppDatabase>((ref) {
  throw StateError('databaseProvider not initialized');
});

final secureStoreProvider = Provider<SecureStore>((ref) => SecureStore());

final authServiceProvider = Provider<AuthService>(
  (ref) => AuthService(ref.watch(secureStoreProvider)),
);

class AuthNotifier extends StateNotifier<AppSession?> {
  AuthNotifier(this._auth) : super(null);

  final AuthService _auth;

  Future<void> hydrate() async {
    state = await _auth.restoreSession();
  }

  Future<void> loginEmail(String email, String password) async {
    final s = await _auth.loginEmail(email: email, password: password);
    await _auth.persistSession(s);
    state = s;
  }

  Future<void> loginPhone(String phone, String pin) async {
    final s = await _auth.loginPhone(phone: phone, pin: pin);
    await _auth.persistSession(s);
    state = s;
  }

  Future<void> logout() async {
    await _auth.logout();
    state = null;
  }

  Future<String> registerGuard({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required DateTime dateOfBirth,
    required String country,
    required String phoneCountryCode,
    required String phone,
    required String passportImagePath,
    String? companyName,
    String? emergencyContact,
    String? registrationNotes,
  }) {
    return _auth.registerGuard(
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: dateOfBirth,
      country: country,
      phoneCountryCode: phoneCountryCode,
      phone: phone,
      passportImagePath: passportImagePath,
      companyName: companyName,
      emergencyContact: emergencyContact,
      registrationNotes: registrationNotes,
    );
  }

  Future<Map<String, dynamic>> registrationStatusByEmail(String email) {
    return _auth.registrationStatusByEmail(email);
  }

  Future<void> verifyGuardEmail({
    required String email,
    required String code,
  }) {
    return _auth.verifyGuardEmail(email: email, code: code);
  }
}

final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AppSession?>((ref) {
  return AuthNotifier(ref.watch(authServiceProvider));
});

final repositoryProvider = Provider<Repository>((ref) {
  final db = ref.watch(databaseProvider);
  final session = ref.watch(authNotifierProvider);
  return Repository(db, session);
});

final syncServiceProvider = Provider<SyncService>(
  (ref) => SyncService(ref.watch(databaseProvider)),
);

final locationServiceProvider = Provider<LocationService>(
  (ref) => LocationService(),
);
