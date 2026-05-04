<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vente extends Model
{
    protected $fillable = ['date', 'is_validated', 'client_id', 'user_id'];
    protected $casts = ['date' => 'date', 'is_validated' => 'boolean'];

    public function lignes(): HasMany
    {
        return $this->hasMany(VenteLigne::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
