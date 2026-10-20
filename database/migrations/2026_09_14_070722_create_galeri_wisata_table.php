<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('galeri_wisata', function (Blueprint $table) {
        $table->id('galeri_id');
        $table->foreignId('wisata_id')->constrained('wisata', 'wisata_id');
        $table->string('foto', 255);
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('galeri_wisata');
    }
};
