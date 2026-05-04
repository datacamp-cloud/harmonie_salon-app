<?php

namespace App\Http\Controllers;

use App\Models\Prestation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrestationController extends Controller
{
    use Archivable;

    public function index(): JsonResponse
    {
        return response()->json(Prestation::all()->map(fn($p) => [
            'id'    => $p->id,
            'nom'   => $p->nom,
            'prix'  => (float) $p->prix,
            'actif' => $p->actif,
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'  => 'required|string|unique:prestations,nom',
            'prix' => 'required|numeric|min:0',
        ]);
        $p = Prestation::create($data);
        return response()->json(['id' => $p->id, 'nom' => $p->nom, 'prix' => (float) $p->prix, 'actif' => true], 201);
    }

    public function update(Request $request, Prestation $prestation): JsonResponse
    {
        $data = $request->validate([
            'nom'  => 'required|string|unique:prestations,nom,' . $prestation->id,
            'prix' => 'required|numeric|min:0',
        ]);
        $prestation->update($data);
        return response()->json(['id' => $prestation->id, 'nom' => $prestation->nom, 'prix' => (float) $prestation->prix, 'actif' => $prestation->actif]);
    }

    public function toggle(Prestation $prestation): JsonResponse
    {
        $prestation->update(['actif' => ! $prestation->actif]);
        return response()->json(['id' => $prestation->id, 'actif' => $prestation->actif]);
    }

    public function destroy(Prestation $prestation): JsonResponse
    {
        return $this->archiverEtSupprimer('prestation', $prestation);
    }
}
