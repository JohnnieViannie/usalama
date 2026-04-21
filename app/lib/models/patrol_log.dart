class PatrolLog {
  const PatrolLog({
    required this.id,
    required this.guardId,
    required this.checkpointId,
    required this.siteId,
    required this.timestamp,
    required this.status,
    this.guardName,
    this.checkpointName,
    this.siteName,
  });

  final String id;
  final String guardId;
  final String checkpointId;
  final String siteId;
  final DateTime timestamp;
  final String status;
  final String? guardName;
  final String? checkpointName;
  final String? siteName;

  factory PatrolLog.fromJson(Map<String, dynamic> json) {
    return PatrolLog(
      id: json['id'] as String,
      guardId: json['guardId'] as String,
      checkpointId: json['checkpointId'] as String,
      siteId: json['siteId'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      status: json['status'] as String? ?? 'on_time',
      guardName: json['guardName'] as String?,
      checkpointName: json['checkpointName'] as String?,
      siteName: json['siteName'] as String?,
    );
  }
}
