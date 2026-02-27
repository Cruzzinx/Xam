<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});
Route::get('/test-rel', function() { 
    try { 
        $u = App\Models\User::where('role', 'siswa')
            ->withAvg('userExams as average_score', 'score')
            ->first();
            
        if (!$u) return 'No student found';
        
        return 'Avg score: ' . ($u->average_score ?? 'null'); 
    } catch (\Exception $e) { 
        return 'Error: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString(); 
    } 
});
