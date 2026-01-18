<?php

namespace App\Http\Controllers;

use App\Models\Voting;
use Illuminate\Http\Request;

class VotingController extends Controller
{
    // GET ALL (ADMIN + STUDENT)
    public function index()
    {
        return Voting::with(['options'])->get();
    }

    // CREATE VOTING
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'poster' => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'required|string'
        ]);

        if ($request->hasFile('poster')) {
            $file = $request->file('poster');
            $filename = time().'_'.$file->getClientOriginalName();
            $file->storeAs('voting_posters', $filename, 'public');
            $data['poster'] = $filename;
        }

        $v = Voting::create($data);
        return response()->json(['message' => 'Voting created', 'data' => $v], 201);
    }

    // GET DETAIL VOTING
    public function show($id)
{
    $voting = Voting::with('options')->findOrFail($id);

    // Fix URL poster
    $voting->poster_url = $voting->poster
        ? asset('storage/voting_posters/' . $voting->poster)
        : null;

    // add votes_count & photo_url
    foreach ($voting->options as $opt) {
        $opt->photo_url = $opt->photo
            ? asset('storage/candidate_photos/' . $opt->photo)
            : null;

        $opt->votes_count = $opt->votes()->count();
    }

    // 🔥 FIX: karena sudah ditambah relasi votes() di model
    $voting->total_votes = $voting->votes()->count();

    return response()->json($voting);
}


    // UPDATE
    public function update(Request $request, $id)
    {
        $voting = Voting::findOrFail($id);

        $data = $request->validate([
            'title' => 'sometimes|string',
            'description' => 'sometimes|string|nullable',
            'poster' => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
            'start_date' => 'sometimes|date|nullable',
            'end_date' => 'sometimes|date|nullable',
            'status' => 'sometimes|string'
        ]);

        if ($request->hasFile('poster')) {
            $file = $request->file('poster');
            $filename = time().'_'.$file->getClientOriginalName();
            $file->storeAs('voting_posters', $filename, 'public');
            $data['poster'] = $filename;
        }

        $voting->update($data);

        return response()->json(['message' => 'Voting updated', 'data' => $voting]);
    }

    // DELETE
    public function destroy($id)
    {
        $v = Voting::findOrFail($id);

        if ($v->poster && \Storage::disk('public')->exists('voting_posters/'.$v->poster)) {
            \Storage::disk('public')->delete('voting_posters/'.$v->poster);
        }

        $v->delete();
        return response()->json(['message' => 'Voting deleted']);
    }
}
