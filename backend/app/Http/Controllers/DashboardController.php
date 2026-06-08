<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exam;
use App\Models\User;
use App\Models\Kelas;
use App\Models\UserExam;
use OpenApi\Attributes as OA;

use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    // ... lines 14-22 ...
    public function stats(Request $request)
    {
        Log::info('Dashboard stats request received', ['user_id' => $request->user()->id]);
        $start = microtime(true);
        $user = $request->user();
        $stats = [];
        $recent_activities = [];
        $top_students = [];
        $upcoming_exams = [];

        if ($user->role === 'admin' || $user->role === 'guru') {
            // Summary Cards
            if ($user->role === 'admin') {
                $stats = [
                    ['title' => 'Total Pengajar', 'count' => User::where('role', 'guru')->count(), 'icon' => '👨‍🏫'],
                    ['title' => 'Total Siswa', 'count' => User::where('role', 'siswa')->count(), 'icon' => '👥'],
                    ['title' => 'Total Kelas', 'count' => Kelas::count(), 'icon' => '🏫'],
                ];
            } else {
                $stats = [
                    ['title' => 'Total Ujian', 'count' => Exam::where('user_id', $user->id)->count(), 'icon' => '📝'],
                    ['title' => 'Total Siswa', 'count' => User::where('role', 'siswa')->count(), 'icon' => '👥'],
                    ['title' => 'Total Kelas', 'count' => Kelas::count(), 'icon' => '🏫'],
                ];
            }

            // Recent Activities (Latest completed/remedial exams)
            $latestActivitiesIds = UserExam::selectRaw('MAX(id)')
                ->whereIn('status', ['completed', 'sudah_remed'])
                ->groupBy('user_id', 'exam_id');

            $activitiesQuery = UserExam::with(['user', 'exam'])
                ->whereIn('id', $latestActivitiesIds);
            
            if ($user->role === 'guru') {
                $activitiesQuery->whereHas('exam', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            }

            $recent_activities = $activitiesQuery->latest('updated_at')
                ->take(5)
                ->get()
                ->map(function ($ue) {
                    return [
                        'id' => $ue->id,
                        'student_name' => $ue->user->name,
                        'exam_title' => $ue->exam->title,
                        'score' => $ue->score,
                        'date' => $ue->updated_at->diffForHumans()
                    ];
                });

            // Top Students (Based on average score)
            $topQuery = User::where('role', 'siswa');
            
            if ($user->role === 'guru') {
                $topQuery->whereHas('userExams.exam', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
                $topQuery->withAvg(['userExams' => function($q) use ($user) {
                    $q->whereHas('exam', function($qe) use ($user) {
                        $qe->where('user_id', $user->id);
                    });
                }], 'score');
            } else {
                $topQuery->withAvg('userExams as average_score', 'score');
            }

            $top_students = $topQuery->orderByDesc('average_score')
                ->take(5)
                ->get()
                ->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'username' => $u->username,
                        'average_score' => round($u->average_score ?? 0, 1),
                        'exams_count' => $u->userExams()->count()
                    ];
                });

        } else {
            // Role Siswa
            $userCompletedExams = UserExam::where('user_id', $user->id)
                ->whereIn('status', ['completed', 'sudah_remed'])
                ->selectRaw('MAX(score) as best_score')
                ->groupBy('exam_id')
                ->get();

            $stats = [
                ['title' => 'Ujian Tersedia', 'count' => Exam::count(), 'icon' => '📄'],
                ['title' => 'Ujian Selesai', 'count' => $userCompletedExams->count(), 'icon' => '✅'],
                ['title' => 'Rata-rata Skor', 'count' => round($userCompletedExams->avg('best_score') ?? 0, 1), 'icon' => '⭐'],
            ];

             // Recent History
             $recent_activities = UserExam::where('user_id', $user->id)
             ->whereIn('status', ['completed', 'sudah_remed'])
             ->with('exam')
             ->latest('updated_at')
             ->take(5)
             ->get()
             ->map(function ($ue) {
                 return [
                     'id' => $ue->id,
                     'exam_title' => $ue->exam->title,
                     'score' => $ue->score,
                     'date' => $ue->updated_at->format('d M Y')
                 ];
             });
        }

        Log::info('Dashboard stats processed', ['duration' => microtime(true) - $start]);
        return response()->json([
            'stats' => $stats,
            'recent_activities' => $recent_activities,
            'top_students' => $top_students,
        ]);
    }

    public function getExamsList()
    {
        $user = auth()->user();
        $query = Exam::select('id', 'title');
        
        if ($user && $user->role === 'guru') {
            $query->where('user_id', $user->id);
        }

        $exams = $query->latest()->get();
        return response()->json($exams);
    }

    public function getExamLeaderboard($id)
    {
        // Leaderboard: Only latest result per student for this exam
        $latestIds = UserExam::where('exam_id', $id)
            ->whereIn('status', ['completed', 'sudah_remed'])
            ->selectRaw('MAX(id)')
            ->groupBy('user_id');

        $leaderboard = UserExam::whereIn('id', $latestIds)
            ->with('user:id,name,username,kelas_id')
            ->orderByDesc('score')
            ->orderBy('updated_at') // Tie-breaker: earlier submission
            ->get()
            ->map(function ($ue) {
                return [
                    'id' => $ue->id,
                    'student_name' => $ue->user->name,
                    'username' => $ue->user->username,
                    'score' => $ue->score,
                    'submitted_at' => $ue->updated_at->format('d M H:i'),
                ];
            });

        return response()->json($leaderboard);
    }
}
