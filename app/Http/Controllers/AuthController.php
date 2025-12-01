<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required',   // NPM / Email
            'password' => 'required'
        ]);

        $login = $request->login;

        // 🔥 Login bisa pakai NPM (username) ATAU Email
        $user = User::where('username', $login)
            ->orWhere('email', $login)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Akun tidak ditemukan'], 404);
        }

        // Cek password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Password salah'], 401);
        }

        // Token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role,
                'avatar' => $user->avatar ?? null
            ]
        ], 200);
    }
}
