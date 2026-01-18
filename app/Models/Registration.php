<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Event;

class Registration extends Model
{
    protected $fillable = [
        'event_id',
        'user_id',
        'status'
    ];

    /**
     * Relasi ke Event
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Relasi ke User (WAJIB)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
