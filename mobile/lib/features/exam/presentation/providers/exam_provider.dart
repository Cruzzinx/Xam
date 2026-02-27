import 'package:flutter/material.dart';
import '../../../../core/services/api_service.dart';
import 'package:dio/dio.dart';

class ExamProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  List<dynamic> _exams = [];
  List<dynamic> get exams => _exams;

  // Results / Grades
  bool _isResultsLoading = false;
  bool get isResultsLoading => _isResultsLoading;

  List<dynamic> _results = [];
  List<dynamic> get results => _results;

  String? _resultsError;
  String? get resultsError => _resultsError;

  // Active Exam Session State
  dynamic _activeExam;
  dynamic get activeExam => _activeExam;

  List<dynamic> _questions = [];
  List<dynamic> get questions => _questions;

  Map<int, dynamic> _selectedAnswers = {};
  Map<int, dynamic> get selectedAnswers => _selectedAnswers;

  bool _isSubmitting = false;
  bool get isSubmitting => _isSubmitting;

  Future<void> loadExams() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.client.get('/exams');
      if (response.statusCode == 200) {
        _exams = response.data ?? [];
      }
    } catch (e) {
      debugPrint('Fetch exams error: $e');
      if (e is DioException && e.response != null) {
        _error = 'Gagal memuat ujian: ${e.response?.data?['message'] ?? e.message}';
      } else {
        _error = 'Gagal memuat ujian: $e';
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> startExam(int examId) async {
    _isLoading = true;
    _error = null;
    _selectedAnswers = {};
    notifyListeners();

    try {
      // 1. Call Start Endpoint
      await _apiService.client.post('/exams/$examId/start', data: {});

      // 2. Fetch Questions
      final response = await _apiService.client.get('/exams/$examId');
      if (response.statusCode == 200) {
        final data = response.data;
        _activeExam = data['exam'];
        _questions = data['questions'] ?? [];
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Start exam error: $e');
      if (e is DioException && e.response != null) {
        final msg = e.response?.data?['message'] ?? e.message;
        _error = 'Gagal memulai ujian: $msg';
      } else {
        _error = 'Gagal memulai ujian: $e';
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
    return false;
  }

  void selectAnswer(int questionId, String optionText, {bool isMultiple = false}) {
    if (isMultiple) {
      if (!_selectedAnswers.containsKey(questionId)) {
        _selectedAnswers[questionId] = <String>[];
      }
      
      final currentList = _selectedAnswers[questionId] as List<String>;
      if (currentList.contains(optionText)) {
        currentList.remove(optionText);
        if (currentList.isEmpty) {
          _selectedAnswers.remove(questionId);
        }
      } else {
        currentList.add(optionText);
      }
    } else {
      _selectedAnswers[questionId] = optionText;
    }
    notifyListeners();
  }

  Future<Map<String, dynamic>?> submitExam(int examId) async {
    _isSubmitting = true;
    notifyListeners();

    try {
      final payload = {
        'answers': _questions.map((q) {
          final ans = _selectedAnswers[q['id']];
          String answerString = '';
          if (ans != null) {
            if (ans is List) {
              answerString = ans.join(',');
            } else {
              answerString = ans.toString();
            }
          }
          return {
            'question_id': q['id'],
            'answer': answerString
          };
        }).toList()
      };

      final response = await _apiService.client.post(
        '/exams/$examId/submit',
        data: payload,
      );

      if (response.statusCode == 200) {
        return response.data;
      }
    } catch (e) {
      debugPrint('Submit exam error: $e');
      _error = 'Gagal mengirim jawaban: $e';
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
    return null;
  }

  Future<void> loadResults() async {
    _isResultsLoading = true;
    _resultsError = null;
    notifyListeners();

    try {
      final response = await _apiService.client.get('/exams/results/history');
      if (response.statusCode == 200) {
        _results = response.data ?? [];
      }
    } catch (e) {
      debugPrint('Fetch results error: $e');
      _resultsError = 'Gagal memuat hasil ujian: $e';
    } finally {
      _isResultsLoading = false;
      notifyListeners();
    }
  }

  // Summary getters for grades page
  double get averageScore {
    if (_results.isEmpty) return 0;
    final total = _results.fold<double>(0, (sum, r) => sum + (r['score'] ?? 0).toDouble());
    return total / _results.length;
  }

  int get highestScore {
    if (_results.isEmpty) return 0;
    return _results.map<int>((r) => (r['score'] ?? 0) as int).reduce((a, b) => a > b ? a : b);
  }
}
