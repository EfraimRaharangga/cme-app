<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GudangKeluar extends Model
{
    public $timestamps = false;

    protected $table = 'gudang_keluar';

    protected $fillable = [
        'no_form',
        'judul',
        'kategori',
        'tanggal',
        'pengambil',
        'jabatan',
        'lokasi_tujuan',
        'keperluan',
        'proyek',
        'tujuan',
        'keterangan',
        'foto',
        'disetujui',
        'pengambil_ttd',
        'created_by',
    ];

    public function details(): HasMany
    {
        return $this->hasMany(GudangKeluarDetail::class, 'keluar_id');
    }
}
