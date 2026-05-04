<?php
// ─── app/Http/Controllers/StatsController.php ────────────────────────────────
namespace App\Http\Controllers;

use App\Models\Depense;
use App\Models\Historique;
use App\Models\Produit;
use App\Models\Recette;
use App\Models\Vente;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $today = Carbon::today()->toDateString();

        // ── Stats du jour ─────────────────────────────────────────────────────
        $ventesDuJour = Vente::with('lignes')
            ->where('date', $today)
            ->where('is_validated', true)
            ->get();

        $ventesJour = $ventesDuJour->sum(
            fn($v) => $v->lignes->sum(fn($l) => $l->quantite * $l->prix_unitaire)
        );

        $recettesDuJour = Recette::where('date', $today)
            ->where('is_validated', true)
            ->get();

        $recettesJour = $recettesDuJour->sum('prix_applique');

        $depensesJour = Depense::where('date', $today)
            ->where('is_validated', true)   // uniquement validées
            ->sum('montant');

        // ── État de caisse — cumul total depuis le début (validés uniquement) ─
        $totalVentesAll = Vente::with('lignes')
            ->where('is_validated', true)
            ->get()
            ->sum(fn($v) => $v->lignes->sum(fn($l) => $l->quantite * $l->prix_unitaire));

        $totalRecettesAll = Recette::where('is_validated', true)->sum('prix_applique');

        $totalDepensesAll = Depense::where('is_validated', true)->sum('montant');

        $etatCaisse = $totalVentesAll + $totalRecettesAll - $totalDepensesAll;

        // ── Produits ──────────────────────────────────────────────────────────
        $produitsStockFaible = Produit::with('type')
            ->where('actif', true)
            ->where('stock_cache', '<=', 5)
            ->get()
            ->map(fn($p) => [
                'id'      => $p->id,
                'nom'     => $p->nom,
                'typeNom' => $p->type?->nom,
                'stock'   => $p->stock_cache,
            ]);

        return response()->json([
            'ventesJour'          => (float) $ventesJour,
            'nombreVentesJour'    => $ventesDuJour->count(),
            'recettesJour'        => (float) $recettesJour,
            'nombreRecettesJour'  => $recettesDuJour->count(),
            'depensesJour'        => (float) $depensesJour,
            'etatCaisse'          => (float) $etatCaisse,
            'produitsStockFaible' => $produitsStockFaible,
            'totalProduitsActifs' => Produit::where('actif', true)->count(),
            'totalProduits'       => Produit::count(),
        ]);
    }

    public function historique(): JsonResponse
    {
        return response()->json(
            Historique::orderByDesc('date')->get()->map(fn($h) => [
                'id'          => $h->id,
                'titre'       => $h->titre,
                'description' => $h->description,
                'date'        => $h->date->toISOString(),
            ])
        );
    }
}
