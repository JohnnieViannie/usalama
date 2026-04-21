class Site {
  const Site({
    required this.id,
    required this.name,
    this.location,
    this.description,
  });

  final String id;
  final String name;
  final String? location;
  final String? description;

  factory Site.fromJson(Map<String, dynamic> json) {
    return Site(
      id: json['id'] as String,
      name: json['name'] as String,
      location: json['location'] as String?,
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'location': location,
        'description': description,
      };
}
