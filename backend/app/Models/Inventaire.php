<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventaire extends Model
{
    protected $fillable = ['date', 'produit_id', 'user_id', 'quantite_physique', 'stock_theorique', 'ecart', 'is_validated'];
    protected $casts = ['date' => 'date', 'is_validated' => 'boolean'];

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
