<?php

namespace Database\Seeders;

use App\Models\Arrivage;
use App\Models\Historique;
use App\Models\Produit;
use App\Models\Vente;
use Illuminate\Database\Seeder;

class BusinessDataSeeder extends Seeder
{
    public function run(): void
    {
        if (Produit::query()->exists()) {
            return;
        }

        $produits = [
            ['nom' => 'Shampooing Hydratant', 'stock' => 25, 'prix' => 18500],
            ['nom' => 'Masque Réparateur', 'stock' => 15, 'prix' => 24000],
            ['nom' => 'Huile de Soin', 'stock' => 3, 'prix' => 32000],
            ['nom' => 'Coloration Châtain', 'stock' => 8, 'prix' => 28500],
            ['nom' => 'Spray Fixant', 'stock' => 2, 'prix' => 15000],
            ['nom' => 'Crème Coiffante', 'stock' => 12, 'prix' => 19000],
            ['nom' => 'Sérum Brillance', 'stock' => 6, 'prix' => 35000],
            ['nom' => 'Gel Coiffant Fort', 'stock' => 20, 'prix' => 12500],
        ];

        foreach ($produits as $produit) {
            Produit::create($produit);
        }

        $arrivages = [
            ['produit_id' => 1, 'quantite' => 50, 'date' => '2024-01-10T09:00:00'],
            ['produit_id' => 4, 'quantite' => 20, 'date' => '2024-01-12T10:30:00'],
            ['produit_id' => 7, 'quantite' => 15, 'date' => '2024-01-14T14:00:00'],
        ];

        foreach ($arrivages as $arrivage) {
            Arrivage::create($arrivage);
        }

        $ventes = [
            ['produit_id' => 1, 'quantite' => 2, 'prix_unitaire' => 18500, 'total' => 37000, 'date' => '2024-01-15T10:30:00'],
            ['produit_id' => 3, 'quantite' => 1, 'prix_unitaire' => 32000, 'total' => 32000, 'date' => '2024-01-15T11:45:00'],
            ['produit_id' => 6, 'quantite' => 1, 'prix_unitaire' => 19000, 'total' => 19000, 'date' => '2024-01-15T14:20:00'],
            ['produit_id' => 2, 'quantite' => 3, 'prix_unitaire' => 24000, 'total' => 72000, 'date' => '2024-01-15T15:00:00'],
            ['produit_id' => 8, 'quantite' => 2, 'prix_unitaire' => 12500, 'total' => 25000, 'date' => '2024-01-15T16:30:00'],
        ];

        foreach ($ventes as $vente) {
            Vente::create($vente);
        }

        $historiques = [
            ['titre' => 'Vente de Shampooing Hydratant', 'description' => 'Vente de 2 Shampooing Hydratant', 'date' => '2024-01-15T10:30:00'],
            ['titre' => 'Vente de Huile de Soin', 'description' => 'Vente de 1 Huile de Soin', 'date' => '2024-01-15T11:45:00'],
            ['titre' => 'Vente de Crème Coiffante', 'description' => 'Vente de 1 Crème Coiffante', 'date' => '2024-01-15T14:20:00'],
            ['titre' => 'Vente de Masque Réparateur', 'description' => 'Vente de 3 Masque Réparateur', 'date' => '2024-01-15T15:00:00'],
            ['titre' => 'Vente de Gel Coiffant Fort', 'description' => 'Vente de 2 Gel Coiffant Fort', 'date' => '2024-01-15T16:30:00'],
        ];

        foreach ($historiques as $historique) {
            Historique::create($historique);
        }
    }
}
