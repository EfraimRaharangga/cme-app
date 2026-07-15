<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AtpPhoto extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'atp_id',
        'item_id',
        'file_path',
    ];

    public function record(): BelongsTo
    {
        return $this->belongsTo(AtpRecord::class, 'atp_id');
    }
}
