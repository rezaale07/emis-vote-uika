<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voting extends Model
{
    protected $fillable = [
        'title',
        'description',
        'poster',
        'start_date',
        'end_date',
        'status'
    ];

    protected $appends = ['poster_url'];

    public function getPosterUrlAttribute()
    {
        return $this->poster
            ? asset('storage/voting_posters/' . $this->poster)
            : null;
    }

    // 🔥 RELASI KANDIDAT
    public function options()
    {
        return $this->hasMany(\App\Models\VoteOption::class);
    }

    // 🔥 RELASI SUARA
    public function votes()
    {
        return $this->hasMany(\App\Models\Vote::class);
    }
}
