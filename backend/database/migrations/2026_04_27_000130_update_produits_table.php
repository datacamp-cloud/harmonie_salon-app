<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->foreignId('type_id')->nullable()->after('nom')
                  ->constrained('types_produits')->nullOnDelete();
            $table->boolean('actif')->default(true)->after('prix');
            $table->integer('stock_cache')->default(0)->after('actif');
        });
    }

    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->dropForeign(['type_id']);
            $table->dropColumn(['type_id', 'actif', 'stock_cache']);
        });
    }
};
