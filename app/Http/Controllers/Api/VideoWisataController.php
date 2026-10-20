<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VideoWisata;
use App\Models\Wisata;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VideoWisataController extends Controller
{
    /**
     * Batas ukuran video dalam KB (512000 KB = 500 MB).
     * Pastikan upload_max_filesize & post_max_size di php.ini
     * minimal sebesar ini.
     */
    private const MAKS_VIDEO_KB = 512000;

    /**
     * Pesan validasi berbahasa Indonesia.
     */
    private function pesanValidasi(): array
    {
        return [
            'video.required' => 'Video wajib dipilih.',
            'video.file'     => 'Video harus berupa file.',
            'video.mimes'    => 'Format video harus MP4, MOV, AVI, atau WEBM.',
            'video.max'      => 'Ukuran video maksimal 500 MB.',
            'video.uploaded' => 'Video gagal diunggah. Periksa pengaturan upload_max_filesize dan post_max_size di php.ini.',
            'judul_video.string' => 'Judul video harus berupa teks.',
            'judul_video.max'    => 'Judul video maksimal 150 karakter.',
        ];
    }

    /**
     * Menampilkan semua video berdasarkan wisata.
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

        $video = VideoWisata::where(
            'wisata_id',
            $wisata_id
        )->get();

        return response()->json([
            'success' => true,
            'message' => 'Data video berhasil diambil',
            'data' => $video
        ]);
    }


    /**
     * Upload video wisata.
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

        $validated = $request->validate([
            'video' => [
                'required',
                'file',
                'mimes:mp4,mov,avi,webm',
                'max:' . self::MAKS_VIDEO_KB
            ],

            'judul_video' => [
                'nullable',
                'string',
                'max:150'
            ]
        ], $this->pesanValidasi());

        $path = $request
            ->file('video')
            ->store(
                'video',
                'public'
            );

        $video = VideoWisata::create([
            'wisata_id' => $wisata_id,
            'video' => $path,
            'judul_video' => $validated['judul_video'] ?? null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Video berhasil ditambahkan',
            'data' => $video
        ], 201);
    }


    /**
     * Update video menggunakan PATCH.
     *
     * Bisa:
     * 1. Mengganti video saja
     * 2. Mengganti judul saja
     * 3. Mengganti video dan judul
     */
    public function update(Request $request, int $id)
    {
        $video = VideoWisata::find($id);

        if (!$video) {
            return response()->json([
                'success' => false,
                'message' => 'Data video tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            // 'sometimes' => video hanya divalidasi bila dikirim,
            // jadi mengubah judul saja tidak mewajibkan upload ulang video.
            'video' => [
                'sometimes',
                'file',
                'mimes:mp4,mov,avi,webm',
                'max:' . self::MAKS_VIDEO_KB
            ],

            'judul_video' => [
                'sometimes',
                'nullable',
                'string',
                'max:150'
            ]
        ], $this->pesanValidasi());

        // Jika ada video baru
        if ($request->hasFile('video')) {

            // Simpan video baru terlebih dahulu
            $newPath = $request
                ->file('video')
                ->store(
                    'video',
                    'public'
                );

            // Hapus video lama
            if ($video->video) {
                Storage::disk('public')->delete(
                    $video->video
                );
            }

            $video->video = $newPath;
        }

        // Jika judul dikirim
        if ($request->has('judul_video')) {
            $video->judul_video =
                $validated['judul_video'] ?? null;
        }

        $video->save();

        return response()->json([
            'success' => true,
            'message' => 'Video berhasil diperbarui',
            'data' => $video
        ]);
    }


    /**
     * Menghapus video.
     */
    public function destroy(int $id)
    {
        $video = VideoWisata::find($id);

        if (!$video) {
            return response()->json([
                'success' => false,
                'message' => 'Data video tidak ditemukan'
            ], 404);
        }

        // Hapus file video
        if ($video->video) {
            Storage::disk('public')->delete(
                $video->video
            );
        }

        // Hapus database
        $video->delete();

        return response()->json([
            'success' => true,
            'message' => 'Video berhasil dihapus'
        ]);
    }
}