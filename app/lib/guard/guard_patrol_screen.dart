import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:movara_shift_hub/models/checkpoint.dart';
import 'package:movara_shift_hub/providers/providers.dart';
import 'package:movara_shift_hub/shared/app_colors.dart';

class GuardPatrolScreen extends ConsumerStatefulWidget {
  const GuardPatrolScreen({super.key});

  @override
  ConsumerState<GuardPatrolScreen> createState() => _GuardPatrolScreenState();
}

class _GuardPatrolScreenState extends ConsumerState<GuardPatrolScreen> {
  late Future<List<_CheckpointRow>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<void> _reload() async {
    setState(() {
      _future = _load();
    });
    await _future;
  }

  Future<List<_CheckpointRow>> _load() async {
    final repo = ref.read(repositoryProvider);
    final db = ref.read(databaseProvider);
    final list = await repo.fetchAssignedCheckpoints();
    final rows = <_CheckpointRow>[];
    for (final c in list) {
      final last = await db.lastScanAtForCheckpoint(c.id);
      final status = last != null ? _CpStatus.completed : _CpStatus.pending;
      rows.add(_CheckpointRow(c, status, last));
    }
    return rows;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Patrol'),
        actions: [
          IconButton(
            onPressed: _reload,
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: FutureBuilder<List<_CheckpointRow>>(
        future: _future,
        builder: (context, snap) {
          if (!snap.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final rows = snap.data!;
          if (rows.isEmpty) {
            return Center(
              child: Text(
                'No checkpoints assigned',
                style: TextStyle(color: AppColors.mutedForeground),
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: rows.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, i) {
              final r = rows[i];
              final (label, color) = switch (r.status) {
                _CpStatus.pending => ('Pending', AppColors.warning),
                _CpStatus.completed => ('Completed', AppColors.success),
                _CpStatus.missed => ('Missed', AppColors.destructive),
              };
              return Card(
                child: ListTile(
                  title: Text(r.checkpoint.name),
                  subtitle: Text('Code: ${r.checkpoint.code}'),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      label,
                      style: TextStyle(
                        color: color,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
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

enum _CpStatus { pending, completed, missed }

class _CheckpointRow {
  _CheckpointRow(this.checkpoint, this.status, this.lastScan);

  final Checkpoint checkpoint;
  final _CpStatus status;
  final DateTime? lastScan;
}
