<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function login(Request $request)
    {
        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Username atau password salah'], 401);
        }

        return response()->json([
            'message' => 'Login berhasil',
            'user' => $user
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'nullable|in:admin,siswa,guru',
            'kelas_id' => 'nullable|exists:kelas,id'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'siswa',
            'kelas_id' => $validated['kelas_id'] ?? null,
        ]);

        return response()->json($user, 201);
    }

    public function updateProfilePhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = $request->user();

        if ($user->profile_photo) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->profile_photo);
        }

        $path = $request->file('photo')->store('profiles', 'public');
        
        $user->update([
            'profile_photo' => $path
        ]);

        return response()->json([
            'message' => 'Foto profil berhasil diperbarui',
            'user' => $user->fresh()
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120',
        ]);

        try {
            \Maatwebsite\Excel\Facades\Excel::import(new \App\Imports\UsersImport, $request->file('file'));
            return response()->json(['message' => 'Data siswa berhasil diimport'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error import data: ' . $e->getMessage()], 500);
        }
    }
}
