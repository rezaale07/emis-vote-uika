<?php

namespace App\Http\Controllers;

use App\Models\Vote;
use App\Models\Voting;
use App\Models\VoteOption;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class VoteController extends Controller
{
    // ============================================================
    // 🔍 CHECK USER VOTE
    // ============================================================
    public function check(Request $request)
    {
        $request->validate([
            'voting_id' => 'required|exists:votings,id',
            'user_id'   => 'required|exists:users,id',
        ]);

        $vote = Vote::where('voting_id', $request->voting_id)
            ->where('user_id', $request->user_id)
            ->first();

        return response()->json([
            'voted'     => $vote ? true : false,
            'option_id' => $vote->vote_option_id ?? null,
        ]);
    }

    // ============================================================
    // 🗳 SUBMIT VOTE
    // ============================================================
    public function store(Request $request)
    {
        $data = $request->validate([
            'voting_id'      => 'required|exists:votings,id',
            'vote_option_id' => 'required|exists:vote_options,id',
            'user_id'        => 'required|exists:users,id',
        ]);

        $voting = Voting::findOrFail($data['voting_id']);

        // Voting harus active
        if ($voting->status !== 'active') {
            throw ValidationException::withMessages([
                'voting' => 'Voting tidak aktif.',
            ]);
        }

        // Cek tanggal
        $now = Carbon::now();
        if ($voting->start_date && $now->lt(Carbon::parse($voting->start_date))) {
            throw ValidationException::withMessages(['voting' => 'Voting belum dimulai.']);
        }
        if ($voting->end_date && $now->gt(Carbon::parse($voting->end_date))) {
            throw ValidationException::withMessages(['voting' => 'Voting telah berakhir.']);
        }

        // Cek opsi kandidat valid
        $opt = VoteOption::where('id', $data['vote_option_id'])
            ->where('voting_id', $data['voting_id'])
            ->first();

        if (! $opt) {
            throw ValidationException::withMessages([
                'vote_option' => 'Opsi kandidat tidak sesuai voting.',
            ]);
        }

        // Cek apakah sudah vote
        $existing = Vote::where('voting_id', $data['voting_id'])
            ->where('user_id', $data['user_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Anda sudah memberikan suara.',
            ], 409);
        }

        // Simpan vote
        $vote = Vote::create($data);

        return response()->json([
            'message' => 'Vote terekam.',
            'vote'    => $vote,
        ], 201);
    }
}
