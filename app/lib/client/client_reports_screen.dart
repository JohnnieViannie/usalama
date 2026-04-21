import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:movara_shift_hub/client/incident_detail_screen.dart';
import 'package:movara_shift_hub/models/incident.dart';
import 'package:movara_shift_hub/models/report_item.dart';
import 'package:movara_shift_hub/providers/providers.dart';
import 'package:movara_shift_hub/shared/app_colors.dart';

class ClientReportsScreen extends ConsumerStatefulWidget {
  const ClientReportsScreen({super.key});

  @override
  ConsumerState<ClientReportsScreen> createState() => _ClientReportsScreenState();
}

class _ClientReportsScreenState extends ConsumerState<ClientReportsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;
  late Future<List<ReportItem>> _reportsFuture;
  late Future<List<Incident>> _incidentsFuture;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    _reportsFuture = ref.read(repositoryProvider).fetchReports();
    _incidentsFuture = ref.read(repositoryProvider).fetchIncidents();
  }

  Future<void> _reload() async {
    setState(() {
      _reportsFuture = ref.read(repositoryProvider).fetchReports();
      _incidentsFuture = ref.read(repositoryProvider).fetchIncidents(forceRemote: true);
    });
    await Future.wait([_reportsFuture, _incidentsFuture]);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reports'),
        bottom: TabBar(
          controller: _tabs,
          tabs: const [
            Tab(text: 'Downloads'),
            Tab(text: 'Incidents'),
          ],
        ),
        actions: [
          IconButton(onPressed: _reload, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: TabBarView(
        controller: _tabs,
        children: [
          FutureBuilder<List<ReportItem>>(
            future: _reportsFuture,
            builder: (context, snap) {
              if (!snap.hasData) {
                return const Center(child: CircularProgressIndicator());
              }
              final items = snap.data!;
              if (items.isEmpty) {
                return Center(
                  child: Text('No reports', style: TextStyle(color: AppColors.mutedForeground)),
                );
              }
              return ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: items.length,
                separatorBuilder: (context, index) => const SizedBox(height: 8),
                itemBuilder: (context, i) {
                  final r = items[i];
                  return Card(
                    child: ListTile(
                      title: Text(r.label),
                      subtitle: Text(
                        '${DateFormat.yMMMd().format(r.periodStart)} — ${DateFormat.yMMMd().format(r.periodEnd)}',
                      ),
                      trailing: const Icon(Icons.link_outlined),
                      onTap: () async {
                        final url = r.downloadUrl ?? '';
                        await Clipboard.setData(ClipboardData(text: url));
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                url.isEmpty
                                    ? 'No URL for this report'
                                    : 'Link copied — open in your browser',
                              ),
                            ),
                          );
                        }
                      },
                    ),
                  );
                },
              );
            },
          ),
          FutureBuilder<List<Incident>>(
            future: _incidentsFuture,
            builder: (context, snap) {
              if (!snap.hasData) {
                return const Center(child: CircularProgressIndicator());
              }
              final list = snap.data!;
              if (list.isEmpty) {
                return Center(
                  child: Text('No incidents', style: TextStyle(color: AppColors.mutedForeground)),
                );
              }
              final fmt = DateFormat.yMMMd().add_jm();
              return ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: list.length,
                separatorBuilder: (context, index) => const SizedBox(height: 8),
                itemBuilder: (context, i) {
                  final inc = list[i];
                  return Card(
                    child: ListTile(
                      title: Text(inc.title),
                      subtitle: Text('${inc.guardName ?? inc.guardId} · ${fmt.format(inc.timestamp)}'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        Navigator.of(context).push<void>(
                          MaterialPageRoute<void>(
                            builder: (_) => IncidentDetailScreen(incident: inc),
                          ),
                        );
                      },
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }
}
