<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'date',
        'time',
        'location',
        'poster_url',
        'status',
        'user_id',
    ];

    /**
     * Jangan cast ke Carbon
     * biar frontend terima string
     */
    protected $casts = [
        'date' => 'string',
        'time' => 'string',
    ];
}
