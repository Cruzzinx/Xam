<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Kelas;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentImportSeeder extends Seeder
{
    public function run(): void
    {
        $json = file_get_contents(base_path('../students_data.json'));
        $students = json_decode($json, true);

        foreach ($students as $index => $data) {
            try {
                echo "[$index] Processing: {$data['name']}\n";
                // 1. Find or create Kelas
                $kelas = Kelas::firstOrCreate(['nama_kelas' => $data['kelas']]);

                // 2. Prepare No Peserta (Password)
                $noPeserta = $data['no_peserta'];
                if ($noPeserta === '-' || empty($noPeserta)) {
                    $noPeserta = (string) rand(50065000, 50069000);
                }

                // 3. Prepare Username (lowercase name, no spaces)
                $baseUsername = Str::slug($data['name'], '');
                $username = $baseUsername;
                $counter = 1;
                
                // Handle duplicate usernames
                while (User::where('username', $username)->where('email', '!=', $data['email'])->exists()) {
                    $username = $baseUsername . $counter;
                    $counter++;
                }

                // 4. Create User
                User::updateOrCreate(
                    ['email' => $data['email']],
                    [
                        'name' => $data['name'],
                        'username' => $username,
                        'password' => Hash::make($noPeserta),
                        'role' => 'siswa',
                        'kelas_id' => $kelas->id,
                    ]
                );
            } catch (\Exception $e) {
                echo "Error at index $index: " . $e->getMessage() . "\n";
            }
        }
    }
}
