enum UserRole {
  guard,
  client;

  static UserRole? fromString(String? v) {
    switch (v?.toLowerCase()) {
      case 'guard':
        return UserRole.guard;
      case 'client':
        return UserRole.client;
      default:
        return null;
    }
  }

  String get apiValue => name;
}
