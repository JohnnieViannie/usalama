import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:movara_shift_hub/models/patrol_log.dart';
import 'package:movara_shift_hub/providers/providers.dart';
import 'package:movara_shift_hub/shared/app_colors.dart';

class ClientActivityScreen extends ConsumerStatefulWidget {
  const ClientActivityScreen({super.key});

  @override
  ConsumerState<ClientActivityScreen> createState() => _ClientActivityScreenState();
}

class _ClientActivityScreenState extends ConsumerState<ClientActivityScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;
  late Future<List<PatrolLog>> _logsFuture;

  String? _guardFilter;
  String? _siteFilter;
  DateTime? _dayFilter;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    _logsFuture = ref.read(repositoryProvider).fetchPatrolLogs();
  }

  Future<void> _reload() async {
    setState(() {
      _logsFuture = ref.read(repositoryProvider).fetchPatrolLogs(forceRemote: true);
    });
    await _logsFuture;
  }

  List<PatrolLog> _applyFilters(List<PatrolLog> all) {
    return all.where((l) {
      if (_guardFilter != null && _guardFilter!.isNotEmpty && l.guardId != _guardFilter) {
        return false;
      }
      if (_siteFilter != null && _siteFilter!.isNotEmpty && l.siteId != _siteFilter) {
        return false;
      }
      if (_dayFilter != null) {
        final d = DateTime(l.timestamp.year, l.timestamp.month, l.timestamp.day);
        final f = DateTime(_dayFilter!.year, _dayFilter!.month, _dayFilter!.day);
        if (d != f) return false;
      }
      return true;
    }).toList()
      ..sort((a, b) => b.timestamp.compareTo(a.timestamp));
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
        title: const Text('Live activity'),
        bottom: TabBar(
          controller: _tabs,
          tabs: const [
            Tab(text: 'Feed'),
            Tab(text: 'Patrol logs'),
          ],
        ),
        actions: [
          IconButton(onPressed: _reload, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: FutureBuilder<List<PatrolLog>>(
        future: _logsFuture,
        builder: (context, snap) {
          if (!snap.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final logs = snap.data!;
          final guards = logs.map((e) => e.guardId).toSet().toList()..sort();
          final sites = logs.map((e) => e.siteId).toSet().toList()..sort();

          return TabBarView(
            controller: _tabs,
            children: [
              _FeedTab(logs: logs),
              _PatrolLogsTab(
                logs: _applyFilters(logs),
                guards: guards,
                sites: sites,
                guardFilter: _guardFilter,
                siteFilter: _siteFilter,
                dayFilter: _dayFilter,
                onGuard: (v) => setState(() => _guardFilter = v),
                onSite: (v) => setState(() => _siteFilter = v),
                onDay: (v) => setState(() => _dayFilter = v),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _FeedTab extends StatelessWidget {
  const _FeedTab({required this.logs});

  final List<PatrolLog> logs;

  @override
  Widget build(BuildContext context) {
    final sorted = [...logs]..sort((a, b) => b.timestamp.compareTo(a.timestamp));
    final fmt = DateFormat.yMMMd().add_jm();

    final lastSeen = <String, DateTime>{};
    for (final l in logs) {
      final cur = lastSeen[l.guardId];
      if (cur == null || l.timestamp.isAfter(cur)) {
        lastSeen[l.guardId] = l.timestamp;
      }
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Guard last seen',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            color: AppColors.foreground,
          ),
        ),
        const SizedBox(height: 8),
        ...lastSeen.entries.map(
          (e) => ListTile(
            dense: true,
            title: Text(e.key),
            subtitle: Text(fmt.format(e.value)),
          ),
        ),
        const Divider(height: 32),
        Text(
          'Recent scans',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            color: AppColors.foreground,
          ),
        ),
        const SizedBox(height: 8),
        ...sorted.take(30).map(
              (l) => Card(
                child: ListTile(
                  title: Text(l.checkpointName ?? l.checkpointId),
                  subtitle: Text(
                    '${l.guardName ?? l.guardId} · ${fmt.format(l.timestamp)}',
                  ),
                  trailing: Text(
                    l.status,
                    style: TextStyle(
                      color: l.status == 'missed'
                          ? AppColors.destructive
                          : AppColors.success,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                ),
              ),
            ),
      ],
    );
  }
}

class _PatrolLogsTab extends StatelessWidget {
  const _PatrolLogsTab({
    required this.logs,
    required this.guards,
    required this.sites,
    required this.guardFilter,
    required this.siteFilter,
    required this.dayFilter,
    required this.onGuard,
    required this.onSite,
    required this.onDay,
  });

  final List<PatrolLog> logs;
  final List<String> guards;
  final List<String> sites;
  final String? guardFilter;
  final String? siteFilter;
  final DateTime? dayFilter;
  final ValueChanged<String?> onGuard;
  final ValueChanged<String?> onSite;
  final ValueChanged<DateTime?> onDay;

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat.yMMMd().add_jm();
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String?>(
                      // ignore: deprecated_member_use — controlled filter; initialValue is one-shot only
                      value: guardFilter,
                      hint: const Text('Guard'),
                      isExpanded: true,
                      items: [
                        const DropdownMenuItem<String?>(
                          value: null,
                          child: Text('All guards'),
                        ),
                        ...guards.map(
                          (g) => DropdownMenuItem<String?>(value: g, child: Text(g)),
                        ),
                      ],
                      onChanged: onGuard,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: DropdownButtonFormField<String?>(
                      // ignore: deprecated_member_use
                      value: siteFilter,
                      hint: const Text('Site'),
                      isExpanded: true,
                      items: [
                        const DropdownMenuItem<String?>(
                          value: null,
                          child: Text('All sites'),
                        ),
                        ...sites.map(
                          (s) => DropdownMenuItem<String?>(value: s, child: Text(s)),
                        ),
                      ],
                      onChanged: onSite,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerLeft,
                child: OutlinedButton.icon(
                  onPressed: () async {
                    final d = await showDatePicker(
                      context: context,
                      initialDate: dayFilter ?? DateTime.now(),
                      firstDate: DateTime(2020),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    onDay(d);
                  },
                  icon: const Icon(Icons.date_range),
                  label: Text(
                    dayFilter == null
                        ? 'Filter by date'
                        : DateFormat.yMMMd().format(dayFilter!),
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: logs.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, i) {
              final l = logs[i];
              return Card(
                child: ListTile(
                  title: Text(l.checkpointName ?? l.checkpointId),
                  subtitle: Text(
                    '${l.guardName ?? l.guardId} · ${fmt.format(l.timestamp)}',
                  ),
                  trailing: Text(l.status),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
