# BACKEND — Instructions de mise en place
# webstock.harmoniesalon.com

## 1. Nouvelles migrations à créer

Copier ces fichiers dans `database/migrations/` :

- `2026_04_27_000100_update_users_table.php`       → ajoute pseudo + role
- `2026_04_27_000110_create_fournisseurs_table.php`
- `2026_04_27_000120_create_types_produits_table.php` + pivot
- `2026_04_27_000130_update_produits_table.php`    → ajoute type_id, actif, stock_cache
- `2026_04_27_000140_create_prestations_charges_clients.php`
- `2026_04_27_000150_update_arrivages_ventes.php`  → refonte multi-lignes + validation
- `2026_04_27_000160_create_recettes_depenses_inventaires.php`

## 2. Nouveaux Models à créer dans app/Models/

- Fournisseur.php
- TypeProduit.php
- Prestation.php
- Charge.php
- Client.php
- ArrivageLigne.php
- VenteLigne.php
- Recette.php
- Depense.php
- Inventaire.php

Remplacer :
- Produit.php  → version avec type_id, actif, stock_cache, recalculerStock()
- Arrivage.php → version avec is_validated, lignes
- Vente.php    → version avec is_validated, client_id, lignes

## 3. Nouveaux Controllers dans app/Http/Controllers/

- AuthController.php          → login par pseudo (pas email)
- ProduitController.php
- FournisseurController.php
- TypeProduitController.php
- ArrivageController.php      → store + valider
- VenteController.php         → store + valider
- RecetteController.php       → store + valider
- DepenseController.php
- InventaireController.php
- PrestationController.php
- ChargeController.php
- ClientController.php
- StatsController.php         → index + historique

## 4. Routes — remplacer routes/api.php

Voir le fichier api.php fourni.

## 5. Installer Sanctum si pas déjà fait

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

Dans `app/Models/User.php`, ajouter le trait :
```php
use Laravel\Sanctum\HasApiTokens;
class User extends Authenticatable {
    use HasApiTokens, HasFactory, Notifiable;
    ...
    protected $fillable = ['name', 'email', 'password', 'pseudo', 'role'];
}
```

## 6. Lancer les migrations et le seeder

```bash
php artisan migrate
php artisan db:seed
```

Le seeder crée :
- Compte admin  : pseudo=admin,    password=password
- Compte caissier: pseudo=caissier, password=password
- 3 fournisseurs, 4 types, 6 produits, 3 prestations, 5 charges, 2 clients

## 7. Tester l'API

```bash
php artisan serve
# → http://localhost:8000

# Test login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"pseudo":"admin","password":"password"}'

# Test produits (avec token)
curl http://localhost:8000/api/produits \
  -H "Authorization: Bearer {token}"
```

## 8. Brancher le frontend

Quand tout est OK, une seule modification dans :
`frontend/src/api/client.js`

Changer :
  export { api } from './mock'
En :
  export { api } from './http'

Et décommenter dans `frontend/.env.local` :
  VITE_API_URL=http://localhost:8000/api

C'est tout. Aucune autre modification n'est nécessaire côté frontend.
