import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/features/auth/presentation/providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';
import '../../../exam/presentation/pages/exams_page.dart';
import '../../../exam/presentation/pages/grades_page.dart';
import '../../../profile/presentation/pages/profile_page.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> with SingleTickerProviderStateMixin {
  int _selectedIndex = 0;
  late AnimationController _entranceController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnimation = CurvedAnimation(parent: _entranceController, curve: Curves.easeOut);
    
    _entranceController.forward();

    // Load dashboard data on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<DashboardProvider>().loadDashboardData();
    });
  }

  @override
  void dispose() {
    _entranceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = context.watch<AuthProvider>();
    final dashboardProvider = context.watch<DashboardProvider>();

    final user = authProvider.user;
    final String name = user?['name'] ?? user?['username'] ?? 'Siswa';
    final String photoUrl = user?['profile_photo_url'] ?? '';

    return Scaffold(
      body: SafeArea(
        child: _selectedIndex == 0 
          // Home Tab
          ? RefreshIndicator(
              onRefresh: () => dashboardProvider.loadDashboardData(),
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    children: [
                      // 1. Header
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Row(
                          children: [
                            TweenAnimationBuilder<double>(
                              duration: const Duration(milliseconds: 600),
                              tween: Tween(begin: 0.0, end: 1.0),
                              builder: (context, scale, child) => Transform.scale(
                                scale: scale,
                                child: Container(
                                  width: 56,
                                  height: 56,
                                  decoration: BoxDecoration(
                                    color: theme.colorScheme.primary,
                                    borderRadius: BorderRadius.circular(18),
                                    boxShadow: [
                                      BoxShadow(
                                        color: theme.colorScheme.primary.withOpacity(0.3),
                                        blurRadius: 15,
                                        offset: const Offset(0, 8),
                                      ),
                                    ],
                                    image: photoUrl.isNotEmpty
                                        ? DecorationImage(
                                            image: NetworkImage(photoUrl),
                                            fit: BoxFit.cover,
                                            onError: (exception, stackTrace) => const Icon(Icons.person),
                                          )
                                        : null,
                                  ),
                                  child: photoUrl.isEmpty
                                      ? Icon(Icons.person, color: theme.colorScheme.onPrimary, size: 28)
                                      : null,
                                ),
                              ),
                            ),
                            const Gap(16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Halo, $name!',
                                    style: GoogleFonts.inter(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w900,
                                      color: theme.colorScheme.onSurface,
                                      letterSpacing: -0.5,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  Text(
                                    'Siap untuk ujian hari ini?',
                                    style: GoogleFonts.inter(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: theme.colorScheme.onSurface.withOpacity(0.5),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              onPressed: () {
                                _showLogoutConfirm(context);
                              },
                              icon: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.red.withOpacity(0.08),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(Icons.logout_rounded, color: Colors.red, size: 20),
                              ),
                            ),
                          ],
                        ),
                      ),
        
                      // Error Message
                      if (dashboardProvider.error != null)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.red.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.red.withOpacity(0.3)),
                            ),
                            child: SelectableText(
                              dashboardProvider.error!,
                              style: GoogleFonts.inter(
                                color: Colors.red,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),

                      // 2. Stats
                      SizedBox(
                        height: 140,
                        child: dashboardProvider.isLoading
                            ? const Center(child: CircularProgressIndicator())
                            : ListView(
                                padding: const EdgeInsets.symmetric(horizontal: 24),
                                scrollDirection: Axis.horizontal,
                                children: dashboardProvider.stats.isNotEmpty 
                                  ? dashboardProvider.stats.map((stat) => Row(
                                      children: [
                                        _buildStatCard(
                                          theme,
                                          title: stat['title'],
                                          value: stat['count'].toString(),
                                          icon: _getIconForStat(stat['icon']),
                                          color: _getColorForStat(stat['title']),
                                        ),
                                        const Gap(16),
                                      ],
                                    )).toList()
                                  : [
                                      _buildStatCard(theme, title: 'Loading...', value: '-', icon: Icons.refresh, color: Colors.grey),
                                    ],
                              ),
                      ),
          
                      const Gap(32),
          
                      // 3. Recent Activity Section
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '🕒 Aktivitas Terbaru',
                              style: GoogleFonts.inter(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: theme.colorScheme.onSurface,
                              ),
                            ),
                            const Gap(16),
                            dashboardProvider.recentActivities.isEmpty
                                ? Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(32),
                                    decoration: BoxDecoration(
                                      color: theme.colorScheme.surface,
                                      borderRadius: BorderRadius.circular(24),
                                      border: Border.all(color: theme.dividerColor.withOpacity(0.05)),
                                    ),
                                    child: Column(
                                      children: [
                                        Icon(Icons.history_rounded, size: 48, color: theme.colorScheme.onSurface.withOpacity(0.1)),
                                        const Gap(12),
                                        Text(
                                          'Belum ada aktivitas terbaru',
                                          style: GoogleFonts.inter(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                            color: theme.colorScheme.onSurface.withOpacity(0.4),
                                          ),
                                        ),
                                      ],
                                    ),
                                  )
                                : ListView.separated(
                                    shrinkWrap: true,
                                    physics: const NeverScrollableScrollPhysics(),
                                    itemCount: dashboardProvider.recentActivities.length,
                                    separatorBuilder: (_, __) => const Gap(12),
                                    itemBuilder: (context, index) {
                                      final activity = dashboardProvider.recentActivities[index];
                                      return _buildActivityItem(theme, activity);
                                    },
                                  ),
                          ],
                        ),
                      ),
                      
                      const Gap(100),
                    ],
                  ),
                ),
              ),
            )
          : _selectedIndex == 1
              ? const ExamsPage()
              : _selectedIndex == 2
                ? const GradesPage()
                : const ProfilePage(),
      ),
      extendBody: true,
      bottomNavigationBar: _buildCustomBottomNav(theme),
    );
  }

  IconData _getIconForStat(String? iconStr) {
    if (iconStr == '📝' || iconStr == '📄') return Icons.assignment_rounded;
    if (iconStr == '👥') return Icons.people_rounded;
    if (iconStr == '🏫') return Icons.school_rounded;
    if (iconStr == '✅') return Icons.check_circle_rounded;
    if (iconStr == '⭐') return Icons.star_rounded;
    return Icons.analytics_rounded;
  }

  Color _getColorForStat(String title) {
    if (title.contains("Total")) return Colors.blue;
    if (title.contains("Selesai")) return Colors.green;
    return Colors.amber;
  }

  Widget _buildStatCard(ThemeData theme, {required String title, required String value, required IconData icon, required Color color}) {
    return Container(
      width: 140,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                maxLines: 1,
                style: GoogleFonts.inter(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              Text(
                title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActivityItem(ThemeData theme, dynamic activity) {
    final title = activity['exam_title'] ?? 'Ujian';
    final score = activity['score'] ?? 0;
    final date = activity['date'] ?? '';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: theme.dividerColor.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: (score >= 70 ? Colors.green : Colors.red).withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              score >= 70 ? Icons.check_circle_rounded : Icons.cancel_rounded,
              color: score >= 70 ? Colors.green : Colors.red,
            ),
          ),
          const Gap(16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface,
                    fontSize: 14,
                  ),
                ),
                const Gap(4),
                Text(
                  date,
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w500,
                    color: theme.colorScheme.onSurface.withOpacity(0.4),
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: (score >= 70 ? Colors.green : Colors.red).withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              score.toString(),
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w900,
                color: score >= 70 ? Colors.green : Colors.red,
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomBottomNav(ThemeData theme) {
    return Container(
      margin: const EdgeInsets.all(24),
      height: 72,
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 30,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildNavItem(theme, 0, Icons.grid_view_rounded, 'Home'),
          _buildNavItem(theme, 1, Icons.assignment_rounded, 'Exams'),
          _buildNavItem(theme, 2, Icons.emoji_events_rounded, 'Grades'),
          _buildNavItem(theme, 3, Icons.person_rounded, 'Profile'),
        ],
      ),
    );
  }

  Widget _buildNavItem(ThemeData theme, int index, IconData icon, String label) {
    final isSelected = _selectedIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedIndex = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutBack,
        width: isSelected ? 100 : 50,
        height: 50,
        decoration: BoxDecoration(
          color: isSelected ? theme.colorScheme.primary : Colors.transparent,
          borderRadius: isSelected 
            ? const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(30),
              )
            : BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isSelected ? theme.colorScheme.onPrimary : theme.colorScheme.onSurface.withOpacity(0.6),
              size: 24,
            ),
            if (isSelected) ...[
              const Gap(8),
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onPrimary,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showLogoutConfirm(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text('Logout', style: GoogleFonts.inter(fontWeight: FontWeight.w900)),
        content: const Text('Apakah Anda yakin ingin keluar dari akun Anda?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Batal', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.read<AuthProvider>().logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }
}
