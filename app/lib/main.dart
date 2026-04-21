import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:movara_shift_hub/local_db/app_database.dart';
import 'package:movara_shift_hub/providers/providers.dart';
import 'package:movara_shift_hub/router/app_router.dart';
import 'package:movara_shift_hub/services/push_service.dart';
import 'package:movara_shift_hub/shared/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final db = await AppDatabase.open();
  WidgetsBinding.instance.addPostFrameCallback((_) {
    PushService.instance.init();
  });
  runApp(
    ProviderScope(
      overrides: [
        databaseProvider.overrideWithValue(db),
      ],
      child: const MovaraShiftHubApp(),
    ),
  );
}

class MovaraShiftHubApp extends ConsumerWidget {
  const MovaraShiftHubApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: 'MovaraShiftHub',
      theme: buildAppTheme(),
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
