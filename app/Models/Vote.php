<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    protected $fillable = [
        'voting_id',
        'vote_option_id',
        'user_id',
    ];

    public function voting()
    {
        return $this->belongsTo(Voting::class);
    }

    public function option()
    {
        return $this->belongsTo(VoteOption::class, 'vote_option_id');
    }
}
