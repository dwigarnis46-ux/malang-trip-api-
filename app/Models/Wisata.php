<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wisata extends Model
{
    protected $table = 'wisata';
    protected $primaryKey = 'wisata_id';
    protected $fillable = [
        'kategori_id', 'nama_wisata', 'deskripsi_wisata', 'lokasi_wisata',
        'rating_wisata', 'harga_tiket', 'jam_buka', 'link_gmap',
    ];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'kategori_id', 'kategori_id');
    }

    public function galeri()
    {
        return $this->hasMany(GaleriWisata::class, 'wisata_id', 'wisata_id');
    }

    public function video()
    {
        return $this->hasMany(VideoWisata::class, 'wisata_id', 'wisata_id');
    }
}