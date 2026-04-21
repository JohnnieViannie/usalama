import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:movara_shift_hub/models/app_session.dart';
import 'package:movara_shift_hub/models/app_user.dart';
import 'package:movara_shift_hub/models/user_role.dart';

const _kToken = 'access_token';
const _kUserJson = 'user_json';
const _kRole = 'role';

class SecureStore {
  SecureStore({FlutterSecureStorage? storage})
      : _s = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _s;

  Future<void> saveSession(AppSession session) async {
    await _s.write(key: _kToken, value: session.accessToken);
    await _s.write(key: _kUserJson, value: jsonEncode(session.user.toJson()));
    await _s.write(key: _kRole, value: session.role.apiValue);
  }

  Future<AppSession?> readSession() async {
    final token = await _s.read(key: _kToken);
    final userRaw = await _s.read(key: _kUserJson);
    final roleRaw = await _s.read(key: _kRole);
    if (token == null || token.isEmpty || userRaw == null || roleRaw == null) {
      return null;
    }
    final role = UserRole.fromString(roleRaw);
    if (role == null) return null;
    final userMap = jsonDecode(userRaw) as Map<String, dynamic>;
    return AppSession(
      user: AppUser.fromJson(userMap),
      role: role,
      accessToken: token,
    );
  }

  Future<void> clear() async {
    await _s.deleteAll();
  }
}
