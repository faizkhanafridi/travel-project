<?php

namespace App\Mail\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $token,
        public int $ttlMinutes,
        public string $email,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset your password',
        );
    }

    public function content(): Content
    {
        // $url = rtrim(config('app.frontend_url', env('FRONTEND_URL')), '/')
        //     . '/reset-password?token=' . urlencode($this->token)
        //     . '&email=' . urlencode($this->email);

        $url = '/reset-password?token=' . urlencode($this->token) . '&email=' . urlencode($this->email);


        // Escape & so the HTML attribute/URL is valid inside the href.
        $safeUrl = htmlspecialchars($url, ENT_QUOTES, 'UTF-8');

        $html = <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background:#f7f7f8; padding:24px;">
  <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:8px; padding:32px;">
    <h2 style="margin:0 0 16px; color:#111827;">Reset your password</h2>
    <p style="margin:0 0 12px; color:#374151;">
      Click the button below to reset your password. This link expires in {$this->ttlMinutes} minutes.
    </p>
    <p style="text-align:center; margin:24px 0;">
      <a href="{$safeUrl}"
         style="display:inline-block; padding:12px 24px; background:#2563eb; color:#ffffff;
                text-decoration:none; border-radius:6px; font-weight:bold;">
        Reset Password
      </a>
    </p>
    <p style="margin:0 0 8px; color:#6b7280; font-size:12px;">
      If the button doesn't work, copy this link into your browser:
    </p>
    <div style="font-size:12px; font-family: monospace; word-break:break-all; text-align:center;
                padding:12px; background:#f3f4f6; border-radius:6px; color:#374151;">
      {$safeUrl}
    </div>
    <p style="margin:16px 0 0; color:#6b7280; font-size:13px;">
      If you didn't request a password reset, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
HTML;

        return new Content(htmlString: $html);
    }
}
