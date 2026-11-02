<?php
// app/Services/TravelService/TravelServiceImageService.php

namespace App\Services\TravelService;

use App\Models\TravelService\TravelServiceImage;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TravelServiceImageService
{
    public function stream(string $uuid): StreamedResponse
    {
        $image = TravelServiceImage::where('uuid', $uuid)->first();
        if (! $image) {
            throw new NotFoundHttpException('Image not found.');
        }

        $disk = Storage::disk('private');
        if (! $disk->exists($image->file_path)) {
            throw new NotFoundHttpException('Image not found.');
        }

        return $disk->response($image->file_path, null, [
            'Content-Type' => $image->mime_type,
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}