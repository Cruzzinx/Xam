import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static String get baseUrl {
    if (kReleaseMode) {
      // Production URL
      return 'https://api.tenexam.com/api';
    }
    // Android Emulator uses 10.0.2.2 to access host localhost
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:8000/api';
    }
    // iOS Simulator / Web / Desktop uses 127.0.0.1
    return 'http://127.0.0.1:8000/api';
  }

  late final Dio _dio;
  final _storage = const FlutterSecureStorage();

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'auth_token');
        debugPrint('[API] ${options.method} ${options.path} | Token: ${token != null ? "${token.substring(0, 10)}..." : "NULL"}');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onResponse: (response, handler) {
        debugPrint('[API] Response ${response.statusCode} for ${response.requestOptions.path}');
        return handler.next(response);
      },
      onError: (DioException e, handler) {
        debugPrint('[API] Error ${e.response?.statusCode} for ${e.requestOptions.path}: ${e.message}');
        if (e.response?.statusCode == 401) {
          // Token is invalid/expired — clear it so app redirects to login
          _storage.delete(key: 'auth_token');
          debugPrint('[API] Token cleared due to 401. User should re-login.');
        }
        return handler.next(e);
      },
    ));
  }

  Dio get client => _dio;
}
