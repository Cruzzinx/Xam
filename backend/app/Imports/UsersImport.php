<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Kelas;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class UsersImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        $nama = $row['nama'] ?? $row['name'] ?? null;
        
        if (!$nama) {
            return null;
        }

        $username = $row['username'] ?? strtolower(str_replace(' ', '', $nama)) . rand(100,999);
        $email = $row['email'] ?? $username . '@local.test';
        $password = isset($row['password']) ? Hash::make($row['password']) : Hash::make('password123');
        $role = $row['role'] ?? 'siswa';

        $kelas_id = null;
        if (isset($row['kelas'])) {
            $kelasRecord = Kelas::firstOrCreate(['nama_kelas' => $row['kelas']]);
            $kelas_id = $kelasRecord->id;
        }

        // Check if user exists
        if (User::where('username', $username)->orWhere('email', $email)->exists()) {
            return null;
        }

        return new User([
            'name'     => $nama,
            'username' => $username,
            'email'    => $email,
            'password' => $password,
            'role'     => $role,
            'kelas_id' => $kelas_id,
        ]);
    }
}
