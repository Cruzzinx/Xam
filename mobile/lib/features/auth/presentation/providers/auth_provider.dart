import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mobile/core/services/api_service.dart';
import 'package:dio/dio.dart';

enum AuthStatus { unknown, authenticated, unauthenticated, error }

class AuthProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  final _storage = const FlutterSecureStorage();

  AuthStatus _status = AuthStatus.unknown;
  AuthStatus get status => _status;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  // Placeholder for User model
  Map<String, dynamic>? _user;
  Map<String, dynamic>? get user => _user;

  Future<void> init() async {
    final token = await _storage.read(key: 'auth_token');
    if (token != null) {
      debugPrint('[Auth] Found stored token: ${token.substring(0, 10)}...');
      // Validate token by fetching user
      try {
        await getUser();
        if (_user != null && (_user!['role'] == 'siswa' || _user!['role'] == 'student')) {
          _status = AuthStatus.authenticated;
          debugPrint('[Auth] Token valid. User authenticated.');
        } else {
          // getUser returned but no user data or NOT A STUDENT
          if (_user != null) {
            debugPrint('[Auth] Access denied: User is not a student (${_user!['role']})');
            _errorMessage = 'Akses ditolak. Aplikasi ini khusus untuk Siswa.';
          }
          await _storage.delete(key: 'auth_token');
          _user = null;
          _status = AuthStatus.unauthenticated;
        }
      } catch (e) {
        debugPrint('[Auth] Token validation failed: $e');
        await _storage.delete(key: 'auth_token');
        _status = AuthStatus.unauthenticated;
      }
    } else {
      debugPrint('[Auth] No stored token. Unauthenticated.');
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    try {
      _errorMessage = null;
      notifyListeners();

      final response = await _apiService.client.post('/login', data: {
        'username': username,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = response.data;
        final token = data['token'];
        
        if (token != null) {
          await _storage.write(key: 'auth_token', value: token);
          
          // Fetch user details immediately to check role
          await getUser();
          
          if (_user != null && (_user!['role'] == 'siswa' || _user!['role'] == 'student')) {
            _status = AuthStatus.authenticated;
            notifyListeners();
            return true;
          } else {
            // NOT A STUDENT - Reject
            await _storage.delete(key: 'auth_token');
            _user = null;
            _status = AuthStatus.unauthenticated;
            _errorMessage = 'Akses ditolak. Aplikasi ini khusus untuk Siswa.';
            notifyListeners();
            return false;
          }
        }
      }
      return false;
    } on DioException catch (e) {
      _status = AuthStatus.error;
      _errorMessage = e.response?.data['message'] ?? 'Login gagal. Periksa koneksi/kredensial.';
      notifyListeners();
      return false;
    } catch (e) {
      _status = AuthStatus.error;
      _errorMessage = 'Terjadi kesalahan: $e';
      notifyListeners();
      return false;
    }
  }

  Future<void> getUser() async {
    try {
      final response = await _apiService.client.get('/me');
      if (response.statusCode == 200) {
        final data = response.data;
        if (data is Map<String, dynamic> && data.containsKey('user')) {
           _user = data['user'];
           debugPrint('User fetched successfully: $_user');
        } else {
           _user = data;
        }
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Failed to fetch user: $e');
    }
  }

  void updateUser(Map<String, dynamic> userData) {
    _user = userData;
    notifyListeners();
  }

  Future<Map<String, dynamic>?> uploadProfilePhoto(String filePath) async {
    try {
      final formData = FormData.fromMap({
        'photo': await MultipartFile.fromFile(filePath, filename: filePath.split('/').last),
      });

      final response = await _apiService.client.post(
        '/user/profile-photo',
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
        ),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['user'] != null) {
          updateUser(Map<String, dynamic>.from(data['user']));
        }
        return data;
      }
      return null;
    } on DioException catch (e) {
      debugPrint('[Auth] Upload photo error: ${e.response?.data}');
      rethrow;
    } catch (e) {
      debugPrint('[Auth] Upload photo error: $e');
      rethrow;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'auth_token');
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
