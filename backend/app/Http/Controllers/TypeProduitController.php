<?php

namespace App\Http\Controllers;

use App\Models\TypeProduit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TypeProduitController extends Controller
{
    use Archivable;

    public function index(): JsonResponse
    {
        return response()->json(TypeProduit::with('fournisseurs')->get()->map(fn($t) => [
            'id'             => $t->id,
            'nom'            => $t->nom,
            'actif'          => $t->actif,
            'fournisseurIds' => $t->fournisseurs->pluck('id'),
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['nom' => 'required|string|unique:types_produits,nom']);
        $t = TypeProduit::create(['nom' => $data['nom']]);
        return response()->json(['id' => $t->id, 'nom' => $t->nom, 'actif' => true, 'fournisseurIds' => []], 201);
    }

    public function update(Request $request, TypeProduit $type): JsonResponse
    {
        $data = $request->validate(['nom' => 'required|string|unique:types_produits,nom,' . $type->id]);
        $type->update($data);
        return response()->json(['id' => $type->id, 'nom' => $type->nom, 'actif' => $type->actif]);
    }

    public function toggle(TypeProduit $type): JsonResponse
    {
        $type->update(['actif' => ! $type->actif]);
        return response()->json(['id' => $type->id, 'actif' => $type->actif]);
    }

    public function updateFournisseurs(Request $request, TypeProduit $type): JsonResponse
    {
        $data = $request->validate([
            'fournisseurIds'   => 'required|array',
            'fournisseurIds.*' => 'exists:fournisseurs,id',
        ]);
        $type->fournisseurs()->sync($data['fournisseurIds']);
        return response()->json(['id' => $type->id, 'fournisseurIds' => $data['fournisseurIds']]);
    }

    public function destroy(TypeProduit $type): JsonResponse
    {
        return $this->archiverEtSupprimer('type_produit', $type);
    }
}
