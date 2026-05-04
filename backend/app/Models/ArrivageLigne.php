<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArrivageLigne extends Model
{
    protected $table = 'arrivage_lignes';
    protected $fillable = ['arrivage_id', 'produit_id', 'fournisseur_id', 'quantite'];

    public function arrivage(): BelongsTo
    {
        return $this->belongsTo(Arrivage::class);
    }

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(Fournisseur::class);
    }
}
