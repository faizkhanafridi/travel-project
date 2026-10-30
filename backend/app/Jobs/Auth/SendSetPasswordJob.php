<?php

namespace App\Jobs\Auth;

use App\Mail\Auth\SetPasswordMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendSetPasswordJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public string $email,
        public string $plainToken,
        public int $ttlMinutes,
    ) {}

    public function handle(): void
    {
        Mail::to($this->email)->send(
            new SetPasswordMail($this->plainToken, $this->ttlMinutes, $this->email)
        );
    }
}