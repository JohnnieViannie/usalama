import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:movara_shift_hub/models/incident.dart';
import 'package:movara_shift_hub/shared/app_colors.dart';

class IncidentDetailScreen extends StatelessWidget {
  const IncidentDetailScreen({super.key, required this.incident});

  final Incident incident;

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat.yMMMd().add_jm();
    final events = <_TimelineEvent>[
      _TimelineEvent(
        title: 'Reported',
        subtitle: fmt.format(incident.timestamp),
        icon: Icons.report_problem_outlined,
      ),
      if (incident.description.isNotEmpty)
        _TimelineEvent(
          title: 'Details',
          subtitle: incident.description,
          icon: Icons.notes_outlined,
        ),
      if ((incident.imageUrl ?? '').isNotEmpty)
        _TimelineEvent(
          title: 'Photo attached',
          subtitle: 'See below',
          icon: Icons.image_outlined,
        ),
    ];

    return Scaffold(
      appBar: AppBar(title: Text(incident.title)),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            'Timeline',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.foreground,
            ),
          ),
          const SizedBox(height: 12),
          ...events.asMap().entries.map((e) {
            final i = e.key;
            final ev = e.value;
            final last = i == events.length - 1;
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: AppColors.accent.withValues(alpha: 0.2),
                      child: Icon(ev.icon, size: 18, color: AppColors.accent),
                    ),
                    if (!last)
                      Container(
                        width: 2,
                        height: 48,
                        color: AppColors.border,
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          ev.title,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          ev.subtitle,
                          style: TextStyle(color: AppColors.mutedForeground),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          }),
          if ((incident.imageUrl ?? '').isNotEmpty)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                incident.imageUrl!,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  padding: const EdgeInsets.all(24),
                  color: AppColors.muted,
                  child: Text(
                    'Image unavailable offline',
                    style: TextStyle(color: AppColors.mutedForeground),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _TimelineEvent {
  _TimelineEvent({
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  final String title;
  final String subtitle;
  final IconData icon;
}
