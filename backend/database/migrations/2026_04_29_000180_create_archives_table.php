<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('archives', function (Blueprint $table) {
            $table->id();
            $table->string('type');           // 'fournisseur', 'charge', 'vente', etc.
            $table->unsignedBigInteger('reference_id'); // id original
            $table->json('data');              // toute la ligne en JSON
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('archives');
    }
};
