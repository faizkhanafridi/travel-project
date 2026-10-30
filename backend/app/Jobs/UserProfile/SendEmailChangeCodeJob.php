<?php

namespace App\Jobs\UserProfile;

use App\Mail\UserProfile\EmailChangeCodeMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendEmailChangeCodeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public string $email,
        public string $code,
        public string $target, // 'current' | 'new'
    ) {}

    public function handle(): void
    {
        Mail::to($this->email)->send(new EmailChangeCodeMail($this->code, $this->target));
    }
}