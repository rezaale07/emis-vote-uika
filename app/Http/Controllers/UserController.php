<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // List mahasiswa
    public function index()
    {
        return User::where('role', 'student')->get();
    }

    // Tambah mahasiswa
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'nim' => 'required|unique:users,username',
            'password' => 'required|min:4',
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->nim,       // NIM sebagai username
            'password' => Hash::make($request->password),
            'role' => 'student',
        ]);

        return response()->json($user);
    }
}
