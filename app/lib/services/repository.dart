import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:movara_shift_hub/local_db/app_database.dart';
import 'package:movara_shift_hub/models/alert_item.dart';
import 'package:movara_shift_hub/models/app_session.dart';
import 'package:movara_shift_hub/models/checkpoint.dart';
import 'package:movara_shift_hub/models/incident.dart';
import 'package:movara_shift_hub/models/patrol_log.dart';
import 'package:movara_shift_hub/models/report_item.dart';
import 'package:movara_shift_hub/services/api_client.dart';
import 'package:movara_shift_hub/services/api_endpoints.dart';
import 'package:uuid/uuid.dart';

const _cacheCheckpoints = 'assigned_checkpoints';
const _cachePatrolLogs = 'patrol_logs';
const _cacheIncidents = 'incidents';

class Repository {
  Repository(this._db, this._session);

  final AppDatabase _db;
  final AppSession? _session;

  Dio get _dio => createDio(accessToken: _session?.accessToken);

  // —— Guard ——

  Future<void> startShift({
    required String siteId,
    double? lat,
    double? lng,
  }) async {
    final guardId = _session!.user.id;
    final id = const Uuid().v4();
    final at = DateTime.now();
    await _db.insertShift(
      id: id,
      guardId: guardId,
      siteId: siteId,
      kind: 'start',
      at: at,
      lat: lat,
      lng: lng,
    );
    await _db.enqueueSync(
      endpoint: ApiEndpoints.startShift,
      method: 'POST',
      body: {
        'guardId': guardId,
        'siteId': siteId,
        'timestamp': at.toIso8601String(),
        'latitude': lat,
        'longitude': lng,
      },
    );
  }

  Future<void> endShift({
    required String siteId,
    double? lat,
    double? lng,
  }) async {
    final guardId = _session!.user.id;
    final id = const Uuid().v4();
    final at = DateTime.now();
    await _db.insertShift(
      id: id,
      guardId: guardId,
      siteId: siteId,
      kind: 'end',
      at: at,
      lat: lat,
      lng: lng,
    );
    await _db.enqueueSync(
      endpoint: ApiEndpoints.endShift,
      method: 'POST',
      body: {
        'guardId': guardId,
        'siteId': siteId,
        'timestamp': at.toIso8601String(),
        'latitude': lat,
        'longitude': lng,
      },
    );
  }

  Future<ShiftState> currentShiftState() async {
    final guardId = _session!.user.id;
    final row = await _db.latestShiftForGuard(guardId);
    if (row == null) return const ShiftState(false, null);
    final kind = row['kind'] as String;
    final onDuty = kind == 'start';
    return ShiftState(onDuty, DateTime.fromMillisecondsSinceEpoch(row['at'] as int));
  }

