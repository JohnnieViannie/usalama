class AppUser {
  const AppUser({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.siteId,
    this.siteName,
    this.companyName,
    this.onboardingStatus,
  });

  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? siteId;
  final String? siteName;
  final String? companyName;
  final String? onboardingStatus;

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] as String? ?? json['_id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      siteId: json['siteId'] as String? ?? json['site_id'] as String?,
      siteName: json['siteName'] as String? ?? json['site_name'] as String?,
      companyName:
          json['companyName'] as String? ?? json['company_name'] as String?,
      onboardingStatus: json['onboardingStatus'] as String? ??
          json['onboarding_status'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'phone': phone,
        'siteId': siteId,
        'siteName': siteName,
        'companyName': companyName,
        'onboardingStatus': onboardingStatus,
      };
}
