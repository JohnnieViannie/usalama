import 'package:flutter/material.dart';

/// Navy Trust palette — aligned with dashboard/src/index.css (light theme).
abstract final class AppColors {
  static Color hsl(double h, double sPercent, double lPercent) {
    return HSLColor.fromAHSL(1, h, sPercent / 100, lPercent / 100).toColor();
  }

  static final background = hsl(210, 40, 98);
  static final foreground = hsl(222, 47, 11);
  static final card = const Color(0xFFFFFFFF);
  static final primary = hsl(222, 65, 20);
  static final onPrimary = hsl(210, 40, 98);
  static final secondary = hsl(210, 40, 94);
  static final onSecondary = hsl(222, 47, 11);
  static final muted = hsl(210, 30, 94);
  static final mutedForeground = hsl(215, 16, 42);
  static final accent = hsl(217, 91, 60);
  static final onAccent = hsl(210, 40, 98);
  static final success = hsl(142, 71, 38);
  static final onSuccess = const Color(0xFFFFFFFF);
  static final warning = hsl(38, 92, 50);
  static final onWarning = const Color(0xFFFFFFFF);
  static final destructive = hsl(0, 75, 50);
  static final onDestructive = hsl(210, 40, 98);
  static final border = hsl(214, 28, 88);
  static final panic = destructive;
}
