class Checkpoint {
  const Checkpoint({
    required this.id,
    required this.name,
    required this.siteId,
    required this.code,
  });

  final String id;
  final String name;
  final String siteId;
  final String code;

  factory Checkpoint.fromJson(Map<String, dynamic> json) {
    return Checkpoint(
      id: json['id'] as String,
      name: json['name'] as String,
      siteId: json['siteId'] as String,
      code: json['code'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'siteId': siteId,
        'code': code,
      };
}
