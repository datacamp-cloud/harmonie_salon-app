<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'pseudo'   => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('pseudo', $request->pseudo)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'pseudo' => ['Identifiant ou mot de passe incorrect.'],
            ]);
        }

        $token = $user->createToken('webstock')->plainTextToken;

        return response()->json([
            'user'  => [
                'id'     => $user->id,
                'nom'    => $user->name,
                'pseudo' => $user->pseudo,
                'role'   => $user->role,
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Deconnecte']);
    }
}
