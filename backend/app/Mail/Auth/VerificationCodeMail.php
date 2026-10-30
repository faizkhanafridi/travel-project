<?php

namespace App\Mail\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verify your email address',
        );
    }

    // Render inline HTML — no Blade view required.
    public function content(): Content
    {
        $html = <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background:#f7f7f8; padding:24px;">
  <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:8px; padding:32px;">
    <h2 style="margin:0 0 16px; color:#111827;">Verify your email address</h2>
    <p style="margin:0 0 12px; color:#374151;">
      Use the 6-digit code below to verify your email address. It expires in 15 minutes.
    </p>
    <div style="font-size:32px; font-weight:bold; letter-spacing:8px; text-align:center;
                padding:16px; background:#f3f4f6; border-radius:6px; color:#111827;">
      {$this->code}
    </div>
    <p style="margin:16px 0 0; color:#6b7280; font-size:13px;">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
HTML;

        return new Content(htmlString: $html);
    }
}