<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSurveyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_site' => 'required|string',
            'tanggal_survey' => 'required|date',
            'nama_surveyor' => 'required|string',
            'lokasi' => 'nullable|string',
            'latitude' => 'nullable|string',
            'longitude' => 'nullable|string',
            'catatan_tambahan' => 'nullable|string',
            'items' => 'required|array',
            'photos' => 'nullable|array',
        ];
    }
}
