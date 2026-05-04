<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Fournisseur extends Model
{
    protected $fillable = ['nom', 'actif'];
    protected $casts = ['actif' => 'boolean'];

    public function typesProduits(): BelongsToMany
    {
        return $this->belongsToMany(TypeProduit::class, 'fournisseur_type_produit');
    }
}
