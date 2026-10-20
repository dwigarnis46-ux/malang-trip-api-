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
    Schema::create('wisata', function (Blueprint $table) {
        $table->id('wisata_id');
        $table->foreignId('kategori_id')->constrained('kategori', 'kategori_id');
        $table->string('nama_wisata', 150);
        $table->text('deskripsi_wisata')->nullable();
        $table->string('lokasi_wisata', 255)->nullable();
        $table->decimal('rating_wisata', 2, 1)->nullable();
        $table->decimal('harga_tiket', 12, 2)->nullable();
        $table->string('jam_buka', 100)->nullable();
        $table->text('link_gmap')->nullable();
        $table->timestamps(); // created_at & updated_at
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wisata');
    }
};
