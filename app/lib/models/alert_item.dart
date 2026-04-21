class AlertItem {
  const AlertItem({
    required this.id,
    required this.type,
    required this.guardId,
    required this.timestamp,
    required this.status,
    this.guardName,
  });

  final String id;
  final String type;
  final String guardId;
  final DateTime timestamp;
  final String status;
  final String? guardName;

  factory AlertItem.fromJson(Map<String, dynamic> json) {
    return AlertItem(
      id: json['id'] as String,
      type: json['type'] as String,
      guardId: json['guardId'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      status: json['status'] as String? ?? 'unresolved',
      guardName: json['guardName'] as String?,
    );
  }
}
