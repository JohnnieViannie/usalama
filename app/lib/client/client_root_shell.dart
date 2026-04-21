import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:movara_shift_hub/client/client_activity_screen.dart';
import 'package:movara_shift_hub/client/client_dashboard_screen.dart';
import 'package:movara_shift_hub/client/client_profile_screen.dart';
import 'package:movara_shift_hub/client/client_reports_screen.dart';
import 'package:movara_shift_hub/providers/providers.dart';
import 'package:movara_shift_hub/widgets/offline_banner.dart';

class ClientRootShell extends ConsumerStatefulWidget {
  const ClientRootShell({super.key});

  @override
  ConsumerState<ClientRootShell> createState() => _ClientRootShellState();
}

class _ClientRootShellState extends ConsumerState<ClientRootShell>
    with WidgetsBindingObserver {
  var _index = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) => _sync());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _sync();
  }

  void _sync() {
    ref.read(syncServiceProvider).runPending(ref.read(authNotifierProvider));
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      const ClientDashboardScreen(),
      const ClientActivityScreen(),
      const ClientReportsScreen(),
      const ClientProfileScreen(),
    ];

    return OfflineBanner(
      child: Scaffold(
        body: pages[_index],
        bottomNavigationBar: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: (i) => setState(() => _index = i),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined),
              selectedIcon: Icon(Icons.dashboard),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(Icons.timeline_outlined),
              selectedIcon: Icon(Icons.timeline),
              label: 'Activity',
            ),
            NavigationDestination(
              icon: Icon(Icons.description_outlined),
              selectedIcon: Icon(Icons.description),
              label: 'Reports',
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
