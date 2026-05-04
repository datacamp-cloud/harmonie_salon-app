<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Models\TypeProduit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProduitController extends Controller
{
    public function index(): JsonResponse
    {
        $produits = Produit::with('type')->get()->map(fn($p) => [
            'id'      => $p->id,
            'nom'     => $p->nom,
            'typeId'  => $p->type_id,
            'typeNom' => $p->type?->nom ?? 'Sans type',
            'prix'    => (float) $p->prix,
            'actif'   => $p->actif,
            'stock'   => $p->stock_cache,
        ]);

        return response()->json($produits);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'    => 'required|string|max:255',
            'typeId' => 'required|exists:types_produits,id',
            'prix'   => 'required|numeric|min:0',
            'actif'  => 'boolean',
        ]);

        $produit = Produit::create([
            'nom'     => $data['nom'],
            'type_id' => $data['typeId'],
            'prix'    => $data['prix'],
            'actif'   => $data['actif'] ?? true,
        ]);

        $produit->load('type');

        return response()->json([
            'id'      => $produit->id,
            'nom'     => $produit->nom,
            'typeId'  => $produit->type_id,
            'typeNom' => $produit->type?->nom ?? 'Sans type',
            'prix'    => (float) $produit->prix,
            'actif'   => $produit->actif,
            'stock'   => 0,
        ], 201);
    }

    public function toggle(Produit $produit): JsonResponse
    {
        $produit->update(['actif' => ! $produit->actif]);

        return response()->json([
            'id'    => $produit->id,
            'actif' => $produit->actif,
        ]);
    }
}
