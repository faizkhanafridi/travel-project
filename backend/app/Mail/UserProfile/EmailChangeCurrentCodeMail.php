<?php
// app/Mail/UserProfile/EmailChangeCurrentCodeMail.php

namespace App\Mail\UserProfile;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailChangeCurrentCodeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $recipientName,
        public string $recipientEmail,
        public string $code,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Confirm your email change — Travel Marketplace');
    }

    public function content(): Content
    {
        $frontend = rtrim(config('app.frontend_url'), '/');
        $url = $frontend
            . '/account/email/confirm-current?email=' . urlencode($this->recipientEmail)
            . '&code=' . urlencode($this->code);

        $body = "Hi {$this->recipientName},\n\n"
            . "We received a request to change your Travel Marketplace email address.\n\n"
            . "Your verification code is: {$this->code}\n\n"
            . "Or open this link to confirm:\n{$url}\n\n"
            . "This code expires in 10 minutes. If you did not request this, ignore this email and change your password.\n";

        return new Content(htmlString: nl2br(e($body)));
    }
}