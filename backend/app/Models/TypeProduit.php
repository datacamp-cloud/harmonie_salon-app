<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeProduit extends Model
{
    protected $table = 'types_produits';
    protected $fillable = ['nom', 'actif'];
    protected $casts = ['actif' => 'boolean'];

    public function fournisseurs(): BelongsToMany
    {
        return $this->belongsToMany(Fournisseur::class, 'fournisseur_type_produit');
    }

    public function produits(): HasMany
    {
        return $this->hasMany(Produit::class, 'type_id');
    }
}
