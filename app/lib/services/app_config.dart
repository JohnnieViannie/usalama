import 'package:movara_shift_hub/shared/constants.dart';

class AppConfig {
  static String get baseUrl {
    if (kApiBaseUrlOverride.isNotEmpty) return kApiBaseUrlOverride;
    return kAppEnv == 'prod' ? kProdApiBaseUrl : kDevApiBaseUrl;
  }

  static bool get useMockApi => kUseMockApi;
}
