<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoteResult extends Model
{
    protected $fillable = [
        'voting_id',
        'option_id',
        'user_id'
    ];
}
