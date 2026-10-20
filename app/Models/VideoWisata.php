<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VideoWisata extends Model
{
    protected $table = 'video_wisata';
    protected $primaryKey = 'video_id';
    public $timestamps = false;
    protected $fillable = ['wisata_id', 'video', 'judul_video'];

    public function wisata()
    {
        return $this->belongsTo(Wisata::class, 'wisata_id', 'wisata_id');
    }
}