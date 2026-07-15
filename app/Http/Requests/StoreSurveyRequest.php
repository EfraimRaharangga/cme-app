<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSurveyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'nama_site' => 'required|string',
            'tanggal_survey' => 'required|date',
            'nama_surveyor' => 'required|string',
            'lokasi' => 'nullable|string',
            'latitude' => 'nullable|string',
            'longitude' => 'nullable|string',
            'catatan_tambahan' => 'nullable|string',
            'items' => 'required|array',
        ];

        $items = $this->input('items', []);
        foreach ($items as $key => $item) {
            $rules["items.{$key}.status"] = 'required|in:checked,cross';
            if (isset($item['type']) && $item['type'] === 'select') {
                $rules["items.{$key}.kondisi"] = 'required|string';
            } else {
                $rules["items.{$key}.kondisi"] = 'nullable|string';
            }
            $rules["photos.{$key}"] = 'required|array|min:1';
            $rules["photos.{$key}.*.path"] = 'required|string';
        }

        return $rules;
    }

    public function messages(): array
    {
        $messages = [
            'nama_site.required' => 'Nama site wajib diisi.',
            'tanggal_survey.required' => 'Tanggal survey wajib diisi.',
            'nama_surveyor.required' => 'Nama surveyor wajib diisi.',
        ];

        $items = $this->input('items', []);
        foreach ($items as $key => $item) {
            $namaItem = $item['nama'] ?? $key;
            $messages["items.{$key}.status.required"] = "Status untuk item '{$namaItem}' wajib dipilih (OK/NG).";
            $messages["items.{$key}.status.in"] = "Status untuk item '{$namaItem}' harus OK atau NG.";
            $messages["items.{$key}.kondisi.required"] = "Pilihan nilai untuk item '{$namaItem}' wajib dipilih.";
            $messages["photos.{$key}.required"] = "Foto untuk item '{$namaItem}' wajib diunggah.";
            $messages["photos.{$key}.min"] = "Foto untuk item '{$namaItem}' wajib diunggah.";
        }

        return $messages;
    }
}
