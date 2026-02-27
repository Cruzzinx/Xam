<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Mapel;
use App\Models\Nilai;

class NilaiSeeder extends Seeder
{
    public function run(): void
    {
        $students = User::where('role', 'siswa')->get();
        $mapels = Mapel::all();

        if ($mapels->isEmpty()) {
            echo "No mapel found. Skipping nilai seeding.\n";
            return;
        }

        foreach ($students as $student) {
            // Only seed grades for subjects in the student's class
            if (!$student->kelas_id) continue;

            $classMapels = Mapel::where('kelas_id', $student->kelas_id)->get();
            
            foreach ($classMapels as $mapel) {
                Nilai::updateOrCreate(
                    ['user_id' => $student->id, 'mapel_id' => $mapel->id],
                    ['skor' => rand(70, 95)]
                );
            }
        }
        
        echo "Seeded " . Nilai::count() . " nilai records.\n";
    }
}
