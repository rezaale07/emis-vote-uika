<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index()
    {
        // Biar konsisten, return data event langsung plus poster_url
        return response()->json(
            Event::orderBy('id', 'desc')->get()
        );
    }

    public function show($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event tidak ditemukan'], 404);
        }

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

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'date'        => 'required|date',
            'time'        => 'required|date_format:H:i',
            'location'    => 'required|string|max:255',
            'status'      => 'nullable|in:active,expired',
            'poster'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        // Auto status
        $eventDateTime = Carbon::parse($data['date'] . ' ' . $data['time']);
        $status = $eventDateTime->isPast() ? 'expired' : ($data['status'] ?? 'active');

        // Upload poster (optional)
        $posterUrl = null;
        if ($request->hasFile('poster')) {
            // pastikan kamu sudah: php artisan storage:link
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
            'poster'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        // Auto status (paksa expired kalau sudah lewat)
        $eventDateTime = Carbon::parse($data['date'] . ' ' . $data['time']);
        $status = $eventDateTime->isPast() ? 'expired' : $data['status'];

        // Default poster tetap yang lama
        $posterUrl = $event->poster_url;

        // Kalau upload poster baru → hapus lama → simpan baru
        if ($request->hasFile('poster')) {

            // Hapus poster lama dengan cara aman:
            // karena kita simpan URL, ambil relative path setelah "/storage/"
            if (!empty($event->poster_url)) {
                $relative = parse_url($event->poster_url, PHP_URL_PATH); // ex: /storage/events/xxx.webp
                if ($relative && str_starts_with($relative, '/storage/')) {
                    $oldPath = substr($relative, strlen('/storage/')); // events/xxx.webp
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
