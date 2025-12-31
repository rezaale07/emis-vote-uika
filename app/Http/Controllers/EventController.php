<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class EventController extends Controller
{
    public function index()
    {
        return response()->json(Event::orderBy('id', 'desc')->get());
    }

    public function show($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json([
                'message' => 'Event tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'id'          => $event->id,
            'title'       => $event->title,
            'description' => $event->description,
            'date'        => $event->date, // string yyyy-mm-dd
            'time'        => $event->time ? substr($event->time, 0, 5) : null, // HH:mm
            'location'    => $event->location,
            'poster_url'  => $event->poster_url,
            'status'      => $event->status,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'date'        => 'required|date',
            'time'        => 'required|date_format:H:i',
            'location'    => 'required|string|max:255',
            'status'      => 'nullable|in:active,expired', // ✅ terima status (optional)
            'poster'      => 'nullable|image|max:4096',
        ]);

        // ===== AUTO EXPIRE (SERVER-SIDE) =====
        $eventDateTime = Carbon::parse($data['date'] . ' ' . $data['time']);
        if ($eventDateTime->isPast()) {
            $data['status'] = 'expired';
        } else {
            $data['status'] = $data['status'] ?? 'active';
        }

        // ===== UPLOAD POSTER =====
        $posterUrl = null;
        if ($request->hasFile('poster')) {
            $path = $request->file('poster')->store('events', 'public');
            $posterUrl = url('storage/' . $path);
        }

        $event = Event::create([
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'date'        => $data['date'],
            'time'        => $data['time'],
            'location'    => $data['location'],
            'poster_url'  => $posterUrl,
            'status'      => $data['status'],
        ]);

        return response()->json([
            'message' => 'Event berhasil dibuat',
            'data'    => $event
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'date'        => 'required|date',
            'time'        => 'required|date_format:H:i',
            'location'    => 'required|string|max:255',
            'status'      => 'required|in:active,expired',
            'poster'      => 'nullable|image|max:4096',
        ]);

        // ===== AUTO EXPIRE (SERVER-SIDE) =====
        $eventDateTime = Carbon::parse($data['date'] . ' ' . $data['time']);
        if ($eventDateTime->isPast()) {
            $data['status'] = 'expired'; // 🔥 paksa expired walau admin pilih active
        }

        // ===== POSTER (replace) =====
        if ($request->hasFile('poster')) {
            // hapus poster lama jika ada
            if ($event->poster_url) {
                $oldPath = str_replace(url('storage') . '/', '', $event->poster_url);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('poster')->store('events', 'public');
            $data['poster_url'] = url('storage/' . $path);
        }

        $event->update([
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'date'        => $data['date'],
            'time'        => $data['time'],
            'location'    => $data['location'],
            'poster_url'  => $data['poster_url'] ?? $event->poster_url,
            'status'      => $data['status'],
        ]);

        return response()->json([
            'message' => 'Event berhasil diperbarui',
            'data'    => $event->fresh()
        ]);
    }

    public function destroy($id)
    {
        $event = Event::findOrFail($id);

        if ($event->poster_url) {
            $oldPath = str_replace(url('storage') . '/', '', $event->poster_url);
            Storage::disk('public')->delete($oldPath);
        }

        $event->delete();

        return response()->json([
            'message' => 'Event berhasil dihapus'
        ]);
    }
}
