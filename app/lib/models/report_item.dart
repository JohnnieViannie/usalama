class ReportItem {
  const ReportItem({
    required this.id,
    required this.label,
    required this.periodStart,
    required this.periodEnd,
    this.downloadUrl,
  });

  final String id;
  final String label;
  final DateTime periodStart;
  final DateTime periodEnd;
  final String? downloadUrl;
}
