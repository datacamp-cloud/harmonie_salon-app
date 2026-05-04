<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('arrivages', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->boolean('is_validated')->default(false);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('arrivage_lignes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('arrivage_id')->constrained('arrivages')->cascadeOnDelete();
            $table->foreignId('produit_id')->constrained('produits');
            $table->foreignId('fournisseur_id')->nullable()->constrained('fournisseurs')->nullOnDelete();
            $table->integer('quantite');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('arrivage_lignes');
        Schema::dropIfExists('arrivages');
    }
};
