<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GaleriWisata extends Model
{
    protected $table = 'galeri_wisata';
    protected $primaryKey = 'galeri_id';
    public $timestamps = false;
    protected $fillable = ['wisata_id', 'foto'];

    public function wisata()
    {
        return $this->belongsTo(Wisata::class, 'wisata_id', 'wisata_id');
    }
}