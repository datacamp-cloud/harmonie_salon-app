<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\ArrivageController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChargeController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DepenseController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\InventaireController;
use App\Http\Controllers\PrestationController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\RecetteController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\TypeProduitController;
use App\Http\Controllers\VenteController;
use Illuminate\Support\Facades\Route;

// ── Auth (public) ─────────────────────────────────────────────────────────────
Route::post('/login',  [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// ── Routes protégées ──────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Produits
    Route::get   ('/produits',                  [ProduitController::class, 'index']);
    Route::post  ('/produits',                  [ProduitController::class, 'store']);
    Route::patch ('/produits/{produit}/toggle', [ProduitController::class, 'toggle']);

    // Arrivages
    Route::get    ('/arrivages',                   [ArrivageController::class, 'index']);
    Route::post   ('/arrivages',                   [ArrivageController::class, 'store']);
    Route::put    ('/arrivages/{arrivage}',         [ArrivageController::class, 'update']);
    Route::post   ('/arrivages/{arrivage}/valider', [ArrivageController::class, 'valider']);
    Route::delete ('/arrivages/{arrivage}',         [ArrivageController::class, 'destroy']);

    // Ventes
    Route::get    ('/ventes',                [VenteController::class, 'index']);
    Route::post   ('/ventes',                [VenteController::class, 'store']);
    Route::put    ('/ventes/{vente}',         [VenteController::class, 'update']);
    Route::post   ('/ventes/{vente}/valider', [VenteController::class, 'valider']);
    Route::delete ('/ventes/{vente}',         [VenteController::class, 'destroy']);

    // Recettes
    Route::get    ('/recettes',                  [RecetteController::class, 'index']);
    Route::post   ('/recettes',                  [RecetteController::class, 'store']);
    Route::put    ('/recettes/{recette}',         [RecetteController::class, 'update']);
    Route::post   ('/recettes/{recette}/valider', [RecetteController::class, 'valider']);
    Route::delete ('/recettes/{recette}',         [RecetteController::class, 'destroy']);

    // Dépenses
    Route::get    ('/depenses',                  [DepenseController::class, 'index']);
    Route::post   ('/depenses',                  [DepenseController::class, 'store']);
    Route::put    ('/depenses/{depense}',         [DepenseController::class, 'update']);
    Route::post   ('/depenses/{depense}/valider', [DepenseController::class, 'valider']);
    Route::delete ('/depenses/{depense}',         [DepenseController::class, 'destroy']);

    // Inventaires
    Route::get  ('/inventaires',             [InventaireController::class, 'index']);
    Route::post ('/inventaires',             [InventaireController::class, 'store']);
    Route::put  ('/inventaires/{inventaire}',[InventaireController::class, 'update']);

    // Référentiels — Fournisseurs
    Route::get    ('/fournisseurs',                      [FournisseurController::class, 'index']);
    Route::post   ('/fournisseurs',                      [FournisseurController::class, 'store']);
    Route::put    ('/fournisseurs/{fournisseur}',         [FournisseurController::class, 'update']);
    Route::patch  ('/fournisseurs/{fournisseur}/toggle',  [FournisseurController::class, 'toggle']);
    Route::delete ('/fournisseurs/{fournisseur}',         [FournisseurController::class, 'destroy']);

    // Référentiels — Types de produits
    Route::get    ('/types-produits',                        [TypeProduitController::class, 'index']);
    Route::post   ('/types-produits',                        [TypeProduitController::class, 'store']);
    Route::put    ('/types-produits/{type}',                 [TypeProduitController::class, 'update']);
    Route::patch  ('/types-produits/{type}/toggle',          [TypeProduitController::class, 'toggle']);
    Route::put    ('/types-produits/{type}/fournisseurs',    [TypeProduitController::class, 'updateFournisseurs']);
    Route::delete ('/types-produits/{type}',                 [TypeProduitController::class, 'destroy']);

    // Référentiels — Prestations
    Route::get    ('/prestations',                     [PrestationController::class, 'index']);
    Route::post   ('/prestations',                     [PrestationController::class, 'store']);
    Route::put    ('/prestations/{prestation}',         [PrestationController::class, 'update']);
    Route::patch  ('/prestations/{prestation}/toggle',  [PrestationController::class, 'toggle']);
    Route::delete ('/prestations/{prestation}',         [PrestationController::class, 'destroy']);

    // Référentiels — Charges
    Route::get    ('/charges',                 [ChargeController::class, 'index']);
    Route::post   ('/charges',                 [ChargeController::class, 'store']);
    Route::put    ('/charges/{charge}',         [ChargeController::class, 'update']);
    Route::patch  ('/charges/{charge}/toggle',  [ChargeController::class, 'toggle']);
    Route::delete ('/charges/{charge}',         [ChargeController::class, 'destroy']);

    // Référentiels — Clients
    Route::get    ('/clients',          [ClientController::class, 'index']);
    Route::post   ('/clients',          [ClientController::class, 'store']);
    Route::put    ('/clients/{client}',  [ClientController::class, 'update']);
    Route::delete ('/clients/{client}',  [ClientController::class, 'destroy']);

    // Stats & Historique
    Route::get('/stats',      [StatsController::class, 'index']);
    Route::get('/historique', [StatsController::class, 'historique']);

    // Gestion des utilisateurs (admin uniquement)
    Route::middleware('can:admin')->group(function () {
        Route::get    ('/users',                        [UserController::class, 'index']);
        Route::post   ('/users',                        [UserController::class, 'store']);
        Route::put    ('/users/{user}',                 [UserController::class, 'update']);
        Route::patch  ('/users/{user}/password',        [UserController::class, 'updatePassword']);
        Route::delete ('/users/{user}',                 [UserController::class, 'destroy']);
    });
