<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\Admin\ExamController as AdminExamController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\KelasController;
use App\Http\Controllers\MapelController;
use App\Http\Controllers\SoalController;
use App\Http\Controllers\NilaiController;
use App\Http\Controllers\DashboardController;

// =======================
// AUTH ROUTES (Public)
// =======================
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// =======================
// AUTHENTICATED ROUTES
// =======================
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth related
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('dashboard/exams-list', [DashboardController::class, 'getExamsList']);
    Route::get('dashboard/leaderboard/{id}', [DashboardController::class, 'getExamLeaderboard']);
    Route::post('user/profile-photo', [UserController::class, 'updateProfilePhoto']);

    // =======================
    // EXAM ROUTES (Student)
    // =======================
    Route::prefix('exams')->group(function () {
        // Results (Static routes first)
        Route::get('/results/history', [ExamController::class, 'results']);
        Route::get('/results/{userExamId}', [ExamController::class, 'resultDetail'])->whereNumber('userExamId');
        
        // Exam Management (Generic routes last)
        Route::get('/', [ExamController::class, 'index']);
        Route::get('/{exam}', [ExamController::class, 'show'])->whereNumber('exam');
        Route::post('/{exam}/start', [ExamController::class, 'start'])->whereNumber('exam');
        Route::post('/{exam}/submit', [ExamController::class, 'submit'])->whereNumber('exam');
    });

    // =======================
    // ADMIN ROUTES
    // =======================
    Route::prefix('admin')->middleware('role:admin,guru')->group(function () {
        // Exam Management
        Route::apiResource('exams', AdminExamController::class);
        Route::post('exams/{exam}/questions', [AdminExamController::class, 'addQuestion']);
        Route::post('exams/{exam}/import-questions', [AdminExamController::class, 'importQuestions']);
        Route::put('exams/{exam}/questions/{question}', [AdminExamController::class, 'updateQuestion']);
        Route::delete('exams/{exam}/questions/{question}', [AdminExamController::class, 'deleteQuestion']);
        
        // Kelas Management
        Route::get('/kelas', [KelasController::class, 'index']);
        Route::get('/kelas/{id}/users', [KelasController::class, 'showUsers']);
        Route::post('/kelas', [KelasController::class, 'store']);
        Route::put('/kelas/{id}', [KelasController::class, 'update']);
        Route::delete('/kelas/{id}', [KelasController::class, 'destroy']);
        
        // User Management
        Route::post('/users', [UserController::class, 'store']);
        
        // Mapel Management
        Route::get('/mapel/{kelas_id}', [MapelController::class, 'index']);
        Route::post('/mapel', [MapelController::class, 'store']);
        Route::put('/mapel/{id}', [MapelController::class, 'update']);
        Route::delete('/mapel/{id}', [MapelController::class, 'destroy']);
        
        // Soal Management
        Route::get('/soal/{mapel_id}', [SoalController::class, 'index']);
        Route::post('/soal/import', [SoalController::class, 'import']);
        Route::put('/soal/{id}', [SoalController::class, 'update']);
        Route::delete('/soal/{id}', [SoalController::class, 'destroy']);
        
        // Nilai Management
        Route::post('/nilai', [NilaiController::class, 'store']);
        Route::get('/nilai/{user_id}', [NilaiController::class, 'show']);
    });
});

// =======================
// LEGACY ROUTES (Optional - Consider removing if not needed)
// =======================
// Route::post('/user/login', [UserController::class, 'login']);

