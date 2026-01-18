<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Voting;
use App\Models\Vote;
use App\Models\Registration;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    // =============================
    // 1) SUMMARY
    // =============================
    public function summary()
    {
        return response()->json([
            'total_events'      => Event::count(),
            'total_participants'=> Registration::count(),
            'total_votes'       => Vote::count(),
        ]);
    }

    // =============================
    // 2) EVENT PARTICIPATION
    // =============================
    public function eventParticipation()
    {
        $events = Event::select('id', 'title')
            ->withCount([
                'registrations as participants',
            ])
            ->get()
            ->map(function ($ev) {
                return [
                    'title'        => $ev->title,
                    'participants' => $ev->participants ?? 0,
                    'capacity'     => rand(150, 500), // opsional kalau ada kapasitas asli
                ];
            });

        return response()->json($events);
    }

    // =============================
    // 3) VOTING PARTICIPATION
    // =============================
    public function votingParticipation()
    {
        $votings = Voting::select('id', 'title')
            ->withCount('votes')
            ->get()
            ->map(function ($vt) {
                return [
                    'title' => $vt->title,
                    'votes' => $vt->votes_count,
                ];
            });

        return response()->json($votings);
    }

    // =============================
    // 4) MONTHLY TRENDS
    // =============================
    public function monthlyTrends()
    {
        $months = collect(range(1, 12))->map(function ($m) {
            return [
                'month'       => date('M', mktime(0,0,0,$m,1)),
                'events'      => Event::whereMonth('created_at', $m)->count(),
                'participants'=> Registration::whereMonth('created_at', $m)->count(),
                'votes'       => Vote::whereMonth('created_at', $m)->count(),
            ];
        });

        return response()->json($months);
    }
}
