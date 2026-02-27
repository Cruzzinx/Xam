<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Kelas;
use App\Models\Mapel;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Soal;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin CBT',
            'username' => 'admin',
            'email' => 'admin@cbt.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        // Create Sample Kelas
        $kelas10 = Kelas::create(['nama_kelas' => 'Kelas 10']);
        $kelas11 = Kelas::create(['nama_kelas' => 'Kelas 11']);
        $kelas12 = Kelas::create(['nama_kelas' => 'Kelas 12']);

        // Create Sample Students
        User::create([
            'name' => 'Budi Santoso',
            'username' => 'budi',
            'email' => 'budi@student.com',
            'password' => Hash::make('password'),
            'role' => 'siswa',
            'kelas_id' => $kelas10->id,
        ]);

        User::create([
            'name' => 'Siti Aminah',
            'username' => 'siti',
            'email' => 'siti@student.com',
            'password' => Hash::make('password'),
            'role' => 'siswa',
            'kelas_id' => $kelas11->id,
        ]);

        // Import students from JSON (Creates more classes)
        $this->call(StudentImportSeeder::class);

        // Get All Kelas (Sample + Imported)
        $allKelas = Kelas::all();

        $subjects = [
            'Matematika',
            'Bahasa Indonesia',
            'Bahasa Inggris',
            'Pendidikan Agama Islam',
            'PKn',
            'Sejarah',
            'Fisika',
            'Kimia',
            'Biologi',
            'Ekonomi',
            'Sosiologi',
            'Geografi',
            'Seni Budaya',
            'Penjaskes',
            'Prakarya'
        ];

        foreach ($allKelas as $kelas) {
            foreach ($subjects as $namaMapel) {
                // Use firstOrCreate to avoid duplicates if re-seeding
                $mapel = Mapel::firstOrCreate([
                    'kelas_id' => $kelas->id,
                    'nama_mapel' => $namaMapel
                ]);

                // Create Dummy Soal for each Mapel
                Soal::create([
                    'mapel_id' => $mapel->id,
                    'pertanyaan' => "Contoh pertanyaan untuk mata pelajaran $namaMapel di kelas {$kelas->nama_kelas}",
                    'opsi_a' => 'Pilihan A',
                    'opsi_b' => 'Pilihan B',
                    'opsi_c' => 'Pilihan C',
                    'opsi_d' => 'Pilihan D',
                    'jawaban_benar' => 'A'
                ]);
            }
        }

        // Create Sample Exam (Linked to specific mapel not strictly required by model but logically good)
        // We'll just keep the generic exam creation as is
        $exam = Exam::create([
            'title' => 'Ujian Matematika Semester 1',
            'description' => 'Ujian tengah semester mata pelajaran matematika',
            'duration_minutes' => 90,
            'start_at' => now(),
            'end_at' => now()->addDays(7),
        ]);

        // Create Sample Questions
        Question::create([
            'exam_id' => $exam->id,
            'prompt' => 'Berapa hasil dari 2 + 2?',
            'options' => ['2', '3', '4', '5'],
            'answer' => '4',
            'score' => 10,
        ]);

        Question::create([
            'exam_id' => $exam->id,
            'prompt' => 'Berapa hasil dari 5 x 3?',
            'options' => ['10', '15', '20', '25'],
            'answer' => '15',
            'score' => 10,
        ]);

        Question::create([
            'exam_id' => $exam->id,
            'prompt' => 'Berapa hasil dari 100 / 4?',
            'options' => ['20', '25', '30', '35'],
            'answer' => '25',
            'score' => 10,
        ]);

        // Generate sample grades
        $this->call(NilaiSeeder::class);
    }
}
