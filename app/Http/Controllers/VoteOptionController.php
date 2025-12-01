<?php

namespace App\Http\Controllers;

use App\Models\VoteOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VoteOptionController extends Controller
{
    public function index($votingId)
{
    return VoteOption::where('voting_id', $votingId)->get();
}


    public function store(Request $request, $votingId)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'bio' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpg,png,jpeg|max:2048'
        ]);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time().'_'.$file->getClientOriginalName();
            $file->storeAs('candidate_photos', $filename, 'public');
            $data['photo'] = $filename;
        }

        $data['voting_id'] = $votingId;

        $opt = VoteOption::create($data);

        return response()->json([
            'message' => 'Candidate added',
            'data' => $opt
        ], 201);
    }

    public function update(Request $request, $votingId, $optionId)
    {
        $opt = VoteOption::where('voting_id', $votingId)
            ->where('id', $optionId)
            ->firstOrFail();

        $data = $request->validate([
            'name' => 'required|string',
            'bio' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpg,png,jpeg|max:2048'
        ]);

        // upload new photo
        if ($request->hasFile('photo')) {

            // delete old photo
            if ($opt->photo && Storage::disk('public')->exists("candidate_photos/{$opt->photo}")) {
                Storage::disk('public')->delete("candidate_photos/{$opt->photo}");
            }

            $file = $request->file('photo');
            $filename = time().'_'.$file->getClientOriginalName();
            $file->storeAs('candidate_photos', $filename, 'public');
            $data['photo'] = $filename;
        }

        $opt->update($data);

        return response()->json([
            'message' => 'Candidate updated',
            'data' => $opt
        ]);
    }

    public function destroy($votingId, $optionId)
    {
        $opt = VoteOption::where('voting_id', $votingId)
            ->where('id', $optionId)
            ->firstOrFail();

        if ($opt->photo && Storage::disk('public')->exists('candidate_photos/'.$opt->photo)) {
            Storage::disk('public')->delete('candidate_photos/'.$opt->photo);
        }

        $opt->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
