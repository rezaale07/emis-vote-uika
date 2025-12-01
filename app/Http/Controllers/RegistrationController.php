<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    // Semua registrasi (admin)
    public function index()
    {
        return response()->json(
            Registration::with('event')->latest()->get()
        );
    }

    // Daftar event
    public function store(Request $request)
    {
        $data = $request->validate([
            'event_id' => 'required|exists:events,id',
            'user_id'  => 'required|exists:users,id'
        ]);

        $reg = Registration::firstOrCreate(
            ['event_id' => $data['event_id'], 'user_id' => $data['user_id']],
            ['status'   => 'registered']
        );

        return response()->json([
            'message'      => 'Registrasi berhasil',
            'registration' => $reg
        ], 201);
    }

    // Cek apakah user sudah daftar
    public function check(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'user_id'  => 'required|exists:users,id'
        ]);

        $exists = Registration::where('event_id', $request->event_id)
            ->where('user_id', $request->user_id)
            ->exists();

        return response()->json(['registered' => $exists]);
    }

    // Peserta event
    public function participants($eventId)
    {
        return Registration::where('event_id', $eventId)
            ->join('users', 'users.id', '=', 'registrations.user_id')
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'registrations.status',
                'registrations.created_at'
            )
            ->orderBy('registrations.created_at', 'asc')
            ->get();
    }

    // Riwayat event user
    public function history($userId)
    {
        try {
            return Registration::where('registrations.user_id', $userId)
                ->join('events', 'events.id', '=', 'registrations.event_id')
                ->select(
                    'registrations.id',
                    'events.title as event_title',
                    'events.date as event_date'
                )
                ->orderBy('registrations.created_at', 'desc')
                ->get();

        } catch (\Exception $e) {

            return response()->json([
                'error' => true,
                'message' => 'Gagal mengambil riwayat event.',
                'detail' => $e->getMessage()
            ], 500);
        }
    }
}
