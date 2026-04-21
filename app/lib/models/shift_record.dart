enum ShiftLocalKind { start, end }

class ShiftRecord {
  const ShiftRecord({
    required this.id,
    required this.guardId,
    required this.siteId,
    required this.kind,
    required this.at,
    this.latitude,
    this.longitude,
    this.synced = false,
  });

  final String id;
  final String guardId;
  final String siteId;
  final ShiftLocalKind kind;
  final DateTime at;
  final double? latitude;
  final double? longitude;
  final bool synced;
}
