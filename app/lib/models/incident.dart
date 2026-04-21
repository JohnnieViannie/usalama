class Incident {
  const Incident({
    required this.id,
    required this.guardId,
    required this.siteId,
    required this.title,
    required this.description,
    required this.timestamp,
    this.imageUrl,
    this.imagePath,
    this.guardName,
    this.synced = false,
  });

  final String id;
  final String guardId;
  final String siteId;
  final String title;
  final String description;
  final DateTime timestamp;
  final String? imageUrl;
  final String? imagePath;
  final String? guardName;
  final bool synced;

  factory Incident.fromJson(Map<String, dynamic> json) {
    return Incident(
      id: json['id'] as String,
      guardId: json['guardId'] as String,
      siteId: json['siteId'] as String,
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      timestamp: DateTime.parse(json['timestamp'] as String),
      imageUrl: json['imageUrl'] as String?,
      guardName: json['guardName'] as String?,
      synced: true,
    );
  }
}
