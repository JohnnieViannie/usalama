/// Duplicate scan suppression window (same checkpoint).
const kScanDedupeSeconds = 90;

const kApiTimeoutSeconds = 30;

/// Set `true` or use `--dart-define=USE_MOCK_API=true` for offline demo without backend.
const bool kUseMockApi = bool.fromEnvironment('USE_MOCK_API', defaultValue: false);

/// Optional full base URL override including `/api/` (highest priority).
const String kApiBaseUrlOverride = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: '',
);

/// Environment selector: `dev` or `prod`.
const String kAppEnv = String.fromEnvironment('APP_ENV', defaultValue: 'dev');

/// Defaults can be overridden with dart-define.
const String kDevApiBaseUrl = String.fromEnvironment(
  'DEV_API_BASE_URL',
  defaultValue: 'http://127.0.0.1:8080/api/',
);
const String kProdApiBaseUrl = String.fromEnvironment(
  'PROD_API_BASE_URL',
  defaultValue: 'https://api.example.com/api/',
);
