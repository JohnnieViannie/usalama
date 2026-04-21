import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:movara_shift_hub/guard/checkpoint_scan_screen.dart';
import 'package:movara_shift_hub/guard/report_incident_screen.dart';
import 'package:movara_shift_hub/providers/providers.dart';
import 'package:movara_shift_hub/shared/app_colors.dart';
import 'package:movara_shift_hub/widgets/large_action_button.dart';

class GuardHomeScreen extends ConsumerStatefulWidget {
  const GuardHomeScreen({super.key});

  @override
  ConsumerState<GuardHomeScreen> createState() => _GuardHomeScreenState();
}

class _GuardHomeScreenState extends ConsumerState<GuardHomeScreen> {
  var _busy = false;

  Future<void> _refresh() async {
    setState(() => _busy = true);
    setState(() => _busy = false);
  }

  Future<void> _shift({required bool start}) async {
    final repo = ref.read(repositoryProvider);
    final loc = ref.read(locationServiceProvider);
    final siteId = ref.read(authNotifierProvider)?.user.siteId ?? 's1';
    setState(() => _busy = true);
    try {
      final p = await loc.currentPosition();
      if (start) {
        await repo.startShift(
          siteId: siteId,
          lat: p?.latitude,
          lng: p?.longitude,
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Shift started — saved locally')),
          );
        }
      } else {
        await repo.endShift(
          siteId: siteId,
          lat: p?.latitude,
          lng: p?.longitude,
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Shift ended — saved locally')),
          );
        }
      }
      ref.read(syncServiceProvider).runPending(ref.read(authNotifierProvider));
      await _refresh();
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _panic() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Send panic alert?'),
        content: const Text(
          'This notifies your control room immediately when online. '
          'It is still queued offline.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Send')),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    final loc = ref.read(locationServiceProvider);
    final repo = ref.read(repositoryProvider);
    setState(() => _busy = true);
    try {
      final p = await loc.currentPosition();
      await repo.panicAlert(lat: p?.latitude, lng: p?.longitude);
      ref.read(syncServiceProvider).runPending(ref.read(authNotifierProvider));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Panic alert queued')),
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(authNotifierProvider);
    final repo = ref.watch(repositoryProvider);
    final name = session?.user.name ?? 'Guard';
    final site = session?.user.siteName ?? session?.user.siteId ?? 'Site';

    return Scaffold(
      appBar: AppBar(title: const Text('Field mode')),
      body: FutureBuilder(
        future: repo.currentShiftState(),
        builder: (context, snap) {
          final onDuty = snap.data?.onDuty ?? false;
          final since = snap.data?.since;
          final timeFmt = since != null ? DateFormat.jm().format(since) : '—';

          return Stack(
            children: [
              ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Text(
                    'Hello, $name',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Site: $site',
                    style: TextStyle(color: AppColors.mutedForeground, fontSize: 15),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Icon(
                            onDuty ? Icons.work_history : Icons.work_off_outlined,
                            color: onDuty ? AppColors.success : AppColors.mutedForeground,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Shift status',
                                  style: TextStyle(fontWeight: FontWeight.w600),
                                ),
                                Text(
                                  onDuty ? 'On duty · since $timeFmt' : 'Off duty',
                                  style: TextStyle(color: AppColors.mutedForeground),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  LargeActionButton(
                    label: onDuty ? 'End shift' : 'Start shift',
                    icon: onDuty ? Icons.stop_circle_outlined : Icons.play_circle_outline,
                    onPressed: _busy ? null : () => _shift(start: !onDuty),
                  ),
                  const SizedBox(height: 12),
                  LargeActionButton(
                    label: 'Scan checkpoint',
                    icon: Icons.qr_code_scanner,
                    accent: true,
                    onPressed: _busy
                        ? null
                        : () {
                            Navigator.of(context).push<void>(
                              MaterialPageRoute<void>(
                                builder: (_) => const CheckpointScanScreen(),
                              ),
                            );
                          },
                  ),
                  const SizedBox(height: 12),
                  LargeActionButton(
                    label: 'Report incident',
                    icon: Icons.camera_alt_outlined,
                    onPressed: _busy
                        ? null
                        : () {
                            Navigator.of(context).push<void>(
                              MaterialPageRoute<void>(
                                builder: (_) => const ReportIncidentScreen(),
                              ),
                            );
                          },
                  ),
                  const SizedBox(height: 16),
                  LargeActionButton(
                    label: 'Panic — alert control',
                    icon: Icons.warning_amber_rounded,
                    danger: true,
                    onPressed: _busy ? null : _panic,
                  ),
                ],
              ),
              if (_busy)
                const Positioned.fill(
                  child: IgnorePointer(
                    child: Center(child: CircularProgressIndicator()),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
