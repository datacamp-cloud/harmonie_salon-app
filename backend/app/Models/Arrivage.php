<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Arrivage extends Model
{
    protected $fillable = ['date', 'is_validated', 'user_id'];
    protected $casts = ['date' => 'date', 'is_validated' => 'boolean'];

    public function lignes(): HasMany
    {
        return $this->hasMany(ArrivageLigne::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
