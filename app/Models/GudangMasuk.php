<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GudangMasuk extends Model
{
    public $timestamps = false;

    protected $table = 'gudang_masuk';

    protected $fillable = [
        'no_form',
        'judul',
        'kategori',
        'tanggal',
        'supplier',
        'penerima',
        'lokasi',
        'keterangan',
        'foto',
        'diserahkan',
        'diterima',
        'created_by',
    ];

    public function details(): HasMany
    {
        return $this->hasMany(GudangMasukDetail::class, 'masuk_id');
    }
}
