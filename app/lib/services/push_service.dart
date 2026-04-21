import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:movara_shift_hub/firebase_options.dart';

final _notifications = FlutterLocalNotificationsPlugin();

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  } catch (e) {
    debugPrint('Background FCM init failed: $e');
  }
}

/// Firebase Cloud Messaging + foreground local notifications.
/// Safe to call when Firebase is not configured — logs and continues.
class PushService {
  PushService._();
  static final PushService instance = PushService._();

  Future<void> init() async {
    try {
      await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
    } catch (e) {
      debugPrint('Firebase init skipped (add google-services / Firebase config): $e');
      return;
    }

    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings();
    await _notifications.initialize(
      const InitializationSettings(android: androidInit, iOS: iosInit),
    );

    final messaging = FirebaseMessaging.instance;
    await messaging.requestPermission();

    FirebaseMessaging.onMessage.listen((RemoteMessage m) async {
      final n = m.notification;
      if (n == null) return;
      await _notifications.show(
        n.title?.hashCode ?? m.hashCode,
        n.title,
        n.body,
        const NotificationDetails(
          android: AndroidNotificationDetails(
            'movara_default',
            'MovaraShiftHub',
            importance: Importance.high,
            priority: Priority.high,
          ),
          iOS: DarwinNotificationDetails(),
        ),
      );
    });

    final token = await messaging.getToken();
    debugPrint('FCM token: $token');
  }
}
