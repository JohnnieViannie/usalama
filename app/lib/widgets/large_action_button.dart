import 'package:flutter/material.dart';
import 'package:movara_shift_hub/shared/app_colors.dart';

class LargeActionButton extends StatelessWidget {
  const LargeActionButton({
    super.key,
    required this.label,
    required this.icon,
    required this.onPressed,
    this.danger = false,
    this.accent = false,
  });

  final String label;
  final IconData icon;
  final VoidCallback? onPressed;
  final bool danger;
  final bool accent;

  @override
  Widget build(BuildContext context) {
    final Color bg;
    final Color fg;
    if (danger) {
      bg = AppColors.destructive;
      fg = AppColors.onDestructive;
    } else if (accent) {
      bg = AppColors.accent;
      fg = AppColors.onAccent;
    } else {
      bg = AppColors.primary;
      fg = AppColors.onPrimary;
    }

    return SizedBox(
      width: double.infinity,
      height: 56,
      child: FilledButton.icon(
        style: FilledButton.styleFrom(
          backgroundColor: bg,
          foregroundColor: fg,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
        onPressed: onPressed,
        icon: Icon(icon, size: 22),
        label: Text(
          label,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}
