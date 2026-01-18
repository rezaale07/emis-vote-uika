<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class StudentController extends Controller
{
    // Ambil semua mahasiswa
    public function index()
    {
        $students = User::where('role', 'student')->get();
        return response()->json($students);
    }

    // Tambah mahasiswa (admin)
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|unique:users,username',
            'email'    => 'nullable|email|unique:users,email',
            'password' => 'required|min:4',
        ]);

        $student = User::create([
            'name'     => $request->name,
            'username' => $request->username,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'student',
        ]);

        return response()->json([
            'message' => 'Akun mahasiswa berhasil ditambahkan!',
            'student' => $student,
        ]);
    }

    // Detail mahasiswa
    public function show($id)
    {
        return response()->json(User::findOrFail($id));
    }

    // Update mahasiswa dari Admin
    public function update(Request $request, $id)
    {
        $student = User::findOrFail($id);

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'username' => 'sometimes|string|unique:users,username,' . $id,
            'email'    => 'nullable|email|unique:users,email,' . $id,
            'password' => 'nullable|min:4',
        ]);

        if ($request->filled('name')) $student->name = $request->name;
        if ($request->filled('username')) $student->username = $request->username;
        if ($request->filled('email')) $student->email = $request->email;
        if ($request->filled('password')) $student->password = Hash::make($request->password);

        $student->save();

        return response()->json([
            'message' => 'Akun mahasiswa berhasil diperbarui!',
            'student' => $student,
        ]);
    }

    // ✔ FINAL : Update profil mahasiswa (avatar + password optional)
    public function updateProfile(Request $request, $id)
    {
        $student = User::findOrFail($id);

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $student->id,
            'email'    => 'nullable|email|unique:users,email,' . $student->id,
            'password' => 'nullable|min:4',
            'avatar'   => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        // ===============================
        // 🔥 AVATAR HANDLING (FINAL FIX)
        // ===============================
        if ($request->hasFile('avatar')) {

            // Hapus avatar lama jika ada
            if ($student->avatar) {
                $oldFile = str_replace(url('/storage') . '/', '', $student->avatar);
                Storage::disk('public')->delete($oldFile);
            }

            // Simpan avatar baru
            $path = $request->file('avatar')->store('avatars', 'public');

            // URL lengkap agar React bisa akses
            $student->avatar = url('storage/' . $path);
        }

        // Data dasar
        $student->name     = $validated['name'];
        $student->username = $validated['username'];
        $student->email    = $validated['email'] ?? null;

        // Password opsional
        if (!empty($validated['password'])) {
            $student->password = Hash::make($validated['password']);
        }

        $student->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui!',
            'user'    => [
                'id'       => $student->id,
                'name'     => $student->name,
                'email'    => $student->email,
                'username' => $student->username,
                'role'     => $student->role,
                'avatar'   => $student->avatar,
            ],
        ]);
    }

    // Hapus akun
    public function destroy($id)
    {
        User::where('id', $id)->delete();

        return response()->json([
            'message' => 'Akun mahasiswa berhasil dihapus!',
        ]);
    }
}
