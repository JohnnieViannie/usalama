import 'dart:convert';

import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';

class AppDatabase {
  AppDatabase._(this._db);
  final Database _db;

  static const _version = 1;

  /// When [debugPath] is set (e.g. [inMemoryDatabasePath] in tests), path_provider is skipped.
  static Future<AppDatabase> open({String? debugPath}) async {
    final String path;
    if (debugPath != null) {
      path = debugPath;
    } else {
      final dir = await getApplicationDocumentsDirectory();
      path = p.join(dir.path, 'movara_shift_hub.db');
    }
    final db = await openDatabase(
      path,
      version: _version,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE sync_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            endpoint TEXT NOT NULL,
            method TEXT NOT NULL,
            body TEXT,
            created_at INTEGER NOT NULL,
            retry_count INTEGER NOT NULL DEFAULT 0
          )
        ''');
        await db.execute('''
          CREATE TABLE shifts_local (
            id TEXT PRIMARY KEY,
            guard_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            kind TEXT NOT NULL,
            at INTEGER NOT NULL,
            lat REAL,
            lng REAL,
            synced INTEGER NOT NULL DEFAULT 0
          )
        ''');
        await db.execute('''
          CREATE TABLE checkpoint_scans (
            id TEXT PRIMARY KEY,
            checkpoint_id TEXT NOT NULL,
            lat REAL,
            lng REAL,
            scanned_at INTEGER NOT NULL,
            synced INTEGER NOT NULL DEFAULT 0
          )
        ''');
        await db.execute('''
          CREATE TABLE incidents_local (
            id TEXT PRIMARY KEY,
            guard_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            image_path TEXT,
            created_at INTEGER NOT NULL,
            lat REAL,
            lng REAL,
            synced INTEGER NOT NULL DEFAULT 0
          )
        ''');
        await db.execute('''
          CREATE TABLE panic_alerts (
            id TEXT PRIMARY KEY,
            guard_id TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            lat REAL,
            lng REAL,
            synced INTEGER NOT NULL DEFAULT 0
          )
        ''');
        await db.execute('''
          CREATE TABLE kv_cache (
            k TEXT PRIMARY KEY,
            v TEXT NOT NULL,
            updated_at INTEGER NOT NULL
          )
        ''');
      },
    );
    return AppDatabase._(db);
  }

  Future<void> close() => _db.close();

  // —— Sync queue ——

  Future<int> enqueueSync({
    required String endpoint,
    required String method,
    Map<String, dynamic>? body,
  }) {
    return _db.insert('sync_queue', {
      'endpoint': endpoint,
      'method': method,
      'body': body == null ? null : jsonEncode(body),
      'created_at': DateTime.now().millisecondsSinceEpoch,
      'retry_count': 0,
    });
  }

  Future<List<Map<String, dynamic>>> pendingQueue() async {
    return _db.query('sync_queue', orderBy: 'id ASC');
  }

  Future<void> removeQueueRow(int id) async {
    await _db.delete('sync_queue', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> bumpRetry(int id, int retry) async {
    await _db.update(
      'sync_queue',
      {'retry_count': retry},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // —— Shifts ——

  Future<void> insertShift({
    required String id,
    required String guardId,
    required String siteId,
    required String kind,
    required DateTime at,
    double? lat,
    double? lng,
    int synced = 0,
  }) async {
    await _db.insert('shifts_local', {
      'id': id,
      'guard_id': guardId,
      'site_id': siteId,
      'kind': kind,
      'at': at.millisecondsSinceEpoch,
      'lat': lat,
      'lng': lng,
      'synced': synced,
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<Map<String, dynamic>?> latestShiftForGuard(String guardId) async {
    final rows = await _db.query(
      'shifts_local',
      where: 'guard_id = ?',
      whereArgs: [guardId],
      orderBy: 'at DESC',
      limit: 1,
    );
    if (rows.isEmpty) return null;
    return rows.first;
  }

  Future<void> markShiftSynced(String id) async {
    await _db.update(
      'shifts_local',
      {'synced': 1},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // —— Scans ——

  Future<void> insertScan({
    required String id,
    required String checkpointId,
    required DateTime scannedAt,
    double? lat,
    double? lng,
    int synced = 0,
  }) async {
    await _db.insert('checkpoint_scans', {
      'id': id,
      'checkpoint_id': checkpointId,
      'scanned_at': scannedAt.millisecondsSinceEpoch,
      'lat': lat,
      'lng': lng,
      'synced': synced,
    });
  }

  Future<DateTime?> lastScanAtForCheckpoint(String checkpointId) async {
    final rows = await _db.query(
      'checkpoint_scans',
      columns: ['scanned_at'],
      where: 'checkpoint_id = ?',
      whereArgs: [checkpointId],
      orderBy: 'scanned_at DESC',
      limit: 1,
    );
    if (rows.isEmpty) return null;
    final ms = rows.first['scanned_at'] as int;
    return DateTime.fromMillisecondsSinceEpoch(ms);
  }

  Future<List<Map<String, dynamic>>> scansForGuardCheckpoints(
    Iterable<String> checkpointIds,
  ) async {
    if (checkpointIds.isEmpty) return [];
    final placeholders = List.filled(checkpointIds.length, '?').join(',');
    return _db.rawQuery(
      'SELECT checkpoint_id, MAX(scanned_at) as last_at FROM checkpoint_scans '
      'WHERE checkpoint_id IN ($placeholders) GROUP BY checkpoint_id',
      checkpointIds.toList(),
    );
  }

  // —— Incidents ——

  Future<void> insertIncident({
    required String id,
    required String guardId,
    required String siteId,
    required String title,
    required String description,
    String? imagePath,
    required DateTime createdAt,
    double? lat,
    double? lng,
    int synced = 0,
  }) async {
    await _db.insert('incidents_local', {
      'id': id,
      'guard_id': guardId,
      'site_id': siteId,
      'title': title,
      'description': description,
      'image_path': imagePath,
      'created_at': createdAt.millisecondsSinceEpoch,
      'lat': lat,
      'lng': lng,
      'synced': synced,
    });
  }

  Future<List<Map<String, dynamic>>> localIncidents(String guardId) async {
    return _db.query(
      'incidents_local',
      where: 'guard_id = ?',
      whereArgs: [guardId],
      orderBy: 'created_at DESC',
    );
  }

  // —— Panic ——

  Future<void> insertPanic({
    required String id,
    required String guardId,
    required DateTime createdAt,
    double? lat,
    double? lng,
    int synced = 0,
  }) async {
    await _db.insert('panic_alerts', {
      'id': id,
      'guard_id': guardId,
      'created_at': createdAt.millisecondsSinceEpoch,
      'lat': lat,
      'lng': lng,
      'synced': synced,
    });
  }

  // —— Key-value cache (JSON blobs) ——

  Future<void> putCache(String key, String json) async {
    await _db.insert(
      'kv_cache',
      {
        'k': key,
        'v': json,
        'updated_at': DateTime.now().millisecondsSinceEpoch,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<String?> getCache(String key) async {
    final rows = await _db.query('kv_cache', where: 'k = ?', whereArgs: [key]);
    if (rows.isEmpty) return null;
    return rows.first['v'] as String?;
  }
}
