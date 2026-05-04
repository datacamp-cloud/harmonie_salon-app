<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VenteLigne extends Model
{
    protected $table = 'vente_lignes';
    protected $fillable = ['vente_id', 'produit_id', 'quantite', 'prix_unitaire'];
    protected $casts = ['prix_unitaire' => 'float'];

    public function vente(): BelongsTo
    {
        return $this->belongsTo(Vente::class);
    }

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }
}
