<?php

namespace App\Http\Controllers;

use App\Models\InstructionImage;
use App\Models\InstructionTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InstructionController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Instruction/Index');
    }

    public function showItem(Request $request, $kategori): Response
    {
        // Decode key from URL
        $kat = urldecode($kategori);

        $spec = InstructionTable::where('kategori', $kat)->where('tipe', 'spesifikasi')->first();
        $sow = InstructionTable::where('kategori', $kat)->where('tipe', 'sow')->first();
        $images = InstructionImage::where('kategori', $kat)->get();

        return Inertia::render('Instruction/Item', [
            'kategori' => $kat,
            'spec' => $spec ? $spec->data_json : null,
            'sow' => $sow ? $sow->data_json : null,
            'images' => $images,
        ]);
    }
}
