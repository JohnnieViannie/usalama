import 'dart:io';

import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

class ImageCompressService {
  /// Returns path to compressed JPEG (or null on failure).
  Future<String?> compressToJpeg(String sourcePath, {int quality = 72}) async {
    final dir = await getTemporaryDirectory();
    final target = p.join(
      dir.path,
      'cmp_${DateTime.now().millisecondsSinceEpoch}.jpg',
    );
    final out = await FlutterImageCompress.compressAndGetFile(
      sourcePath,
      target,
      quality: quality,
      minWidth: 1280,
      minHeight: 720,
    );
    return out?.path;
  }

  Future<void> deleteIfExists(String? path) async {
    if (path == null) return;
    final f = File(path);
    if (await f.exists()) await f.delete();
  }
}
