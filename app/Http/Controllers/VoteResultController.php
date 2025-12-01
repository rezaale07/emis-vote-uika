<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\VoteResult;
use Illuminate\Http\Request;

class VoteResultController extends Controller
{
    public function index(Event $event)
    {
        $results = $event->options()->withCount('votes')->get();
        return view('vote.results', compact('event','results'));
    }
}
