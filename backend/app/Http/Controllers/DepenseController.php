<?php
// ─── app/Http/Controllers/DepenseController.php ──────────────────────────────
namespace App\Http\Controllers;

use App\Models\Depense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepenseController extends Controller
{
    use Archivable;

    public function index(): JsonResponse
    {
        return response()->json(
            Depense::with('charge')->latest('date')->get()->map(fn($d) => $this->format($d))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date'        => 'required|date',
            'chargeId'    => 'required|exists:charges,id',
            'montant'     => 'required|numeric|min:0.01',
            'notes'       => 'nullable|string',
            'isValidated' => 'boolean',
        ]);

        $d = Depense::create([
            'date'         => $data['date'],
            'charge_id'    => $data['chargeId'],
            'user_id'      => auth()->id(),
            'montant'      => $data['montant'],
            'notes'        => $data['notes'] ?? '',
            'is_validated' => $data['isValidated'] ?? false,
        ]);

        $d->load('charge');
        return response()->json($this->format($d), 201);
    }

    public function update(Request $request, Depense $depense): JsonResponse
    {
        if ($depense->is_validated) {
            return response()->json(['message' => 'Une depense validee ne peut pas etre modifiee'], 422);
        }

        $data = $request->validate([
            'date'     => 'required|date',
            'chargeId' => 'required|exists:charges,id',
            'montant'  => 'required|numeric|min:0.01',
            'notes'    => 'nullable|string',
        ]);

        $depense->update([
            'date'      => $data['date'],
            'charge_id' => $data['chargeId'],
            'montant'   => $data['montant'],
            'notes'     => $data['notes'] ?? '',
        ]);

        $depense->load('charge');
        return response()->json($this->format($depense));
    }

    public function valider(Depense $depense): JsonResponse
    {
        if ($depense->is_validated) {
            return response()->json(['message' => 'Cette depense est deja validee'], 422);
        }

        $depense->update(['is_validated' => true]);
        $depense->load('charge');
        return response()->json($this->format($depense));
    }

    public function destroy(Depense $depense): JsonResponse
    {
        if ($depense->is_validated) {
            return response()->json(['message' => 'Une depense validee ne peut pas etre supprimee'], 422);
        }
        $depense->load('charge');
        return $this->archiverEtSupprimer('depense', $depense);
    }

    private function format(Depense $d): array
    {
        return [
            'id'          => $d->id,
            'date'        => $d->date->toDateString(),
            'chargeId'    => $d->charge_id,
            'chargeNom'   => $d->charge?->nom ?? '-',
            'montant'     => (float) $d->montant,
            'notes'       => $d->notes,
            'isValidated' => $d->is_validated,
        ];
    }
}
