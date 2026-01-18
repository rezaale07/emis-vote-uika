<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use App\Models\Event;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    /**
     * =========================
     * CHECK REGISTRATION (STUDENT)
     * =========================
     */
    public function check(Request $request)
    {
        $request->validate([
            'event_id' => 'required|integer',
            'user_id'  => 'required|integer',
        ]);

        $exists = Registration::where('event_id', $request->event_id)
            ->where('user_id', $request->user_id)
            ->exists();

        return response()->json([
            'registered' => $exists
        ]);
    }

    /**
     * =========================
     * REGISTER EVENT
     * =========================
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'event_id' => 'required|exists:events,id',
            'user_id'  => 'required|exists:users,id',
        ]);

        $exists = Registration::where('event_id', $data['event_id'])
            ->where('user_id', $data['user_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Kamu sudah terdaftar di event ini.'
            ], 409);
        }

        $reg = Registration::create([
            'event_id' => $data['event_id'],
            'user_id'  => $data['user_id'],
            'status'   => 'registered'
        ]);

        return response()->json([
            'message' => 'Registrasi berhasil',
            'data'    => $reg
        ], 201);
    }

    /**
     * =========================
     * ADMIN: LIST ALL REGISTRATIONS
     * =========================
     */
    public function index()
    {
        return response()->json(
            Registration::with(['user', 'event'])
                ->latest()
                ->get()
        );
    }

    /**
     * =========================
     * ADMIN: EVENT PARTICIPANTS
     * =========================
     */
    public function participants($eventId)
    {
        // pastikan event ada
        Event::findOrFail($eventId);

        $participants = Registration::with('user')
            ->where('event_id', $eventId)
            ->latest()
            ->get();

        return response()->json([
            'participants' => $participants
        ]);
    }

    /**
     * =========================
     * STUDENT: HISTORY EVENT
     * =========================
     */
    public function history($userId)
    {
        $history = Registration::with('event')
            ->where('user_id', $userId)
            ->latest()
            ->get();

        return response()->json([
            'history' => $history
        ]);
    }
}
