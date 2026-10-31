<?php
// app/Mail/Auth/PasswordResetCodeMail.php

namespace App\Mail\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetCodeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $recipientName,
        public string $recipientEmail,
        public string $code,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your password reset code — Travel Marketplace');
    }

    public function content(): Content
    {
        // No Blade view. Plain-text body with a link straight to the frontend.
        $frontend = rtrim(config('app.frontend_url'), '/');
        $url = $frontend
            . '/reset-password?email=' . urlencode($this->recipientEmail)
            . '&code=' . urlencode($this->code);

        $body = "Hi {$this->recipientName},\n\n"
            . "We received a request to reset your Travel Marketplace password.\n\n"
            . "Your reset code is: {$this->code}\n\n"
            . "Or click the link below to choose a new password:\n"
            . "{$url}\n\n"
            . "This code expires in 10 minutes. If you did not request this, you can safely ignore this email.\n";

        return new Content(text: $body);
    }
}