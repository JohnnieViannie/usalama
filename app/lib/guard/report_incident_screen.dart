import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:movara_shift_hub/providers/providers.dart';
import 'package:movara_shift_hub/services/image_compress_service.dart';
import 'package:movara_shift_hub/shared/app_colors.dart';

class ReportIncidentScreen extends ConsumerStatefulWidget {
  const ReportIncidentScreen({super.key});

  @override
  ConsumerState<ReportIncidentScreen> createState() => _ReportIncidentScreenState();
}

class _ReportIncidentScreenState extends ConsumerState<ReportIncidentScreen> {
  final _title = TextEditingController();
  final _desc = TextEditingController();
  final _picker = ImagePicker();
  final _compress = ImageCompressService();
  String? _photoPath;
  var _busy = false;

  @override
  void dispose() {
    _title.dispose();
    _desc.dispose();
    super.dispose();
  }

  Future<void> _pick() async {
    final x = await _picker.pickImage(source: ImageSource.camera, maxWidth: 1600);
    if (x == null) return;
    setState(() => _busy = true);
    try {
      final out = await _compress.compressToJpeg(x.path);
      setState(() => _photoPath = out);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _submit() async {
    if (_title.text.trim().isEmpty || _desc.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Title and description required')),
      );
      return;
    }
    setState(() => _busy = true);
    try {
      final loc = ref.read(locationServiceProvider);
      final p = await loc.currentPosition();
      await ref.read(repositoryProvider).reportIncident(
            title: _title.text.trim(),
            description: _desc.text.trim(),
            imagePath: _photoPath,
            lat: p?.latitude,
            lng: p?.longitude,
          );
      ref.read(syncServiceProvider).runPending(ref.read(authNotifierProvider));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Incident saved — will sync when online')),
        );
        Navigator.of(context).pop();
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Report incident')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(
            controller: _title,
            decoration: const InputDecoration(labelText: 'Title'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _desc,
            minLines: 3,
            maxLines: 6,
            decoration: const InputDecoration(labelText: 'Description'),
          ),
          const SizedBox(height: 16),
          if (_photoPath != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(File(_photoPath!), height: 180, fit: BoxFit.cover),
            ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: _busy ? null : _pick,
            icon: const Icon(Icons.photo_camera_outlined),
            label: const Text('Add photo'),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _busy ? null : _submit,
            child: _busy
                ? const SizedBox(
                    height: 22,
                    width: 22,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Submit'),
          ),
          const SizedBox(height: 12),
          Text(
            'Photos are compressed before upload. Works offline.',
            style: TextStyle(fontSize: 12, color: AppColors.mutedForeground),
          ),
        ],
      ),
    );
  }
}
