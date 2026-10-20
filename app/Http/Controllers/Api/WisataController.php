<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wisata;
use Illuminate\Http\Request;

class WisataController extends Controller
{
    /**
     * Menampilkan semua wisata.
     *
     * Support:
     * ?search=coban
     * ?kategori_id=1
     * ?search=coban&kategori_id=1
     */
    public function index(Request $request)
    {
        $query = Wisata::with([
            'kategori',
            'galeri',
            'video'
        ]);

        // Search nama wisata
        if ($request->filled('search')) {
            $query->where(
                'nama_wisata',
                'like',
                '%' . $request->search . '%'
            );
        }

        // Filter kategori
        if ($request->filled('kategori_id')) {
            $query->where(
                'kategori_id',
                $request->kategori_id
            );
        }

        $wisata = $query
            ->orderBy('wisata_id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data wisata berhasil diambil',
            'data' => $wisata
        ]);
    }


    /**
     * Menampilkan detail wisata.
     */
    public function show(int $id)
    {
        $wisata = Wisata::with([
            'kategori',
            'galeri',
            'video'
        ])->find($id);

        if (!$wisata) {
            return response()->json([
                'success' => false,
                'message' => 'Data wisata tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail wisata berhasil diambil',
            'data' => $wisata
        ]);
    }


    /**
     * Menambahkan wisata.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori_id' => [
                'required',
                'integer',
                'exists:kategori,kategori_id'
            ],

            'nama_wisata' => [
                'required',
                'string',
                'max:150'
            ],

            'deskripsi_wisata' => [
                'nullable',
                'string'
            ],

            'lokasi_wisata' => [
                'nullable',
                'string',
                'max:255'
            ],

            'rating_wisata' => [
                'nullable',
                'numeric',
                'min:0',
                'max:5'
            ],

            'harga_tiket' => [
                'nullable',
                'numeric',
                'min:0'
            ],

            'jam_buka' => [
                'nullable',
                'string',
                'max:100'
            ],

            'link_gmap' => [
                'nullable',
                'string'
            ],
        ]);

        $wisata = Wisata::create($validated);

        $wisata->load([
            'kategori',
            'galeri',
            'video'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data wisata berhasil ditambahkan',
            'data' => $wisata
        ], 201);
    }


    /**
     * Update sebagian data wisata menggunakan PATCH.
     */
    public function update(Request $request, int $id)
    {
        $wisata = Wisata::find($id);

        if (!$wisata) {
            return response()->json([
                'success' => false,
                'message' => 'Data wisata tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            'kategori_id' => [
                'sometimes',
                'integer',
                'exists:kategori,kategori_id'
            ],

            'nama_wisata' => [
                'sometimes',
                'string',
                'max:150'
            ],

            'deskripsi_wisata' => [
                'sometimes',
                'nullable',
                'string'
            ],

            'lokasi_wisata' => [
                'sometimes',
                'nullable',
                'string',
                'max:255'
            ],

            'rating_wisata' => [
                'sometimes',
                'nullable',
                'numeric',
                'min:0',
                'max:5'
            ],

            'harga_tiket' => [
                'sometimes',
                'nullable',
                'numeric',
                'min:0'
            ],

            'jam_buka' => [
                'sometimes',
                'nullable',
                'string',
                'max:100'
            ],

            'link_gmap' => [
                'sometimes',
                'nullable',
                'string'
            ],
        ]);

        $wisata->update($validated);

        $wisata->load([
            'kategori',
            'galeri',
            'video'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data wisata berhasil diperbarui',
            'data' => $wisata
        ]);
    }


    /**
     * Menghapus wisata.
     */
    public function destroy(int $id)
    {
        $wisata = Wisata::find($id);

        if (!$wisata) {
            return response()->json([
                'success' => false,
                'message' => 'Data wisata tidak ditemukan'
            ], 404);
        }

        $wisata->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data wisata berhasil dihapus'
        ]);
    }
}