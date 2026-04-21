import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:movara_shift_hub/guard/report_incident_screen.dart';
import 'package:movara_shift_hub/models/incident.dart';
import 'package:movara_shift_hub/providers/providers.dart';
import 'package:movara_shift_hub/shared/app_colors.dart';

class GuardIncidentsScreen extends ConsumerStatefulWidget {
  const GuardIncidentsScreen({super.key});

  @override
  ConsumerState<GuardIncidentsScreen> createState() => _GuardIncidentsScreenState();
}

class _GuardIncidentsScreenState extends ConsumerState<GuardIncidentsScreen> {
  late Future<List<Incident>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<Incident>> _load() =>
      ref.read(repositoryProvider).localIncidentsForGuard();

  Future<void> _reload() async {
    setState(() => _future = _load());
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My incidents'),
        actions: [
          IconButton(onPressed: _reload, icon: const Icon(Icons.refresh)),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.of(context).push<void>(
            MaterialPageRoute<void>(builder: (_) => const ReportIncidentScreen()),
          );
          await _reload();
        },
        icon: const Icon(Icons.add),
        label: const Text('Report'),
      ),
      body: FutureBuilder<List<Incident>>(
        future: _future,
        builder: (context, snap) {
          if (!snap.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final list = snap.data!;
          if (list.isEmpty) {
            return Center(
              child: Text(
                'No incidents yet',
                style: TextStyle(color: AppColors.mutedForeground),
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: list.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, i) {
              final inc = list[i];
              final fmt = DateFormat.yMMMd().add_jm();
              return Card(
                child: ListTile(
                  title: Text(inc.title),
                  subtitle: Text(
                    '${fmt.format(inc.timestamp)} · ${inc.synced ? 'Synced' : 'Pending sync'}',
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
