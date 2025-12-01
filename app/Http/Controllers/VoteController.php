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
    public function store(Request $request)
    {
        $data = $request->validate([
            'voting_id'      => 'required|exists:votings,id',
            'vote_option_id' => 'required|exists:vote_options,id',
            'user_id'        => 'required|integer|exists:users,id',
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
            throw ValidationException::withMessages([
                'voting' => 'Voting belum dimulai.',
            ]);
        }

        if ($voting->end_date && $now->gt(Carbon::parse($voting->end_date))) {
            throw ValidationException::withMessages([
                'voting' => 'Voting telah berakhir.',
            ]);
        }

        // Pastikan option milik voting
        $opt = VoteOption::where('id', $data['vote_option_id'])
            ->where('voting_id', $data['voting_id'])
            ->first();

        if (! $opt) {
            throw ValidationException::withMessages([
                'vote_option' => 'Opsi kandidat tidak sesuai voting.',
            ]);
        }

        // ⛔ CEK SUDAH PERNAH VOTE BELUM
        $existing = Vote::where('voting_id', $data['voting_id'])
            ->where('user_id', $data['user_id'])
            ->first();

        if ($existing) {
            // Frontend akan baca status 409 untuk menampilkan pesan "sudah pernah vote"
            return response()->json([
                'message' => 'Anda sudah memberikan suara pada voting ini.',
            ], 409);
        }

        // SIMPAN VOTE BARU
        $vote = Vote::create($data);

        return response()->json([
            'message' => 'Vote terekam.',
            'vote'    => $vote,
        ], 201);
    }
}
