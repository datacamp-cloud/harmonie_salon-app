<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('prestations', function (Blueprint $table) {
            $table->id();
            $table->string('nom')->unique();
            $table->decimal('prix', 12, 2)->default(0);
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });

        Schema::create('charges', function (Blueprint $table) {
            $table->id();
            $table->string('nom')->unique();
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });

        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('telephone')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
        Schema::dropIfExists('charges');
        Schema::dropIfExists('prestations');
    }
};
