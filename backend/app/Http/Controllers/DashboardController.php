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
            $stats = [
                ['title' => 'Total Ujian', 'count' => Exam::count(), 'icon' => '📝'],
                ['title' => 'Total Siswa', 'count' => User::where('role', 'siswa')->count(), 'icon' => '👥'],
                ['title' => 'Total Kelas', 'count' => Kelas::count(), 'icon' => '🏫'],
            ];

            // Recent Activities (Latest completed exams)
            $recent_activities = UserExam::with(['user', 'exam'])
                ->where('status', 'completed')
                ->latest('updated_at')
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
            $top_students = User::where('role', 'siswa')
                ->withAvg('userExams as average_score', 'score')
                ->orderByDesc('average_score')
                ->take(5)
                ->get()
                ->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'username' => $u->username,
                        'average_score' => round($u->average_score, 1) ?? 0,
                        'exams_count' => $u->userExams()->count()
                    ];
                });

        } else {
            // Role Siswa
            $stats = [
                ['title' => 'Ujian Tersedia', 'count' => Exam::count(), 'icon' => '📄'],
                ['title' => 'Ujian Selesai', 'count' => UserExam::where('user_id', $user->id)->where('status', 'completed')->count(), 'icon' => '✅'],
                ['title' => 'Rata-rata Skor', 'count' => round(UserExam::where('user_id', $user->id)->avg('score') ?? 0, 1), 'icon' => '⭐'],
            ];

             // Recent History
             $recent_activities = UserExam::where('user_id', $user->id)
             ->where('status', 'completed')
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
        $exams = Exam::select('id', 'title')->latest()->get();
        return response()->json($exams);
    }

    public function getExamLeaderboard($id)
    {
        $leaderboard = UserExam::where('exam_id', $id)
            ->where('status', 'completed')
            ->with('user:id,name,username,kelas_id') // Optimize query
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
