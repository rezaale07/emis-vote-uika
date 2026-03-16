<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StudentController extends Controller
{
    /* =========================
       GET ALL STUDENTS
    ========================= */
    public function index(Request $request)
{
    $search = $request->query('search');

    $students = User::where('role', 'student')
        ->when($search, function ($q) use ($search) {
            $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('fakultas', 'like', "%{$search}%")
                    ->orWhere('prodi', 'like', "%{$search}%")
                    ->orWhere('angkatan', 'like', "%{$search}%");
            });
        })
        ->orderBy('created_at', 'asc')
        ->get([
            'id',
            'name',
            'username',
            'email',
            'fakultas',
            'prodi',
            'angkatan',
        ]);

    return response()->json($students);
}


    /* =========================
       CREATE STUDENT (MANUAL)
    ========================= */
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|unique:users,username',
            'email'    => 'nullable|email|unique:users,email',
            'password' => 'required|min:4',

            // tambahan
            'fakultas' => 'nullable|string|max:100',
            'prodi'    => 'nullable|string|max:100',
            'angkatan' => 'nullable|string|max:10',
        ]);

        $student = User::create([
            'name'     => $request->name,
            'username' => $request->username,
            'email'    => $request->email ?: null,
            'password' => Hash::make($request->password),
            'role'     => 'student',

            'fakultas' => $request->fakultas ?: null,
            'prodi'    => $request->prodi ?: null,
            'angkatan' => $request->angkatan ?: null,
        ]);

        return response()->json([
            'message' => 'Akun mahasiswa berhasil ditambahkan!',
            'student' => $student,
        ]);
    }

    /* =========================
       SHOW DETAIL
    ========================= */
    public function show($id)
    {
        return response()->json(
            User::findOrFail($id)
        );
    }

    /* =========================
       UPDATE STUDENT (ADMIN)
    ========================= */
    public function update(Request $request, $id)
    {
        $student = User::findOrFail($id);

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'username' => 'sometimes|string|unique:users,username,' . $id,
            'email'    => 'nullable|email|unique:users,email,' . $id,
            'password' => 'nullable|min:4',

            // tambahan
            'fakultas' => 'nullable|string|max:100',
            'prodi'    => 'nullable|string|max:100',
            'angkatan' => 'nullable|string|max:10',
        ]);

        if ($request->has('name')) {
            $student->name = $request->name;
        }

        if ($request->has('username')) {
            $student->username = $request->username;
        }

        if ($request->has('email')) {
            $student->email = $request->email ?: null;
        }

        if ($request->filled('password')) {
            $student->password = Hash::make($request->password);
        }

        // tambahan
        if ($request->has('fakultas')) {
            $student->fakultas = $request->fakultas ?: null;
        }

        if ($request->has('prodi')) {
            $student->prodi = $request->prodi ?: null;
        }

        if ($request->has('angkatan')) {
            $student->angkatan = $request->angkatan ?: null;
        }

        $student->save();

        return response()->json([
            'message' => 'Akun mahasiswa berhasil diperbarui!',
            'student' => $student,
        ]);
    }

    /* =========================
       IMPORT EXCEL (Laravel 12 SAFE)
    ========================= */
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
            if ($index === 0) continue; // skip header

            $nama     = trim($row[0] ?? '');
            $npm      = trim($row[1] ?? '');
            $email    = trim($row[2] ?? '');
            $fakultas = trim($row[3] ?? '');
            $prodi    = trim($row[4] ?? '');
            $angkatan = trim($row[5] ?? '');

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

    /* =========================
       DELETE
    ========================= */
    public function destroy($id)
    {
        User::where('id', $id)->delete();

        return response()->json([
            'message' => 'Akun mahasiswa berhasil dihapus!',
        ]);
    }
}
