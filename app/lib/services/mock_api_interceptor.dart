import 'package:dio/dio.dart';
import 'package:movara_shift_hub/services/mock_api_data.dart';

/// Short-circuits HTTP when [AppConfig.useMockApi] is enabled.
class MockApiInterceptor extends Interceptor {
  bool _pathEnds(String path, String segment) {
    final normalized = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
    return normalized.endsWith('/$segment');
  }

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final path = options.uri.path;
    if (_pathEnds(path, 'login')) {
      final data = options.data;
      String? email;
      String? phone;
      if (data is Map) {
        email = data['email'] as String?;
        phone = data['phone'] as String?;
      }
      final isClient = (email?.toLowerCase().contains('client') ?? false) ||
          (phone?.endsWith('0001') ?? false);
      final body = mockLoginResponse(isClient: isClient);
      if (!isClient) {
        final user = Map<String, dynamic>.from(body['user'] as Map);
        user['onboardingStatus'] = 'approved';
        body['user'] = user;
      }
      return handler.resolve(
        Response(
          requestOptions: options,
          statusCode: 200,
          data: body,
        ),
      );
    }

    if (_pathEnds(path, 'guard-register')) {
      return handler.resolve(
        Response(
          requestOptions: options,
          statusCode: 201,
          data: {
            'ok': true,
            'onboardingStatus': 'pending',
          },
        ),
      );
    }

    if (_pathEnds(path, 'guard-registration-status')) {
      final email = options.queryParameters['email']?.toString() ?? '';
      return handler.resolve(
        Response(
          requestOptions: options,
          statusCode: 200,
          data: {
            'registered': email.isNotEmpty,
            'email': email,
            'onboardingStatus': email.contains('approved')
                ? 'approved'
                : 'pending',
          },
        ),
      );
    }

    if (_pathEnds(path, 'assigned-checkpoints')) {
      return handler.resolve(
        Response(
          requestOptions: options,
          statusCode: 200,
          data: mockCheckpoints,
        ),
      );
    }

    if (_pathEnds(path, 'patrol-logs')) {
      return handler.resolve(
        Response(
          requestOptions: options,
          statusCode: 200,
          data: mockPatrolLogsJson(),
        ),
      );
    }

    if (_pathEnds(path, 'incidents')) {
      return handler.resolve(
        Response(
          requestOptions: options,
          statusCode: 200,
          data: mockIncidentsJson(),
        ),
      );
    }

    if (_pathEnds(path, 'reports')) {
      return handler.resolve(
        Response(
          requestOptions: options,
          statusCode: 200,
          data: [
            {
              'id': 'r-daily',
              'label': 'Daily summary',
              'periodStart': DateTime.now().toIso8601String(),
              'periodEnd': DateTime.now().toIso8601String(),
              'downloadUrl': 'https://example.com/report-daily.pdf',
            },
            {
              'id': 'r-weekly',
              'label': 'Weekly summary',
              'periodStart': DateTime.now().toIso8601String(),
              'periodEnd': DateTime.now().toIso8601String(),
              'downloadUrl': 'https://example.com/report-weekly.pdf',
            },
          ],
        ),
      );
    }

    if (path.contains('start-shift') ||
        path.contains('end-shift') ||
        path.contains('scan-checkpoint') ||
        path.contains('report-incident') ||
        path.contains('panic-alert')) {
      return handler.resolve(
        Response(requestOptions: options, statusCode: 200, data: {'ok': true}),
      );
    }

    if (_pathEnds(path, 'dashboard') || _pathEnds(path, 'activity')) {
      return handler.resolve(
        Response(
          requestOptions: options,
          statusCode: 200,
          data: {
            'guardsOnDuty': mockGuards.where((g) => g['status'] == 'on_duty').length,
            'activeSites': 2,
            'alerts': mockAlertsJson(),
          },
        ),
      );
    }

    return handler.next(options);
  }
}
