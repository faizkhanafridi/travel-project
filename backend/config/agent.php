<?php

return [
    'document_max_kb' => (int) env('AGENT_DOC_MAX_KB', 10240),
    'document_disk' => env('AGENT_DOC_DISK', 'local'),
    'document_path' => env('AGENT_DOC_PATH', 'agent-documents'),
    'submit_rate_limit_per_hour' => (int) env('AGENT_SUBMIT_RATE_LIMIT', 3),
    'allowed_mimes' => ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
];