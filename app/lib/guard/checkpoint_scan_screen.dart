import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:movara_shift_hub/models/checkpoint.dart';
import 'package:movara_shift_hub/providers/providers.dart';
import 'package:movara_shift_hub/services/scan_dedupe.dart';
import 'package:movara_shift_hub/shared/app_colors.dart';

class CheckpointScanScreen extends ConsumerStatefulWidget {
  const CheckpointScanScreen({super.key});

  @override
  ConsumerState<CheckpointScanScreen> createState() => _CheckpointScanScreenState();
}

class _CheckpointScanScreenState extends ConsumerState<CheckpointScanScreen> {
  final _scanner = MobileScannerController();
  var _handled = false;

  @override
  void dispose() {
    _scanner.dispose();
    super.dispose();
  }

  Future<void> _onDetect(BarcodeCapture cap) async {
    if (_handled) return;
    final raw = cap.barcodes.first.rawValue;
    if (raw == null || raw.isEmpty) return;

    final repo = ref.read(repositoryProvider);
    final db = ref.read(databaseProvider);
    List<Checkpoint> checkpoints;
    try {
      checkpoints = await repo.fetchAssignedCheckpoints();
    } catch (_) {
      checkpoints = await repo.fetchAssignedCheckpoints();
    }

    Checkpoint? match;
    for (final c in checkpoints) {
      if (c.id == raw || c.code == raw) {
        match = c;
        break;
      }
    }

    if (match == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unknown checkpoint: $raw')),
      );
      return;
    }

    final allow = await allowCheckpointScan(db, match.id);
    if (!allow) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Duplicate scan — wait before scanning again')),
      );
      return;
    }

    _handled = true;
    final loc = ref.read(locationServiceProvider);
    final p = await loc.currentPosition();
    await repo.scanCheckpoint(
      checkpointId: match.id,
      lat: p?.latitude,
      lng: p?.longitude,
    );
    ref.read(syncServiceProvider).runPending(ref.read(authNotifierProvider));

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Checkpoint OK: ${match.name}')),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan checkpoint'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.onPrimary,
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _scanner,
            onDetect: _onDetect,
          ),
          Positioned(
            left: 16,
            right: 16,
            bottom: 32,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Point the camera at the checkpoint QR code.',
                  style: TextStyle(color: AppColors.foreground),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
