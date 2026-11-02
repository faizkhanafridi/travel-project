<?php
// app/Enums/TravelService/RequirementAnswerType.php

namespace App\Enums\TravelService;

enum RequirementAnswerType: string
{
    case TEXT = 'text';
    case TEXTAREA = 'textarea';
    case FILE = 'file';
    case NUMBER = 'number';
    case DATE = 'date';
}