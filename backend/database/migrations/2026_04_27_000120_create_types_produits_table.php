<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('types_produits', function (Blueprint $table) {
            $table->id();
            $table->string('nom')->unique();
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });

        // Pivot : type <-> fournisseurs
        Schema::create('fournisseur_type_produit', function (Blueprint $table) {
            $table->foreignId('type_produit_id')->constrained('types_produits')->cascadeOnDelete();
            $table->foreignId('fournisseur_id')->constrained('fournisseurs')->cascadeOnDelete();
            $table->primary(['type_produit_id', 'fournisseur_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fournisseur_type_produit');
        Schema::dropIfExists('types_produits');
    }
};
