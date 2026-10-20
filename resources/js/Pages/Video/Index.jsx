import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../api/axios';

/* ================= IKON ================= */

const svgProps = {
    viewBox: '0 0 16 16',
    width: '1em',
    height: '1em',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
};

const IconEdit = () => (
    <svg {...svgProps} strokeWidth="1.6">
        <path d="M11 2.5l2.5 2.5L5.5 13H3v-2.5L11 2.5z" />
    </svg>
);

const IconHapus = () => (
    <svg {...svgProps} strokeWidth="1.5">
        <path d="M2 4.5h12M6 4.5V3h4v1.5M3.5 4.5l.7 8.5h7.6l.7-8.5" />
    </svg>
);

const IconCek = () => (
    <svg {...svgProps} strokeWidth="1.8">
        <path d="M3 8.5l3.2 3.2L13 4.8" />
    </svg>
);

const IconSilang = () => (
    <svg {...svgProps} strokeWidth="1.8">
        <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
);

// ikon "unggah video" pada kotak unggah (sesuai desain)
const IconUnggahVideo = () => (
    <svg viewBox="0 0 48 44" fill="none" stroke="currentColor" strokeWidth="2.6"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 3.5h28M6 9h36" />
        <rect x="3" y="14" width="42" height="27" rx="2.5" />
        <path d="M20 21.5l10.5 6-10.5 6v-12z" />
    </svg>
);

// ikon video kecil pada tabel
const IconVideoKecil = () => (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.6"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="26" height="19" rx="3" />
        <path d="M13 9.5l8 4.5-8 4.5v-9z" fill="currentColor" />
        <path d="M5 28h22" />
    </svg>
);

/* ================= UTIL ================= */

// Batas ukuran video (MB). Ubah angka ini bila ingin lebih besar / lebih kecil.
// Ingat: batas di server Laravel & php.ini juga harus disesuaikan.
const MAKS_MB = 500;
const MAKS_UKURAN = MAKS_MB * 1024 * 1024;
const EKSTENSI_BOLEH = ['mp4', 'mov', 'avi', 'webm'];

// Alamat server Laravel (diambil dari baseURL axios, mis. http://127.0.0.1:8000/api)
const BACKEND_ORIGIN = (() => {
    try {
        return new URL(api.defaults.baseURL || '', window.location.origin).origin;
    } catch {
        return 'http://127.0.0.1:8000';
    }
})();

// Nama kolom file video bisa berbeda-beda; ambil yang tersedia
const videoDari = (item) =>
    item?.video ||
    item?.file_video ||
    item?.url_video ||
    item?.path ||
    item?.file ||
    '';

