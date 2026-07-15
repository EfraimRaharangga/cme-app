<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstructionImage extends Model
{
    public $timestamps = false;

    protected $table = 'instruction_images';

    protected $fillable = [
        'kategori',
        'file_path',
        'created_by',
    ];
}
