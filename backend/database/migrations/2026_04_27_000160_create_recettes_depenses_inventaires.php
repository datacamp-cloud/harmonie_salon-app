<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('recettes', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('prestation_id')->constrained('prestations');
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('prix_applique', 12, 2);
            $table->text('notes')->nullable();
            $table->boolean('is_validated')->default(false);
            $table->timestamps();
        });

        Schema::create('depenses', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('charge_id')->constrained('charges');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('montant', 12, 2);
            $table->text('notes')->nullable();
            $table->boolean('is_validated')->default(false);
            $table->timestamps();
        });

        Schema::create('inventaires', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('produit_id')->constrained('produits');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('quantite_physique');
            $table->integer('stock_theorique');
            $table->integer('ecart');
            $table->boolean('is_validated')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventaires');
        Schema::dropIfExists('depenses');
        Schema::dropIfExists('recettes');
    }
};
