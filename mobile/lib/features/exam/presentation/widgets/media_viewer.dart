import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:video_player/video_player.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:url_launcher/url_launcher.dart';

class MediaViewer extends StatefulWidget {
  final String filePath;
  final String fileType;
  final String baseUrl;

  const MediaViewer({
    super.key,
    required this.filePath,
    required this.fileType,
    this.baseUrl = 'http://10.0.2.2:8000', // Default relative to emulator
  });

  @override
  State<MediaViewer> createState() => _MediaViewerState();
}

class _MediaViewerState extends State<MediaViewer> {
  VideoPlayerController? _videoController;
  AudioPlayer? _audioPlayer;
  bool _isPlaying = false;
  Duration _duration = Duration.zero;
  Duration _position = Duration.zero;
  bool _isLoadingError = false;

  String get fullUrl {
    // If it's already an absolute URL, return as is
    if (widget.filePath.startsWith('http://') || widget.filePath.startsWith('https://')) {
      return widget.filePath;
    }
    // Prepend base URL for relative paths
    return '${widget.baseUrl}${widget.filePath}';
  }

  @override
  void initState() {
    super.initState();
    _initializeMedia();
  }

  void _initializeMedia() async {
    try {
        if (widget.fileType == 'video') {
            _videoController = VideoPlayerController.networkUrl(Uri.parse(fullUrl))
                ..initialize().then((_) {
                setState(() {});
                });
        } else if (widget.fileType == 'audio') {
            _audioPlayer = AudioPlayer();
            _audioPlayer!.onDurationChanged.listen((d) {
                if (mounted) setState(() => _duration = d);
            });
            _audioPlayer!.onPositionChanged.listen((p) {
                if (mounted) setState(() => _position = p);
            });
            _audioPlayer!.onPlayerStateChanged.listen((state) {
                if (mounted) setState(() => _isPlaying = state == PlayerState.playing);
            });
            
            // Set the sound URL early
            await _audioPlayer!.setSourceUrl(fullUrl);
        }
    } catch (e) {
        if (mounted) {
            setState(() {
                _isLoadingError = true;
            });
        }
    }
  }

  @override
  void dispose() {
    _videoController?.dispose();
    _audioPlayer?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.filePath.isEmpty) return const SizedBox.shrink();

    if (_isLoadingError) {
        return Container(
            margin: const EdgeInsets.symmetric(vertical: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16)
            ),
            child: Row(
                children: [
                    const Icon(Icons.error_outline, color: Colors.red),
                    const SizedBox(width: 8),
                    Expanded(child: Text('Gagal memuat media', style: TextStyle(color: Colors.red))),
                    TextButton(
                        onPressed: () => launchUrl(Uri.parse(fullUrl)),
                        child: Text("Buka di Browser")
                    )
                ],
            ),
        );
    }

    Widget content;
    switch (widget.fileType) {
      case 'image':
        content = ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: CachedNetworkImage(
            imageUrl: fullUrl,
            fit: BoxFit.cover,
            width: double.infinity,
            placeholder: (context, url) => const Center(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: CircularProgressIndicator(),
              ),
            ),
            errorWidget: (context, url, error) => _buildErrorFallback(),
          ),
        );
        break;

      case 'video':
        content = _videoController != null && _videoController!.value.isInitialized
            ? ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: AspectRatio(
                  aspectRatio: _videoController!.value.aspectRatio,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      VideoPlayer(_videoController!),
                      if (!_videoController!.value.isPlaying)
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.black54,
                            shape: BoxShape.circle,
                          ),
                          child: IconButton(
                            iconSize: 48,
                            icon: const Icon(Icons.play_arrow, color: Colors.white),
                            onPressed: () {
                              setState(() {
                                _videoController!.play();
                              });
                            },
                          ),
                        ),
                    ],
                  ),
                ),
              )
            : const Center(child: Padding(
              padding: EdgeInsets.all(16.0),
              child: CircularProgressIndicator(),
            ));
        break;

      case 'audio':
        content = Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.blueGrey.withOpacity(0.2),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              IconButton(
                icon: Icon(
                  _isPlaying ? Icons.pause_circle_filled : Icons.play_circle_fill,
                  size: 48,
                  color: AppTheme.primary,
                ),
                onPressed: () async {
                  if (_isPlaying) {
                    await _audioPlayer?.pause();
                  } else {
                    await _audioPlayer?.play(UrlSource(fullUrl));
                  }
                },
              ),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Slider(
                      value: _position.inSeconds.toDouble(),
                      min: 0.0,
                      max: _duration.inSeconds.toDouble() > 0 ? _duration.inSeconds.toDouble() : 1.0,
                      onChanged: (value) async {
                        final position = Duration(seconds: value.toInt());
                        await _audioPlayer?.seek(position);
                      },
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(_formatDuration(_position), style: const TextStyle(color: Colors.white70)),
                          Text(_formatDuration(_duration), style: const TextStyle(color: Colors.white70)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
        break;

      default:
        // Try to handle unrecognized file types by allowing browser opening
        content = _buildErrorFallback();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: content,
    );
  }

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return "$minutes:$seconds";
  }

  Widget _buildErrorFallback() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white10,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          const Icon(Icons.attachment, color: Colors.white54),
          const SizedBox(width: 8),
          Expanded(child: Text('Lampiran file: ${widget.fileType}', style: const TextStyle(color: Colors.white))),
          TextButton(
            onPressed: () => launchUrl(Uri.parse(fullUrl)),
            child: const Text('Buka di Browser'),
          )
        ],
      ),
    );
  }
}
