<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    /**
     * 🔁 Refresh status event (AUTO EXPIRED)
     */
    private function refreshEventStatus(Event $event)
    {
        if (!$event->date || !$event->time) return;

        $eventDateTime = Carbon::parse($event->date . ' ' . $event->time);

        if ($eventDateTime->isPast() && $event->status !== 'expired') {
            $event->update(['status' => 'expired']);
        }
    }

    /**
     * LIST EVENT
     */
    public function index()
    {
        $events = Event::orderBy('id', 'desc')->get();

        foreach ($events as $event) {
            $this->refreshEventStatus($event);
        }

        return response()->json($events);
    }

    /**
     * DETAIL EVENT
     */
    public function show($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event tidak ditemukan'], 404);
        }

        $this->refreshEventStatus($event);

        return response()->json([
            'id'          => $event->id,
            'title'       => $event->title,
            'description' => $event->description,
            'date'        => $event->date,
            'time'        => $event->time ? substr($event->time, 0, 5) : null,
            'location'    => $event->location,
            'poster_url'  => $event->poster_url,
            'status'      => $event->status,
        ]);
    }

    /**
     * CREATE EVENT
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'date'        => 'required|date',
            'time'        => 'required|date_format:H:i',
            'location'    => 'required|string|max:255',
            'poster'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        // AUTO STATUS
        $eventDateTime = Carbon::parse($data['date'] . ' ' . $data['time']);
        $status = $eventDateTime->isPast() ? 'expired' : 'active';

        // Upload poster
        $posterUrl = null;
        if ($request->hasFile('poster')) {
            $path = $request->file('poster')->store('events', 'public');
            $posterUrl = asset('storage/' . $path);
        }

        $event = Event::create([
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'date'        => $data['date'],
            'time'        => $data['time'],
            'location'    => $data['location'],
            'poster_url'  => $posterUrl,
            'status'      => $status,
        ]);

        return response()->json([
            'message' => 'Event berhasil dibuat',
            'data'    => $event
        ], 201);
    }

    /**
     * UPDATE EVENT
     */
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'date'        => 'required|date',
            'time'        => 'required|date_format:H:i',
            'location'    => 'required|string|max:255',
            'poster'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        // AUTO STATUS (FORCED)
        $eventDateTime = Carbon::parse($data['date'] . ' ' . $data['time']);
        $status = $eventDateTime->isPast() ? 'expired' : 'active';

        // Poster lama
        $posterUrl = $event->poster_url;

        if ($request->hasFile('poster')) {

            if (!empty($event->poster_url)) {
                $relative = parse_url($event->poster_url, PHP_URL_PATH);
                if ($relative && str_starts_with($relative, '/storage/')) {
                    $oldPath = substr($relative, strlen('/storage/'));
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $path = $request->file('poster')->store('events', 'public');
            $posterUrl = asset('storage/' . $path);
        }

        $event->update([
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'date'        => $data['date'],
            'time'        => $data['time'],
            'location'    => $data['location'],
            'poster_url'  => $posterUrl,
            'status'      => $status,
        ]);

        return response()->json([
            'message' => 'Event berhasil diperbarui',
            'data'    => $event->fresh(),
        ]);
    }

    /**
     * DELETE EVENT
     */
    public function destroy($id)
    {
        $event = Event::findOrFail($id);

        if (!empty($event->poster_url)) {
            $relative = parse_url($event->poster_url, PHP_URL_PATH);
            if ($relative && str_starts_with($relative, '/storage/')) {
                $oldPath = substr($relative, strlen('/storage/'));
                Storage::disk('public')->delete($oldPath);
            }
        }

        $event->delete();

        return response()->json(['message' => 'Event berhasil dihapus']);
    }
}
