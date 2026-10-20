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

const IconPlus = () => (
    <svg {...svgProps} strokeWidth="1.8">
        <path d="M8 3v10M3 8h10" />
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

const IconGambar = () => (
    <svg viewBox="0 0 48 40" fill="none" stroke="currentColor" strokeWidth="2.6"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2.5" y="2.5" width="43" height="35" rx="3" />
        <circle cx="14" cy="13.5" r="3.8" />
        <path d="M2.5 30l13-11 10 8.5 6.5-5.5 13.5 11" />
    </svg>
);

/* ================= UTIL ================= */

const TIPE_BOLEH = ['image/jpeg', 'image/png', 'image/webp'];
const MAKS_UKURAN = 5 * 1024 * 1024;

// Alamat server Laravel (diambil dari baseURL axios, mis. http://127.0.0.1:8000/api)
const BACKEND_ORIGIN = (() => {
    try {
        return new URL(api.defaults.baseURL || '', window.location.origin).origin;
    } catch {
        return 'http://127.0.0.1:8000';
    }
})();

// Nama kolom foto bisa berbeda-beda; ambil yang tersedia
const fotoDari = (item) =>
    item?.foto ||
    item?.gambar ||
    item?.url_foto ||
    item?.foto_galeri ||
    item?.path ||
    item?.file ||
    '';

// Mengubah nilai dari database menjadi alamat gambar yang bisa dibuka browser:
//   "galeri/a.jpg"          -> {server}/storage/galeri/a.jpg
//   "/storage/galeri/a.jpg" -> {server}/storage/galeri/a.jpg
//   "public/galeri/a.jpg"   -> {server}/storage/galeri/a.jpg
//   "http(s)://..."         -> dipakai apa adanya
const getImageUrl = (foto) => {
    if (!foto || typeof foto !== 'string') return '';

    if (/^(https?:)?\/\//.test(foto) || /^(data|blob):/.test(foto)) {
        return foto;
    }

    let path = foto.replace(/^\/+/, '').replace(/^public\//, '');

    if (!path.startsWith('storage/')) {
        path = `storage/${path}`;
    }

    return `${BACKEND_ORIGIN}/${path}`;
};

// Gambar mini; bila gagal dimuat tampil ikon pengganti
function Thumb({ src, alt, onClick }) {
    const [gagal, setGagal] = useState(false);

    useEffect(() => {
        setGagal(false);
    }, [src]);

    if (!src || gagal) {
        return (
            <span
                className="gal-thumb gal-thumb-kosong"
                title={src ? `Gambar tidak dapat dimuat: ${src}` : 'Alamat gambar kosong'}
            >
                <IconGambar />
            </span>
        );
    }

    return (
        <button
            type="button"
            className="gal-thumb gal-thumb-btn"
            onClick={onClick}
            aria-label={`Lihat foto ${alt}`}
        >
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onError={() => {
                    console.warn('Gambar galeri gagal dimuat:', src);
                    setGagal(true);
                }}
            />
        </button>
    );
}

function Galeri() {
    const [galeri, setGaleri] = useState([]);
    const [wisata, setWisata] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [cari, setCari] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ wisata_id: '', foto: null });
    const [preview, setPreview] = useState(null);
    const [seret, setSeret] = useState(false);

    const [hapusItem, setHapusItem] = useState(null);
    const [lihatItem, setLihatItem] = useState(null);
    const [notice, setNotice] = useState(null); // {type, title, message}

    const objectUrl = useRef(null);

    /* ================= DATA ================= */

    const loadData = async () => {
        try {
            setLoading(true);

            const response = await api.get('/wisata');
            const responseData = response.data;

            let wisataData = [];

            if (Array.isArray(responseData)) {
                wisataData = responseData;
            } else if (Array.isArray(responseData?.data)) {
                wisataData = responseData.data;
            }

            setWisata(wisataData);

            // Ambil semua galeri dari setiap wisata
            const semuaGaleri = [];

            wisataData.forEach((item) => {
                if (Array.isArray(item.galeri)) {
                    item.galeri.forEach((foto) => {
                        semuaGaleri.push({
                            ...foto,
                            wisata: item,
                            wisata_id: foto.wisata_id || item.wisata_id,
                        });
                    });
                }
            });

            setGaleri(semuaGaleri);
        } catch (error) {
            console.error('Gagal mengambil data wisata/galeri:', error);

            setWisata([]);
            setGaleri([]);
            setNotice({
                type: 'error',
                title: 'Gagal Memuat Data',
                message: 'Data galeri tidak dapat diambil. Coba muat ulang halaman.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        return () => {
            if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        };
    }, []);

    // Notifikasi sukses hilang otomatis
    useEffect(() => {
        if (notice?.type !== 'success') return;
        const timer = setTimeout(() => setNotice(null), 2200);
        return () => clearTimeout(timer);
    }, [notice]);

    const getWisataName = (item) => {
        if (item.wisata && item.wisata.nama_wisata) {
            return item.wisata.nama_wisata;
        }

        const found = wisata.find(
            (w) => Number(w.wisata_id) === Number(item.wisata_id)
        );

        return found?.nama_wisata || '-';
    };

    const hasil = useMemo(() => {
        const kata = cari.trim().toLowerCase();
        if (!kata) return galeri;

        return galeri.filter((item) =>
            String(
                item.wisata?.nama_wisata ||
                    wisata.find(
                        (w) => Number(w.wisata_id) === Number(item.wisata_id)
                    )?.nama_wisata ||
                    ''
            )
                .toLowerCase()
                .includes(kata)
        );
    }, [galeri, wisata, cari]);

    /* ================= FORM ================= */

    const bersihkanPreview = () => {
        if (objectUrl.current) {
            URL.revokeObjectURL(objectUrl.current);
            objectUrl.current = null;
        }
    };

    const resetForm = () => {
        bersihkanPreview();
        setForm({ wisata_id: '', foto: null });
        setPreview(null);
        setEditing(null);
        setSeret(false);
    };

    const openTambah = () => {
        resetForm();
        setShowModal(true);
    };

    const openEdit = (item) => {
        bersihkanPreview();
        setEditing(item);
        setForm({ wisata_id: item.wisata_id || '', foto: null });
        setPreview(getImageUrl(fotoDari(item)));
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
        resetForm();
    };

    const pilihFile = (file) => {
        if (!file) return;

        if (!TIPE_BOLEH.includes(file.type)) {
            setNotice({
                type: 'error',
                title: 'Format Tidak Didukung',
                message: 'Gunakan foto berformat JPG, JPEG, PNG, atau WEBP.',
            });
            return;
        }

        if (file.size > MAKS_UKURAN) {
            setNotice({
                type: 'error',
                title: 'Ukuran Terlalu Besar',
                message: 'Ukuran foto maksimal 5 MB.',
            });
            return;
        }

        bersihkanPreview();
        objectUrl.current = URL.createObjectURL(file);

        setForm((prev) => ({ ...prev, foto: file }));
        setPreview(objectUrl.current);
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

        if (!editing && !form.foto) {
            setNotice({
                type: 'error',
                title: 'Foto Belum Dipilih',
                message: 'Silakan pilih foto terlebih dahulu.',
            });
            return;
        }

        try {
            setSaving(true);

            const data = new FormData();
            data.append('wisata_id', form.wisata_id);

            if (form.foto) {
                data.append('foto', form.foto);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
            };

            if (editing) {
                data.append('_method', 'PATCH');
                await api.post(`/galeri/${editing.galeri_id}`, data, config);
            } else {
                await api.post(`/wisata/${form.wisata_id}/galeri`, data, config);
            }

            const edit = Boolean(editing);

            setShowModal(false);
            resetForm();

            setNotice({
                type: 'success',
                title: 'Berhasil Disimpan',
                message: edit
                    ? 'Foto berhasil diperbarui.'
                    : 'Foto berhasil ditambahkan.',
            });

            await loadData();
        } catch (error) {
            console.error('Gagal menyimpan foto:', error);
            console.error('Response error:', error.response?.data);

            setNotice({
                type: 'error',
                title: 'Gagal Menyimpan',
                message:
                    error.response?.data?.message ||
                    'Terjadi kesalahan saat menyimpan foto.',
            });
        } finally {
            setSaving(false);
        }
    };

    const doHapus = async () => {
        if (!hapusItem) return;

        try {
            setDeleting(true);
            await api.delete(`/galeri/${hapusItem.galeri_id}`);

            setHapusItem(null);
            setNotice({
                type: 'success',
                title: 'Berhasil Dihapus',
                message: 'Foto berhasil dihapus.',
            });

            await loadData();
        } catch (error) {
            console.error('Gagal menghapus foto:', error);

            setHapusItem(null);
            setNotice({
                type: 'error',
                title: 'Gagal Menghapus',
                message: error.response?.data?.message || 'Gagal menghapus foto.',
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
                .gal-page {
                    container-type: inline-size;
                    width: 100%;
                    min-height: 100vh;
                    min-height: 100dvh;
                    background: #f8fbff;
                }

                .gal-page *,
                .gal-bg *,
                .gal-page *::before,
                .gal-bg *::before {
                    box-sizing: border-box;
                }

                .gal-inner {
                    --u: clamp(1px, calc(100cqw / 424), 1.64px);
                    --line: #a9c9ea;
                    --blue: #2c4fa5;
                    width: 100%;
                    padding: calc(13 * var(--u)) 5.4cqw calc(20 * var(--u)) 4.2cqw;
                    font-family: 'Bitter', Georgia, 'Times New Roman', serif;
                    color: #222;
                }

                .gal-title {
                    margin: 0;
                    color: #1f1f1f;
                    font-size: calc(14.5 * var(--u));
                    line-height: calc(18 * var(--u));
                    font-weight: 400;
                }

                .gal-subtitle {
                    margin: calc(1 * var(--u)) 0 0;
                    color: #222;
                    font-size: calc(11 * var(--u));
                    line-height: calc(15 * var(--u));
                }

                /* ----- toolbar ----- */

                .gal-toolbar {
                    display: flex;
                    gap: calc(10 * var(--u));
                    margin-top: calc(17 * var(--u));
                }

                .gal-search-wrap {
                    position: relative;
                    flex: 240 1 0;
                    min-width: 0;
                }

                .gal-search {
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

                .gal-search::placeholder {
                    color: #8d9bb0;
                    opacity: 1;
                }

                .gal-search:focus {
                    border-color: #477ac0;
                    box-shadow: 0 0 0 2px rgba(53, 118, 178, .12);
                }

                .gal-clear {
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

                .gal-clear:hover {
                    background: #d6e3f3;
                }

                .gal-btn-tambah {
                    flex: 142 1 0;
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

                .gal-btn-tambah:hover {
                    background: #23438f;
                }

                /* ----- tabel ----- */

                .gal-card {
                    min-height: calc(217 * var(--u));
                    margin-top: calc(9 * var(--u));
                    background: #fff;
                    border: 1px solid var(--line);
                    border-radius: calc(4 * var(--u));
                    overflow-x: auto;
                }

                /* Garis tegak digambar sebagai lapisan di atas tabel (::after)
                   supaya tampil dari nama kolom sampai dasar kartu. */
                .gal-table-inner {
                    position: relative;
                    width: 100%;
                    min-width: 360px;
                    min-height: calc(217 * var(--u) - 2px);
                    background: #fff;
                }

                .gal-table-inner::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background-image:
                        linear-gradient(#dbe3ee, #dbe3ee),
                        linear-gradient(#dbe3ee, #dbe3ee),
                        linear-gradient(#dbe3ee, #dbe3ee);
                    background-repeat: no-repeat;
                    background-size: 1px 100%;
                    background-position: 10% 0, 28% 0, 66% 0;
                }

                .gal-table-inner.gal-no-lines::after {
                    display: none;
                }

                .gal-table {
                    width: 100%;
                    table-layout: fixed;
                    border-collapse: collapse;
                }

                .gal-table th {
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

                .gal-table td {
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

                .gal-table td:nth-child(4) {
                    white-space: nowrap;
                }

                .gal-table tbody tr:hover td {
                    background: rgba(47, 111, 190, .06);
                }

                /* ----- gambar mini ----- */

                .gal-thumb {
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

                .gal-thumb svg {
                    width: calc(20 * var(--u));
                    height: calc(20 * var(--u));
                    color: #8fa9cf;
                }

                .gal-thumb img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .gal-thumb-btn {
                    cursor: zoom-in;
                    transition: transform .15s ease, box-shadow .15s ease;
                }

                .gal-thumb-btn:hover {
                    transform: scale(1.06);
                    box-shadow: 0 4px 12px rgba(53, 118, 178, .25);
                }

                /* ----- tombol aksi ----- */

                .gal-aksi {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: calc(10 * var(--u));
                }

                .gal-pill {
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

                .gal-pill:hover {
                    filter: brightness(.96);
                }

                .gal-pill svg {
                    width: calc(8 * var(--u));
                    height: calc(8 * var(--u));
                }

                .gal-pill-edit {
                    width: calc(36 * var(--u));
                    background: #cfe3fb;
                    color: #3a64b4;
                }

                .gal-pill-hapus {
                    width: calc(44 * var(--u));
                    background: #fbc2c7;
                    color: #d03a48;
                }

                .gal-message {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: calc(120 * var(--u));
                    color: #8a99ad;
                    font-size: calc(10.5 * var(--u));
                    text-align: center;
                }

                .gal-info {
                    margin: calc(2 * var(--u)) 0 0;
                    padding-top: calc(2 * var(--u));
                    color: #7f9cc4;
                    font-size: calc(8 * var(--u));
                    line-height: calc(12 * var(--u));
                }

                /* ================= POP UP ================= */

                .gal-bg {
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
                    animation: gal-fade .18s ease both;
                }

                .gal-bg.gal-top {
                    z-index: 1100;
                    background: rgba(14, 32, 66, .35);
                }

                .gal-modal {
                    position: relative;
                    width: calc(330 * var(--u));
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
                    animation: gal-pop .22s cubic-bezier(.2, .9, .3, 1.2) both;
                }

                .gal-modal.gal-sm {
                    width: calc(310 * var(--u));
                }

                .gal-modal.gal-wide {
                    width: min(calc(520 * var(--u)), 100%);
                }

                .gal-modal::before {
                    content: '';
                    position: absolute;
                    inset: 0 0 auto 0;
                    height: calc(4 * var(--u));
                    background: linear-gradient(90deg, #2c4fa5, #5aa8ff);
                }

                .gal-modal.gal-danger::before {
                    background: linear-gradient(90deg, #d03a48, #f08a93);
                }

                .gal-modal.gal-ok::before {
                    background: linear-gradient(90deg, #1f9d6e, #5fd3a6);
                }

                .gal-close {
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

                .gal-close:hover {
                    background: #e1ebf7;
                    color: #1f2d45;
                }

                .gal-head {
                    display: flex;
                    align-items: center;
                    gap: calc(12 * var(--u));
                    padding-right: calc(24 * var(--u));
                }

                .gal-icon {
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

                .gal-icon svg {
                    width: calc(17 * var(--u));
                    height: calc(17 * var(--u));
                }

                .gal-icon.gal-icon-danger { background: #fde8ea; color: #d03a48; }
                .gal-icon.gal-icon-ok     { background: #e2f6ee; color: #1f9d6e; }

                .gal-modal-title {
                    margin: 0;
                    color: #173e68;
                    font-size: calc(15 * var(--u));
                    line-height: calc(19 * var(--u));
                    font-weight: 600;
                }

                .gal-modal-sub {
                    margin: calc(2 * var(--u)) 0 0;
                    color: #5c6b80;
                    font-size: calc(10.5 * var(--u));
                    line-height: calc(14 * var(--u));
                }

                /* ----- pop up form tambah / edit (sesuai desain) ----- */

                .gf-modal {
                    width: calc(275 * var(--u));
                    max-width: 100%;
                    max-height: calc(100dvh - 32px);
                    overflow-y: auto;
                    padding: calc(13 * var(--u)) calc(28 * var(--u)) calc(17 * var(--u)) calc(18 * var(--u));
                    background: #fff;
                    border-radius: calc(4 * var(--u));
                    box-shadow: 0 18px 50px rgba(0, 0, 0, .28);
                    color: #222;
                    animation: gal-pop .2s ease both;
                }

                .gf-title {
                    margin: 0;
                    color: #1f1f1f;
                    font-size: calc(14.5 * var(--u));
                    line-height: calc(18 * var(--u));
                    font-weight: 400;
                }

                .gf-sub {
                    margin: calc(2.5 * var(--u)) 0 0;
                    color: #222;
                    font-size: calc(11 * var(--u));
                    line-height: calc(15 * var(--u));
                }

                .gf-label {
                    display: block;
                    margin: calc(22.5 * var(--u)) 0 calc(6 * var(--u));
                    color: #222;
                    font-size: calc(11 * var(--u));
                    line-height: calc(14 * var(--u));
                    font-weight: 400;
                }

                .gf-label-foto {
                    margin-top: calc(14 * var(--u));
                    margin-bottom: calc(10 * var(--u));
                }

                .gf-select {
                    display: block;
                    width: calc(100% - 7 * var(--u));
                    height: calc(18 * var(--u));
                    margin-left: calc(7 * var(--u));
                    padding: 0 calc(22 * var(--u)) 0 calc(9 * var(--u));
                    appearance: none;
                    -webkit-appearance: none;
                    background-color: #fff;
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' fill='none' stroke='%236f8fc4' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>");
                    background-repeat: no-repeat;
                    background-position: right calc(8 * var(--u)) center;
                    border: 1px solid #a9c9ea;
                    border-radius: calc(3 * var(--u));
                    outline: none;
                    color: #333;
                    font-family: inherit;
                    font-size: calc(10.5 * var(--u));
                    cursor: pointer;
                }

                .gf-select:invalid {
                    color: #8d9bb0;
                }

                .gf-select:focus {
                    border-color: #477ac0;
                    box-shadow: 0 0 0 2px rgba(53, 118, 178, .12);
                }

                .gf-drop {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: calc(10 * var(--u));
                    width: calc(100% - 12 * var(--u));
                    height: calc(116 * var(--u));
                    margin-left: calc(12 * var(--u));
                    padding: calc(10 * var(--u));
                    background: #fff;
                    border: 1px solid #a9c9ea;
                    border-radius: calc(8 * var(--u));
                    overflow: hidden;
                    text-align: center;
                    cursor: pointer;
                    transition: border-color .15s ease, background .15s ease;
                }

                .gf-drop:hover,
                .gf-drop.gf-drag {
                    background: #f7fbff;
                    border-color: #477ac0;
                }

                .gf-drop:focus-within {
                    border-color: #477ac0;
                    box-shadow: 0 0 0 2px rgba(53, 118, 178, .12);
                }

                .gf-drop input {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    cursor: pointer;
                }

                .gf-drop-icon {
                    display: block;
                    width: calc(40 * var(--u));
                    height: calc(33 * var(--u));
                    color: #5b82c4;
                }

                .gf-drop-icon svg {
                    display: block;
                    width: 100%;
                    height: 100%;
                }

                .gf-drop-text {
                    margin: 0;
                    color: #8a97ab;
                    font-size: calc(8 * var(--u));
                    line-height: calc(16 * var(--u));
                }

                .gf-drop-preview {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .gf-drop-ganti {
                    position: absolute;
                    right: calc(8 * var(--u));
                    bottom: calc(8 * var(--u));
                    padding: calc(3 * var(--u)) calc(10 * var(--u));
                    background: rgba(14, 32, 66, .68);
                    border-radius: 999px;
                    color: #fff;
                    font-size: calc(8.5 * var(--u));
                    pointer-events: none;
                }

                .gf-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: calc(7 * var(--u));
                    margin-top: calc(13 * var(--u));
                }

                .gf-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: calc(5 * var(--u));
                    width: calc(66 * var(--u));
                    height: calc(18 * var(--u));
                    padding: 0;
                    border-radius: calc(3 * var(--u));
                    font-family: inherit;
                    font-size: calc(10.5 * var(--u));
                    cursor: pointer;
                    transition: background .15s ease;
                }

                .gf-btn-batal {
                    background: #fff;
                    border: 1px solid #8fb4de;
                    color: #222;
                }

                .gf-btn-batal:hover {
                    background: #f1f7fd;
                }

                .gf-btn-simpan {
                    background: #2c4fa5;
                    border: 1px solid #2c4fa5;
                    color: #fff;
                }

                .gf-btn-simpan:hover {
                    background: #23438f;
                }

                .gf-btn:disabled {
                    opacity: .65;
                    cursor: not-allowed;
                }

                /* ----- tombol ----- */

                .gal-actions {
                    display: flex;
                    justify-content: center;
                    gap: calc(10 * var(--u));
                    margin-top: calc(22 * var(--u));
                }

                .gal-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: calc(6 * var(--u));
                    min-width: calc(74 * var(--u));
                    height: calc(26 * var(--u));
                    padding: 0 calc(14 * var(--u));
                    border-radius: calc(5 * var(--u));
                    font-family: inherit;
                    font-size: calc(10.5 * var(--u));
                    cursor: pointer;
                    transition: transform .12s ease, box-shadow .15s ease, background .15s ease;
                }

                .gal-btn-batal {
                    background: #fff;
                    border: 1px solid #b9d1ee;
                    color: #2a3b57;
                }

                .gal-btn-batal:hover {
                    background: #f1f7fd;
                }

                .gal-btn-simpan {
                    background: linear-gradient(180deg, #3a62c0, #2c4fa5);
                    border: 1px solid #2c4fa5;
                    color: #fff;
                    box-shadow: 0 calc(3 * var(--u)) calc(8 * var(--u)) rgba(44, 79, 165, .3);
                }

                .gal-btn-danger {
                    background: linear-gradient(180deg, #e0505d, #d03a48);
                    border: 1px solid #d03a48;
                    color: #fff;
                    box-shadow: 0 calc(3 * var(--u)) calc(8 * var(--u)) rgba(208, 58, 72, .3);
                }

                .gal-btn-ok {
                    background: linear-gradient(180deg, #2fb383, #1f9d6e);
                    border: 1px solid #1f9d6e;
                    color: #fff;
                    box-shadow: 0 calc(3 * var(--u)) calc(8 * var(--u)) rgba(31, 157, 110, .3);
                }

                .gal-btn-simpan:hover,
                .gal-btn-danger:hover,
                .gal-btn-ok:hover {
                    transform: translateY(-1px);
                }

                .gal-btn:disabled {
                    opacity: .65;
                    cursor: not-allowed;
                    transform: none;
                }

                .gal-spin {
                    width: calc(9 * var(--u));
                    height: calc(9 * var(--u));
                    border: 2px solid rgba(255, 255, 255, .45);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: gal-spin .7s linear infinite;
                }

                /* ----- varian rata tengah (konfirmasi & notifikasi) ----- */

                .gal-center {
                    text-align: center;
                }

                .gal-center .gal-icon {
                    width: calc(46 * var(--u));
                    height: calc(46 * var(--u));
                    margin: calc(4 * var(--u)) auto 0;
                    border-radius: 50%;
                    box-shadow: 0 0 0 calc(6 * var(--u)) #eef4fd;
                }

                .gal-center .gal-icon-danger { box-shadow: 0 0 0 calc(6 * var(--u)) #fef3f4; }
                .gal-center .gal-icon-ok     { box-shadow: 0 0 0 calc(6 * var(--u)) #f0faf5; }

                .gal-center .gal-icon svg {
                    width: calc(21 * var(--u));
                    height: calc(21 * var(--u));
                }

                .gal-center .gal-modal-title {
                    margin-top: calc(18 * var(--u));
                    font-size: calc(16 * var(--u));
                    line-height: calc(20 * var(--u));
                }

                .gal-text {
                    margin: calc(8 * var(--u)) 0 0;
                    color: #4a586c;
                    font-size: calc(10.5 * var(--u));
                    line-height: calc(16 * var(--u));
                }

                .gal-text strong {
                    color: #1f1f1f;
                    font-weight: 700;
                }

                .gal-center .gal-btn {
                    flex: 1;
                }

                .gal-hapus-foto {
                    display: block;
                    width: calc(120 * var(--u));
                    height: calc(80 * var(--u));
                    margin: calc(14 * var(--u)) auto 0;
                    object-fit: cover;
                    border: 1px solid #d6e3f3;
                    border-radius: calc(6 * var(--u));
                }

                /* ----- lihat foto ----- */

                .gal-lightbox-img {
                    display: block;
                    width: 100%;
                    max-height: 65vh;
                    margin-top: calc(18 * var(--u));
                    object-fit: contain;
                    background: #f1f5fa;
                    border-radius: calc(6 * var(--u));
                }

                @keyframes gal-fade {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                @keyframes gal-pop {
                    from { opacity: 0; transform: translateY(14px) scale(.96); }
                    to   { opacity: 1; transform: none; }
                }

                @keyframes gal-spin {
                    to { transform: rotate(360deg); }
                }

                /* ----- area sempit ----- */

                @container (max-width: 460px) {
                    .gal-toolbar {
                        flex-direction: column;
                    }

                    .gal-search-wrap {
                        flex: none;
                        width: 100%;
                    }

                    .gal-search,
                    .gal-btn-tambah {
                        height: 38px;
                        font-size: 13.5px;
                    }

                    .gal-btn-tambah {
                        flex: none;
                        width: 100%;
                    }

                    .gal-clear {
                        width: 20px;
                        height: 20px;
                        right: 9px;
                        font-size: 10px;
                    }

                    .gal-title { font-size: 17px; }

                    .gal-subtitle {
                        font-size: 12px;
                        line-height: 18px;
                    }

                    .gal-table th,
                    .gal-table td {
                        font-size: 12px;
                    }

                    .gal-info { font-size: 10px; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .gal-bg,
                    .gal-modal {
                        animation: none;
                    }
                }
            `}</style>

            {/* ================= HALAMAN ================= */}

            <div className="gal-page">
                <div className="gal-inner">

                    <h1 className="gal-title">Kelola Galeri</h1>
                    <p className="gal-subtitle">kelola foto galeri dari wisata</p>

                    <div className="gal-toolbar">
                        <div className="gal-search-wrap">
                            <input
                                className="gal-search"
                                type="text"
                                value={cari}
                                onChange={(e) => setCari(e.target.value)}
                                placeholder="cari  wisata"
                                aria-label="Cari wisata"
                            />

                            {cari && (
                                <button
                                    type="button"
                                    className="gal-clear"
                                    onClick={() => setCari('')}
                                    aria-label="Hapus pencarian"
                                >
                                    <IconSilang />
                                </button>
                            )}
                        </div>

                        <button className="gal-btn-tambah" onClick={openTambah}>
                            + Tambah foto
                        </button>
                    </div>

                    <div className="gal-card">
                        {loading ? (
                            <div className="gal-message">Memuat data galeri...</div>
                        ) : (
                            <div
                                className={`gal-table-inner${
                                    hasil.length === 0 ? ' gal-no-lines' : ''
                                }`}
                            >
                                <table className="gal-table">
                                    <colgroup>
                                        <col style={{ width: '10%' }} />
                                        <col style={{ width: '18%' }} />
                                        <col style={{ width: '38%' }} />
                                        <col style={{ width: '34%' }} />
                                    </colgroup>

                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Foto</th>
                                            <th>Nama Wisata</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {hasil.map((item, index) => (
                                            <tr key={item.galeri_id}>
                                                <td>{index + 1}</td>

                                                <td>
                                                    <Thumb
                                                        src={getImageUrl(fotoDari(item))}
                                                        alt={getWisataName(item)}
                                                        onClick={() => setLihatItem(item)}
                                                    />
                                                </td>

                                                <td>{getWisataName(item)}</td>

                                                <td>
                                                    <span className="gal-aksi">
                                                        <button
                                                            className="gal-pill gal-pill-edit"
                                                            onClick={() => openEdit(item)}
                                                        >
                                                            <IconEdit /> Edit
                                                        </button>

                                                        <button
                                                            className="gal-pill gal-pill-hapus"
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
                                    <div className="gal-message">
                                        {galeri.length === 0
                                            ? 'Belum ada foto.'
                                            : 'Foto tidak ditemukan.'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!loading && (
                        <p className="gal-info">
                            Menampilkan {hasil.length === 0 ? 0 : `1–${hasil.length}`} dari{' '}
                            {galeri.length} data
                        </p>
                    )}

                </div>
            </div>

            {/* ================= POP UP TAMBAH / EDIT FOTO ================= */}

            {showModal && (
                <div className="gal-bg" onMouseDown={(e) => klikLatar(e, closeModal)}>
                    <form
                        className="gf-modal"
                        onSubmit={handleSubmit}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="gal-form-title"
                    >
                        <h2 className="gf-title" id="gal-form-title">
                            {editing ? 'Edit Foto' : 'Tambah Foto'}
                        </h2>

                        <p className="gf-sub">
                            {editing
                                ? 'Perbarui foto galeri wisata'
                                : 'Unggah foto galeri wisata'}
                        </p>

                        <label className="gf-label" htmlFor="gal-wisata">
                            Nama Wisata
                        </label>

                        <select
                            id="gal-wisata"
                            className="gf-select"
                            value={form.wisata_id}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    wisata_id: e.target.value,
                                }))
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

                        <span className="gf-label gf-label-foto">Unggah Foto</span>

                        <label
                            className={`gf-drop${seret ? ' gf-drag' : ''}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setSeret(true);
                            }}
                            onDragLeave={() => setSeret(false)}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleFileChange}
                            />

                            {preview ? (
                                <>
                                    <img
                                        className="gf-drop-preview"
                                        src={preview}
                                        alt="Pratinjau foto"
                                    />
                                    <span className="gf-drop-ganti">Ganti foto</span>
                                </>
                            ) : (
                                <>
                                    <span className="gf-drop-icon">
                                        <IconGambar />
                                    </span>
                                    <p className="gf-drop-text">
                                        Klik disini untuk mengunggah foto
                                        <br />
                                        atau video
                                    </p>
                                </>
                            )}
                        </label>

                        <div className="gf-actions">
                            <button
                                type="button"
                                className="gf-btn gf-btn-batal"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                className="gf-btn gf-btn-simpan"
                                disabled={saving}
                            >
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ================= POP UP LIHAT FOTO ================= */}

            {lihatItem && (
                <div
                    className="gal-bg gal-top"
                    onMouseDown={(e) => klikLatar(e, () => setLihatItem(null))}
                >
                    <div
                        className="gal-modal gal-wide"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="gal-lihat-title"
                    >
                        <button
                            type="button"
                            className="gal-close"
                            onClick={() => setLihatItem(null)}
                            aria-label="Tutup"
                        >
                            <IconSilang />
                        </button>

                        <h2 className="gal-modal-title" id="gal-lihat-title">
                            {getWisataName(lihatItem)}
                        </h2>

                        <img
                            className="gal-lightbox-img"
                            src={getImageUrl(fotoDari(lihatItem))}
                            alt={getWisataName(lihatItem)}
                        />
                    </div>
                </div>
            )}

            {/* ================= POP UP KONFIRMASI HAPUS ================= */}

            {hapusItem && (
                <div
                    className="gal-bg gal-top"
                    onMouseDown={(e) =>
                        klikLatar(e, () => !deleting && setHapusItem(null))
                    }
                >
                    <div
                        className="gal-modal gal-sm gal-danger gal-center"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="gal-hapus-title"
                    >
                        <div className="gal-icon gal-icon-danger">
                            <IconHapus />
                        </div>

                        <h2 className="gal-modal-title" id="gal-hapus-title">
                            Hapus Foto?
                        </h2>

                        <p className="gal-text">
                            Foto dari <strong>{getWisataName(hapusItem)}</strong> akan
                            dihapus permanen dan tidak dapat dikembalikan.
                        </p>

                        {fotoDari(hapusItem) && (
                            <img
                                className="gal-hapus-foto"
                                src={getImageUrl(fotoDari(hapusItem))}
                                alt=""
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        )}

                        <div className="gal-actions">
                            <button
                                type="button"
                                className="gal-btn gal-btn-batal"
                                onClick={() => setHapusItem(null)}
                                disabled={deleting}
                                autoFocus
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                className="gal-btn gal-btn-danger"
                                onClick={doHapus}
                                disabled={deleting}
                            >
                                {deleting && <span className="gal-spin" />}
                                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= POP UP NOTIFIKASI ================= */}

            {notice && (
                <div
                    className="gal-bg gal-top"
                    onMouseDown={(e) => klikLatar(e, () => setNotice(null))}
                >
                    <div
                        className={`gal-modal gal-sm gal-center ${
                            notice.type === 'success' ? 'gal-ok' : 'gal-danger'
                        }`}
                        role="alertdialog"
                        aria-modal="true"
                    >
                        <div
                            className={`gal-icon ${
                                notice.type === 'success'
                                    ? 'gal-icon-ok'
                                    : 'gal-icon-danger'
                            }`}
                        >
                            {notice.type === 'success' ? <IconCek /> : <IconSilang />}
                        </div>

                        <h2 className="gal-modal-title">{notice.title}</h2>
                        <p className="gal-text">{notice.message}</p>

                        <div className="gal-actions">
                            <button
                                type="button"
                                className={`gal-btn ${
                                    notice.type === 'success'
                                        ? 'gal-btn-ok'
                                        : 'gal-btn-danger'
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

export default Galeri;
