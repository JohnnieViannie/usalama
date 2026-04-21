import 'dart:convert';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:movara_shift_hub/local_db/app_database.dart';
import 'package:movara_shift_hub/models/app_session.dart';
import 'package:movara_shift_hub/services/api_client.dart';

class SyncService {
  SyncService(this._db);

  final AppDatabase _db;
  static const _maxRetries = 8;

  Future<void> runPending(AppSession? session) async {
    if (session == null) return;
    final connectivity = await Connectivity().checkConnectivity();
    final offline = connectivity.isEmpty ||
        connectivity.every((r) => r == ConnectivityResult.none);
    if (offline) return;

    final dio = createDio(accessToken: session.accessToken);
    final rows = await _db.pendingQueue();
    for (final row in rows) {
      final id = row['id'] as int;
      final retry = (row['retry_count'] as int?) ?? 0;
      if (retry >= _maxRetries) continue;

      final endpoint = row['endpoint'] as String;
      final method = (row['method'] as String).toUpperCase();
      final bodyRaw = row['body'] as String?;
      Map<String, dynamic>? body;
      if (bodyRaw != null && bodyRaw.isNotEmpty) {
        body = jsonDecode(bodyRaw) as Map<String, dynamic>;
      }

      try {
        await _send(dio, method, endpoint, body);
        await _db.removeQueueRow(id);
      } catch (_) {
        await _db.bumpRetry(id, retry + 1);
      }
    }
  }

  Future<void> _send(
    Dio dio,
    String method,
    String path,
    Map<String, dynamic>? body,
  ) async {
    switch (method) {
      case 'POST':
        await dio.post<dynamic>(path, data: body);
        return;
      default:
        await dio.post<dynamic>(path, data: body);
    }
  }
}
