<?php

return [
    'photo_max_kb' => (int) env('PROFILE_PHOTO_MAX_KB', 5120),
    'email_change_code_ttl' => (int) env('EMAIL_CHANGE_CODE_TTL_MINUTES', 15),
    'email_change_max_attempts' => (int) env('EMAIL_CHANGE_MAX_ATTEMPTS', 5),
    'email_change_resend_cooldown' => (int) env('EMAIL_CHANGE_RESEND_COOLDOWN_SECONDS', 60),
];