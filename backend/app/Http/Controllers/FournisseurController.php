<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FournisseurController extends Controller
{
    use Archivable;

    public function index(): JsonResponse
    {
        return response()->json(Fournisseur::all()->map(fn($f) => [
            'id'    => $f->id,
            'nom'   => $f->nom,
            'actif' => $f->actif,
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['nom' => 'required|string|unique:fournisseurs,nom']);
        $f = Fournisseur::create(['nom' => $data['nom']]);
        return response()->json(['id' => $f->id, 'nom' => $f->nom, 'actif' => true], 201);
    }

    public function update(Request $request, Fournisseur $fournisseur): JsonResponse
    {
        $data = $request->validate(['nom' => 'required|string|unique:fournisseurs,nom,' . $fournisseur->id]);
        $fournisseur->update($data);
        return response()->json(['id' => $fournisseur->id, 'nom' => $fournisseur->nom, 'actif' => $fournisseur->actif]);
    }

    public function toggle(Fournisseur $fournisseur): JsonResponse
    {
        $fournisseur->update(['actif' => ! $fournisseur->actif]);
        return response()->json(['id' => $fournisseur->id, 'actif' => $fournisseur->actif]);
    }

    public function destroy(Fournisseur $fournisseur): JsonResponse
    {
        return $this->archiverEtSupprimer('fournisseur', $fournisseur);
    }
}
