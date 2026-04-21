import 'package:flutter_test/flutter_test.dart';
import 'package:movara_shift_hub/services/scan_dedupe.dart';
import 'package:movara_shift_hub/shared/constants.dart';

void main() {
  group('allowScanAfter', () {
    test('allows first scan', () {
      final now = DateTime(2026, 4, 18, 12);
      expect(allowScanAfter(null, now), true);
    });

    test('blocks duplicate within window', () {
      final now = DateTime(2026, 4, 18, 12, 0, 30);
      final last = DateTime(2026, 4, 18, 12, 0, 0);
      expect(allowScanAfter(last, now, seconds: kScanDedupeSeconds), false);
    });

    test('allows after window', () {
      final now = DateTime(2026, 4, 18, 12, 2, 0);
      final last = DateTime(2026, 4, 18, 12, 0, 0);
      expect(allowScanAfter(last, now, seconds: kScanDedupeSeconds), true);
    });
  });
}
