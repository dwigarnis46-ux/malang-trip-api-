<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Model
{
    use HasApiTokens;

    protected $table = 'admin';
    protected $primaryKey = 'admin_id';
    public $timestamps = false;
    protected $fillable = ['username', 'password'];
    protected $hidden = ['password'];
}