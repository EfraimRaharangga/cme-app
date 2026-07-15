<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AtpRecord extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'nama_site',
        'tanggal',
        'region',
        'latitude',
        'longitude',
        'no_po',
        'hasil_json',
        'verdict',
        'verdict_notes',
        'approval_json',
        'bastp_json',
        'created_by',
    ];

    protected $casts = [
        'hasil_json' => 'array',
        'approval_json' => 'array',
        'bastp_json' => 'array',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(AtpPhoto::class, 'atp_id');
    }

    public function bal(): HasOne
    {
        return $this->hasOne(BalData::class, 'atp_id');
    }

    public function bastp(): HasOne
    {
        return $this->hasOne(BastpData::class, 'atp_id');
    }
}
