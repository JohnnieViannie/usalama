import 'package:dio/dio.dart';
import 'package:movara_shift_hub/models/app_session.dart';
import 'package:movara_shift_hub/services/api_client.dart';
import 'package:movara_shift_hub/services/api_endpoints.dart';
import 'package:movara_shift_hub/services/secure_store.dart';

class AuthService {
  AuthService(this._store);

  final SecureStore _store;

  Future<AppSession?> restoreSession() => _store.readSession();

  Future<AppSession> loginEmail({
    required String email,
    required String password,
  }) async {
    final dio = createDio();
    final res = await dio.post<Map<String, dynamic>>(
      ApiEndpoints.login,
      data: {'email': email, 'password': password},
    );
    return _sessionFromResponse(res.data!);
  }

  Future<AppSession> loginPhone({
    required String phone,
    required String pin,
  }) async {
    final dio = createDio();
    final res = await dio.post<Map<String, dynamic>>(
      ApiEndpoints.login,
      data: {'phone': phone, 'pin': pin},
    );
    return _sessionFromResponse(res.data!);
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
  }) async {
    final dio = createDio();
    final form = FormData.fromMap({
      'email': email,
      'password': password,
      'firstName': firstName,
      'lastName': lastName,
      'dateOfBirth': dateOfBirth.toIso8601String().substring(0, 10),
      'country': country,
      'phoneCountryCode': phoneCountryCode,
      'phone': phone,
      'companyName': companyName,
      'emergencyContact': emergencyContact,
      'registrationNotes': registrationNotes,
      'passportImage': await MultipartFile.fromFile(passportImagePath),
    });
    final res = await dio.post<Map<String, dynamic>>(
      ApiEndpoints.guardRegister,
      data: form,
    );
    return res.data?['onboardingStatus'] as String? ?? 'pending';
  }

  Future<Map<String, dynamic>> registrationStatusByEmail(String email) async {
    final dio = createDio();
    final res = await dio.get<Map<String, dynamic>>(
      ApiEndpoints.guardRegistrationStatus,
      queryParameters: {'email': email},
    );
    return res.data ?? <String, dynamic>{};
  }

  Future<void> verifyGuardEmail({
    required String email,
    required String code,
  }) async {
    final dio = createDio();
    await dio.post<Map<String, dynamic>>(
      ApiEndpoints.guardVerifyEmail,
      data: {
        'email': email,
        'code': code,
      },
    );
  }

  AppSession _sessionFromResponse(Map<String, dynamic> data) {
    final token = data['token'] as String? ?? data['access_token'] as String? ?? '';
    final session = AppSession.fromLoginJson(data, token);
    return session;
  }

  Future<void> persistSession(AppSession session) => _store.saveSession(session);

  Future<void> logout() => _store.clear();
}
