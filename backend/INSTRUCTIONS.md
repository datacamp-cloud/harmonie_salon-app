# BACKEND — Instructions de mise en place (version finale)
# webstock.harmoniesalon.com

## 1. Migrations à exécuter dans l'ordre

```bash
php artisan migrate
```

Fichiers de migration à avoir dans database/migrations/ :

- 0001_01_01_000000_create_users_table.php          (existant)
- 2026_04_23_000100_create_produits_table.php        (existant — sera modifié)
- 2026_04_23_000110_create_ventes_table.php          (existant — sera modifié)
- 2026_04_23_000120_create_arrivages_table.php       (existant — sera modifié)
- 2026_04_23_000130_create_historiques_table.php     (existant)
- 2026_04_27_000100_update_users_table.php           (nouveau — pseudo + role)
- 2026_04_27_000110_create_fournisseurs_table.php    (nouveau)
- 2026_04_27_000120_create_types_produits_table.php  (nouveau + pivot)
- 2026_04_27_000130_update_produits_table.php        (nouveau — type_id, actif, stock_cache)
- 2026_04_27_000140_create_prestations_charges_clients.php (nouveau)
- 2026_04_27_000150_update_arrivages_ventes.php      (nouveau — multi-lignes + validation)
- 2026_04_27_000160_create_recettes_depenses_inventaires.php (nouveau)
- 2026_04_28_000170_add_is_validated_to_depenses.php (nouveau — validation dépenses)

## 2. Models à créer / remplacer dans app/Models/

Remplacer :
- User.php          → pseudo + role + HasApiTokens
- Produit.php       → type_id, actif, stock_cache, recalculerStock()
- Arrivage.php      → is_validated, lignes()
- Vente.php         → is_validated, client_id, lignes()

Créer :
- Fournisseur.php
- TypeProduit.php
- Prestation.php
- Charge.php
- Client.php
- ArrivageLigne.php
- VenteLigne.php
- Recette.php
- Depense.php       → is_validated
- Inventaire.php

## 3. Controllers à créer dans app/Http/Controllers/

- AuthController.php        → login par PSEUDO (pas email)
- ProduitController.php
- FournisseurController.php
- TypeProduitController.php
- ArrivageController.php    → store + update + valider
- VenteController.php       → store + update + valider + prix_vente par ligne
- RecetteController.php     → store + update + valider
- DepenseController.php     → store + update + valider + is_validated
- InventaireController.php  → store + update
- PrestationController.php
- ChargeController.php
- ClientController.php
- StatsController.php       → stats du jour + état caisse cumulatif

## 4. Routes — remplacer routes/api.php

Voir le fichier routes/api.php fourni.
Nouvelles routes par rapport à la version précédente :
  PUT  /arrivages/{id}
  PUT  /ventes/{id}
  PUT  /recettes/{id}
  PUT  /depenses/{id}
  PUT  /inventaires/{id}
  POST /depenses/{id}/valider

## 5. Installer Sanctum

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

## 6. Lancer les migrations et le seeder

```bash
php artisan migrate
php artisan db:seed
```

Comptes créés par le seeder :
  pseudo=admin     / password=password  (role: admin)
  pseudo=caissier  / password=password  (role: caissier)

## 7. Test rapide

```bash
php artisan serve

# Login avec PSEUDO
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"pseudo":"admin","password":"password"}'

# Récupérer les produits
curl http://localhost:8000/api/produits \
  -H "Authorization: Bearer {token}"
```

## 8. Brancher le frontend (quand tout est validé)

Dans frontend/src/api/client.js, changer UNE ligne :
  export { api } from './mock'
→
  export { api } from './http'

Dans frontend/.env.local, décommenter :
  VITE_API_URL=http://localhost:8000/api
