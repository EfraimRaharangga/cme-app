<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SurveyTemplate extends Model
{
    protected $fillable = [
        'title',
        'kategori_json',
        'created_by',
    ];

    protected $casts = [
        'kategori_json' => 'array',
    ];
}
