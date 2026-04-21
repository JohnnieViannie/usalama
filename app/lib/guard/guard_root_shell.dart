import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:movara_shift_hub/guard/guard_home_screen.dart';
import 'package:movara_shift_hub/guard/guard_incidents_screen.dart';
import 'package:movara_shift_hub/guard/guard_patrol_screen.dart';
import 'package:movara_shift_hub/guard/guard_profile_screen.dart';
import 'package:movara_shift_hub/providers/providers.dart';
import 'package:movara_shift_hub/widgets/offline_banner.dart';

class GuardRootShell extends ConsumerStatefulWidget {
  const GuardRootShell({super.key});

  @override
  ConsumerState<GuardRootShell> createState() => _GuardRootShellState();
}

class _GuardRootShellState extends ConsumerState<GuardRootShell>
    with WidgetsBindingObserver {
  var _index = 0;
  Timer? _routeTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _sync();
      _startRouteHeartbeat();
    });
  }

  @override
  void dispose() {
    _routeTimer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _sync();
      _sendRoutePing();
    }
  }

  void _sync() {
    ref.read(syncServiceProvider).runPending(ref.read(authNotifierProvider));
  }

  void _startRouteHeartbeat() {
    _routeTimer?.cancel();
    _routeTimer = Timer.periodic(const Duration(minutes: 3), (_) {
      _sendRoutePing();
    });
  }

  Future<void> _sendRoutePing() async {
    final session = ref.read(authNotifierProvider);
    if (session == null || !session.isGuard) return;
    final repo = ref.read(repositoryProvider);
    final shift = await repo.currentShiftState();
    if (!shift.onDuty) return;
    final loc = ref.read(locationServiceProvider);
    final p = await loc.currentPosition();
    if (p == null) return;
    final siteId = session.user.siteId;
    if (siteId == null || siteId.isEmpty) return;
    await repo.submitRoutePing(
      siteId: siteId,
      latitude: p.latitude,
      longitude: p.longitude,
      source: 'background',
      accuracyM: p.accuracy,
    );
    _sync();
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      const GuardHomeScreen(),
      const GuardPatrolScreen(),
      const GuardIncidentsScreen(),
      const GuardProfileScreen(),
    ];

    return OfflineBanner(
      child: Scaffold(
        body: pages[_index],
        bottomNavigationBar: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: (i) => setState(() => _index = i),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.map_outlined),
              selectedIcon: Icon(Icons.map),
              label: 'Patrol',
            ),
            NavigationDestination(
              icon: Icon(Icons.report_problem_outlined),
              selectedIcon: Icon(Icons.report_problem),
              label: 'Incidents',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
