import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:movara_shift_hub/providers/providers.dart';
import 'package:movara_shift_hub/services/repository.dart';
import 'package:movara_shift_hub/shared/app_colors.dart';
import 'package:movara_shift_hub/widgets/stat_card.dart';

class ClientDashboardScreen extends ConsumerStatefulWidget {
  const ClientDashboardScreen({super.key});

  @override
  ConsumerState<ClientDashboardScreen> createState() => _ClientDashboardScreenState();
}

class _ClientDashboardScreenState extends ConsumerState<ClientDashboardScreen> {
  late Future<ClientDashboardData> _future;

  @override
  void initState() {
    super.initState();
    _future = ref.read(repositoryProvider).fetchDashboard();
  }

  Future<void> _reload() async {
    setState(() {
      _future = ref.read(repositoryProvider).fetchDashboard();
    });
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(onPressed: _reload, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: FutureBuilder<ClientDashboardData>(
        future: _future,
        builder: (context, snap) {
          if (!snap.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final d = snap.data!;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (d.offline)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(
                    'Showing cached data',
                    style: TextStyle(color: AppColors.warning, fontWeight: FontWeight.w600),
                  ),
                ),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.1,
                children: [
                  StatCard(
                    label: 'Guards on duty',
                    value: '${d.guardsOnDuty}',
                    tone: AppColors.success,
                  ),
                  StatCard(
                    label: 'Active sites',
                    value: '${d.activeSites}',
                  ),
                  StatCard(
                    label: 'Missed checkpoints',
                    value: '${d.missedCheckpoints}',
                    tone: AppColors.warning,
                  ),
                  StatCard(
                    label: 'Panic alerts',
                    value: '${d.panicCount}',
                    tone: AppColors.destructive,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Text(
                'Recent alerts',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.foreground,
                ),
              ),
              const SizedBox(height: 8),
              if (d.recentAlerts.isEmpty)
                Text(
                  'No alerts',
                  style: TextStyle(color: AppColors.mutedForeground),
                )
              else
                ...d.recentAlerts.map(
                  (a) => Card(
                    child: ListTile(
                      title: Text(a.type.replaceAll('_', ' ')),
                      subtitle: Text(a.guardName ?? a.guardId),
                      trailing: Text(a.status),
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
