<?php

namespace App\Http\Resources\Agent;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentBusinessHourResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'day_of_week' => (int) $this->day_of_week,
            'is_closed' => (bool) $this->is_closed,
            'open_time' => $this->open_time,
            'close_time' => $this->close_time,
        ];
    }
}