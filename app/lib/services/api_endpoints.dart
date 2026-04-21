class ApiEndpoints {
  // Auth
  static const login = '/login/';
  static const guardRegister = '/guard-register/';
  static const guardRegistrationStatus = '/guard-registration-status/';
  static const guardVerifyEmail = '/guard-verify-email/';

  // Guard actions
  static const startShift = '/start-shift/';
  static const endShift = '/end-shift/';
  static const assignedCheckpoints = '/assigned-checkpoints/';
  static const scanCheckpoint = '/scan-checkpoint/';
  static const submitLocationPings = '/submit-location-pings/';
  static const reportIncident = '/report-incident/';
  static const panicAlert = '/panic-alert/';

  // Client dashboard data
  static const patrolLogs = '/patrol-logs/';
  static const incidents = '/incidents/';
  static const reports = '/reports/';
  static const dashboard = '/dashboard/';
}
