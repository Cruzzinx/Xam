import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:mobile/core/theme/app_theme.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> with SingleTickerProviderStateMixin {
  bool _uploading = false;
  late AnimationController _mainController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _mainController,
      curve: Curves.easeIn,
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _mainController,
      curve: Curves.easeOutBack,
    ));

    _mainController.forward();
  }

  @override
  void dispose() {
    _mainController.dispose();
    super.dispose();
  }

  Future<void> _pickAndUpload() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.image,
        allowMultiple: false,
      );

      if (result == null || result.files.isEmpty) return;

      final file = result.files.first;
      if (file.path == null) return;

      if (file.size > 2 * 1024 * 1024) {
        _showSnackBar('Ukuran file maksimal 2MB!', Colors.red.shade500, Icons.warning_rounded);
        return;
      }

      final ext = file.extension?.toLowerCase() ?? '';
      if (!['jpg', 'jpeg', 'png'].contains(ext)) {
        _showSnackBar('Hanya file JPG/PNG yang diperbolehkan!', Colors.orange.shade500, Icons.warning_rounded);
        return;
      }

      setState(() => _uploading = true);

      final authProvider = context.read<AuthProvider>();
      await authProvider.uploadProfilePhoto(file.path!);

      _showSnackBar('Foto profil berhasil diperbarui!', Colors.green.shade500, Icons.check_circle_rounded);
    } catch (e) {
      _showSnackBar('Gagal mengunggah foto: $e', Colors.red.shade500, Icons.error_rounded);
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  void _showSnackBar(String message, Color bgColor, IconData icon) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const Gap(12),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13),
              ),
            ),
          ],
        ),
        backgroundColor: bgColor,
        behavior: SnackBarBehavior.floating,
        elevation: 10,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        margin: const EdgeInsets.all(20),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    final fullName = user?['name'] ?? user?['username'] ?? 'User';
    final username = user?['username'] ?? '';
    final email = user?['email'] ?? 'N/A';
    final role = (user?['role'] ?? 'siswa').toString().toUpperCase();
    final profilePhotoUrl = user?['profile_photo_url'] ?? '';
    final userId = user?['id']?.toString() ?? '';

    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              // 1. Header with staggered entrance
              _buildHeader(theme),
              const Gap(32),

              // 2. Profile Card
              _buildProfileCard(theme, fullName, username, role, profilePhotoUrl, email, userId),
              const Gap(24),

              // 3. Info Sections with animation
              _buildInfoSection(
                theme,
                icon: '📋',
                title: 'Informasi Akun',
                items: [
                  _InfoItem(label: 'Nama Lengkap', value: fullName),
                  _InfoItem(label: 'Username', value: username),
                  _InfoItem(label: 'Email', value: email),
                ],
              ),
              const Gap(16),

              _buildInfoSection(
                theme,
                icon: '🔒',
                title: 'Keamanan & Akses',
                items: [
                  _InfoItem(label: 'Status Akun', value: 'Aktif', isStatus: true),
                  _InfoItem(label: 'Hak Akses', value: role),
                ],
              ),
              const Gap(32),

              // 4. Logout (Animated Button)
              _buildLogoutButton(context),
              const Gap(40),
              
              Text(
                'TenExam v1.0 • @2026',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface.withOpacity(0.2),
                  letterSpacing: 1,
                ),
              ),
              const Gap(24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(ThemeData theme) {
    return Row(
      children: [
        TweenAnimationBuilder<double>(
          duration: const Duration(milliseconds: 600),
          tween: Tween(begin: 0.0, end: 1.0),
          builder: (context, value, child) => Transform.scale(
            scale: value,
            child: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Center(child: Text('👤', style: TextStyle(fontSize: 24))),
            ),
          ),
        ),
        const Gap(16),
        Text(
          'Profil Pengguna',
          style: GoogleFonts.inter(
            fontSize: 28,
            fontWeight: FontWeight.w900,
            color: theme.colorScheme.onSurface,
            letterSpacing: -0.5,
          ),
        ),
      ],
    );
  }

  Widget _buildProfileCard(ThemeData theme, String fullName, String username, String role, String photoUrl, String email, String userId) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(32),
          topRight: Radius.circular(32),
          bottomLeft: Radius.circular(32),
          bottomRight: Radius.circular(72),
        ),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withOpacity(0.08),
            blurRadius: 40,
            offset: const Offset(0, 20),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Background accents (Reduced to feel more centered)
          Positioned(
            top: -20,
            right: -20,
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppTheme.primary.withOpacity(0.04),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            bottom: -20,
            left: -20,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppTheme.primary.withOpacity(0.03),
                shape: BoxShape.circle,
              ),
            ),
          ),
          
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 40),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Animated Avatar
                  _buildAnimatedAvatar(theme, fullName, photoUrl),
                  const Gap(28),
  
                  // Text Content
                  Hero(
                    tag: 'profile_name',
                    child: Material(
                      color: Colors.transparent,
                      child: SizedBox(
                        width: double.infinity,
                        child: Text(
                          fullName,
                          style: GoogleFonts.inter(
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                            color: theme.colorScheme.onSurface,
                            letterSpacing: -0.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ),
                  const Gap(8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      role,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.primary,
                        letterSpacing: 3,
                      ),
                    ),
                  ),
                  const Gap(12),
                  Text(
                    '@$username',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: theme.colorScheme.onSurface.withOpacity(0.4),
                    ),
                  ),
                  const Gap(28),
  
                  // Interactive info chips
                  SizedBox(
                    width: double.infinity,
                    child: Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      alignment: WrapAlignment.center,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        _buildInteractiveChip(theme, '📧', email),
                        _buildInteractiveChip(theme, '🆔', '#$userId'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedAvatar(ThemeData theme, String fullName, String photoUrl) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: _uploading ? null : _pickAndUpload,
        child: TweenAnimationBuilder<double>(
          duration: const Duration(milliseconds: 300),
          tween: Tween(begin: 1.0, end: _uploading ? 0.95 : 1.0),
          builder: (context, scale, child) => Transform.scale(
            scale: scale,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                // Main Ring
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppTheme.primary.withOpacity(0.2),
                      width: 2,
                    ),
                  ),
                  child: Container(
                    width: 110,
                    height: 110,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF6366F1), Color(0xFF4F46E5)],
                      ),
                      borderRadius: BorderRadius.circular(36),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primary.withOpacity(0.35),
                          blurRadius: 25,
                          offset: const Offset(0, 12),
                        ),
                      ],
                      image: photoUrl.isNotEmpty
                          ? DecorationImage(
                              image: NetworkImage(photoUrl),
                              fit: BoxFit.cover,
                            )
                          : null,
                    ),
                    child: photoUrl.isEmpty
                        ? Center(
                            child: Text(
                              fullName.isNotEmpty ? fullName[0].toUpperCase() : 'U',
                              style: GoogleFonts.inter(
                                fontSize: 48,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                          )
                        : null,
                  ),
                ),

                // Uploading Overlay
                if (_uploading)
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.4),
                        borderRadius: BorderRadius.circular(42),
                      ),
                      child: const Center(
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 3,
                        ),
                      ),
                    ),
                  ),

                // Floating Camera Button
                Positioned(
                  bottom: -4,
                  right: -4,
                  child: Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.primary.withOpacity(0.1), width: 1),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 15,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.add_a_photo_rounded, size: 18, color: Color(0xFF4F46E5)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInteractiveChip(ThemeData theme, String emoji, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: theme.colorScheme.onSurface.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.colorScheme.onSurface.withOpacity(0.05)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 16)),
          const Gap(10),
          Flexible(
            child: Text(
              text,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.onSurface.withOpacity(0.7),
              ),
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection(ThemeData theme, {required String icon, required String title, required List<_InfoItem> items}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(icon, style: const TextStyle(fontSize: 18)),
              ),
              const Gap(16),
              Text(
                title,
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          const Gap(24),
          ...items.map((item) => _buildInfoRow(theme, item)),
        ],
      ),
    );
  }

  Widget _buildInfoRow(ThemeData theme, _InfoItem item) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            item.label.toUpperCase(),
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: theme.colorScheme.onSurface.withOpacity(0.3),
              letterSpacing: 1.5,
            ),
          ),
          const Gap(8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: item.isStatus
                  ? Colors.green.withOpacity(0.05)
                  : theme.colorScheme.onSurface.withOpacity(0.02),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: item.isStatus
                    ? Colors.green.withOpacity(0.15)
                    : theme.colorScheme.onSurface.withOpacity(0.05),
              ),
            ),
            child: Row(
              children: [
                if (item.isStatus) ...[
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle),
                  ),
                  const Gap(12),
                ],
                Expanded(
                  child: Text(
                    item.value,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: item.isStatus
                          ? Colors.green.shade700
                          : theme.colorScheme.onSurface.withOpacity(0.8),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogoutButton(BuildContext context) {
    return StatefulBuilder(
      builder: (context, setState) {
        bool isPressed = false;
        return MouseRegion(
          onEnter: (_) => setState(() => isPressed = true),
          onExit: (_) => setState(() => isPressed = false),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            transform: Matrix4.identity()..scale(isPressed ? 1.02 : 1.0),
            width: double.infinity,
            height: 64,
            child: ElevatedButton.icon(
              onPressed: () => _showLogoutDialog(context),
              icon: const Icon(Icons.logout_rounded, size: 24),
              label: Text(
                'KELUAR AKUN',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2,
                  fontSize: 14,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade500,
                foregroundColor: Colors.white,
                elevation: isPressed ? 8 : 0,
                shadowColor: Colors.red.withOpacity(0.4),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
            ),
          ),
        );
      },
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        title: Text('Logout', style: GoogleFonts.inter(fontWeight: FontWeight.w900)),
        content: const Text('Apakah Anda yakin ingin keluar dari aplikasi TenExam?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('BATAL', style: GoogleFonts.inter(fontWeight: FontWeight.w800, color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.read<AuthProvider>().logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade500,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('YA, KELUAR'),
          ),
        ],
      ),
    );
  }
}

class _InfoItem {
  final String label;
  final String value;
  final bool isStatus;
  _InfoItem({required this.label, required this.value, this.isStatus = false});
}
