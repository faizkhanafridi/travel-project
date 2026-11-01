<?php
// app/Mail/UserProfile/EmailChangeNewCodeMail.php

namespace App\Mail\UserProfile;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailChangeNewCodeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $recipientName,
        public string $newEmail,
        public string $code,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Verify your new email — Travel Marketplace');
    }

    public function content(): Content
    {
        $frontend = rtrim(config('app.frontend_url'), '/');
        $url = $frontend
            . '/account/email/confirm-new?email=' . urlencode($this->newEmail)
            . '&code=' . urlencode($this->code);

        $body = "Hi {$this->recipientName},\n\n"
            . "Please verify this email address to finish changing your Travel Marketplace account email.\n\n"
            . "Your verification code is: {$this->code}\n\n"
            . "Or open this link to verify:\n{$url}\n\n"
            . "This code expires in 10 minutes.\n";

        return new Content(htmlString: nl2br(e($body)));
    }
}