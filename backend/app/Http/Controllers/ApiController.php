<?php

namespace App\Http\Controllers;

use App\Models\Arrivage;
use App\Models\Historique;
use App\Models\Produit;
use App\Models\Vente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ApiController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        return response()->json([
            'user' => [
                'id' => 1,
                'email' => $credentials['email'],
                'nom' => 'Admin Salon',
            ],
            'token' => 'mock-jwt-token-123',
        ]);
    }

    public function getProduits(): JsonResponse
    {
        return response()->json(
            Produit::query()->orderBy('id')->get()->map(fn (Produit $produit) => [
                'id' => $produit->id,
                'nom' => $produit->nom,
                'stock' => $produit->stock,
                'prix' => (float) $produit->prix,
            ])
        );
    }

    public function addProduit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'stock' => ['required', 'integer', 'min:0'],
            'prix' => ['required', 'numeric', 'min:0'],
        ]);

        $produit = Produit::create($validated);
        $this->ajouterHistorique(
            "Nouveau produit: {$produit->nom}",
            "Ajout du produit {$produit->nom} avec un stock initial de {$produit->stock}"
        );

        return response()->json([
            'id' => $produit->id,
            'nom' => $produit->nom,
            'stock' => $produit->stock,
            'prix' => (float) $produit->prix,
        ], 201);
    }

    public function getVentes(): JsonResponse
    {
        $ventes = Vente::query()->with('produit')->orderBy('id')->get();

        return response()->json($ventes->map(fn (Vente $vente) => [
            'id' => $vente->id,
            'produitId' => $vente->produit_id,
            'produitNom' => $vente->produit?->nom,
            'quantite' => $vente->quantite,
            'prixUnitaire' => (float) $vente->prix_unitaire,
            'total' => (float) $vente->total,
            'date' => $vente->date->toISOString(),
        ]));
    }

    public function addVente(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'produitId' => ['required', 'integer', 'exists:produits,id'],
            'quantite' => ['required', 'integer', 'min:1'],
        ]);

        $result = DB::transaction(function () use ($validated) {
            $produit = Produit::query()->lockForUpdate()->findOrFail($validated['produitId']);

            if ($produit->stock < $validated['quantite']) {
                throw ValidationException::withMessages([
                    'quantite' => ['Stock insuffisant'],
                ]);
            }

            $produit->stock -= $validated['quantite'];
            $produit->save();

            $vente = Vente::create([
                'produit_id' => $produit->id,
                'quantite' => $validated['quantite'],
                'prix_unitaire' => $produit->prix,
                'total' => $produit->prix * $validated['quantite'],
                'date' => now(),
            ]);

            $this->ajouterHistorique(
                "Vente de {$produit->nom}",
                "Vente de {$vente->quantite} {$produit->nom} pour ".number_format((float) $vente->total, 0, '', ' ')." FCFA",
                $vente->date
            );

            return [$vente, $produit];
        });

        /** @var Vente $vente */
        [$vente, $produit] = $result;

        return response()->json([
            'id' => $vente->id,
            'produitId' => $vente->produit_id,
            'produitNom' => $produit->nom,
            'quantite' => $vente->quantite,
            'prixUnitaire' => (float) $vente->prix_unitaire,
            'total' => (float) $vente->total,
            'date' => $vente->date->toISOString(),
        ], 201);
    }

    public function getArrivages(): JsonResponse
    {
        $arrivages = Arrivage::query()->with('produit')->orderBy('id')->get();

        return response()->json($arrivages->map(fn (Arrivage $arrivage) => [
            'id' => $arrivage->id,
            'produitId' => $arrivage->produit_id,
            'produitNom' => $arrivage->produit?->nom,
            'quantite' => $arrivage->quantite,
            'date' => $arrivage->date->toISOString(),
        ]));
    }

    public function addArrivage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'produitId' => ['required', 'integer', 'exists:produits,id'],
            'quantite' => ['required', 'integer', 'min:1'],
        ]);

        $result = DB::transaction(function () use ($validated) {
            $produit = Produit::query()->lockForUpdate()->findOrFail($validated['produitId']);
            $produit->stock += $validated['quantite'];
            $produit->save();

            $arrivage = Arrivage::create([
                'produit_id' => $produit->id,
                'quantite' => $validated['quantite'],
                'date' => now(),
            ]);

            $this->ajouterHistorique(
                "Arrivage de {$produit->nom}",
                "Ajout en stock de {$arrivage->quantite} unite(s) pour {$produit->nom}",
                $arrivage->date
            );

            return [$arrivage, $produit];
        });

        /** @var Arrivage $arrivage */
        [$arrivage, $produit] = $result;

        return response()->json([
            'id' => $arrivage->id,
            'produitId' => $arrivage->produit_id,
            'produitNom' => $produit->nom,
            'quantite' => $arrivage->quantite,
            'date' => $arrivage->date->toISOString(),
        ], 201);
    }

    public function getStats(): JsonResponse
    {
        $today = Carbon::today();
        $ventesJour = Vente::query()->whereDate('date', $today)->get();

        return response()->json([
            'ventesJour' => (float) $ventesJour->sum('total'),
            'nombreVentesJour' => $ventesJour->count(),
            'produitsStockFaible' => Produit::query()
                ->where('stock', '<=', 5)
                ->orderBy('stock')
                ->get()
                ->map(fn (Produit $produit) => [
                    'id' => $produit->id,
                    'nom' => $produit->nom,
                    'stock' => $produit->stock,
                    'prix' => (float) $produit->prix,
                ]),
            'totalProduits' => Produit::query()->count(),
            'totalVentes' => Vente::query()->count(),
        ]);
    }

    public function getHistorique(): JsonResponse
    {
        return response()->json(
            Historique::query()
                ->orderBy('date')
                ->get()
                ->map(fn (Historique $event) => [
                    'id' => $event->id,
                    'titre' => $event->titre,
                    'description' => $event->description,
                    'date' => $event->date->toISOString(),
                ])
        );
    }

    private function ajouterHistorique(string $titre, string $description, ?Carbon $date = null): void
    {
        Historique::create([
            'titre' => $titre,
            'description' => $description,
            'date' => $date ?? now(),
        ]);
    }
}
