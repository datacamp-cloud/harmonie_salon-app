<?php
// ─── app/Http/Controllers/ArrivageController.php ─────────────────────────────
namespace App\Http\Controllers;

use App\Models\Arrivage;
use App\Models\Produit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ArrivageController extends Controller
{
    use Archivable;

    public function index(): JsonResponse
    {
        return response()->json(
            Arrivage::with(['lignes.produit', 'lignes.fournisseur'])->latest('date')->get()
                ->map(fn($a) => $this->format($a))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date'                  => 'required|date',
            'isValidated'           => 'boolean',
            'items'                 => 'required|array|min:1',
            'items.*.produitId'     => 'required|exists:produits,id',
            'items.*.quantite'      => 'required|integer|min:1',
            'items.*.fournisseurId' => 'required|exists:fournisseurs,id',
        ]);

        $arrivage = DB::transaction(function () use ($data) {
            $a = Arrivage::create([
                'date'         => $data['date'],
                'is_validated' => $data['isValidated'] ?? false,
                'user_id'      => auth()->id(),
            ]);

            foreach ($data['items'] as $item) {
                $a->lignes()->create([
                    'produit_id'     => $item['produitId'],
                    'fournisseur_id' => $item['fournisseurId'],
                    'quantite'       => $item['quantite'],
                ]);

                if ($a->is_validated) {
                    Produit::find($item['produitId'])?->recalculerStock();
                }
            }

            return $a;
        });

        $arrivage->load(['lignes.produit', 'lignes.fournisseur']);
        return response()->json($this->format($arrivage), 201);
    }

    public function update(Request $request, Arrivage $arrivage): JsonResponse
    {
        if ($arrivage->is_validated) {
            return response()->json(['message' => 'Un arrivage valide ne peut pas etre modifie'], 422);
        }

        $data = $request->validate([
            'date'                  => 'required|date',
            'items'                 => 'required|array|min:1',
            'items.*.produitId'     => 'required|exists:produits,id',
            'items.*.quantite'      => 'required|integer|min:1',
            'items.*.fournisseurId' => 'required|exists:fournisseurs,id',
        ]);

        DB::transaction(function () use ($arrivage, $data) {
            $arrivage->update(['date' => $data['date']]);

            // Supprimer les anciennes lignes et recréer
            $arrivage->lignes()->delete();

            foreach ($data['items'] as $item) {
                $arrivage->lignes()->create([
                    'produit_id'     => $item['produitId'],
                    'fournisseur_id' => $item['fournisseurId'],
                    'quantite'       => $item['quantite'],
                ]);
            }
        });

        $arrivage->load(['lignes.produit', 'lignes.fournisseur']);
        return response()->json($this->format($arrivage));
    }

    public function valider(Arrivage $arrivage): JsonResponse
    {
        if ($arrivage->is_validated) {
            return response()->json(['message' => 'Cet arrivage est deja valide'], 422);
        }

        DB::transaction(function () use ($arrivage) {
            $arrivage->update(['is_validated' => true]);

            foreach ($arrivage->lignes as $ligne) {
                $ligne->produit?->recalculerStock();
            }
        });

        $arrivage->load(['lignes.produit', 'lignes.fournisseur']);
        return response()->json($this->format($arrivage));
    }

    public function destroy(Arrivage $arrivage): JsonResponse
    {
        if ($arrivage->is_validated) {
            return response()->json(['message' => 'Un arrivage valide ne peut pas etre supprime'], 422);
        }
        $arrivage->load(['lignes.produit', 'lignes.fournisseur']);
        return $this->archiverEtSupprimer('arrivage', $arrivage);
    }

    private function format(Arrivage $a): array
    {
        $items = $a->lignes->map(fn($l) => [
            'produitId'     => $l->produit_id,
            'produitNom'    => $l->produit?->nom,
            'fournisseurId' => $l->fournisseur_id,
            'fournisseurNom'=> $l->fournisseur?->nom ?? '-',
            'quantite'      => $l->quantite,
        ]);

        return [
            'id'              => $a->id,
            'date'            => $a->date->toDateString(),
            'isValidated'     => $a->is_validated,
            'fournisseurNoms' => $a->lignes->pluck('fournisseur.nom')->filter()->unique()->values(),
            'items'           => $items,
            'totalQuantite'   => $items->sum('quantite'),
        ];
    }
}