  Future<List<Checkpoint>> fetchAssignedCheckpoints({bool forceRemote = false}) async {
    if (!forceRemote) {
      final cached = await _db.getCache(_cacheCheckpoints);
      if (cached != null) {
        final list = (jsonDecode(cached) as List<dynamic>)
            .map((e) => Checkpoint.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
        if (list.isNotEmpty) return list;
      }
    }
    try {
      final res = await _dio.get<List<dynamic>>(ApiEndpoints.assignedCheckpoints);
      final list = res.data!
          .map((e) => Checkpoint.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
      await _db.putCache(_cacheCheckpoints, jsonEncode(res.data));
      return list;
    } catch (_) {
      final cached = await _db.getCache(_cacheCheckpoints);
      if (cached == null) return [];
      final list = (jsonDecode(cached) as List<dynamic>)
          .map((e) => Checkpoint.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
      return list;
    }
  }

  Future<bool> scanCheckpoint({
    required String checkpointId,
    double? lat,
    double? lng,
  }) async {
    final id = const Uuid().v4();
    final at = DateTime.now();
    await _db.insertScan(
      id: id,
      checkpointId: checkpointId,
      scannedAt: at,
      lat: lat,
      lng: lng,
    );
    await _db.enqueueSync(
      endpoint: ApiEndpoints.scanCheckpoint,
      method: 'POST',
      body: {
        'guardId': _session!.user.id,
        'checkpointId': checkpointId,
        'timestamp': at.toIso8601String(),
        'latitude': lat,
        'longitude': lng,
      },
    );
    return true;
  }

  Future<void> submitRoutePing({
    required String siteId,
    required double latitude,
    required double longitude,
    String source = 'background',
    String? checkpointId,
    double? accuracyM,
  }) async {
    final at = DateTime.now().toIso8601String();
    await _db.enqueueSync(
      endpoint: ApiEndpoints.submitLocationPings,
      method: 'POST',
      body: {
        'guardId': _session!.user.id,
        'siteId': siteId,
        'points': [
          {
            'timestamp': at,
            'latitude': latitude,
            'longitude': longitude,
            'source': source,
            'checkpointId': checkpointId,
            'accuracyM': accuracyM,
          }
        ],
      },
    );
  }

  Future<void> reportIncident({
    required String title,
    required String description,
    String? imagePath,
    double? lat,
    double? lng,
  }) async {
    final id = const Uuid().v4();
    final at = DateTime.now();
    final user = _session!.user;
    final siteId = user.siteId ?? 's1';
    await _db.insertIncident(
      id: id,
      guardId: user.id,
      siteId: siteId,
      title: title,
      description: description,
      imagePath: imagePath,
      createdAt: at,
      lat: lat,
      lng: lng,
    );
    await _db.enqueueSync(
      endpoint: ApiEndpoints.reportIncident,
      method: 'POST',
      body: {
        'id': id,
        'guardId': user.id,
        'siteId': siteId,
        'title': title,
        'description': description,
        'timestamp': at.toIso8601String(),
        'latitude': lat,
        'longitude': lng,
        'imagePath': imagePath,
      },
    );
  }

  Future<void> panicAlert({double? lat, double? lng}) async {
    final user = _session!.user;
    final id = const Uuid().v4();
    final at = DateTime.now();
    await _db.insertPanic(
      id: id,
      guardId: user.id,
      createdAt: at,
      lat: lat,
      lng: lng,
    );
    await _db.enqueueSync(
      endpoint: ApiEndpoints.panicAlert,
      method: 'POST',
      body: {
        'guardId': user.id,
        'timestamp': at.toIso8601String(),
        'latitude': lat,
        'longitude': lng,
      },
    );
  }

  Future<List<Incident>> localIncidentsForGuard() async {
    final rows = await _db.localIncidents(_session!.user.id);
    return rows
        .map(
          (r) => Incident(
            id: r['id'] as String,
            guardId: r['guard_id'] as String,
            siteId: r['site_id'] as String,
            title: r['title'] as String,
            description: r['description'] as String,
            timestamp: DateTime.fromMillisecondsSinceEpoch(r['created_at'] as int),
            imagePath: r['image_path'] as String?,
            synced: (r['synced'] as int) == 1,
          ),
        )
        .toList();
  }

  // —— Client ——

  Future<List<PatrolLog>> fetchPatrolLogs({bool forceRemote = false}) async {
    if (!forceRemote) {
      final cached = await _db.getCache(_cachePatrolLogs);
      if (cached != null) {
        final decoded = jsonDecode(cached);
        if (decoded is List) {
          return decoded
              .map((e) => PatrolLog.fromJson(Map<String, dynamic>.from(e as Map)))
              .toList();
        }
      }
    }
    try {
      final res = await _dio.get<dynamic>(ApiEndpoints.patrolLogs);
      final raw = res.data;
      final List<dynamic> list;
      if (raw is String) {
        list = jsonDecode(raw) as List<dynamic>;
      } else if (raw is List) {
        list = raw;
      } else {
        list = [];
      }
      await _db.putCache(_cachePatrolLogs, jsonEncode(list));
      return list
          .map((e) => PatrolLog.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    } catch (_) {
      final cached = await _db.getCache(_cachePatrolLogs);
      if (cached == null) return [];
      final list = jsonDecode(cached) as List<dynamic>;
      return list
          .map((e) => PatrolLog.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    }
  }

  Future<List<Incident>> fetchIncidents({bool forceRemote = false}) async {
    if (!forceRemote) {
      final cached = await _db.getCache(_cacheIncidents);
      if (cached != null) {
        final list = jsonDecode(cached) as List<dynamic>;
        return list
            .map((e) => Incident.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      }
    }
    try {
      final res = await _dio.get<dynamic>(ApiEndpoints.incidents);
      final raw = res.data;
      final List<dynamic> list;
      if (raw is String) {
        list = jsonDecode(raw) as List<dynamic>;
      } else if (raw is List) {
        list = raw;
      } else {
        list = [];
      }
      await _db.putCache(_cacheIncidents, jsonEncode(list));
      return list
          .map((e) => Incident.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    } catch (_) {
      final cached = await _db.getCache(_cacheIncidents);
      if (cached == null) return [];
      final list = jsonDecode(cached) as List<dynamic>;
      return list
          .map((e) => Incident.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    }
  }

  Future<List<ReportItem>> fetchReports() async {
    final res = await _dio.get<List<dynamic>>(ApiEndpoints.reports);
    return res.data!
        .map((e) {
          final m = Map<String, dynamic>.from(e as Map);
          return ReportItem(
            id: m['id'] as String,
            label: m['label'] as String,
            periodStart: DateTime.parse(m['periodStart'] as String),
            periodEnd: DateTime.parse(m['periodEnd'] as String),
            downloadUrl: m['downloadUrl'] as String?,
          );
        })
        .toList();
  }

  Future<ClientDashboardData> fetchDashboard() async {
    try {
      final logs = await fetchPatrolLogs(forceRemote: true);
      await fetchIncidents(forceRemote: true);
      final alertsRaw = await _dio.get<Map<String, dynamic>>(ApiEndpoints.dashboard);
      final onDuty = alertsRaw.data?['guardsOnDuty'] as int? ?? 0;
      final sites = alertsRaw.data?['activeSites'] as int? ?? 0;
      final alertsJson = alertsRaw.data?['alerts'];
      List<AlertItem> alerts = [];
      if (alertsJson is String) {
        final list = jsonDecode(alertsJson) as List<dynamic>;
        alerts = list
            .map((e) => AlertItem.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      }
      final missed = logs.where((l) => l.status == 'missed').length;
      final panicAlerts = alerts.where((a) => a.type == 'panic').length;
      return ClientDashboardData(
        guardsOnDuty: onDuty,
        activeSites: sites,
        missedCheckpoints: missed,
        panicCount: panicAlerts,
        recentAlerts: alerts,
      );
    } catch (_) {
      final logs = await fetchPatrolLogs();
      final missed = logs.where((l) => l.status == 'missed').length;
      return ClientDashboardData(
        guardsOnDuty: 0,
        activeSites: 0,
        missedCheckpoints: missed,
        panicCount: 0,
        recentAlerts: const [],
        offline: true,
      );
    }
  }
}

class ShiftState {
  const ShiftState(this.onDuty, this.since);
  final bool onDuty;
  final DateTime? since;
}

class ClientDashboardData {
  const ClientDashboardData({
    required this.guardsOnDuty,
    required this.activeSites,
    required this.missedCheckpoints,
    required this.panicCount,
    required this.recentAlerts,
    this.offline = false,
  });

  final int guardsOnDuty;
  final int activeSites;
  final int missedCheckpoints;
  final int panicCount;
  final List<AlertItem> recentAlerts;
  final bool offline;
}
