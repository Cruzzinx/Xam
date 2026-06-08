import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/theme/app_theme.dart';
import '../../../exam/presentation/providers/exam_provider.dart';
import '../../../dashboard/presentation/providers/dashboard_provider.dart';

class GradesPage extends StatefulWidget {
  const GradesPage({super.key});

  @override
  State<GradesPage> createState() => _GradesPageState();
}

class _GradesPageState extends State<GradesPage> with TickerProviderStateMixin {
  late TabController _tabController;
  late AnimationController _mainController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _mainController.forward();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<ExamProvider>().loadResults();
        context.read<DashboardProvider>().loadDashboardData();
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _mainController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        // Custom Tab Bar
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
          child: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: TabBar(
              controller: _tabController,
              indicator: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                color: const Color(0xFF10B981),
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              dividerColor: Colors.transparent,
              labelColor: Colors.white,
              unselectedLabelColor: theme.colorScheme.onSurface.withOpacity(0.4),
              labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w900, fontSize: 13),
              unselectedLabelStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13),
              tabs: const [
                Tab(text: 'RIWAYAT'),
                Tab(text: 'PERINGKAT'),
              ],
            ),
          ),
        ),
        
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildHistoryTab(context),
              _buildLeaderboardTab(context),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHistoryTab(BuildContext context) {
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
            _buildHeader(theme, 'Hasil Ujian', 'Rangkuman pencapaian Anda'),
            const Gap(24),
            if (!examProvider.isResultsLoading && examProvider.results.isNotEmpty)
              _buildSummarySection(theme, examProvider),
            
            if (examProvider.isResultsLoading)
              const Center(child: Padding(padding: EdgeInsets.all(60), child: CircularProgressIndicator(color: Color(0xFF10B981), strokeWidth: 3))),

            if (examProvider.resultsError != null)
              _buildErrorRow(theme, examProvider.resultsError!),

            if (!examProvider.isResultsLoading && examProvider.results.isEmpty && examProvider.resultsError == null)
              _buildEmptyResults(theme, 'Belum ada hasil', 'Selesaikan ujian untuk melihat hasil di sini'),

            if (!examProvider.isResultsLoading && examProvider.results.isNotEmpty)
              ...List.generate(examProvider.results.length, (index) {
                final result = examProvider.results[index];
                return _buildResultCard(theme, result, index);
              }),
            const Gap(100),
          ],
        ),
      ),
    );
  }

  Widget _buildLeaderboardTab(BuildContext context) {
    final theme = Theme.of(context);
    final dashboardProvider = context.watch<DashboardProvider>();

    return RefreshIndicator(
      onRefresh: () => dashboardProvider.loadDashboardData(),
      color: const Color(0xFF10B981),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(theme, 'Leaderboard', 'Peringkat nilai seluruh siswa'),
            const Gap(24),

            // Exam Selector
            if (dashboardProvider.examsList.isNotEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: theme.dividerColor.withOpacity(0.05)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: dashboardProvider.selectedExamId,
                    isExpanded: true,
                    icon: const Icon(Icons.expand_more_rounded, color: Color(0xFF10B981)),
                    style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface),
                    onChanged: (val) {
                      if (val != null) dashboardProvider.fetchLeaderboard(val);
                    },
                    items: dashboardProvider.examsList.map((exam) {
                      return DropdownMenuItem<String>(
                        value: exam['id'].toString(),
                        child: Text(exam['title']),
                      );
                    }).toList(),
                  ),
                ),
              ),
            
            const Gap(24),
            
            if (dashboardProvider.isLeaderboardLoading)
              const Center(child: CircularProgressIndicator(color: Color(0xFF10B981))),

            if (!dashboardProvider.isLeaderboardLoading && dashboardProvider.leaderboard.isEmpty)
              _buildEmptyResults(theme, 'Tidak ada data', 'Belum ada siswa yang menyelesaikan ujian ini'),

            if (!dashboardProvider.isLeaderboardLoading && dashboardProvider.leaderboard.isNotEmpty)
              ...List.generate(dashboardProvider.leaderboard.length, (index) {
                final entry = dashboardProvider.leaderboard[index];
                return _buildLeaderboardCard(theme, entry, index);
              }),
            const Gap(100),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(ThemeData theme, String title, String subtitle) {
    return Row(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF059669), Color(0xFF10B981)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Center(child: Text(title.contains('Hasil') ? '📊' : '🏆', style: const TextStyle(fontSize: 22))),
        ),
        const Gap(16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w900, color: theme.colorScheme.onSurface, letterSpacing: -0.5)),
              Text(subtitle, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface.withOpacity(0.4))),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSummarySection(ThemeData theme, ExamProvider provider) {
    return Row(
      children: [
        Expanded(child: _buildSummaryCard(theme, '🏆', 'Rata-rata', provider.averageScore.toStringAsFixed(1), isPrimary: false)),
        const Gap(12),
        Expanded(child: _buildSummaryCard(theme, '📝', 'Total', provider.results.length.toString(), isPrimary: true)),
        const Gap(12),
        Expanded(child: _buildSummaryCard(theme, '⭐', 'Tertinggi', provider.highestScore.toString(), isPrimary: false, valueColor: Colors.green.shade600)),
      ],
    );
  }

  Widget _buildSummaryCard(ThemeData theme, String emoji, String label, String value, {bool isPrimary = false, Color? valueColor}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 10),
      decoration: BoxDecoration(
        color: isPrimary ? const Color(0xFF10B981) : theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: isPrimary ? const Color(0xFF10B981).withOpacity(0.3) : Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 20)),
          const Gap(8),
          Text(label.toUpperCase(), style: GoogleFonts.inter(fontSize: 8, fontWeight: FontWeight.w900, color: isPrimary ? Colors.white70 : theme.colorScheme.onSurface.withOpacity(0.3), letterSpacing: 1.2)),
          const Gap(4),
          Text(value, style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w900, color: isPrimary ? Colors.white : valueColor ?? theme.colorScheme.onSurface)),
        ],
      ),
    );
  }

  Widget _buildResultCard(ThemeData theme, dynamic result, int index) {
    final score = (result['score'] ?? 0) as int;
    final isPassing = score >= 70;
    final examTitle = result['exam']?['title'] ?? 'Ujian Terhapus';
    final dateStr = result['submitted_at'] != null ? result['submitted_at'].toString().split(' ')[0] : '-';

    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Container(
            width: 54, height: 54,
            decoration: BoxDecoration(
              color: (isPassing ? Colors.green : Colors.red).withOpacity(0.08),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: (isPassing ? Colors.green : Colors.red).withOpacity(0.2), width: 1.5),
            ),
            child: Center(child: Text(score.toString(), style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w900, color: isPassing ? Colors.green.shade700 : Colors.red.shade700))),
          ),
          const Gap(16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(examTitle, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w900, color: theme.colorScheme.onSurface)),
                const Gap(4),
                Text(dateStr, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: theme.colorScheme.onSurface.withOpacity(0.3))),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(color: (isPassing ? Colors.green : Colors.red).withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
            child: Text(isPassing ? 'LULUS' : 'REMEDIAL', style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w900, color: isPassing ? Colors.green.shade800 : Colors.red.shade800, letterSpacing: 0.5)),
          ),
        ],
      ),
    );
  }

  Widget _buildLeaderboardCard(ThemeData theme, dynamic entry, int index) {
    final bool isMe = false; // logic for isMe can be added if needed
    final int rank = index + 1;
    final String name = entry['student_name'] ?? 'Siswa';
    final int score = entry['score'] ?? 0;

    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: rank <= 3 ? const Color(0xFF10B981).withOpacity(0.2) : theme.dividerColor.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: rank == 1 ? Colors.amber.shade100 : rank == 2 ? Colors.blueGrey.shade50 : rank == 3 ? Colors.orange.shade50 : theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                rank == 1 ? '🥇' : rank == 2 ? '🥈' : rank == 3 ? '🥉' : rank.toString(),
                style: GoogleFonts.inter(fontWeight: FontWeight.w900, fontSize: rank <= 3 ? 18 : 14, color: theme.colorScheme.onSurface.withOpacity(0.4)),
              ),
            ),
          ),
          const Gap(16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: GoogleFonts.inter(fontWeight: FontWeight.w900, fontSize: 14, color: theme.colorScheme.onSurface)),
                Text('@${entry['username']}', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface.withOpacity(0.3))),
              ],
            ),
          ),
          Text(
            score.toString(),
            style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w900, color: score >= 70 ? const Color(0xFF10B981) : Colors.redAccent),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyResults(ThemeData theme, String title, String subtitle) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          children: [
            const Text('🏜️', style: TextStyle(fontSize: 48)),
            const Gap(16),
            Text(title, style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w900, color: theme.colorScheme.onSurface)),
            const Gap(4),
            Text(subtitle, textAlign: TextAlign.center, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface.withOpacity(0.4))),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorRow(ThemeData theme, String error) {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.red.withOpacity(0.05), borderRadius: BorderRadius.circular(16)),
      child: Text(error, style: GoogleFonts.inter(color: Colors.red.shade700, fontWeight: FontWeight.w700, fontSize: 12)),
    );
  }
}
