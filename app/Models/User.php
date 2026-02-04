<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Contracts\Auth\CanResetPassword;
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable implements CanResetPassword
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
    'name',
    'username',
    'email',
    'password',
    'role',
    'avatar',
    'fakultas',
    'prodi',
    'angkatan',
];


    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Digunakan oleh Laravel Password Broker
     */
    public function getEmailForPasswordReset()
    {
        return $this->email;
    }

    /**
     * Kirim email reset password (CUSTOM)
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
