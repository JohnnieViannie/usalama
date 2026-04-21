import 'package:dio/dio.dart';
import 'package:movara_shift_hub/services/app_config.dart';
import 'package:movara_shift_hub/services/mock_api_interceptor.dart';
import 'package:movara_shift_hub/shared/constants.dart';

Dio createDio({String? accessToken}) {
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.baseUrl,
      connectTimeout: Duration(seconds: kApiTimeoutSeconds),
      receiveTimeout: Duration(seconds: kApiTimeoutSeconds),
      headers: {
        'Content-Type': 'application/json',
        if (accessToken != null && accessToken.isNotEmpty)
          'Authorization': 'Bearer $accessToken',
      },
    ),
  );

  if (AppConfig.useMockApi) {
    dio.interceptors.add(MockApiInterceptor());
  }

  return dio;
}