//   "video/a.mp4"          -> {server}/storage/video/a.mp4
//   "/storage/video/a.mp4" -> {server}/storage/video/a.mp4
//   "http(s)://..."        -> dipakai apa adanya
const getVideoUrl = (video) => {
    if (!video || typeof video !== 'string') return '';

    if (/^(https?:)?\/\//.test(video) || /^(data|blob):/.test(video)) {
        return video;
    }

    let path = video.replace(/^\/+/, '').replace(/^public\//, '');

    if (!path.startsWith('storage/')) {
        path = `storage/${path}`;
    }

    return `${BACKEND_ORIGIN}/${path}`;
};

const formatUkuran = (byte) => {
    if (byte >= 1024 * 1024) return `${(byte / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(byte / 1024))} KB`;
};

// Gambar mini video (bingkai pertama); bila gagal tampil ikon pengganti
function VideoThumb({ src, judul, onClick }) {
    const [gagal, setGagal] = useState(false);

    useEffect(() => {
        setGagal(false);
    }, [src]);

    if (!src || gagal) {
        return (
            <span
                className="vid-thumb vid-thumb-kosong"
                title={src ? `Video tidak dapat dimuat: ${src}` : 'Alamat video kosong'}
            >
                <IconVideoKecil />
            </span>
        );
    }

    return (
        <button
            type="button"
            className="vid-thumb vid-thumb-btn"
            onClick={onClick}
            aria-label={`Putar video ${judul}`}
        >
            <video
                src={`${src}#t=0.5`}
                preload="metadata"
                muted
                playsInline
                onError={() => {
                    console.warn('Video gagal dimuat:', src);
                    setGagal(true);
                }}
            />
            <span className="vid-thumb-play" aria-hidden="true">▶</span>
        </button>
    );
}

function Video() {
    const [videos, setVideos] = useState([]);
    const [wisata, setWisata] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [progress, setProgress] = useState(0);
    const [deleting, setDeleting] = useState(false);

    const [cari, setCari] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ wisata_id: '', judul_video: '', video: null });
    const [seret, setSeret] = useState(false);

    const [hapusItem, setHapusItem] = useState(null);
    const [lihatItem, setLihatItem] = useState(null);
    const [notice, setNotice] = useState(null); // {type, title, message}

    const inputFile = useRef(null);

    /* ================= DATA ================= */

    const loadData = async () => {
        try {
            setLoading(true);

            const wisataResponse = await api.get('/wisata');

            const wisataData =
                wisataResponse.data.data || wisataResponse.data || [];

            const daftarWisata = Array.isArray(wisataData) ? wisataData : [];

            setWisata(daftarWisata);

            const semuaVideo = daftarWisata.flatMap((item) =>
                (item.video || []).map((video) => ({
                    ...video,
                    wisata: item,
                    wisata_id: video.wisata_id || item.wisata_id,
                }))
            );

            setVideos(semuaVideo);
        } catch (error) {
            console.error('Gagal mengambil data video:', error);

            setWisata([]);
            setVideos([]);
            setNotice({
                type: 'error',
                title: 'Gagal Memuat Data',
                message: 'Data video tidak dapat diambil. Coba muat ulang halaman.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Notifikasi sukses hilang otomatis
    useEffect(() => {
        if (notice?.type !== 'success') return;
        const timer = setTimeout(() => setNotice(null), 2200);
        return () => clearTimeout(timer);
    }, [notice]);

    const getWisataName = (item) => {
        if (item.wisata?.nama_wisata) {
            return item.wisata.nama_wisata;
        }

        const found = wisata.find(
            (w) => Number(w.wisata_id) === Number(item.wisata_id)
        );

        return found?.nama_wisata || '-';
    };

    const hasil = useMemo(() => {
        const kata = cari.trim().toLowerCase();
        if (!kata) return videos;

        return videos.filter((item) => {
            const nama =
                item.wisata?.nama_wisata ||
                wisata.find((w) => Number(w.wisata_id) === Number(item.wisata_id))
                    ?.nama_wisata ||
                '';

            return `${nama} ${item.judul_video || ''}`.toLowerCase().includes(kata);
        });
    }, [videos, wisata, cari]);

    /* ================= FORM ================= */

    const resetForm = () => {
        setForm({ wisata_id: '', judul_video: '', video: null });
        setEditing(null);
        setSeret(false);
        setProgress(0);
    };

    const openTambah = () => {
        resetForm();
        setShowModal(true);
    };

    const openEdit = (item) => {
        resetForm();
        setEditing(item);
        setForm({
            wisata_id: item.wisata_id || '',
            judul_video: item.judul_video || '',
            video: null,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
        resetForm();
    };

    const pilihFile = (file) => {
        if (!file) return;

        const ekstensi = file.name.split('.').pop().toLowerCase();

        if (!EKSTENSI_BOLEH.includes(ekstensi)) {
            setNotice({
                type: 'error',
                title: 'Format Tidak Didukung',
                message: 'Gunakan video berformat MP4, MOV, AVI, atau WEBM.',
            });
            return;
        }

        if (file.size > MAKS_UKURAN) {
            setNotice({
                type: 'error',
                title: 'Ukuran Terlalu Besar',
                message: `Ukuran video maksimal ${MAKS_MB} MB.`,
            });
            return;
        }

        setForm((prev) => ({ ...prev, video: file }));
    };

    const handleFileChange = (e) => {
        pilihFile(e.target.files[0]);
        e.target.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setSeret(false);
        pilihFile(e.dataTransfer.files?.[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.wisata_id) {
            setNotice({
                type: 'error',
                title: 'Data Belum Lengkap',
                message: 'Silakan pilih wisata terlebih dahulu.',
            });
            return;
        }

        if (!form.judul_video.trim()) {
            setNotice({
                type: 'error',
                title: 'Data Belum Lengkap',
                message: 'Judul video wajib diisi.',
            });
            return;
        }

        if (!editing && !form.video) {
            setNotice({
                type: 'error',
                title: 'Video Belum Dipilih',
                message: 'Silakan pilih video terlebih dahulu.',
            });
            return;
        }

        try {
            setSaving(true);
            setProgress(0);

            const data = new FormData();
            data.append('wisata_id', form.wisata_id);
            data.append('judul_video', form.judul_video);

            if (form.video) {
                data.append('video', form.video);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
                // unggahan besar butuh waktu: jangan putus karena timeout axios
                timeout: 0,
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                onUploadProgress: (event) => {
                    if (event.total) {
                        setProgress(Math.round((event.loaded * 100) / event.total));
                    }
                },
            };

            if (editing) {
                data.append('_method', 'PATCH');
                await api.post(`/video/${editing.video_id}`, data, config);
            } else {
                await api.post(`/wisata/${form.wisata_id}/video`, data, config);
            }

            const edit = Boolean(editing);

            setShowModal(false);
            resetForm();

            setNotice({
                type: 'success',
                title: 'Berhasil Disimpan',
                message: edit
                    ? 'Video berhasil diperbarui.'
                    : 'Video berhasil ditambahkan.',
            });

            await loadData();
        } catch (error) {
            console.error('Gagal menyimpan video:', error);
            console.error('Response error:', error.response?.data);

            setNotice({
                type: 'error',
                title: 'Gagal Menyimpan',
                message:
                    error.response?.data?.message ||
                    'Terjadi kesalahan saat menyimpan video.',
            });
        } finally {
            setSaving(false);
        }
    };

    const doHapus = async () => {
        if (!hapusItem) return;

        try {
            setDeleting(true);
            await api.delete(`/video/${hapusItem.video_id}`);

            setHapusItem(null);
            setNotice({
                type: 'success',
                title: 'Berhasil Dihapus',
                message: 'Video berhasil dihapus.',
            });

            await loadData();
        } catch (error) {
            console.error('Gagal menghapus video:', error);

            setHapusItem(null);
            setNotice({
                type: 'error',
                title: 'Gagal Menghapus',
                message: error.response?.data?.message || 'Gagal menghapus video.',
            });
        } finally {
            setDeleting(false);
        }
    };

    // Esc menutup pop up paling atas
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape') return;

            if (notice) setNotice(null);
            else if (hapusItem) {
                if (!deleting) setHapusItem(null);
            } else if (lihatItem) setLihatItem(null);
            else if (showModal) closeModal();
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const klikLatar = (e, tutup) => {
        if (e.target === e.currentTarget) tutup();
    };

    /* ================= TAMPILAN ================= */

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bitter:wght@400;500;600;700&display=swap');

                html,
                body,
                #root {
                    background: #f8fbff;
                }

                /*
                  Desain dasar: area konten 424px (mockup).
                  --u = 1 satuan desain, dibatasi 1.64px supaya sepadan
                  dengan sidebar, dan tidak pernah di bawah 1px.
                */
                .vid-page {
                    container-type: inline-size;
                    width: 100%;
                    min-height: 100vh;
                    min-height: 100dvh;
                    background: #f8fbff;
                }

                .vid-page *,
                .vid-bg *,
                .vid-page *::before,
                .vid-bg *::before {
                    box-sizing: border-box;
                }

                .vid-inner {
                    --u: clamp(1px, calc(100cqw / 424), 1.64px);
                    --line: #a9c9ea;
                    --blue: #2c4fa5;
                    width: 100%;
                    padding: calc(13 * var(--u)) 5.4cqw calc(20 * var(--u)) 4.2cqw;
                    font-family: 'Bitter', Georgia, 'Times New Roman', serif;
                    color: #222;
                }

                .vid-title {
                    margin: 0;
                    color: #1f1f1f;
                    font-size: calc(14.5 * var(--u));
                    line-height: calc(18 * var(--u));
                    font-weight: 400;
                }

                .vid-subtitle {
                    margin: calc(1 * var(--u)) 0 0;
                    color: #222;
                    font-size: calc(11 * var(--u));
                    line-height: calc(15 * var(--u));
                }

                /* ----- toolbar ----- */

                .vid-toolbar {
                    display: flex;
                    gap: calc(9 * var(--u));
                    margin-top: calc(17 * var(--u));
                }

                .vid-search-wrap {
                    position: relative;
                    flex: 222 1 0;
                    min-width: 0;
                }

                .vid-search {
                    width: 100%;
                    min-width: 0;
                    height: calc(19 * var(--u));
                    padding: 0 calc(22 * var(--u)) 0 calc(9 * var(--u));
                    background: #fff;
                    border: 1px solid var(--line);
                    border-radius: calc(3 * var(--u));
                    outline: none;
                    color: #333;
                    font-family: inherit;
                    font-size: calc(10.5 * var(--u));
                }

                .vid-search::placeholder {
                    color: #8d9bb0;
                    opacity: 1;
                }

                .vid-search:focus {
                    border-color: #477ac0;
                    box-shadow: 0 0 0 2px rgba(53, 118, 178, .12);
                }

                .vid-clear {
                    position: absolute;
                    top: 50%;
                    right: calc(5 * var(--u));
                    width: calc(13 * var(--u));
                    height: calc(13 * var(--u));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    background: #e8eff8;
                    border: none;
                    border-radius: 50%;
                    color: #5b6b82;
                    font-size: calc(7 * var(--u));
                    transform: translateY(-50%);
                    cursor: pointer;
                }

                .vid-clear:hover {
                    background: #d6e3f3;
                }

                .vid-btn-tambah {
                    flex: 130 1 0;
                    min-width: 0;
                    height: calc(20 * var(--u));
                    padding: 0 calc(6 * var(--u));
                    background: var(--blue);
                    color: #fff;
                    border: none;
                    border-radius: calc(3 * var(--u));
                    font-family: inherit;
                    font-size: calc(10.5 * var(--u));
                    white-space: nowrap;
                    cursor: pointer;
                    transition: background .2s ease;
                }

                .vid-btn-tambah:hover {
                    background: #23438f;
                }

                /* ----- tabel ----- */

                .vid-card {
                    min-height: calc(217 * var(--u));
                    margin-top: calc(9 * var(--u));
                    background: #fff;
                    border: 1px solid var(--line);
                    border-radius: calc(4 * var(--u));
                    overflow-x: auto;
                }

                /* Garis tegak digambar sebagai lapisan di atas tabel (::after)
                   supaya tampil dari nama kolom sampai dasar kartu. */
                .vid-table-inner {
                    position: relative;
                    width: 100%;
                    min-width: 420px;
                    min-height: calc(217 * var(--u) - 2px);
                    background: #fff;
                }

                .vid-table-inner::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background-image:
                        linear-gradient(#dbe3ee, #dbe3ee),
                        linear-gradient(#dbe3ee, #dbe3ee),
                        linear-gradient(#dbe3ee, #dbe3ee),
                        linear-gradient(#dbe3ee, #dbe3ee);
                    background-repeat: no-repeat;
                    background-size: 1px 100%;
                    background-position: 8.5% 0, 22.5% 0, 46.5% 0, 68% 0;
                }

                .vid-table-inner.vid-no-lines::after {
                    display: none;
                }

                .vid-table {
                    width: 100%;
                    table-layout: fixed;
                    border-collapse: collapse;
                }

                .vid-table th {
                    height: calc(30 * var(--u));
                    padding: 0 calc(8 * var(--u));
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid #dbe3ee;
                    color: #2f4a7d;
                    font-size: calc(11 * var(--u));
                    font-weight: 600;
                    text-align: center;
                }

                .vid-table td {
                    height: calc(50 * var(--u));
                    padding: calc(6 * var(--u)) calc(8 * var(--u));
                    border: none;
                    border-bottom: 1px solid #dbe3ee;
                    color: #222;
                    font-size: calc(11 * var(--u));
                    line-height: calc(15 * var(--u));
                    text-align: center;
                    vertical-align: middle;
                    overflow-wrap: break-word;
                }

                .vid-table td:nth-child(5) {
                    white-space: nowrap;
                }

                .vid-table tbody tr:hover td {
                    background: rgba(47, 111, 190, .06);
                }

                /* ----- gambar mini video ----- */

                .vid-thumb {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: calc(46 * var(--u));
                    height: calc(34 * var(--u));
                    padding: 0;
                    background: #eef4fb;
                    border: 1px solid #d6e3f3;
                    border-radius: calc(4 * var(--u));
                    overflow: hidden;
                    vertical-align: middle;
                }

                .vid-thumb svg {
                    width: calc(20 * var(--u));
                    height: calc(20 * var(--u));
                    color: #5b6b82;
                }

                .vid-thumb video {
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    background: #111827;
                    pointer-events: none;
                }

                .vid-thumb-play {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(14, 32, 66, .28);
                    color: #fff;
                    font-size: calc(10 * var(--u));
                    transition: background .15s ease;
                }

                .vid-thumb-btn {
                    cursor: pointer;
                    transition: transform .15s ease, box-shadow .15s ease;
                }

                .vid-thumb-btn:hover {
                    transform: scale(1.06);
                    box-shadow: 0 4px 12px rgba(53, 118, 178, .25);
                }

                .vid-thumb-btn:hover .vid-thumb-play {
                    background: rgba(14, 32, 66, .5);
                }

                /* ----- tombol aksi ----- */

                .vid-aksi {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: calc(10 * var(--u));
                }

                .vid-pill {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: calc(3 * var(--u));
                    height: calc(14 * var(--u));
                    padding: 0;
                    border: none;
                    border-radius: calc(3 * var(--u));
                    font-family: inherit;
                    font-size: calc(8.5 * var(--u));
                    cursor: pointer;
                    transition: filter .15s ease;
                }

                .vid-pill:hover {
                    filter: brightness(.96);
                }

                .vid-pill svg {
                    width: calc(8 * var(--u));
                    height: calc(8 * var(--u));
                }

                .vid-pill-edit {
                    width: calc(36 * var(--u));
                    background: #cfe3fb;
                    color: #3a64b4;
                }

                .vid-pill-hapus {
                    width: calc(44 * var(--u));
                    background: #fbc2c7;
                    color: #d03a48;
                }

                .vid-message {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: calc(120 * var(--u));
                    color: #8a99ad;
                    font-size: calc(10.5 * var(--u));
                    text-align: center;
                }

                .vid-info {
                    margin: calc(2 * var(--u)) 0 0;
                    padding-top: calc(2 * var(--u));
                    color: #7f9cc4;
                    font-size: calc(8 * var(--u));
                    line-height: calc(12 * var(--u));
                }

                /* ================= POP UP ================= */

                .vid-bg {
                    --u: clamp(1.1px, calc(100vw / 340), 1.64px);
                    --line: #b9d1ee;
                    --blue: #2c4fa5;
                    position: fixed;
                    inset: 0;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    background: rgba(14, 32, 66, .45);
                    -webkit-backdrop-filter: blur(3px);
                    backdrop-filter: blur(3px);
                    font-family: 'Bitter', Georgia, 'Times New Roman', serif;
                    animation: vid-fade .18s ease both;
                }

                .vid-bg.vid-top {
                    z-index: 1100;
                    background: rgba(14, 32, 66, .35);
                }

                .vid-modal {
                    position: relative;
                    width: calc(310 * var(--u));
                    max-width: 100%;
                    max-height: calc(100dvh - 32px);
                    overflow-y: auto;
                    padding: calc(24 * var(--u)) calc(22 * var(--u)) calc(20 * var(--u));
                    background: #fff;
                    border-radius: calc(8 * var(--u));
                    box-shadow:
                        0 2px 6px rgba(14, 32, 66, .08),
                        0 24px 60px rgba(14, 32, 66, .32);
                    color: #222;
                    animation: vid-pop .22s cubic-bezier(.2, .9, .3, 1.2) both;
                }

                .vid-modal.vid-wide {
                    width: min(calc(560 * var(--u)), 100%);
                }

                .vid-modal::before {
                    content: '';
                    position: absolute;
                    inset: 0 0 auto 0;
                    height: calc(4 * var(--u));
                    background: linear-gradient(90deg, #2c4fa5, #5aa8ff);
                }

                .vid-modal.vid-danger::before {
                    background: linear-gradient(90deg, #d03a48, #f08a93);
                }

                .vid-modal.vid-ok::before {
                    background: linear-gradient(90deg, #1f9d6e, #5fd3a6);
                }

                .vid-close {
                    position: absolute;
                    top: calc(12 * var(--u));
                    right: calc(12 * var(--u));
                    z-index: 2;
                    width: calc(22 * var(--u));
                    height: calc(22 * var(--u));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    background: #f1f5fa;
                    border: none;
                    border-radius: 50%;
                    color: #5b6b82;
                    font-size: calc(10 * var(--u));
                    cursor: pointer;
                    transition: background .15s ease, color .15s ease;
                }

                .vid-close:hover {
                    background: #e1ebf7;
                    color: #1f2d45;
                }

                .vid-icon {
                    flex-shrink: 0;
                    width: calc(36 * var(--u));
                    height: calc(36 * var(--u));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #e6f0fd;
                    border-radius: calc(10 * var(--u));
                    color: var(--blue);
                }

                .vid-icon svg {
                    width: calc(17 * var(--u));
                    height: calc(17 * var(--u));
                }

                .vid-icon.vid-icon-danger { background: #fde8ea; color: #d03a48; }
                .vid-icon.vid-icon-ok     { background: #e2f6ee; color: #1f9d6e; }

                .vid-modal-title {
                    margin: 0;
                    color: #173e68;
                    font-size: calc(15 * var(--u));
                    line-height: calc(19 * var(--u));
                    font-weight: 600;
                }

                /* ----- pop up form tambah / edit (sesuai desain) ----- */

                .vf-modal {
                    width: calc(277 * var(--u));
                    max-width: 100%;
                    max-height: calc(100dvh - 32px);
                    overflow-y: auto;
                    padding: calc(13 * var(--u)) calc(30 * var(--u)) calc(17 * var(--u)) calc(17 * var(--u));
                    background: #fff;
                    border-radius: calc(4 * var(--u));
                    box-shadow: 0 18px 50px rgba(0, 0, 0, .28);
                    color: #222;
                    animation: vid-pop .2s ease both;
                }

                .vf-title {
                    margin: 0;
                    color: #1f1f1f;
                    font-size: calc(14.5 * var(--u));
                    line-height: calc(18 * var(--u));
                    font-weight: 400;
                }

                .vf-sub {
                    margin: calc(2.5 * var(--u)) 0 0;
                    color: #222;
                    font-size: calc(11 * var(--u));
                    line-height: calc(15 * var(--u));
                }

                .vf-label {
                    display: block;
                    margin: calc(14.5 * var(--u)) 0 calc(4 * var(--u));
                    color: #222;
                    font-size: calc(11 * var(--u));
                    line-height: calc(14 * var(--u));
                    font-weight: 400;
                }

                .vf-label-judul {
                    margin-top: calc(6 * var(--u));
                    margin-bottom: calc(6 * var(--u));
                }

                .vf-label-video {
                    margin-top: calc(7 * var(--u));
                    margin-left: calc(3 * var(--u));
                }

                .vf-select,
                .vf-input {
                    display: block;
                    width: calc(100% - 8 * var(--u));
                    height: calc(19 * var(--u));
                    margin-left: calc(8 * var(--u));
                    background-color: #fff;
                    border: 1px solid #a9c9ea;
                    border-radius: calc(3 * var(--u));
                    outline: none;
                    color: #333;
                    font-family: inherit;
                    font-size: calc(10.5 * var(--u));
                }

                .vf-select {
                    padding: 0 calc(22 * var(--u)) 0 calc(9 * var(--u));
                    appearance: none;
                    -webkit-appearance: none;
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' fill='none' stroke='%236f8fc4' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>");
                    background-repeat: no-repeat;
                    background-position: right calc(8 * var(--u)) center;
                    cursor: pointer;
                }

                .vf-select:invalid {
                    color: #8d9bb0;
                }

                .vf-input {
                    padding: 0 calc(9 * var(--u));
                }

                .vf-select:focus,
                .vf-input:focus {
                    border-color: #477ac0;
                    box-shadow: 0 0 0 2px rgba(53, 118, 178, .12);
                }

                .vf-drop {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: calc(14 * var(--u));
                    width: calc(100% - 10 * var(--u));
                    height: calc(105 * var(--u));
                    margin: calc(4 * var(--u)) 0 0 calc(10 * var(--u));
                    padding: calc(10 * var(--u));
                    background: #fff;
                    border: 1px solid #a9c9ea;
                    border-radius: calc(8 * var(--u));
                    overflow: hidden;
                    text-align: center;
                    cursor: pointer;
                    transition: border-color .15s ease, background .15s ease;
                }

                .vf-drop:hover,
                .vf-drop.vf-drag {
                    background: #f7fbff;
                    border-color: #477ac0;
                }

                .vf-drop:focus-within {
                    border-color: #477ac0;
                    box-shadow: 0 0 0 2px rgba(53, 118, 178, .12);
                }

                .vf-drop input {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    cursor: pointer;
                }

                .vf-drop-icon {
                    display: block;
                    width: calc(38 * var(--u));
                    height: calc(35 * var(--u));
                    color: #5b82c4;
                }

                .vf-drop-icon svg {
                    display: block;
                    width: 100%;
                    height: 100%;
                }

                .vf-drop-text {
                    margin: 0;
                    max-width: 100%;
                    color: #8a97ab;
                    font-size: calc(7.5 * var(--u));
                    line-height: calc(12 * var(--u));
                    overflow-wrap: anywhere;
                }

                .vf-drop-file {
                    margin: 0;
                    max-width: 100%;
                    color: #2f4a7d;
                    font-size: calc(8.5 * var(--u));
                    line-height: calc(12 * var(--u));
                    overflow-wrap: anywhere;
                }

                .vf-drop-file small {
                    display: block;
                    color: #8a97ab;
                    font-size: calc(7.5 * var(--u));
                }

                .vf-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: calc(9 * var(--u));
                    margin-top: calc(12 * var(--u));
                }

                .vf-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: calc(5 * var(--u));
                    width: calc(66 * var(--u));
                    height: calc(19 * var(--u));
                    padding: 0;
                    border-radius: calc(3 * var(--u));
                    font-family: inherit;
                    font-size: calc(10.5 * var(--u));
                    white-space: nowrap;
                    cursor: pointer;
                    transition: background .15s ease;
                }

                .vf-btn-simpan.vf-lebar {
                    width: auto;
                    min-width: calc(66 * var(--u));
                    padding: 0 calc(8 * var(--u));
                }

                .vf-btn-batal {
                    background: #fff;
                    border: 1px solid #8fb4de;
                    color: #222;
                }

                .vf-btn-batal:hover {
                    background: #f1f7fd;
                }

                .vf-btn-simpan {
                    background: #2c4fa5;
                    border: 1px solid #2c4fa5;
                    color: #fff;
                }

                .vf-btn-simpan:hover {
                    background: #23438f;
                }

                .vf-btn:disabled {
                    opacity: .7;
                    cursor: not-allowed;
                }

                /* ----- tombol pop up lain ----- */

                .vid-actions {
                    display: flex;
                    justify-content: center;
                    gap: calc(10 * var(--u));
                    margin-top: calc(22 * var(--u));
                }

                .vid-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: calc(6 * var(--u));
                    flex: 1;
                    min-width: calc(74 * var(--u));
                    height: calc(26 * var(--u));
                    padding: 0 calc(14 * var(--u));
                    border-radius: calc(5 * var(--u));
                    font-family: inherit;
                    font-size: calc(10.5 * var(--u));
                    cursor: pointer;
                    transition: transform .12s ease, box-shadow .15s ease, background .15s ease;
                }

                .vid-btn-batal {
                    background: #fff;
                    border: 1px solid #b9d1ee;
                    color: #2a3b57;
                }

                .vid-btn-batal:hover {
                    background: #f1f7fd;
                }

                .vid-btn-danger {
                    background: linear-gradient(180deg, #e0505d, #d03a48);
                    border: 1px solid #d03a48;
                    color: #fff;
                    box-shadow: 0 calc(3 * var(--u)) calc(8 * var(--u)) rgba(208, 58, 72, .3);
                }

                .vid-btn-ok {
                    background: linear-gradient(180deg, #2fb383, #1f9d6e);
                    border: 1px solid #1f9d6e;
                    color: #fff;
                    box-shadow: 0 calc(3 * var(--u)) calc(8 * var(--u)) rgba(31, 157, 110, .3);
                }

                .vid-btn-danger:hover,
                .vid-btn-ok:hover {
                    transform: translateY(-1px);
                }

                .vid-btn:disabled {
                    opacity: .65;
                    cursor: not-allowed;
                    transform: none;
                }

                .vid-spin {
                    width: calc(9 * var(--u));
                    height: calc(9 * var(--u));
                    border: 2px solid rgba(255, 255, 255, .45);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: vid-spin .7s linear infinite;
                }

                /* ----- varian rata tengah (konfirmasi & notifikasi) ----- */

                .vid-center {
                    text-align: center;
                }

                .vid-center .vid-icon {
                    width: calc(46 * var(--u));
                    height: calc(46 * var(--u));
                    margin: calc(4 * var(--u)) auto 0;
                    border-radius: 50%;
                    box-shadow: 0 0 0 calc(6 * var(--u)) #eef4fd;
                }

                .vid-center .vid-icon-danger { box-shadow: 0 0 0 calc(6 * var(--u)) #fef3f4; }
                .vid-center .vid-icon-ok     { box-shadow: 0 0 0 calc(6 * var(--u)) #f0faf5; }

                .vid-center .vid-icon svg {
                    width: calc(21 * var(--u));
                    height: calc(21 * var(--u));
                }

                .vid-center .vid-modal-title {
                    margin-top: calc(18 * var(--u));
                    font-size: calc(16 * var(--u));
                    line-height: calc(20 * var(--u));
                }

                .vid-text {
                    margin: calc(8 * var(--u)) 0 0;
                    color: #4a586c;
                    font-size: calc(10.5 * var(--u));
                    line-height: calc(16 * var(--u));
                }

                .vid-text strong {
                    color: #1f1f1f;
                    font-weight: 700;
                }

                /* ----- putar video ----- */

                .vid-player {
                    display: block;
                    width: 100%;
                    max-height: 65vh;
                    margin-top: calc(14 * var(--u));
                    background: #0b1220;
                    border-radius: calc(6 * var(--u));
                }

                .vid-player-sub {
                    margin: calc(4 * var(--u)) 0 0;
                    color: #5c6b80;
                    font-size: calc(10.5 * var(--u));
                }

                @keyframes vid-fade {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                @keyframes vid-pop {
                    from { opacity: 0; transform: translateY(14px) scale(.96); }
                    to   { opacity: 1; transform: none; }
                }

                @keyframes vid-spin {
                    to { transform: rotate(360deg); }
                }

                /* ----- area sempit ----- */

                @container (max-width: 460px) {
                    .vid-toolbar {
                        flex-direction: column;
                    }

                    .vid-search-wrap {
                        flex: none;
                        width: 100%;
                    }

                    .vid-search,
                    .vid-btn-tambah {
                        height: 38px;
                        font-size: 13.5px;
                    }

                    .vid-btn-tambah {
                        flex: none;
                        width: 100%;
                    }

                    .vid-clear {
                        width: 20px;
                        height: 20px;
                        right: 9px;
                        font-size: 10px;
                    }

                    .vid-title { font-size: 17px; }

                    .vid-subtitle {
                        font-size: 12px;
                        line-height: 18px;
                    }

                    .vid-table th,
                    .vid-table td {
                        font-size: 12px;
                    }

                    .vid-info { font-size: 10px; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .vid-bg,
                    .vid-modal,
                    .vf-modal {
                        animation: none;
                    }
                }
            `}</style>

            {/* ================= HALAMAN ================= */}

            <div className="vid-page">
                <div className="vid-inner">

                    <h1 className="vid-title">Kelola Video</h1>
                    <p className="vid-subtitle">kelola video dari wisata</p>

                    <div className="vid-toolbar">
                        <div className="vid-search-wrap">
                            <input
                                className="vid-search"
                                type="text"
                                value={cari}
                                onChange={(e) => setCari(e.target.value)}
                                placeholder="cari  wisata"
                                aria-label="Cari wisata"
                            />

                            {cari && (
                                <button
                                    type="button"
                                    className="vid-clear"
                                    onClick={() => setCari('')}
                                    aria-label="Hapus pencarian"
                                >
                                    <IconSilang />
                                </button>
                            )}
                        </div>

                        <button className="vid-btn-tambah" onClick={openTambah}>
                            + Tambah video
                        </button>
                    </div>

                    <div className="vid-card">
                        {loading ? (
                            <div className="vid-message">Memuat data video...</div>
                        ) : (
                            <div
                                className={`vid-table-inner${
                                    hasil.length === 0 ? ' vid-no-lines' : ''
                                }`}
                            >
                                <table className="vid-table">
                                    <colgroup>
                                        <col style={{ width: '8.5%' }} />
                                        <col style={{ width: '14%' }} />
                                        <col style={{ width: '24%' }} />
                                        <col style={{ width: '21.5%' }} />
                                        <col style={{ width: '32%' }} />
                                    </colgroup>

                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Video</th>
                                            <th>Nama Wisata</th>
                                            <th>Judul Video</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {hasil.map((item, index) => (
                                            <tr key={item.video_id}>
                                                <td>{index + 1}</td>

                                                <td>
                                                    <VideoThumb
                                                        src={getVideoUrl(videoDari(item))}
                                                        judul={item.judul_video || 'video'}
                                                        onClick={() => setLihatItem(item)}
                                                    />
                                                </td>

                                                <td>{getWisataName(item)}</td>

                                                <td>{item.judul_video || 'Tanpa Judul'}</td>

                                                <td>
                                                    <span className="vid-aksi">
                                                        <button
                                                            className="vid-pill vid-pill-edit"
                                                            onClick={() => openEdit(item)}
                                                        >
                                                            <IconEdit /> Edit
                                                        </button>

                                                        <button
                                                            className="vid-pill vid-pill-hapus"
                                                            onClick={() => setHapusItem(item)}
                                                        >
                                                            <IconHapus /> Hapus
                                                        </button>
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {hasil.length === 0 && (
                                    <div className="vid-message">
                                        {videos.length === 0
                                            ? 'Belum ada video.'
                                            : 'Video tidak ditemukan.'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!loading && (
                        <p className="vid-info">
                            Menampilkan {hasil.length === 0 ? 0 : `1–${hasil.length}`} dari{' '}
                            {videos.length} data
                        </p>
                    )}

                </div>
            </div>

            {/* ================= POP UP TAMBAH / EDIT VIDEO ================= */}

            {showModal && (
                <div className="vid-bg" onMouseDown={(e) => klikLatar(e, closeModal)}>
                    <form
                        className="vf-modal"
                        onSubmit={handleSubmit}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="vid-form-title"
                    >
                        <h2 className="vf-title" id="vid-form-title">
                            {editing ? 'Edit video' : 'Tambah video'}
                        </h2>

                        <p className="vf-sub">
                            {editing ? 'Perbarui video wisata' : 'Unggah video wisata'}
                        </p>

                        <label className="vf-label" htmlFor="vid-wisata">
                            Nama Wisata
                        </label>

                        <select
                            id="vid-wisata"
                            className="vf-select"
                            value={form.wisata_id}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, wisata_id: e.target.value }))
                            }
                            required
                        >
                            <option value="" disabled>
                                Pilih Wisata
                            </option>

                            {wisata.map((item) => (
                                <option key={item.wisata_id} value={item.wisata_id}>
                                    {item.nama_wisata}
                                </option>
                            ))}
                        </select>

                        <label className="vf-label vf-label-judul" htmlFor="vid-judul">
                            Judul Video
                        </label>

                        <input
                            id="vid-judul"
                            className="vf-input"
                            type="text"
                            value={form.judul_video}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, judul_video: e.target.value }))
                            }
                            required
                        />

                        <span className="vf-label vf-label-video">Unggah Video</span>

                        <label
                            className={`vf-drop${seret ? ' vf-drag' : ''}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setSeret(true);
                            }}
                            onDragLeave={() => setSeret(false)}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={inputFile}
                                type="file"
                                accept=".mp4,.mov,.avi,.webm,video/mp4,video/quicktime,video/x-msvideo,video/webm"
                                onChange={handleFileChange}
                            />

                            <span className="vf-drop-icon">
                                <IconUnggahVideo />
                            </span>

                            {form.video ? (
                                <p className="vf-drop-file">
                                    {form.video.name}
                                    <small>{formatUkuran(form.video.size)} • klik untuk mengganti</small>
                                </p>
                            ) : editing ? (
                                <p className="vf-drop-text">
                                    Video saat ini dipertahankan.
                                    <br />
                                    Klik disini untuk mengganti video
                                </p>
                            ) : (
                                <p className="vf-drop-text">
                                    Klik disini untuk mengunggah video AI
                                </p>
                            )}
                        </label>

                        <div className="vf-actions">
                            <button
                                type="button"
                                className="vf-btn vf-btn-batal"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                className={`vf-btn vf-btn-simpan${saving ? ' vf-lebar' : ''}`}
                                disabled={saving}
                            >
                                {saving
                                    ? progress > 0 && progress < 100
                                        ? `Mengunggah ${progress}%`
                                        : 'Menyimpan...'
                                    : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ================= POP UP PUTAR VIDEO ================= */}

            {lihatItem && (
                <div
                    className="vid-bg vid-top"
                    onMouseDown={(e) => klikLatar(e, () => setLihatItem(null))}
                >
                    <div
                        className="vid-modal vid-wide"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="vid-lihat-title"
                    >
                        <button
                            type="button"
                            className="vid-close"
                            onClick={() => setLihatItem(null)}
                            aria-label="Tutup"
                        >
                            <IconSilang />
                        </button>

                        <h2 className="vid-modal-title" id="vid-lihat-title">
                            {lihatItem.judul_video || 'Tanpa Judul'}
                        </h2>

                        <p className="vid-player-sub">{getWisataName(lihatItem)}</p>

                        <video
                            className="vid-player"
                            src={getVideoUrl(videoDari(lihatItem))}
                            controls
                            autoPlay
                        />
                    </div>
                </div>
            )}

            {/* ================= POP UP KONFIRMASI HAPUS ================= */}

            {hapusItem && (
                <div
                    className="vid-bg vid-top"
                    onMouseDown={(e) =>
                        klikLatar(e, () => !deleting && setHapusItem(null))
                    }
                >
                    <div
                        className="vid-modal vid-danger vid-center"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="vid-hapus-title"
                    >
                        <div className="vid-icon vid-icon-danger">
                            <IconHapus />
                        </div>

                        <h2 className="vid-modal-title" id="vid-hapus-title">
                            Hapus Video?
                        </h2>

                        <p className="vid-text">
                            Video <strong>{hapusItem.judul_video || 'Tanpa Judul'}</strong>{' '}
                            dari <strong>{getWisataName(hapusItem)}</strong> akan dihapus
                            permanen dan tidak dapat dikembalikan.
                        </p>

                        <div className="vid-actions">
                            <button
                                type="button"
                                className="vid-btn vid-btn-batal"
                                onClick={() => setHapusItem(null)}
                                disabled={deleting}
                                autoFocus
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                className="vid-btn vid-btn-danger"
                                onClick={doHapus}
                                disabled={deleting}
                            >
                                {deleting && <span className="vid-spin" />}
                                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= POP UP NOTIFIKASI ================= */}

            {notice && (
                <div
                    className="vid-bg vid-top"
                    onMouseDown={(e) => klikLatar(e, () => setNotice(null))}
                >
                    <div
                        className={`vid-modal vid-center ${
                            notice.type === 'success' ? 'vid-ok' : 'vid-danger'
                        }`}
                        role="alertdialog"
                        aria-modal="true"
                    >
                        <div
                            className={`vid-icon ${
                                notice.type === 'success'
                                    ? 'vid-icon-ok'
                                    : 'vid-icon-danger'
                            }`}
                        >
                            {notice.type === 'success' ? <IconCek /> : <IconSilang />}
                        </div>

                        <h2 className="vid-modal-title">{notice.title}</h2>
                        <p className="vid-text">{notice.message}</p>

                        <div className="vid-actions">
                            <button
                                type="button"
                                className={`vid-btn ${
                                    notice.type === 'success'
                                        ? 'vid-btn-ok'
                                        : 'vid-btn-danger'
                                }`}
                                onClick={() => setNotice(null)}
                                autoFocus
                            >
                                Oke
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Video;
