<?php

namespace App\Http\Controllers;

use App\Models\Charge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChargeController extends Controller
{
    use Archivable;

    public function index(): JsonResponse
    {
        return response()->json(Charge::all()->map(fn($c) => [
            'id'    => $c->id,
            'nom'   => $c->nom,
            'actif' => $c->actif,
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['nom' => 'required|string|unique:charges,nom']);
        $c = Charge::create($data);
        return response()->json(['id' => $c->id, 'nom' => $c->nom, 'actif' => true], 201);
    }

    public function update(Request $request, Charge $charge): JsonResponse
    {
        $data = $request->validate(['nom' => 'required|string|unique:charges,nom,' . $charge->id]);
        $charge->update($data);
        return response()->json(['id' => $charge->id, 'nom' => $charge->nom, 'actif' => $charge->actif]);
    }

    public function toggle(Charge $charge): JsonResponse
    {
        $charge->update(['actif' => ! $charge->actif]);
        return response()->json(['id' => $charge->id, 'actif' => $charge->actif]);
    }

    public function destroy(Charge $charge): JsonResponse
    {
        return $this->archiverEtSupprimer('charge', $charge);
    }
}
