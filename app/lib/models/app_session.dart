import 'package:movara_shift_hub/models/app_user.dart';
import 'package:movara_shift_hub/models/user_role.dart';

class AppSession {
  const AppSession({
    required this.user,
    required this.role,
    required this.accessToken,
  });

  final AppUser user;
  final UserRole role;
  final String accessToken;

  bool get isGuard => role == UserRole.guard;
  bool get isClient => role == UserRole.client;

  factory AppSession.fromLoginJson(Map<String, dynamic> json, String token) {
    final userJson = json['user'] as Map<String, dynamic>? ?? {};
    final role = UserRole.fromString(json['role'] as String?) ?? UserRole.guard;
    return AppSession(
      user: AppUser.fromJson(userJson),
      role: role,
      accessToken: token,
    );
  }
}
