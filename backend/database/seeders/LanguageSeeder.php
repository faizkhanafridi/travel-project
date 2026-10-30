<?php

namespace Database\Seeders;

use App\Models\UserProfile\Language;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LanguageSeeder extends Seeder
{
    public function run(): void
    {
        $languages = [
            ['name' => 'English', 'code' => 'en'],
            ['name' => 'Arabic', 'code' => 'ar'],
            ['name' => 'Urdu', 'code' => 'ur'],
            ['name' => 'Hindi', 'code' => 'hi'],
            ['name' => 'French', 'code' => 'fr'],
            ['name' => 'Spanish', 'code' => 'es'],
            ['name' => 'German', 'code' => 'de'],
            ['name' => 'Mandarin', 'code' => 'zh'],
            ['name' => 'Japanese', 'code' => 'ja'],
            ['name' => 'Turkish', 'code' => 'tr'],
        ];

        foreach ($languages as $language) {
            Language::firstOrCreate(
                ['code' => $language['code']],
                ['uuid' => (string) Str::uuid(), 'name' => $language['name']],
            );
        }
    }
}