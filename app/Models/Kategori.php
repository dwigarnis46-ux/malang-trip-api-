<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    protected $table = 'kategori';
    protected $primaryKey = 'kategori_id';
    public $timestamps = false;
    protected $fillable = ['nama_kategori'];

    public function wisata()
    {
        return $this->hasMany(Wisata::class, 'kategori_id', 'kategori_id');
    }
}