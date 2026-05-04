<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    use Archivable;

    public function index(): JsonResponse
    {
        return response()->json(Client::all()->map(fn($c) => [
            'id'        => $c->id,
            'nom'       => $c->nom,
            'telephone' => $c->telephone,
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'       => 'required|string',
            'telephone' => 'nullable|string',
        ]);
        $c = Client::create($data);
        return response()->json(['id' => $c->id, 'nom' => $c->nom, 'telephone' => $c->telephone], 201);
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate([
            'nom'       => 'required|string',
            'telephone' => 'nullable|string',
        ]);
        $client->update($data);
        return response()->json(['id' => $client->id, 'nom' => $client->nom, 'telephone' => $client->telephone]);
    }

    public function destroy(Client $client): JsonResponse
    {
        return $this->archiverEtSupprimer('client', $client);
    }
}
