import 'dart:async';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/theme/app_theme.dart';
import '../providers/exam_provider.dart';

class ExamSessionPage extends StatefulWidget {
  final int examId;

  const ExamSessionPage({super.key, required this.examId});

  @override
  State<ExamSessionPage> createState() => _ExamSessionPageState();
}

class _ExamSessionPageState extends State<ExamSessionPage> {
  late PageController _pageController;
  int _currentIndex = 0;
  Timer? _timer;
  int _secondsRemaining = 0;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _startExamFlow();
  }

  Future<void> _startExamFlow() async {
    final provider = context.read<ExamProvider>();
    final success = await provider.startExam(widget.examId);
    
    if (success && mounted) {
      setState(() {
        _secondsRemaining = (provider.activeExam['duration_minutes'] ?? 0) * 60;
        _isInitialized = true;
      });
      _startTimer();
    } else if (mounted) {
      Navigator.pop(context);
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      } else {
        _timer?.cancel();
        _submitExam(isAuto: true);
      }
    });
  }

  String _formatTime(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '$m:${s.toString().padLeft(2, '0')}';
  }

  Future<void> _submitExam({bool isAuto = false}) async {
    final provider = context.read<ExamProvider>();
    
    if (!isAuto) {
      // Check for unanswered questions
      final unansweredCount = provider.questions.length - provider.selectedAnswers.length;
      if (unansweredCount > 0) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            title: Row(
              children: [
                const Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 28),
                const Gap(8),
                Text('Soal Belum Lengkap', style: GoogleFonts.inter(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 18)),
              ],
            ),
            content: Text(
              'Terdapat $unansweredCount soal yang belum dijawab. Pindahkan ke halaman soal yang kosong dan jawablah sebelum mengumpulkan ujian.',
              style: GoogleFonts.inter(color: Colors.white70, fontSize: 14),
            ),
            actions: [
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Lengkapi Sekarang', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
        return;
      }

      final confirm = await _showConfirmDialog();
      if (confirm != true) return;
    }

    if (!mounted) return;
    final result = await provider.submitExam(widget.examId);

    if (result != null && mounted) {
      _timer?.cancel();
      _showResultDialog(result['score'].toString());
    }
  }

  Future<bool?> _showConfirmDialog() {
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text('Akhiri Ujian?', style: GoogleFonts.inter(fontWeight: FontWeight.w900, color: Colors.white)),
        content: Text('Pastikan semua jawaban sudah terisi. Anda tidak dapat kembali setelah ini.', style: GoogleFonts.inter(color: Colors.white70)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Lanjut')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red.shade400, foregroundColor: Colors.white),
            child: const Text('Ya, Selesai'),
          ),
        ],
      ),
    );
  }

  void _showResultDialog(String score) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Gap(16),
            const Text('🎉', style: TextStyle(fontSize: 64)),
            const Gap(16),
            Text(
              'Ujian Selesai!',
              style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            const Gap(8),
            Text(
              'Skor Anda',
              style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white54),
            ),
            const Gap(4),
            Text(
              score,
              style: GoogleFonts.inter(fontSize: 56, fontWeight: FontWeight.w900, color: AppTheme.primary),
            ),
            const Gap(32),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx); // Close dialog
                  Navigator.pop(context); // Back to exams list
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('KEMBALI KE DAFTAR'),
              ),
            ),
            const Gap(8),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ExamProvider>();
    final theme = Theme.of(context);

    if (!_isInitialized) {
      return const Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              Gap(16),
              Text('Menyiapkan lembar ujian...'),
            ],
          ),
        ),
      );
    }

    final questions = provider.questions;
    final progress = (_currentIndex + 1) / questions.length;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldPop = await _showConfirmDialog();
        if (shouldPop == true && context.mounted) {
          Navigator.of(context).pop();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0F172A), // Premium Dark Slate
        appBar: AppBar(
          automaticallyImplyLeading: false,
          backgroundColor: const Color(0xFF1E293B),
          elevation: 0,
          foregroundColor: Colors.white,
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                provider.activeExam['title'] ?? 'Ujian',
                style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w900),
              ),
              Text(
                'Pertanyaan ${_currentIndex + 1} dari ${questions.length}',
                style: GoogleFonts.inter(fontSize: 10, color: Colors.white60),
              ),
            ],
          ),
          actions: [
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: _secondsRemaining < 300 ? Colors.red : Colors.white10,
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              child: Text(
                '⏳ ${_formatTime(_secondsRemaining)}',
                style: GoogleFonts.inter(
                  fontSize: 16, 
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
        body: Column(
          children: [
            LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.white10,
              color: AppTheme.primary,
              minHeight: 6,
            ),
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: questions.length,
                itemBuilder: (context, index) {
                  final q = questions[index];
                  return SingleChildScrollView(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(28),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(32),
                            border: Border.all(color: Colors.white.withOpacity(0.05)),
                          ),
                          child: Text(
                            q['prompt'] ?? '',
                            style: GoogleFonts.inter(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              height: 1.5,
                            ),
                          ),
                        ),
                        const Gap(40),
                        ...List.generate((q['options'] as List).length, (optIdx) {
                          final optionKey = String.fromCharCode(65 + optIdx);
                          final optionText = q['options'][optIdx];
                          final isSelected = provider.selectedAnswers[q['id']] == optionKey;

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: InkWell(
                              onTap: () => provider.selectAnswer(q['id'], optionKey),
                              borderRadius: BorderRadius.circular(24),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.all(20),
                                decoration: BoxDecoration(
                                  color: isSelected ? AppTheme.primary : const Color(0xFF1E293B),
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(
                                    color: isSelected ? AppTheme.primary : Colors.white.withOpacity(0.05),
                                    width: 2,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        color: isSelected ? Colors.white.withOpacity(0.2) : Colors.grey.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                      alignment: Alignment.center,
                                      child: Text(
                                        optionKey,
                                        style: GoogleFonts.inter(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w900,
                                          color: isSelected ? Colors.white : Colors.grey.shade600,
                                        ),
                                      ),
                                    ),
                                    const Gap(20),
                                    Expanded(
                                      child: Text(
                                        optionText,
                                        style: GoogleFonts.inter(
                                          fontSize: 16,
                                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                          color: isSelected ? Colors.white : Colors.white70,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  );
                },
              ),
            ),
            _buildNavigation(questions.length),
          ],
        ),
      ),
    );
  }

  Widget _buildNavigation(int total) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 40),
      decoration: const BoxDecoration(
        color: Colors.transparent,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (_currentIndex > 0)
            _navButton(
              onTap: () {
                _pageController.previousPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
                setState(() => _currentIndex--);
              },
              icon: Icons.arrow_back_ios_new_rounded,
              label: 'PREV',
              isOutline: true,
            )
          else
            const SizedBox(width: 80),
          
          if (_currentIndex < total - 1)
            _navButton(
              onTap: () {
                _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
                setState(() => _currentIndex++);
              },
              icon: Icons.arrow_forward_ios_rounded,
              label: 'NEXT',
            )
          else
            _navButton(
              onTap: _submitExam,
              icon: Icons.check_circle_rounded,
              label: 'FINISH',
              color: Colors.green,
            ),
        ],
      ),
    );
  }

  Widget _navButton({required VoidCallback onTap, required IconData icon, required String label, bool isOutline = false, Color? color}) {
    final btnColor = color ?? AppTheme.primary;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        decoration: BoxDecoration(
          color: isOutline ? Colors.transparent : btnColor,
          borderRadius: BorderRadius.circular(16),
          border: isOutline ? Border.all(color: btnColor.withOpacity(0.3), width: 2) : null,
        ),
        child: Row(
          children: [
            if (label == 'PREV') Icon(icon, size: 16, color: btnColor),
            if (label == 'PREV') const Gap(8),
            Text(
              label,
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w900,
                color: isOutline ? btnColor : Colors.white,
                letterSpacing: 1,
              ),
            ),
            if (label != 'PREV') const Gap(8),
            if (label != 'PREV') Icon(icon, size: 16, color: isOutline ? btnColor : Colors.white),
          ],
        ),
      ),
    );
  }
}
