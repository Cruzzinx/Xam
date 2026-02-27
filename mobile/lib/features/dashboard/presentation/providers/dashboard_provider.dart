import 'package:flutter/material.dart';
import '../../../../core/services/api_service.dart';
import 'package:dio/dio.dart';

class DashboardProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  // Stats
  List<dynamic> _stats = [];
  List<dynamic> get stats => _stats;

  List<dynamic> _recentActivities = [];
  List<dynamic> get recentActivities => _recentActivities;

  // Leaderboard
  List<dynamic> _examsList = [];
  List<dynamic> get examsList => _examsList;

  List<dynamic> _leaderboard = [];
  List<dynamic> get leaderboard => _leaderboard;

  String? _error;
  String? get error => _error;

  String? _selectedExamId;
  String? get selectedExamId => _selectedExamId;

  bool _isLeaderboardLoading = false;
  bool get isLeaderboardLoading => _isLeaderboardLoading;

  Future<void> loadDashboardData() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await Future.wait([
        _fetchStats(),
        _fetchExamsList(),
      ]);
    } catch (e) {
      debugPrint('Error loading dashboard: $e');
      _error = 'Error loading dashboard: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _fetchStats() async {
    try {
      final response = await _apiService.client.get('/dashboard/stats');
      if (response.statusCode == 200) {
        final data = response.data;
        _stats = data['stats'] ?? [];
        _recentActivities = data['recent_activities'] ?? [];
      }
    } catch (e) {
      debugPrint('Fetch stats error: $e');
      _error = 'Fetch stats error: $e';
    }
  }

  Future<void> _fetchExamsList() async {
    try {
      final response = await _apiService.client.get('/dashboard/exams-list');
      if (response.statusCode == 200) {
        _examsList = response.data ?? [];
        // Auto-select first exam if available
        if (_examsList.isNotEmpty && _selectedExamId == null) {
          _selectedExamId = _examsList[0]['id'].toString();
          fetchLeaderboard(_selectedExamId!);
        }
      }
    } catch (e) {
      debugPrint('Fetch exams list error: $e');
    }
  }

  Future<void> fetchLeaderboard(String examId) async {
    _selectedExamId = examId;
    _isLeaderboardLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.client.get('/dashboard/leaderboard/$examId');
      if (response.statusCode == 200) {
        _leaderboard = response.data ?? [];
      }
    } catch (e) {
      debugPrint('Fetch leaderboard error: $e');
      _leaderboard = [];
    } finally {
      _isLeaderboardLoading = false;
      notifyListeners();
    }
  }
}
