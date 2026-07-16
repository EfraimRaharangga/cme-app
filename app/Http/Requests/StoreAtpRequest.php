<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'nama_site' => 'required|string',
            'tanggal' => 'required|date',
            'no_po' => 'required|string',
            'region' => 'nullable|string',
            'latitude' => 'nullable|string',
            'longitude' => 'nullable|string',
            'hasil_json' => 'required|array',
            'hasil_json.items' => 'required|array',
            'verdict' => 'nullable|string',
            'verdict_notes' => 'nullable|string',
            'approval_json' => 'nullable|array',
            'bastp_json' => 'nullable|string',
            'fotos_item' => 'nullable|array',
        ];

        $items = $this->input('hasil_json.items', []);
        foreach ($items as $key => $status) {
            $rules["hasil_json.items.{$key}"] = 'required|in:OK,NG,NA';
            
            if ($status === 'OK' || $status === 'NG') {
                $rules["fotos_item.{$key}"] = 'required|array|min:1';
                $rules["fotos_item.{$key}.*.path"] = 'required|string';
            }
        }

        return $rules;
    }

    public function messages(): array
    {
        $messages = [
            'nama_site.required' => 'Nama site wajib diisi.',
            'tanggal.required' => 'Tanggal pemeriksaan wajib diisi.',
            'no_po.required' => 'Nomor PO / SPK wajib diisi.',
            'hasil_json.required' => 'Data checklist wajib diisi.',
            'hasil_json.items.required' => 'Item checklist wajib diisi.',
        ];

        $items = $this->input('hasil_json.items', []);
        $itemNames = $this->input('hasil_json.itemNames', []);
        foreach ($items as $key => $status) {
            $namaItem = $itemNames[$key] ?? $key;
            $messages["hasil_json.items.{$key}.required"] = "Status untuk '{$namaItem}' wajib dipilih (OK/NG/NA).";
            $messages["hasil_json.items.{$key}.in"] = "Status untuk '{$namaItem}' harus OK, NG, atau NA.";
            $messages["fotos_item.{$key}.required"] = "Foto untuk '{$namaItem}' wajib diunggah.";
            $messages["fotos_item.{$key}.min"] = "Foto untuk '{$namaItem}' wajib diunggah.";
            $messages["fotos_item.{$key}.*.path.required"] = "File foto untuk '{$namaItem}' tidak valid.";
        }

        return $messages;
    }
}
