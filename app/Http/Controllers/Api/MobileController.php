<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wisata;
use App\Models\Kategori;
use Illuminate\Http\Request;

class MobileController extends Controller
{
    public function home()
    {
        $kategori = Kategori::all();

        $wisataTerbaru = Wisata::with(['kategori', 'galeri'])
    ->orderByDesc('wisata_id')
    ->take(6)
    ->get();

$wisataPopuler = Wisata::with(['kategori', 'galeri'])
    ->orderByDesc('rating_wisata')
    ->take(6)
    ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data beranda berhasil diambil',
            'data' => [
                'kategori' => $kategori,
                'wisata_terbaru' => $wisataTerbaru,
                'wisata_populer' => $wisataPopuler,
            ],
        ]);
    }

    public function kategori()
    {
        return response()->json([
            'success' => true,
            'message' => 'Data kategori berhasil diambil',
            'data' => Kategori::all(),
        ]);
    }

    public function wisata(Request $request)
{
    $query = Wisata::with([
        'kategori',
        'galeri',
    ]);

    if ($request->filled('search')) {
        $search = $request->search;

        $query->where(function ($q) use ($search) {
            $q->where('nama_wisata', 'like', "%{$search}%")
                ->orWhere('lokasi_wisata', 'like', "%{$search}%");
        });
    }

    if ($request->filled('kategori_id')) {
        $query->where('kategori_id', $request->kategori_id);
    }

    return response()->json([
        'success' => true,
        'message' => 'Daftar wisata berhasil diambil',
        'data' => $query->orderByDesc('wisata_id')->get(),
    ]);
}

    public function detailWisata(int $id)
    {
        $wisata = Wisata::with([
            'kategori',
            'galeri',
            'video',
        ])->find($id);

        if (!$wisata) {
            return response()->json([
                'success' => false,
                'message' => 'Wisata tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail wisata berhasil diambil',
            'data' => $wisata,
        ]);
    }

    public function galeri(int $id)
    {
        $wisata = Wisata::find($id);

        if (!$wisata) {
            return response()->json([
                'success' => false,
                'message' => 'Wisata tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Galeri berhasil diambil',
            'data' => $wisata->galeri,
        ]);
    }

    public function video(int $id)
    {
        $wisata = Wisata::find($id);

        if (!$wisata) {
            return response()->json([
                'success' => false,
                'message' => 'Wisata tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Video berhasil diambil',
            'data' => $wisata->video,
        ]);
    }
}
