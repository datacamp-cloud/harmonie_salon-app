<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prestation extends Model
{
    protected $fillable = ['nom', 'prix', 'actif'];
    protected $casts = ['prix' => 'float', 'actif' => 'boolean'];
}
