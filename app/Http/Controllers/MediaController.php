<?php

namespace App\Http\Controllers;

use App\Http\Requests\TempUploadRequest;
use Illuminate\Http\JsonResponse;

class MediaController extends Controller
{
    public function uploadTemp(TempUploadRequest $request): JsonResponse
    {
        $file = $request->file('image');
        $url = $file->temporaryUrl();
        
        // Extract relative path from URL (e.g. 'uploads/temp/xxxx.png')
        $baseUrl = asset('storage/');
        $path = str_replace($baseUrl . '/', '', $url);

        return response()->json([
            'url' => $url,
            'path' => $path,
        ]);
    }
}
