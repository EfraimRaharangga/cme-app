<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AtpTemplate extends Model
{
    protected $fillable = [
        'title',
        'data_json',
        'created_by',
    ];

    protected $casts = [
        'data_json' => 'array',
    ];
}
