<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GaleriWisata;
use App\Models\Wisata;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GaleriWisataController extends Controller
{
    /**
     * Menampilkan semua galeri berdasarkan wisata.
     */
    public function index(int $wisata_id)
    {
        $wisata = Wisata::find($wisata_id);

        if (!$wisata) {
            return response()->json([
                'success' => false,
                'message' => 'Data wisata tidak ditemukan'
            ], 404);
        }

        $galeri = GaleriWisata::where(
            'wisata_id',
            $wisata_id
        )->get();

        return response()->json([
            'success' => true,
            'message' => 'Data galeri berhasil diambil',
            'data' => $galeri
        ]);
    }


    /**
     * Upload foto galeri.
     */
    public function store(Request $request, int $wisata_id)
    {
        $wisata = Wisata::find($wisata_id);

        if (!$wisata) {
            return response()->json([
                'success' => false,
                'message' => 'Data wisata tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'foto' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120'
            ]
        ]);

        $file = $request->file('foto');

        $path = $file->store(
            'wisata',
            'public'
        );

        $galeri = GaleriWisata::create([
            'wisata_id' => $wisata_id,
            'foto' => $path
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto galeri berhasil ditambahkan',
            'data' => $galeri
        ], 201);
    }


    /**
     * Mengganti foto galeri menggunakan PATCH.
     */
    public function update(Request $request, int $id)
    {
        $galeri = GaleriWisata::find($id);

        if (!$galeri) {
            return response()->json([
                'success' => false,
                'message' => 'Data galeri tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'foto' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120'
            ]
        ]);

        // Simpan file baru
        $file = $request->file('foto');

        $newPath = $file->store(
            'wisata',
            'public'
        );

        // Hapus file lama
        if ($galeri->foto) {
            Storage::disk('public')->delete(
                $galeri->foto
            );
        }

        // Update database
        $galeri->update([
            'foto' => $newPath
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto galeri berhasil diperbarui',
            'data' => $galeri
        ]);
    }


    /**
     * Menghapus foto galeri.
     */
    public function destroy(int $id)
    {
        $galeri = GaleriWisata::find($id);

        if (!$galeri) {
            return response()->json([
                'success' => false,
                'message' => 'Data galeri tidak ditemukan'
            ], 404);
        }

        // Hapus file
        if ($galeri->foto) {
            Storage::disk('public')->delete(
                $galeri->foto
            );
        }

        // Hapus database
        $galeri->delete();

        return response()->json([
            'success' => true,
            'message' => 'Foto galeri berhasil dihapus'
        ]);
    }
}