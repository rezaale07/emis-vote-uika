<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;


class StudentController extends Controller
{
    // Ambil semua mahasiswa
    public function index()
    {
        $students = User::where('role', 'student')->get();
        return response()->json($students);
    }

    // Tambah mahasiswa (manual oleh admin)
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

    // Update profil mahasiswa (avatar + password optional)
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

        // Avatar handling
        if ($request->hasFile('avatar')) {
            if ($student->avatar) {
                $oldFile = str_replace(url('/storage') . '/', '', $student->avatar);
                Storage::disk('public')->delete($oldFile);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $student->avatar = url('storage/' . $path);
        }

        $student->name     = $validated['name'];
        $student->username = $validated['username'];
        $student->email    = $validated['email'] ?? null;

        if (!empty($validated['password'])) {
            $student->password = Hash::make($validated['password']);
        }

        $student->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui!',
            'user'    => $student,
        ]);
    }

    // 🔥 IMPORT EXCEL (Laravel 12 SAFE)
public function import(Request $request)
{
    $request->validate([
        'file' => 'required|file|mimes:xlsx',
    ]);

    $spreadsheet = IOFactory::load(
        $request->file('file')->getPathname()
    );

    $rows = $spreadsheet
        ->getActiveSheet()
        ->toArray();

    $success = 0;
    $failed  = 0;
    $errors  = [];

    foreach ($rows as $index => $row) {
        // skip header
        if ($index === 0) continue;

        $nama      = trim($row[0] ?? '');
        $npm       = trim($row[1] ?? '');
        $email     = trim($row[2] ?? '');
        $fakultas  = trim($row[3] ?? '');
        $prodi     = trim($row[4] ?? '');
        $angkatan  = trim($row[5] ?? '');

        if ($nama === '' || $npm === '') {
            $failed++;
            $errors[] = "Baris " . ($index + 1) . ": nama / npm kosong";
            continue;
        }

        if (User::where('username', $npm)->exists()) {
            $failed++;
            $errors[] = "Baris " . ($index + 1) . ": npm sudah terdaftar";
            continue;
        }

        User::create([
            'name'     => $nama,
            'username' => $npm,
            'email'    => $email ?: null,
            'password' => Hash::make($npm),
            'role'     => 'student',
            'fakultas' => $fakultas ?: null,
            'prodi'    => $prodi ?: null,
            'angkatan' => $angkatan ?: null,
        ]);

        $success++;
    }

    return response()->json([
        'message' => 'Import selesai',
        'success' => $success,
        'failed'  => $failed,
        'errors'  => $errors,
    ]);
}



    // Hapus akun mahasiswa
    public function destroy($id)
    {
        User::where('id', $id)->delete();

        return response()->json([
            'message' => 'Akun mahasiswa berhasil dihapus!',
        ]);
    }
}
