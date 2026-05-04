<?php
// ─── app/Http/Controllers/RecetteController.php ──────────────────────────────
namespace App\Http\Controllers;

use App\Models\Recette;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecetteController extends Controller
{
    use Archivable;

    public function index(): JsonResponse
    {
        return response()->json(
            Recette::with(['prestation', 'client'])->latest('date')->get()->map(fn($r) => $this->format($r))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date'          => 'required|date',
            'prestationId'  => 'required|exists:prestations,id',
            'clientId'      => 'nullable|exists:clients,id',
            'prixApplique'  => 'required|numeric|min:0',
            'notes'         => 'nullable|string',
            'isValidated'   => 'boolean',
        ]);

        $r = Recette::create([
            'date'           => $data['date'],
            'prestation_id'  => $data['prestationId'],
            'client_id'      => $data['clientId'] ?? null,
            'user_id'        => auth()->id(),
            'prix_applique'  => $data['prixApplique'],
            'notes'          => $data['notes'] ?? '',
            'is_validated'   => $data['isValidated'] ?? false,
        ]);

        $r->load(['prestation', 'client']);
        return response()->json($this->format($r), 201);
    }

    public function update(Request $request, Recette $recette): JsonResponse
    {
        if ($recette->is_validated) {
            return response()->json(['message' => 'Une recette validee ne peut pas etre modifiee'], 422);
        }

        $data = $request->validate([
            'date'         => 'required|date',
            'prestationId' => 'required|exists:prestations,id',
            'clientId'     => 'nullable|exists:clients,id',
            'prixApplique' => 'required|numeric|min:0',
            'notes'        => 'nullable|string',
        ]);

        $recette->update([
            'date'          => $data['date'],
            'prestation_id' => $data['prestationId'],
            'client_id'     => $data['clientId'] ?? null,
            'prix_applique' => $data['prixApplique'],
            'notes'         => $data['notes'] ?? '',
        ]);

        $recette->load(['prestation', 'client']);
        return response()->json($this->format($recette));
    }

    public function valider(Recette $recette): JsonResponse
    {
        if ($recette->is_validated) {
            return response()->json(['message' => 'Cette recette est deja validee'], 422);
        }

        $recette->update(['is_validated' => true]);
        $recette->load(['prestation', 'client']);
        return response()->json($this->format($recette));
    }

    public function destroy(Recette $recette): JsonResponse
    {
        if ($recette->is_validated) {
            return response()->json(['message' => 'Une recette validee ne peut pas etre supprimee'], 422);
        }
        $recette->load(['prestation', 'client']);
        return $this->archiverEtSupprimer('recette', $recette);
    }

    private function format(Recette $r): array
    {
        return [
            'id'            => $r->id,
            'date'          => $r->date->toDateString(),
            'prestationId'  => $r->prestation_id,
            'prestationNom' => $r->prestation?->nom,
            'prixReference' => (float) $r->prestation?->prix,
            'clientId'      => $r->client_id,
            'clientNom'     => $r->client?->nom,
            'prixApplique'  => (float) $r->prix_applique,
            'notes'         => $r->notes,
            'isValidated'   => $r->is_validated,
        ];
    }
}
