import 'dart:convert';

/// Mirrors dashboard/src/lib/mockData.ts for demo API responses.
final String mockSitesJson = jsonEncode([
  {
    'id': 's1',
    'name': 'Equity Bank HQ',
    'location': 'Upper Hill, Nairobi',
    'description': 'Tier-1 banking facility',
  },
  {
    'id': 's2',
    'name': 'Westgate Mall',
    'location': 'Westlands, Nairobi',
    'description': 'Mixed-use retail complex',
  },
]);

final List<Map<String, dynamic>> mockGuards = [
  {
    'id': 'g1',
    'name': 'James Kamau',
    'phone': '+254 712 345 678',
    'status': 'on_duty',
    'siteId': 's1',
  },
  {
    'id': 'g2',
    'name': 'Mary Wanjiru',
    'phone': '+254 722 111 222',
    'status': 'on_duty',
    'siteId': 's2',
  },
];

final List<Map<String, dynamic>> mockCheckpoints = [
  {'id': 'c1', 'name': 'Main Gate', 'siteId': 's1', 'code': 'USH-c1-MAIN'},
  {'id': 'c2', 'name': 'Vault Door', 'siteId': 's1', 'code': 'USH-c2-VAULT'},
  {'id': 'c3', 'name': 'Parking B2', 'siteId': 's2', 'code': 'USH-c3-B2'},
  {'id': 'c4', 'name': 'Rooftop', 'siteId': 's2', 'code': 'USH-c4-ROOF'},
];

Map<String, dynamic> mockUserForGuard(String guardId) {
  final g = mockGuards.firstWhere(
    (e) => e['id'] == guardId,
    orElse: () => mockGuards.first,
  );
  return {
    'id': g['id'],
    'name': g['name'],
    'phone': g['phone'],
    'siteId': g['siteId'],
    'siteName': 'Equity Bank HQ',
  };
}

Map<String, dynamic> mockLoginResponse({
  required bool isClient,
  String? guardId,
}) {
  if (isClient) {
    return {
      'user': {
        'id': 'c-admin',
        'name': 'Client Admin',
        'email': 'client@example.com',
      },
      'role': 'client',
      'token': 'mock-client-token',
    };
  }
  final gid = guardId ?? 'g1';
  return {
    'user': mockUserForGuard(gid),
    'role': 'guard',
    'token': 'mock-guard-token',
  };
}

String mockPatrolLogsJson() {
  final now = DateTime.now().toIso8601String();
  return jsonEncode([
    {
      'id': 'p1',
      'guardId': 'g1',
      'checkpointId': 'c1',
      'siteId': 's1',
      'timestamp': now,
      'status': 'on_time',
      'guardName': 'James Kamau',
      'checkpointName': 'Main Gate',
    },
  ]);
}

String mockIncidentsJson() {
  return jsonEncode([
    {
      'id': 'i1',
      'guardId': 'g1',
      'siteId': 's1',
      'title': 'Perimeter breach',
      'description': 'Fence damage reported near north wall.',
      'timestamp': DateTime.now().toIso8601String(),
      'imageUrl': null,
      'guardName': 'James Kamau',
    },
  ]);
}

String mockAlertsJson() {
  return jsonEncode([
    {
      'id': 'a1',
      'type': 'missed_checkpoint',
      'guardId': 'g2',
      'timestamp': DateTime.now().toIso8601String(),
      'status': 'unresolved',
      'guardName': 'Mary Wanjiru',
    },
  ]);
}
