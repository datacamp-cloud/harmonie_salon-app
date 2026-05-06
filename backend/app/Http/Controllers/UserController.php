<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // Liste tous les utilisateurs (sauf le compte connecté)
    public function index(Request $request): JsonResponse
    {
        $users = User::orderBy('name')->get()->map(fn($u) => $this->format($u));
        return response()->json($users);
    }

    // Créer un utilisateur
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'pseudo'   => 'required|string|max:255|unique:users,pseudo',
            'role'     => ['required', Rule::in(['admin', 'caissier', 'viewer'])],
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['pseudo'] . '@harmoniesalon.local',
            'pseudo'   => $data['pseudo'],
            'role'     => $data['role'],
            'password' => Hash::make($data['password']),
        ]);

        return response()->json($this->format($user), 201);
    }

    // Modifier nom et rôle
    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name'   => 'required|string|max:255',
            'pseudo' => ['required', 'string', Rule::unique('users', 'pseudo')->ignore($user->id)],
            'role'   => ['required', Rule::in(['admin', 'caissier', 'viewer'])],
        ]);

        $user->update([
            'name'   => $data['name'],
            'pseudo' => $data['pseudo'],
            'role'   => $data['role'],
        ]);

        return response()->json($this->format($user));
    }

    // Changer le mot de passe
    public function updatePassword(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $user->update(['password' => Hash::make($data['password'])]);

        return response()->json(['message' => 'Mot de passe mis a jour']);
    }

    // Supprimer un utilisateur (impossible de se supprimer soi-même)
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte'], 422);
        }

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprime']);
    }

    private function format(User $u): array
    {
        return [
            'id'     => $u->id,
            'name'   => $u->name,
            'pseudo' => $u->pseudo,
            'role'   => $u->role,
        ];
    }
}
