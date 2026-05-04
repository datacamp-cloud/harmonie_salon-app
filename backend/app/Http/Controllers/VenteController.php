<?php
// ─── app/Http/Controllers/VenteController.php ────────────────────────────────
namespace App\Http\Controllers;

use App\Models\Produit;
use App\Models\Vente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VenteController extends Controller
{
    use Archivable;

    public function index(): JsonResponse
    {
        return response()->json(
            Vente::with(['lignes.produit', 'client'])->latest('date')->get()->map(fn($v) => $this->format($v))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date'                => 'required|date',
            'clientId'            => 'nullable|exists:clients,id',
            'isValidated'         => 'boolean',
            'items'               => 'required|array|min:1',
            'items.*.produitId'   => 'required|exists:produits,id',
            'items.*.quantite'    => 'required|integer|min:1',
            'items.*.prixVente'   => 'nullable|numeric|min:0',
        ]);

        $vente = DB::transaction(function () use ($data) {
            $v = Vente::create([
                'date'         => $data['date'],
                'is_validated' => $data['isValidated'] ?? false,
                'client_id'    => $data['clientId'] ?? null,
                'user_id'      => auth()->id(),
            ]);

            foreach ($data['items'] as $item) {
                $produit = Produit::lockForUpdate()->find($item['produitId']);

                if ($v->is_validated && $produit->stock_cache < $item['quantite']) {
                    throw ValidationException::withMessages([
                        'items' => ["Stock insuffisant pour {$produit->nom}"],
                    ]);
                }

                // Utiliser le prix saisi si fourni, sinon le prix catalogue
                $prixUnitaire = isset($item['prixVente']) && $item['prixVente'] !== null
                    ? $item['prixVente']
                    : $produit->prix;

                $v->lignes()->create([
                    'produit_id'    => $produit->id,
                    'quantite'      => $item['quantite'],
                    'prix_unitaire' => $prixUnitaire,
                ]);

                if ($v->is_validated) {
                    $produit->recalculerStock();
                }
            }

            return $v;
        });

        $vente->load(['lignes.produit', 'client']);
        return response()->json($this->format($vente), 201);
    }

    public function update(Request $request, Vente $vente): JsonResponse
    {
        if ($vente->is_validated) {
            return response()->json(['message' => 'Une vente validee ne peut pas etre modifiee'], 422);
        }

        $data = $request->validate([
            'date'              => 'required|date',
            'clientId'          => 'nullable|exists:clients,id',
            'items'             => 'required|array|min:1',
            'items.*.produitId' => 'required|exists:produits,id',
            'items.*.quantite'  => 'required|integer|min:1',
            'items.*.prixVente' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($vente, $data) {
            $vente->update([
                'date'      => $data['date'],
                'client_id' => $data['clientId'] ?? null,
            ]);

            // Supprimer les anciennes lignes et recréer
            $vente->lignes()->delete();

            foreach ($data['items'] as $item) {
                $produit = Produit::find($item['produitId']);
                $prixUnitaire = isset($item['prixVente']) && $item['prixVente'] !== null
                    ? $item['prixVente']
                    : $produit->prix;

                $vente->lignes()->create([
                    'produit_id'    => $produit->id,
                    'quantite'      => $item['quantite'],
                    'prix_unitaire' => $prixUnitaire,
                ]);
            }
        });

        $vente->load(['lignes.produit', 'client']);
        return response()->json($this->format($vente));
    }

    public function valider(Vente $vente): JsonResponse
    {
        if ($vente->is_validated) {
            return response()->json(['message' => 'Cette vente est deja validee'], 422);
        }

        DB::transaction(function () use ($vente) {
            $vente->load('lignes.produit');

            foreach ($vente->lignes as $ligne) {
                if ($ligne->produit->stock_cache < $ligne->quantite) {
                    throw ValidationException::withMessages([
                        'stock' => ["Stock insuffisant pour {$ligne->produit->nom}"],
                    ]);
                }
            }

            $vente->update(['is_validated' => true]);

            foreach ($vente->lignes as $ligne) {
                $ligne->produit->recalculerStock();
            }
        });

        $vente->load(['lignes.produit', 'client']);
        return response()->json($this->format($vente));
    }

    public function destroy(Vente $vente): JsonResponse
    {
        if ($vente->is_validated) {
            return response()->json(['message' => 'Une vente validee ne peut pas etre supprimee'], 422);
        }
        $vente->load(['lignes.produit', 'client']);
        return $this->archiverEtSupprimer('vente', $vente);
    }

    private function format(Vente $v): array
    {
        $items = $v->lignes->map(fn($l) => [
            'produitId'    => $l->produit_id,
            'produitNom'   => $l->produit?->nom,
            'quantite'     => $l->quantite,
            'prixUnitaire' => (float) $l->prix_unitaire,
            'total'        => $l->quantite * $l->prix_unitaire,
        ]);

        return [
            'id'            => $v->id,
            'date'          => $v->date->toDateString(),
            'isValidated'   => $v->is_validated,
            'clientId'      => $v->client_id,
            'clientNom'     => $v->client?->nom,
            'items'         => $items,
            'totalQuantite' => $items->sum('quantite'),
            'total'         => $items->sum('total'),
        ];
    }
}
