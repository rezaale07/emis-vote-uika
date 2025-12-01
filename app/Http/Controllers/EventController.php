<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index()
    {
        return response()->json(Event::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'date'        => 'required|date',
            'location'    => 'required|string|max:255',
            'poster'      => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
        ]);

        $posterUrl = null;

        if ($request->hasFile('poster')) {
            $path = $request->file('poster')->store('events', 'public');
            $posterUrl = url('storage/' . $path);
        }

        $event = Event::create([
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'date'        => $validated['date'],
            'location'    => $validated['location'],
            'poster_url'  => $posterUrl,
        ]);

        return response()->json(['event' => $event], 201);
    }

    public function show($id)
    {
        return response()->json(Event::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title'       => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'date'        => 'nullable|date',
            'location'    => 'nullable|string|max:255',
            'poster'      => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
        ]);

        if ($request->hasFile('poster')) {

            if ($event->poster_url) {
                $old = str_replace(url('storage').'/','',$event->poster_url);
                Storage::disk('public')->delete($old);
            }

            $path = $request->file('poster')->store('events', 'public');
            $validated['poster_url'] = url('storage/' . $path);
        }

        $event->update($validated);

        return response()->json(['event' => $event]);
    }

    public function destroy($id)
    {
        $event = Event::findOrFail($id);

        if ($event->poster_url) {
            $old = str_replace(url('storage').'/','',$event->poster_url);
            Storage::disk('public')->delete($old);
        }

        $event->delete();

        return response()->json(['message' => 'Event dihapus']);
    }
}
