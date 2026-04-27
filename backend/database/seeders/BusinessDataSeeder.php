<?php

namespace Database\Seeders;

use App\Models\Charge;
use App\Models\Client;
use App\Models\Fournisseur;
use App\Models\Prestation;
use App\Models\Produit;
use App\Models\TypeProduit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BusinessDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── Utilisateurs ─────────────────────────────────────────────────────
        User::firstOrCreate(['pseudo' => 'admin'], [
            'name'     => 'Admin Salon',
            'email'    => 'admin@harmoniesalon.com',
            'password' => Hash::make('password'),
            'pseudo'   => 'admin',
            'role'     => 'admin',
        ]);

        User::firstOrCreate(['pseudo' => 'caissier'], [
            'name'     => 'Caissier',
            'email'    => 'caissier@harmoniesalon.com',
            'password' => Hash::make('password'),
            'pseudo'   => 'caissier',
            'role'     => 'caissier',
        ]);

        // ── Fournisseurs ──────────────────────────────────────────────────────
        $beautySource   = Fournisseur::firstOrCreate(['nom' => 'Beauty Source'],   ['actif' => true]);
        $proHair        = Fournisseur::firstOrCreate(['nom' => 'Pro Hair Supply'], ['actif' => true]);
        $esthetiqueDepot= Fournisseur::firstOrCreate(['nom' => 'Esthetique Depot'],['actif' => false]);

        // ── Types de produits + liaison fournisseurs ──────────────────────────
        $shampooing = TypeProduit::firstOrCreate(['nom' => 'Shampooing'], ['actif' => true]);
        $shampooing->fournisseurs()->sync([$beautySource->id, $proHair->id]);

        $soin = TypeProduit::firstOrCreate(['nom' => 'Soin'], ['actif' => true]);
        $soin->fournisseurs()->sync([$beautySource->id, $proHair->id]);

        $coloration = TypeProduit::firstOrCreate(['nom' => 'Coloration'], ['actif' => true]);
        $coloration->fournisseurs()->sync([$proHair->id, $esthetiqueDepot->id]);

        $coiffage = TypeProduit::firstOrCreate(['nom' => 'Coiffage'], ['actif' => true]);
        $coiffage->fournisseurs()->sync([$beautySource->id, $esthetiqueDepot->id]);

        // ── Produits ──────────────────────────────────────────────────────────
        Produit::firstOrCreate(['nom' => 'Shampooing Hydratant'], [
            'type_id' => $shampooing->id, 'prix' => 18500, 'actif' => true,
        ]);
        Produit::firstOrCreate(['nom' => 'Masque Reparateur'], [
            'type_id' => $soin->id, 'prix' => 24000, 'actif' => true,
        ]);
        Produit::firstOrCreate(['nom' => 'Huile de Soin'], [
            'type_id' => $soin->id, 'prix' => 32000, 'actif' => true,
        ]);
        Produit::firstOrCreate(['nom' => 'Coloration Chatain'], [
            'type_id' => $coloration->id, 'prix' => 28500, 'actif' => true,
        ]);
        Produit::firstOrCreate(['nom' => 'Spray Fixant'], [
            'type_id' => $coiffage->id, 'prix' => 15000, 'actif' => false,
        ]);
        Produit::firstOrCreate(['nom' => 'Creme Coiffante'], [
            'type_id' => $coiffage->id, 'prix' => 19000, 'actif' => true,
        ]);

        // ── Prestations ───────────────────────────────────────────────────────
        Prestation::firstOrCreate(['nom' => 'Brushing'],          ['prix' => 8000,  'actif' => true]);
        Prestation::firstOrCreate(['nom' => 'Pose de perruque'],  ['prix' => 25000, 'actif' => true]);
        Prestation::firstOrCreate(['nom' => 'Coloration complete'],['prix' => 35000,'actif' => true]);

        // ── Charges ───────────────────────────────────────────────────────────
        Charge::firstOrCreate(['nom' => 'Linge et serviettes'], ['actif' => true]);
        Charge::firstOrCreate(['nom' => 'Produits de soin'],    ['actif' => true]);
        Charge::firstOrCreate(['nom' => 'Loyer'],               ['actif' => true]);
        Charge::firstOrCreate(['nom' => 'Salaires'],            ['actif' => true]);
        Charge::firstOrCreate(['nom' => 'Entretien materiel'],  ['actif' => true]);

        // ── Clients ───────────────────────────────────────────────────────────
        Client::firstOrCreate(['nom' => 'Marie Kouassi'], ['telephone' => '07 00 11 22 33']);
        Client::firstOrCreate(['nom' => 'Aicha Diallo'],  ['telephone' => null]);

        $this->command->info('✅ Donnees Harmonie Salon inserees avec succes.');
        $this->command->info('   Identifiants : admin / password  |  caissier / password');
    }
}
