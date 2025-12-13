<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'title',
        'description',
        'date',
        'location',
        'poster_url',
        'user_id',
        'status',       // ✅ TAMBAHAN
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
