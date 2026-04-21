// Replace with output from `flutterfire configure` for production FCM.
// These placeholder values allow compilation; push delivery requires a real Firebase project.

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnsupportedError('Web is not configured for Firebase in this app.');
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError('Firebase is not configured for this platform.');
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'replace-me',
    appId: '1:000000000000:android:placeholder000000000000',
    messagingSenderId: '000000000000',
    projectId: 'movarashifthub-placeholder',
    storageBucket: 'movarashifthub-placeholder.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'replace-me',
    appId: '1:000000000000:ios:placeholder000000000000',
    messagingSenderId: '000000000000',
    projectId: 'movarashifthub-placeholder',
    storageBucket: 'movarashifthub-placeholder.appspot.com',
    iosBundleId: 'com.movarashifthub.movaraShiftHub',
  );
}
