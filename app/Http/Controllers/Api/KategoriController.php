<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use Illuminate\Http\Request;

class KategoriController extends Controller
{
    /**
     * Menampilkan semua kategori.
     */
    public function index()
    {
        $kategori = Kategori::withCount('wisata')
            ->orderBy('kategori_id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data kategori berhasil diambil',
            'data' => $kategori
        ]);
    }


    /**
     * Menampilkan detail kategori.
     */
    public function show(int $id)
    {
        $kategori = Kategori::with([
            'wisata'
        ])->find($id);

        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail kategori berhasil diambil',
            'data' => $kategori
        ]);
    }


    /**
     * Menambahkan kategori.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kategori' => [
                'required',
                'string',
                'max:100'
            ]
        ]);

        $kategori = Kategori::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil ditambahkan',
            'data' => $kategori
        ], 201);
    }


    /**
     * Update kategori menggunakan PATCH.
     */
    public function update(Request $request, int $id)
    {
        $kategori = Kategori::find($id);

        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            'nama_kategori' => [
                'sometimes',
                'string',
                'max:100'
            ]
        ]);

        $kategori->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil diperbarui',
            'data' => $kategori
        ]);
    }


    /**
     * Menghapus kategori.
     */
    public function destroy(int $id)
    {
        $kategori = Kategori::find($id);

        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan'
            ], 404);
        }

        // Cegah penghapusan kategori yang masih digunakan.
        if ($kategori->wisata()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak dapat dihapus karena masih digunakan oleh wisata'
            ], 422);
        }

        $kategori->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus'
        ]);
    }
}