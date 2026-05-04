<?php
// ─── app/Http/Controllers/InventaireController.php ───────────────────────────
namespace App\Http\Controllers;

use App\Models\Inventaire;
use App\Models\Produit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventaireController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Inventaire::with('produit')->latest('date')->get()->map(fn($i) => $this->format($i))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date'             => 'required|date',
            'produitId'        => 'required|exists:produits,id',
            'quantitePhysique' => 'required|integer|min:0',
            'isValidated'      => 'boolean',
        ]);

        $inv = DB::transaction(function () use ($data) {
            $produit        = Produit::lockForUpdate()->find($data['produitId']);
            $stockTheorique = $produit->stock_cache;
            $ecart          = $data['quantitePhysique'] - $stockTheorique;
            $isValidated    = $data['isValidated'] ?? true;

            $inv = Inventaire::create([
                'date'              => $data['date'],
                'produit_id'        => $data['produitId'],
                'user_id'           => auth()->id(),
                'quantite_physique' => $data['quantitePhysique'],
                'stock_theorique'   => $stockTheorique,
                'ecart'             => $ecart,
                'is_validated'      => $isValidated,
            ]);

            if ($isValidated) {
                $produit->recalculerStock();
            }

            return $inv;
        });

        $inv->load('produit');
        return response()->json($this->format($inv), 201);
    }

    public function update(Request $request, Inventaire $inventaire): JsonResponse
    {
        if ($inventaire->is_validated) {
            return response()->json(['message' => 'Un inventaire valide ne peut pas etre modifie'], 422);
        }

        $data = $request->validate([
            'date'             => 'required|date',
            'produitId'        => 'required|exists:produits,id',
            'quantitePhysique' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($inventaire, $data) {
            $produit        = Produit::lockForUpdate()->find($data['produitId']);
            $stockTheorique = $produit->stock_cache;
            $ecart          = $data['quantitePhysique'] - $stockTheorique;

            $inventaire->update([
                'date'              => $data['date'],
                'produit_id'        => $data['produitId'],
                'quantite_physique' => $data['quantitePhysique'],
                'stock_theorique'   => $stockTheorique,
                'ecart'             => $ecart,
            ]);
        });

        $inventaire->load('produit');
        return response()->json($this->format($inventaire));
    }

    private function format(Inventaire $i): array
    {
        return [
            'id'               => $i->id,
            'date'             => $i->date->toDateString(),
            'produitId'        => $i->produit_id,
            'produitNom'       => $i->produit?->nom,
            'quantitePhysique' => $i->quantite_physique,
            'stockTheorique'   => $i->stock_theorique,
            'ecart'            => $i->ecart,
            'isValidated'      => $i->is_validated,
        ];
    }
}
