<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserExam;
use App\Models\Exam;
use App\Models\Kelas;
use App\Models\User;

class DataNilaiController extends Controller
{
    /**
     * Get all exam results for admin view
     */
    public function index(Request $request)
    {
        // Parameter filter
        $exam_id = $request->query('exam_id');
        $kelas_id = $request->query('kelas_id');
        $search = $request->query('search');

        $latestIds = UserExam::selectRaw('MAX(id)')
                             ->whereIn('status', ['completed', 'sudah_remed'])
                             ->groupBy('user_id', 'exam_id');

        $query = UserExam::with(['user.kelas', 'exam'])
                         ->whereIn('id', $latestIds);

        // Filter by Ownership if Teacher
        if (auth()->user()->role !== 'admin') {
            $query->whereHas('exam', function($q) {
                $q->where('user_id', auth()->id());
            });
        }

        // Filter by Exam
        if ($exam_id) {
            $query->where('exam_id', $exam_id);
        }

        // Filter by Kelas
        if ($kelas_id) {
            $query->whereHas('user', function($q) use ($kelas_id) {
                $q->where('kelas_id', $kelas_id);
            });
        }

        // Search by User Name
        if ($search) {
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        // Urutkan dari nilai tertinggi ke terendah by default
        $results = $query->orderByDesc('score')
                         ->orderBy('updated_at')
                         ->get()
                         ->map(function ($ue) {
                             return [
                                 'id' => $ue->id,
                                 'user_id' => $ue->user_id,
                                 'student_name' => $ue->user->name,
                                 'username' => $ue->user->username,
                                 'kelas_name' => $ue->user->kelas ? $ue->user->kelas->nama_kelas : '-',
                                 'exam_id' => $ue->exam_id,
                                 'exam_title' => $ue->exam->title,
                                 'kkm' => $ue->exam->kkm,
                                 'status' => $ue->status,
                                 'score' => $ue->score,
                                 'submitted_at' => $ue->updated_at,
                             ];
                         });

        return response()->json($results);
    }

    /**
     * Get filter options (list of exams and classes)
     */
    public function filterOptions()
    {
        $examQuery = Exam::select('id', 'title');
        
        if (auth()->user()->role !== 'admin') {
            $examQuery->where('user_id', auth()->id());
        }

        $exams = $examQuery->orderByDesc('id')->get();
        $kelas = Kelas::select('id', 'nama_kelas')->orderBy('nama_kelas')->get();

        return response()->json([
            'exams' => $exams,
            'kelas' => $kelas
        ]);
    }
}
