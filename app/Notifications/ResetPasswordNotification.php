<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    protected string $token;

    public function __construct(string $token)
    {
        $this->token = $token;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $frontend = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');

        $url = $frontend
            . '/reset-password?token=' . $this->token
            . '&email=' . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('🔐 Reset Password Akun EMIS-Vote UIKA')
            ->from(
                config('mail.from.address'),
                'EMIS-Vote UIKA'
            )
            ->view('emails.reset-password', [
                'user' => $notifiable,
                'url'  => $url,
            ]);
    }
}
