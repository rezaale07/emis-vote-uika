<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use SerializesModels;

    public string $name;
    public string $resetUrl;

    public function __construct(string $name, string $resetUrl)
    {
        $this->name = $name;
        $this->resetUrl = $resetUrl;
    }

    public function build()
    {
        return $this
            ->subject('🔐 Reset Password Akun EMIS-Vote UIKA')
            ->markdown('emails.reset-password');
    }
}
