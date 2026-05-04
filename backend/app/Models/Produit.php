<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produit extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'type_id', 'prix', 'actif', 'stock_cache'];
    protected $casts = ['prix' => 'float', 'actif' => 'boolean', 'stock_cache' => 'integer'];

    public function type(): BelongsTo
    {
        return $this->belongsTo(TypeProduit::class, 'type_id');
    }

    public function arrivageLignes(): HasMany
    {
        return $this->hasMany(ArrivageLigne::class);
    }

    public function venteLignes(): HasMany
    {
        return $this->hasMany(VenteLigne::class);
    }

    public function inventaires(): HasMany
    {
        return $this->hasMany(Inventaire::class);
    }

    // Recalcule le stock_cache depuis les données réelles
    public function recalculerStock(): void
    {
        $entrees = $this->arrivageLignes()
            ->whereHas('arrivage', fn($q) => $q->where('is_validated', true))
            ->sum('quantite');

        $sorties = $this->venteLignes()
            ->whereHas('vente', fn($q) => $q->where('is_validated', true))
            ->sum('quantite');

        $ecarts = $this->inventaires()
            ->where('is_validated', true)
            ->sum('ecart');

        $this->stock_cache = $entrees - $sorties + $ecarts;
        $this->save();
    }
}
