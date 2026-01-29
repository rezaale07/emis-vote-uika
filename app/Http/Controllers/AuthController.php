<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    /**
     * ======================
     * LOGIN (NPM / EMAIL)
     * ======================
     */
    public function login(Request $request)
    {
        $request->validate([
            'login'    => 'required|string',
            'password' => 'required|string'
        ]);

        $login = trim(strtolower($request->login));

        $user = User::where(function ($q) use ($login) {
                $q->where('username', $login)
                  ->orWhere('email', $login);
            })
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Akun tidak ditemukan'], 404);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Password salah'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->name,
                'email'    => $user->email,
                'username' => $user->username,
                'role'     => $user->role,
                'avatar'   => $user->avatar,
            ]
        ]);
    }

    /**
     * ======================
     * FORGOT PASSWORD
     * ======================
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'login' => 'required|string'
        ]);

        $login = trim(strtolower($request->login));

        $user = User::where('role', 'student')
            ->where(function ($q) use ($login) {
                $q->where('username', $login)
                  ->orWhere('email', $login);
            })
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Mahasiswa tidak ditemukan'
            ], 404);
        }

        // Kirim reset link (URL di-handle oleh Notification)
        $status = Password::sendResetLink([
            'email' => $user->email
        ]);

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Link reset password berhasil dikirim ke email'
            ]);
        }

        if ($status === Password::RESET_THROTTLED) {
            return response()->json([
                'message' => 'Silakan tunggu beberapa saat sebelum mengirim ulang email reset.'
            ], 429);
        }

        return response()->json([
            'message' => 'Gagal mengirim email reset password'
        ], 500);
    }

    /**
     * ======================
     * RESET PASSWORD
     * ======================
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => 'required|min:6|confirmed',
        ]);

        $student = User::where('email', strtolower(trim($request->email)))
            ->where('role', 'student')
            ->first();

        if (!$student) {
            return response()->json([
                'message' => 'Mahasiswa tidak valid'
            ], 403);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Password berhasil direset, silakan login kembali'
            ]);
        }

        return response()->json([
            'message' => 'Token reset tidak valid atau sudah kadaluarsa'
        ], 400);
    }
}
