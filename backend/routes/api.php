<?php

use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [ApiController::class, 'login']);

Route::get('/produits', [ApiController::class, 'getProduits']);
Route::post('/produits', [ApiController::class, 'addProduit']);

Route::get('/ventes', [ApiController::class, 'getVentes']);
Route::post('/ventes', [ApiController::class, 'addVente']);

Route::get('/arrivages', [ApiController::class, 'getArrivages']);
Route::post('/arrivages', [ApiController::class, 'addArrivage']);

Route::get('/stats', [ApiController::class, 'getStats']);
Route::get('/historique', [ApiController::class, 'getHistorique']);
