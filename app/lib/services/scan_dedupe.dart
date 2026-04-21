import 'package:movara_shift_hub/local_db/app_database.dart';
import 'package:movara_shift_hub/shared/constants.dart';

/// Pure logic for tests: returns true if a new scan is allowed at [now].
bool allowScanAfter(
  DateTime? lastScan,
  DateTime now, {
  int seconds = kScanDedupeSeconds,
}) {
  if (lastScan == null) return true;
  return now.difference(lastScan).inSeconds >= seconds;
}

Future<bool> allowCheckpointScan(AppDatabase db, String checkpointId) async {
  final last = await db.lastScanAtForCheckpoint(checkpointId);
  return allowScanAfter(last, DateTime.now());
}
