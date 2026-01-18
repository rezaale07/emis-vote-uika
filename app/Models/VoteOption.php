<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoteOption extends Model
{
    protected $fillable = [
        'voting_id',
        'name',
        'bio',
        'photo'
    ];

    protected $appends = ['photo_url'];

    // =====================
    //  ACCESSOR FOTO URL
    // =====================
    public function getPhotoUrlAttribute()
    {
        return $this->photo
            ? asset('storage/candidate_photos/' . $this->photo)
            : null;
    }

    // =====================
    //  RELASI KE VOTING
    // =====================
    public function voting()
    {
        return $this->belongsTo(Voting::class);
    }

    // =====================
    //  RELASI KE VOTES
    //  (PENTING BANGET! WAJIB ADA)
    // =====================
    public function votes()
    {
        return $this->hasMany(\App\Models\Vote::class, 'vote_option_id');
    }
}
        