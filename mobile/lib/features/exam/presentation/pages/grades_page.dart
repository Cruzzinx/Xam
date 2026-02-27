import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/theme/app_theme.dart';
import '../../../exam/presentation/providers/exam_provider.dart';

class GradesPage extends StatefulWidget {
  const GradesPage({super.key});

  @override
  State<GradesPage> createState() => _GradesPageState();
}

class _GradesPageState extends State<GradesPage> with SingleTickerProviderStateMixin {
  late AnimationController _mainController;

  @override
  void initState() {
    super.initState();
    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _mainController.forward();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<ExamProvider>().loadResults();
    });
  }

  @override
  void dispose() {
    _mainController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final examProvider = context.watch<ExamProvider>();

    return RefreshIndicator(
      onRefresh: () => examProvider.loadResults(),
      color: const Color(0xFF10B981),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            _buildHeader(theme),
            const Gap(32),

            // Summary Stats Section
            if (!examProvider.isResultsLoading && examProvider.results.isNotEmpty)
              _buildSummarySection(theme, examProvider),
            
            if (examProvider.isResultsLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(60),
                  child: CircularProgressIndicator(color: Color(0xFF10B981), strokeWidth: 3),
                ),
              ),

            if (examProvider.resultsError != null)
              _buildErrorRow(theme, examProvider.resultsError!),

            if (!examProvider.isResultsLoading && examProvider.results.isEmpty && examProvider.resultsError == null)
              _buildEmptyResults(theme),

            // Results List
            if (!examProvider.isResultsLoading && examProvider.results.isNotEmpty)
              ...List.generate(examProvider.results.length, (index) {
                final result = examProvider.results[index];
                return TweenAnimationBuilder<double>(
                  duration: Duration(milliseconds: 400 + (index * 100)),
                  tween: Tween(begin: 0.0, end: 1.0),
                  builder: (context, value, child) => Opacity(
                    opacity: value,
                    child: Transform.translate(
                      offset: Offset(0, 30 * (1 - value)),
                      child: child,
                    ),
                  ),
                  child: _buildResultCard(theme, result),
                );
              }),
            const Gap(40),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(ThemeData theme) {
    return TweenAnimationBuilder<double>(
      duration: const Duration(milliseconds: 600),
      tween: Tween(begin: 0.0, end: 1.0),
      builder: (context, value, child) => Opacity(
        opacity: value,
        child: child,
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF059669), Color(0xFF10B981)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF10B981).withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: const Center(child: Text('📊', style: TextStyle(fontSize: 26))),
          ),
          const Gap(16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hasil Ujian',
                  style: GoogleFonts.inter(
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    color: theme.colorScheme.onSurface,
                    letterSpacing: -0.5,
                  ),
                ),
                Text(
                  'Rangkuman pencapaian Anda',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface.withOpacity(0.4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummarySection(ThemeData theme, ExamProvider provider) {
    return FadeTransition(
      opacity: _mainController,
      child: SlideTransition(
        position: Tween<Offset>(begin: const Offset(0.1, 0), end: Offset.zero).animate(_mainController),
        child: Row(
          children: [
            Expanded(child: _buildSummaryCard(
              theme, '🏆', 'Rata-rata',
              provider.averageScore.toStringAsFixed(1),
              isPrimary: false,
            )),
            const Gap(12),
            Expanded(child: _buildSummaryCard(
              theme, '📝', 'Total',
              provider.results.length.toString(),
              isPrimary: true,
            )),
            const Gap(12),
            Expanded(child: _buildSummaryCard(
              theme, '⭐', 'Tertinggi',
              provider.highestScore.toString(),
              isPrimary: false,
              valueColor: Colors.green.shade600,
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard(ThemeData theme, String emoji, String label, String value, {bool isPrimary = false, Color? valueColor}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 12),
      decoration: BoxDecoration(
        color: isPrimary ? const Color(0xFF10B981) : theme.colorScheme.surface,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
          bottomLeft: Radius.circular(20),
          bottomRight: Radius.circular(40),
        ),
        boxShadow: [
          BoxShadow(
            color: isPrimary 
              ? const Color(0xFF10B981).withOpacity(0.3) 
              : Colors.black.withOpacity(0.04),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 24)),
          const Gap(12),
          Text(
            label.toUpperCase(),
            style: GoogleFonts.inter(
              fontSize: 9,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.5,
              color: isPrimary ? Colors.white.withOpacity(0.8) : theme.colorScheme.onSurface.withOpacity(0.3),
            ),
          ),
          const Gap(6),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 26,
              fontWeight: FontWeight.w900,
              color: isPrimary ? Colors.white : valueColor ?? theme.colorScheme.onSurface,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultCard(ThemeData theme, dynamic result) {
    final score = (result['score'] ?? 0) as int;
    final isPassing = score >= 70; // Set passing grade (KKM) to 70
    final examTitle = result['exam']?['title'] ?? 'Ujian Terhapus';
    
    DateTime? date;
    String dateStr = 'Unknown';
    try {
      final submittedAt = result['submitted_at'] ?? result['updated_at'] ?? '';
      if (submittedAt.isNotEmpty) {
        date = DateTime.parse(submittedAt);
        dateStr = '${date.day}/${date.month}/${date.year}';
      }
    } catch (_) {}

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          // Animated Score Circle
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: isPassing 
                ? Colors.green.withOpacity(0.08) 
                : Colors.red.withOpacity(0.08),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isPassing ? Colors.green.withOpacity(0.2) : Colors.red.withOpacity(0.2),
                width: 2,
              ),
            ),
            child: Center(
              child: Text(
                score.toString(),
                style: GoogleFonts.inter(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: isPassing ? Colors.green.shade700 : Colors.red.shade700,
                ),
              ),
            ),
          ),
          const Gap(20),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  examTitle,
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: theme.colorScheme.onSurface,
                    letterSpacing: -0.3,
                  ),
                ),
                const Gap(6),
                Row(
                  children: [
                    Icon(Icons.calendar_today_rounded, size: 12, color: theme.colorScheme.onSurface.withOpacity(0.3)),
                    const Gap(6),
                    Text(
                      dateStr,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface.withOpacity(0.3),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Status Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: isPassing ? Colors.green.withOpacity(0.12) : Colors.red.withOpacity(0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Text(
              isPassing ? 'LULUS' : 'REMEDIAL',
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: FontWeight.w900,
                color: isPassing ? Colors.green.shade800 : Colors.red.shade800,
                letterSpacing: 1,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyResults(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(60),
        child: Column(
          children: [
            const Text('🏜️', style: TextStyle(fontSize: 60)),
            const Gap(24),
            Text(
              'Belum ada hasil',
              style: GoogleFonts.inter(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const Gap(8),
            Text(
              'Selesaikan ujian untuk melihat hasil di sini',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface.withOpacity(0.4),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorRow(ThemeData theme, String error) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.red.withOpacity(0.1)),
      ),
      child: Text(
        error,
        style: GoogleFonts.inter(color: Colors.red.shade700, fontWeight: FontWeight.w700),
      ),
    );
  }
}
