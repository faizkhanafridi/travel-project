<?php
// app/Mail/Auth/SetPasswordCodeMail.php

namespace App\Mail\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SetPasswordCodeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $recipientName,
        public string $recipientEmail,
        public string $code,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Set your password — Travel Marketplace');
    }

    public function content(): Content
    {
        // No Blade view. Plain-text body with a link straight to the frontend.
        $frontend = rtrim(config('app.frontend_url'), '/');
        $url = $frontend
            . '/set-password?email=' . urlencode($this->recipientEmail)
            . '&code=' . urlencode($this->code);

        $body = "Hi {$this->recipientName},\n\n"
            . "You signed up for Travel Marketplace with a social account and haven't set a password yet.\n\n"
            . "Your verification code is: {$this->code}\n\n"
            . "Or click the link below to set a password:\n"
            . "{$url}\n\n"
            . "This code expires in 10 minutes. If you did not request this, you can safely ignore this email.\n";

        return new Content(text: $body);
    }
}