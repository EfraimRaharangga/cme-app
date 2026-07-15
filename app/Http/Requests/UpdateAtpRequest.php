<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_site' => 'required|string',
            'tanggal' => 'required|date',
            'no_po' => 'required|string',
            'region' => 'nullable|string',
            'latitude' => 'nullable|string',
            'longitude' => 'nullable|string',
            'hasil_json' => 'nullable|array',
            'verdict' => 'nullable|string',
            'verdict_notes' => 'nullable|string',
            'approval_json' => 'nullable|array',
            'fotos_item' => 'nullable|array',
        ];
    }
}
