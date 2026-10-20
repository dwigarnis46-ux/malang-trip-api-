<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\GaleriWisataController;
use App\Http\Controllers\Api\KategoriController;
use App\Http\Controllers\Api\VideoWisataController;
use App\Http\Controllers\Api\WisataController;
use App\Http\Controllers\Api\MobileController;
use Illuminate\Support\Facades\Route;


// =====================================================
// PUBLIC API
// =====================================================

// =====================================================
// WISATA
// =====================================================

// Menampilkan semua wisata
// Bisa menggunakan:
// /api/wisata
// /api/wisata?search=coban
// /api/wisata?kategori_id=1
// /api/wisata?search=coban&kategori_id=1
Route::get(
    '/wisata',
    [WisataController::class, 'index']
);

// Detail wisata
Route::get(
    '/wisata/{id}',
    [WisataController::class, 'show']
);


// =====================================================
// KATEGORI
// =====================================================

// Menampilkan semua kategori
Route::get(
    '/kategori',
    [KategoriController::class, 'index']
);

// Detail kategori
Route::get(
    '/kategori/{id}',
    [KategoriController::class, 'show']
);


// =====================================================
// GALERI WISATA
// =====================================================

// Menampilkan semua galeri berdasarkan wisata
Route::get(
    '/wisata/{wisata_id}/galeri',
    [GaleriWisataController::class, 'index']
);


// =====================================================
// VIDEO WISATA
// =====================================================

// Menampilkan semua video berdasarkan wisata
Route::get(
    '/wisata/{wisata_id}/video',
    [VideoWisataController::class, 'index']
);


// =====================================================
// ADMIN AUTHENTICATION
// =====================================================

// Login admin
Route::post(
    '/admin/login',
    [AdminAuthController::class, 'login']
);


// =====================================================
// ADMIN PROTECTED API
// =====================================================

Route::middleware('auth:sanctum')->group(function () {

    // =================================================
    // ADMIN
    // =================================================

    // Data admin yang sedang login
    Route::get(
        '/admin/me',
        [AdminAuthController::class, 'me']
    );

    // Logout admin
    Route::post(
        '/admin/logout',
        [AdminAuthController::class, 'logout']
    );


    // =================================================
    // KATEGORI
    // =================================================

    // CREATE
    Route::post(
        '/kategori',
        [KategoriController::class, 'store']
    );

    // UPDATE
    Route::patch(
        '/kategori/{id}',
        [KategoriController::class, 'update']
    );

    // DELETE
    Route::delete(
        '/kategori/{id}',
        [KategoriController::class, 'destroy']
    );


    // =================================================
    // WISATA
    // =================================================

    // CREATE
    Route::post(
        '/wisata',
        [WisataController::class, 'store']
    );

    // UPDATE
    Route::patch(
        '/wisata/{id}',
        [WisataController::class, 'update']
    );

    // DELETE
    Route::delete(
        '/wisata/{id}',
        [WisataController::class, 'destroy']
    );


    // =================================================
    // GALERI WISATA
    // =================================================

    // CREATE / UPLOAD
    Route::post(
        '/wisata/{wisata_id}/galeri',
        [GaleriWisataController::class, 'store']
    );

    // UPDATE / GANTI FOTO
    Route::patch(
        '/galeri/{id}',
        [GaleriWisataController::class, 'update']
    );

    // DELETE
    Route::delete(
        '/galeri/{id}',
        [GaleriWisataController::class, 'destroy']
    );


    // =================================================
    // VIDEO WISATA
    // =================================================

    // CREATE / UPLOAD
    Route::post(
        '/wisata/{wisata_id}/video',
        [VideoWisataController::class, 'store']
    );

    // UPDATE / GANTI VIDEO
    Route::patch(
        '/video/{id}',
        [VideoWisataController::class, 'update']
    );

    // DELETE
    Route::delete(
    '/video/{id}',
    [VideoWisataController::class, 'destroy']
);

});

// =====================================================
// MOBILE API - PENGGUNA
// =====================================================

Route::prefix('mobile')->group(function () {
    Route::get('/home', [MobileController::class, 'home']);

    Route::get('/kategori', [MobileController::class, 'kategori']);

    Route::get('/wisata', [MobileController::class, 'wisata']);

    Route::get('/wisata/{id}', [MobileController::class, 'detailWisata']);

    Route::get('/wisata/{id}/galeri', [MobileController::class, 'galeri']);

    Route::get('/wisata/{id}/video', [MobileController::class, 'video']);
});