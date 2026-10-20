import { useEffect, useMemo, useState } from 'react';
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

const IconSimpan = () => (
    <svg {...svgProps} strokeWidth="1.5">
        <path d="M3 2.5h8.5L13.5 4.5v9h-10.5v-11zM5.5 2.5v3.5h5v-3.5M5.5 13.5v-4h5v4" />
    </svg>
);

const IconSilang = () => (
    <svg {...svgProps} strokeWidth="1.8">
        <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
);

const IconPin = () => (
    <svg {...svgProps} strokeWidth="1.5">
        <path d="M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 10-9 0C3.5 9.8 8 14 8 14z" />
        <circle cx="8" cy="6.5" r="1.6" />
    </svg>
);

const IconJam = () => (
    <svg {...svgProps} strokeWidth="1.5">
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 5v3.2l2 1.3" />
    </svg>
);

const FORM_KOSONG = {
    kategori_id: '',
    nama_wisata: '',
    deskripsi_wisata: '',
    deskripsi_singkat: '',
    lokasi_wisata: '',
    rating_wisata: '',
    harga_tiket: '',
    jam_buka: '',
    link_gmap: '',
};

function Wisata() {
    const [wisata, setWisata] = useState([]);
    const [kategori, setKategori] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [search, setSearch] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(FORM_KOSONG);

    const [konfirmSimpan, setKonfirmSimpan] = useState(false);
    const [hapusItem, setHapusItem] = useState(null);
    const [notice, setNotice] = useState(null); // {type, title, message}

    /* ================= DATA ================= */

    const loadData = async () => {
        try {
            setLoading(true);

            const [wisataResponse, kategoriResponse] = await Promise.all([
                api.get('/wisata'),
                api.get('/kategori'),
            ]);

            setWisata(wisataResponse.data.data || []);
            setKategori(kategoriResponse.data.data || []);
        } catch (error) {
            console.error('Gagal mengambil data wisata:', error);
            setNotice({
                type: 'error',
                title: 'Gagal Memuat Data',
                message: 'Data wisata tidak dapat diambil. Coba muat ulang halaman.',
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

    const getKategoriName = (kategoriId) => {
        const item = kategori.find(
            (k) => Number(k.kategori_id) === Number(kategoriId)
        );
        return item ? item.nama_kategori : '-';
    };

    const hasil = useMemo(() => {
        const kata = search.trim().toLowerCase();

        if (!kata) return wisata;

        return wisata.filter((item) =>
            [item.nama_wisata, item.lokasi_wisata]
                .join(' ')
                .toLowerCase()
                .includes(kata)
        );
    }, [wisata, search]);

    const formatHarga = (harga) => {
        if (harga === null || harga === undefined || harga === '') {
            return 'Gratis';
        }

        const number = Number(harga);
        if (number === 0) return 'Gratis';

        return `Rp ${number.toLocaleString('id-ID')}`;
    };

    /* ================= FORM ================= */

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const openTambah = () => {
        setEditId(null);
        setForm(FORM_KOSONG);
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditId(item.wisata_id);
        setForm({
            kategori_id: item.kategori_id || '',
            nama_wisata: item.nama_wisata || '',
            deskripsi_wisata: item.deskripsi_wisata || '',
            deskripsi_singkat: item.deskripsi_singkat || '',
            lokasi_wisata: item.lokasi_wisata || '',
            rating_wisata: item.rating_wisata || '',
            harga_tiket: item.harga_tiket || '',
            jam_buka: item.jam_buka || '',
            link_gmap: item.link_gmap || '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
        setEditId(null);
    };

    // Langkah 1: validasi, lalu tampilkan pop up konfirmasi simpan
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.kategori_id || !form.nama_wisata.trim()) {
            setNotice({
                type: 'error',
                title: 'Data Belum Lengkap',
                message: 'Kategori dan nama wisata wajib diisi.',
            });
            return;
        }

        setKonfirmSimpan(true);
    };

    // Langkah 2: simpan setelah dikonfirmasi
    const doSimpan = async () => {
        try {
            setSaving(true);

            const data = {
                kategori_id: form.kategori_id,
                nama_wisata: form.nama_wisata,
                deskripsi_wisata: form.deskripsi_wisata,
                deskripsi_singkat: form.deskripsi_singkat,
                lokasi_wisata: form.lokasi_wisata,
                rating_wisata: form.rating_wisata || null,
                harga_tiket: form.harga_tiket || 0,
                jam_buka: form.jam_buka,
                link_gmap: form.link_gmap,
            };

            if (editId) {
                await api.patch(`/wisata/${editId}`, data);
            } else {
                await api.post('/wisata', data);
            }

            setKonfirmSimpan(false);
            setShowModal(false);
            setEditId(null);

            setNotice({
                type: 'success',
                title: 'Berhasil Disimpan',
                message: editId
                    ? 'Data wisata berhasil diperbarui.'
                    : 'Data wisata berhasil ditambahkan.',
            });

            await loadData();
        } catch (error) {
            console.error('Gagal menyimpan wisata:', error);
            console.error('Response:', error.response?.data);

            setKonfirmSimpan(false);
            setNotice({
                type: 'error',
                title: 'Gagal Menyimpan',
                message:
                    error.response?.data?.message ||
                    'Gagal menyimpan data wisata.',
            });
        } finally {
            setSaving(false);
        }
    };

    const doHapus = async () => {
        if (!hapusItem) return;

        try {
            setDeleting(true);
            await api.delete(`/wisata/${hapusItem.wisata_id}`);

            setHapusItem(null);
            setNotice({
                type: 'success',
                title: 'Berhasil Dihapus',
                message: 'Data wisata berhasil dihapus.',
            });

            await loadData();
        } catch (error) {
            console.error('Gagal menghapus wisata:', error);

            setHapusItem(null);
            setNotice({
                type: 'error',
                title: 'Gagal Menghapus',
                message:
                    error.response?.data?.message ||
                    'Gagal menghapus wisata.',
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
            else if (konfirmSimpan) {
                if (!saving) setKonfirmSimpan(false);
            } else if (hapusItem) {
                if (!deleting) setHapusItem(null);
            } else if (showModal) closeModal();
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const klikLatar = (e, tutup) => {
        if (e.target === e.currentTarget) tutup();
    };

    const renderAksi = (item) => (
        <span className="wis-aksi">
            <button
                type="button"
                className="wis-pill wis-pill-edit"
                onClick={() => openEdit(item)}
            >
                <IconEdit /> Edit
            </button>

            <button
                type="button"
                className="wis-pill wis-pill-hapus"
                onClick={() => setHapusItem(item)}
            >
                <IconHapus /> Hapus
            </button>
        </span>
    );

    const gratis = (harga) => !harga || Number(harga) === 0;

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
                .wis-page {
                    container-type: inline-size;
                    width: 100%;
                    min-height: 100vh;
                    min-height: 100dvh;
                    background: #f8fbff;
                }

                .wis-page *,
                .wis-bg *,
                .wis-page *::before,
                .wis-bg *::before {
                    box-sizing: border-box;
                }

                .wis-inner {
                    --u: clamp(1px, calc(100cqw / 424), 1.64px);
                    --line: #a9c9ea;
                    --blue: #2c4fa5;
                    --ink: #2b3b5c;
                    width: 100%;
                    padding: calc(11 * var(--u)) 5.4cqw calc(20 * var(--u)) 4.2cqw;
                    font-family: 'Bitter', Georgia, 'Times New Roman', serif;
                    color: var(--ink);
                }

                .wis-title {
                    margin: 0;
                    color: #1f1f1f;
                    font-size: calc(14.5 * var(--u));
                    line-height: calc(18 * var(--u));
                    font-weight: 400;
                }

                .wis-subtitle {
                    margin: calc(1 * var(--u)) 0 0;
                    color: #222;
                    font-size: calc(11 * var(--u));
                    line-height: calc(15 * var(--u));
                }

                /* ----- toolbar ----- */

                .wis-toolbar {
                    display: flex;
                    gap: calc(9 * var(--u));
                    margin-top: calc(17 * var(--u));
                }

                .wis-search-wrap {
                    position: relative;
                    flex: 234 1 0;
                    min-width: 0;
                }

                .wis-clear {
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

                .wis-clear:hover {
                    background: #d6e3f3;
                }

                .wis-search {
                    width: 100%;
                    padding-right: calc(22 * var(--u));
                    min-width: 0;
                    height: calc(19 * var(--u));
                    padding: 0 calc(9 * var(--u));
                    background: #fff;
                    border: 1px solid var(--line);
                    border-radius: calc(3 * var(--u));
                    outline: none;
                    color: #333;
                    font-family: inherit;
                    font-size: calc(10.5 * var(--u));
                }

                .wis-search::placeholder {
                    color: #8d9bb0;
                    opacity: 1;
                }

                .wis-search:focus {
                    border-color: #477ac0;
                    box-shadow: 0 0 0 2px rgba(53, 118, 178, .12);
                }

                .wis-btn-tambah {
                    flex: 140 1 0;
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

                .wis-btn-tambah:hover {
                    background: #23438f;
                }

                /* ----- kartu data ----- */

                .wis-card {
                    min-height: calc(216 * var(--u));
                    margin-top: calc(10 * var(--u));
                    background: #fff;
                    border: 1px solid var(--line);
                    border-radius: calc(4 * var(--u));
                    overflow: hidden;
                }

                /* ----- tabel (layar lebar) ----- */

                .wis-table-wrap {
                    width: 100%;
                    overflow-x: auto;
                }

                .wis-list {
                    display: none;
                }

                /* Garis tegak digambar sebagai lapisan di atas tabel (::after)
                   supaya selalu tampil dari nama kolom sampai dasar kartu,
                   tidak tertutup latar sel, dan menerus walau barisnya sedikit. */
                .wis-table-inner {
                    position: relative;
                    width: 100%;
                    min-width: 940px;
                    min-height: calc(216 * var(--u) - 2px);
                    background-color: #fff;
                }

                .wis-table-inner::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background-image:
                        linear-gradient(#dbe3ee, #dbe3ee), linear-gradient(#dbe3ee, #dbe3ee),
                        linear-gradient(#dbe3ee, #dbe3ee), linear-gradient(#dbe3ee, #dbe3ee),
                        linear-gradient(#dbe3ee, #dbe3ee), linear-gradient(#dbe3ee, #dbe3ee),
                        linear-gradient(#dbe3ee, #dbe3ee), linear-gradient(#dbe3ee, #dbe3ee);
                    background-repeat: no-repeat;
                    background-size: 1px 100%;
                    background-position:
                        4% 0, 17% 0, 25.5% 0, 37.5% 0,
                        59.5% 0, 66% 0, 75% 0, 86% 0;
                }

                .wis-table {
                    width: 100%;
                    table-layout: fixed;
                    border-collapse: collapse;
                }

                .wis-table th {
                    padding: 13px 8px;
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid #dbe3ee;
                    color: #2f4a7d;
                    font-size: 13.5px;
                    font-weight: 600;
                    line-height: 1.3;
                    text-align: center;
                    white-space: nowrap;
                }

                .wis-table td {
                    padding: 14px 10px;
                    border: none;
                    border-bottom: 1px solid #dbe3ee;
                    color: var(--ink);
                    font-size: 13.5px;
                    line-height: 1.45;
                    text-align: center;
                    vertical-align: middle;
                    overflow-wrap: break-word;
                    word-break: normal;
                }

                /* hover transparan supaya garis tegak tetap terlihat */
                .wis-table tbody tr:hover td {
                    background: rgba(47, 111, 190, .06);
                }

                /* kolom Deskripsi: isi rata kiri agar mudah dibaca */
                .wis-table td:nth-child(5) {
                    text-align: left;
                }

                .wis-table td.wis-td-nama {
                    color: #1b2433;
                    font-weight: 700;
                }

                .wis-table td.wis-td-aksi {
                    padding-left: 6px;
                    padding-right: 6px;
                    white-space: nowrap;
                }

                .wis-sub-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    margin-top: 3px;
                    color: #3a64b4;
                    font-size: 11.5px;
                    text-decoration: none;
                }

                .wis-sub-link:hover {
                    text-decoration: underline;
                }

                .wis-desk-singkat,
                .wis-desk {
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    font-size: 12.5px;
                    line-height: 1.45;
                }

                .wis-desk-singkat {
                    -webkit-line-clamp: 1;
                    line-clamp: 1;
                    margin-bottom: 2px;
                    color: #1f2f55;
                    font-weight: 600;
                }

                .wis-desk {
                    -webkit-line-clamp: 2;
                    line-clamp: 2;
                    color: #62728f;
                }

                .wis-star {
                    color: #f2b01e;
                }

                .wis-rating {
                    white-space: nowrap;
                    font-weight: 600;
                }

                .wis-harga {
                    white-space: nowrap;
                }

                .wis-free {
                    color: #1f8a5f;
                    font-weight: 600;
                }

                /* ----- tombol aksi ----- */

                .wis-aksi {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }

                .wis-pill {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    height: 26px;
                    padding: 0 11px;
                    border: none;
                    border-radius: 6px;
                    font-family: inherit;
                    font-size: 12px;
                    cursor: pointer;
                    transition: filter .15s ease, transform .12s ease;
                }

                .wis-pill:hover {
                    filter: brightness(.95);
                    transform: translateY(-1px);
                }

                .wis-pill svg {
                    width: 12px;
                    height: 12px;
                }

                .wis-pill-edit {
                    background: #cfe3fb;
                    color: #3a64b4;
                }

                .wis-pill-hapus {
                    background: #fbc2c7;
                    color: #d03a48;
                }

                /* ----- daftar kartu (layar sempit) ----- */

                .wis-list {
                    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
                    gap: 12px;
                    padding: 12px;
                }

                .wis-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 14px 15px;
                    background: #fff;
                    border: 1px solid #dbe7f5;
                    border-radius: 10px;
                    transition: box-shadow .2s ease, border-color .2s ease, transform .2s ease;
                }

                .wis-item:hover {
                    border-color: #a9c9ea;
                    box-shadow: 0 8px 20px rgba(53, 118, 178, .12);
                    transform: translateY(-2px);
                }

                .wis-item-name {
                    margin: 0;
                    color: #1f2f55;
                    font-size: 15.5px;
                    line-height: 1.3;
                    font-weight: 600;
                }

                .wis-item-meta {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 4px 6px;
                    margin: 3px 0 0;
                    color: #6b7a93;
                    font-size: 12.5px;
                }

                .wis-item-meta svg {
                    width: 12px;
                    height: 12px;
                }

                .wis-item-singkat {
                    margin: 0;
                    color: #1f2f55;
                    font-size: 13px;
                    font-weight: 600;
                    line-height: 1.4;
                }

                .wis-item-desk {
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 3;
                    line-clamp: 3;
                    overflow: hidden;
                    margin: 0;
                    color: #4a586c;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .wis-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .wis-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 3px 10px;
                    background: #f1f5fa;
                    border-radius: 999px;
                    color: #4a586c;
                    font-size: 12px;
                    line-height: 1.5;
                    text-decoration: none;
                }

                .wis-chip svg {
                    width: 12px;
                    height: 12px;
                }

                .wis-chip-rating { background: #fff5d9; color: #9a6b00; font-weight: 600; }
                .wis-chip-free   { background: #e3f6ee; color: #1f8a5f; font-weight: 600; }
                .wis-chip-link   { background: #e8f1fc; color: #3a64b4; }
                .wis-chip-link:hover { background: #d9e8fa; }

                .wis-item-actions {
                    display: flex;
                    margin-top: auto;
                    padding-top: 6px;
                    border-top: 1px solid #edf2f9;
                }

                .wis-item-actions .wis-aksi {
                    width: 100%;
                    justify-content: flex-end;
                }

                /* ----- loading & kosong ----- */

                .wis-skeleton-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 14px;
                }

                .wis-skeleton {
                    height: 44px;
                    border-radius: 6px;
                    background: linear-gradient(90deg, #eaf1f9 25%, #f6f9fd 50%, #eaf1f9 75%);
                    background-size: 200% 100%;
                    animation: wis-shimmer 1.2s linear infinite;
                }

                .wis-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    min-height: calc(190 * var(--u));
                    padding: 24px 16px;
                    text-align: center;
                }

                .wis-empty-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    margin-bottom: 4px;
                    background: #eef4fd;
                    border-radius: 50%;
                    color: #6f8fc4;
                    font-size: 22px;
                }

                .wis-empty-title {
                    margin: 0;
                    color: #1f2f55;
                    font-size: 15px;
                    font-weight: 600;
                }

                .wis-empty-text {
                    margin: 0;
                    color: #7a8aa3;
                    font-size: 13px;
                }

                .wis-empty-btn {
                    margin-top: 8px;
                    height: 32px;
                    padding: 0 16px;
                    background: var(--blue);
                    border: none;
                    border-radius: 6px;
                    color: #fff;
                    font-family: inherit;
                    font-size: 13px;
                    cursor: pointer;
                    transition: background .2s ease;
                }

                .wis-empty-btn:hover {
                    background: #23438f;
                }

                .wis-info {
                    margin: calc(2 * var(--u)) 0 0;
                    padding-top: calc(2 * var(--u));
                    color: #7f9cc4;
                    font-size: calc(8 * var(--u));
                    line-height: calc(12 * var(--u));
                }

                @keyframes wis-shimmer {
                    from { background-position: 200% 0; }
                    to   { background-position: -200% 0; }
                }

                /* ================= POP UP ================= */

                .wis-bg {
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
                    animation: wis-fade .18s ease both;
                }

                .wis-bg.wis-top {
                    z-index: 1100;
                    background: rgba(14, 32, 66, .35);
                }

                .wis-modal {
                    position: relative;
                    width: calc(400 * var(--u));
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
                    animation: wis-pop .22s cubic-bezier(.2, .9, .3, 1.2) both;
                }

                .wis-modal.wis-sm {
                    width: calc(310 * var(--u));
                }

                .wis-modal::before {
                    content: '';
                    position: absolute;
                    inset: 0 0 auto 0;
                    height: calc(4 * var(--u));
                    background: linear-gradient(90deg, #2c4fa5, #5aa8ff);
                }

                .wis-modal.wis-danger::before {
                    background: linear-gradient(90deg, #d03a48, #f08a93);
                }

                .wis-modal.wis-ok::before {
                    background: linear-gradient(90deg, #1f9d6e, #5fd3a6);
                }

                .wis-close {
                    position: absolute;
                    top: calc(12 * var(--u));
                    right: calc(12 * var(--u));
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

                .wis-close:hover {
                    background: #e1ebf7;
                    color: #1f2d45;
                }

                .wis-head {
                    display: flex;
                    align-items: center;
                    gap: calc(12 * var(--u));
                    padding-right: calc(24 * var(--u));
                }

                .wis-icon {
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

                .wis-icon svg {
                    width: calc(17 * var(--u));
                    height: calc(17 * var(--u));
                }

                .wis-icon.wis-icon-danger { background: #fde8ea; color: #d03a48; }
                .wis-icon.wis-icon-ok     { background: #e2f6ee; color: #1f9d6e; }

                .wis-modal-title {
                    margin: 0;
                    color: #173e68;
                    font-size: calc(15 * var(--u));
                    line-height: calc(19 * var(--u));
                    font-weight: 600;
                }

                .wis-modal-sub {
                    margin: calc(2 * var(--u)) 0 0;
                    color: #5c6b80;
                    font-size: calc(10.5 * var(--u));
                    line-height: calc(14 * var(--u));
                }

                /* ----- form 2 kolom ----- */

                .wis-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    column-gap: calc(18 * var(--u));
                    row-gap: calc(12 * var(--u));
                    margin-top: calc(20 * var(--u));
                }

                .wis-field label {
                    display: block;
                    margin-bottom: calc(5 * var(--u));
                    color: #2a3b57;
                    font-size: calc(10.5 * var(--u));
                    line-height: calc(14 * var(--u));
                    font-weight: 600;
                }

                .wis-field.wis-full {
                    grid-column: 1 / -1;
                }

                .wis-field.wis-tall {
                    grid-row: span 2;
                    display: flex;
                    flex-direction: column;
                }

                .wis-field input,
                .wis-field select,
                .wis-field textarea {
                    display: block;
                    width: 100%;
                    padding: 0 calc(10 * var(--u));
                    background: #fbfdff;
                    border: 1px solid var(--line);
                    border-radius: calc(5 * var(--u));
                    outline: none;
                    color: #222;
                    font-family: inherit;
                    font-size: calc(10.5 * var(--u));
                    transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
                }

                .wis-field input,
                .wis-field select {
                    height: calc(26 * var(--u));
                }

                .wis-field textarea {
                    flex: 1;
                    min-height: calc(86 * var(--u));
                    padding-top: calc(7 * var(--u));
                    padding-bottom: calc(7 * var(--u));
                    resize: none;
                }

                .wis-field select {
                    appearance: none;
                    -webkit-appearance: none;
                    padding-right: calc(24 * var(--u));
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' fill='none' stroke='%236f8fc4' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>");
                    background-repeat: no-repeat;
                    background-position: right calc(9 * var(--u)) center;
                    cursor: pointer;
                }

                .wis-field select:invalid {
                    color: #8d9bb0;
                }

                .wis-field input::placeholder,
                .wis-field textarea::placeholder {
                    color: #8d9bb0;
                    opacity: 1;
                }

                .wis-field input:focus,
                .wis-field select:focus,
                .wis-field textarea:focus {
                    background-color: #fff;
                    border-color: #477ac0;
                    box-shadow: 0 0 0 calc(3 * var(--u)) rgba(71, 122, 192, .16);
                }

                /* ----- tombol ----- */

                .wis-actions {
                    display: flex;
                    justify-content: center;
                    gap: calc(10 * var(--u));
                    margin-top: calc(24 * var(--u));
                }

                .wis-btn {
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

                .wis-btn-batal {
                    background: #fff;
                    border: 1px solid #b9d1ee;
                    color: #2a3b57;
                }

                .wis-btn-batal:hover {
                    background: #f1f7fd;
                }

                .wis-btn-simpan {
                    background: linear-gradient(180deg, #3a62c0, #2c4fa5);
                    border: 1px solid #2c4fa5;
                    color: #fff;
                    box-shadow: 0 calc(3 * var(--u)) calc(8 * var(--u)) rgba(44, 79, 165, .3);
                }

                .wis-btn-danger {
                    background: linear-gradient(180deg, #e0505d, #d03a48);
                    border: 1px solid #d03a48;
                    color: #fff;
                    box-shadow: 0 calc(3 * var(--u)) calc(8 * var(--u)) rgba(208, 58, 72, .3);
                }

                .wis-btn-ok {
                    background: linear-gradient(180deg, #2fb383, #1f9d6e);
                    border: 1px solid #1f9d6e;
                    color: #fff;
                    box-shadow: 0 calc(3 * var(--u)) calc(8 * var(--u)) rgba(31, 157, 110, .3);
                }

                .wis-btn-simpan:hover,
                .wis-btn-danger:hover,
                .wis-btn-ok:hover {
                    transform: translateY(-1px);
                }

                .wis-btn:disabled {
                    opacity: .65;
                    cursor: not-allowed;
                    transform: none;
                }

                .wis-spin {
                    width: calc(9 * var(--u));
                    height: calc(9 * var(--u));
                    border: 2px solid rgba(255, 255, 255, .45);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: wis-spin .7s linear infinite;
                }

                /* ----- varian rata tengah (konfirmasi & notifikasi) ----- */

                .wis-center {
                    text-align: center;
                }

                .wis-center .wis-icon {
                    width: calc(46 * var(--u));
                    height: calc(46 * var(--u));
                    margin: calc(4 * var(--u)) auto 0;
                    border-radius: 50%;
                    box-shadow: 0 0 0 calc(6 * var(--u)) #eef4fd;
                }

                .wis-center .wis-icon-danger { box-shadow: 0 0 0 calc(6 * var(--u)) #fef3f4; }
                .wis-center .wis-icon-ok     { box-shadow: 0 0 0 calc(6 * var(--u)) #f0faf5; }

                .wis-center .wis-icon svg {
                    width: calc(21 * var(--u));
                    height: calc(21 * var(--u));
                }

                .wis-center .wis-modal-title {
                    margin-top: calc(18 * var(--u));
                    font-size: calc(16 * var(--u));
                    line-height: calc(20 * var(--u));
                }

                .wis-text {
                    margin: calc(8 * var(--u)) 0 0;
                    color: #4a586c;
                    font-size: calc(10.5 * var(--u));
                    line-height: calc(16 * var(--u));
                }

                .wis-text strong {
                    color: #1f1f1f;
                    font-weight: 700;
                }

                .wis-center .wis-actions {
                    margin-top: calc(22 * var(--u));
                }

                .wis-center .wis-btn {
                    flex: 1;
                }

                @keyframes wis-fade {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                @keyframes wis-pop {
                    from { opacity: 0; transform: translateY(14px) scale(.96); }
                    to   { opacity: 1; transform: none; }
                }

                @keyframes wis-spin {
                    to { transform: rotate(360deg); }
                }

                /* ----- area sempit ----- */

                @container (max-width: 460px) {
                    .wis-toolbar {
                        flex-direction: column;
                    }

                    .wis-search-wrap {
                        flex: none;
                        width: 100%;
                    }

                    .wis-search,
                    .wis-btn-tambah {
                        height: 38px;
                        font-size: 13.5px;
                    }

                    .wis-btn-tambah {
                        flex: none;
                        width: 100%;
                    }

                    .wis-clear {
                        width: 20px;
                        height: 20px;
                        right: 9px;
                        font-size: 10px;
                    }

                    .wis-title { font-size: 17px; }

                    .wis-subtitle {
                        font-size: 12px;
                        line-height: 18px;
                    }

                    .wis-info { font-size: 10px; }
                }

                @container (max-width: 1039px) {
                    .wis-table-wrap {
                        display: none;
                    }

                    .wis-list {
                        display: grid;
                    }
                }

                @media (max-width: 560px) {
                    .wis-grid {
                        grid-template-columns: 1fr;
                    }

                    .wis-field.wis-tall {
                        grid-row: auto;
                    }

                    .wis-field input,
                    .wis-field select {
                        height: 36px;
                        font-size: 13px;
                    }

                    .wis-field textarea {
                        font-size: 13px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .wis-bg,
                    .wis-modal {
                        animation: none;
                    }
                }
            `}</style>

            {/* ================= HALAMAN ================= */}

            <div className="wis-page">
                <div className="wis-inner">

                    <h1 className="wis-title">Kelola Wisata</h1>
                    <p className="wis-subtitle">
                        Daftar destinasi wisata di Malang
                    </p>

                    <div className="wis-toolbar">
                        <div className="wis-search-wrap">
                            <input
                                className="wis-search"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="cari  wisata"
                                aria-label="Cari wisata"
                            />

                            {search && (
                                <button
                                    type="button"
                                    className="wis-clear"
                                    onClick={() => setSearch('')}
                                    aria-label="Hapus pencarian"
                                >
                                    <IconSilang />
                                </button>
                            )}
                        </div>

                        <button className="wis-btn-tambah" onClick={openTambah}>
                            + Tambah Wisata
                        </button>
                    </div>

                    <div className="wis-card">
                        {loading ? (
                            <div className="wis-skeleton-list" aria-busy="true">
                                {[0, 1, 2, 3].map((i) => (
                                    <div className="wis-skeleton" key={i} />
                                ))}
                            </div>
                        ) : hasil.length === 0 ? (
                            <div className="wis-empty">
                                <div className="wis-empty-icon">
                                    <IconPin />
                                </div>

                                <p className="wis-empty-title">
                                    {wisata.length === 0
                                        ? 'Belum ada data wisata'
                                        : 'Wisata tidak ditemukan'}
                                </p>

                                <p className="wis-empty-text">
                                    {wisata.length === 0
                                        ? 'Mulai dengan menambahkan destinasi wisata pertama.'
                                        : `Tidak ada hasil untuk “${search}”.`}
                                </p>

                                {wisata.length === 0 ? (
                                    <button className="wis-empty-btn" onClick={openTambah}>
                                        + Tambah Wisata
                                    </button>
                                ) : (
                                    <button
                                        className="wis-empty-btn"
                                        onClick={() => setSearch('')}
                                    >
                                        Hapus pencarian
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* TABEL: layar lebar */}
                                <div className="wis-table-wrap">
                                    <div className="wis-table-inner">
                                    <table className="wis-table">
                                        <colgroup>
                                            <col style={{ width: '4%' }} />
                                            <col style={{ width: '13%' }} />
                                            <col style={{ width: '8.5%' }} />
                                            <col style={{ width: '12%' }} />
                                            <col style={{ width: '22%' }} />
                                            <col style={{ width: '6.5%' }} />
                                            <col style={{ width: '9%' }} />
                                            <col style={{ width: '11%' }} />
                                            <col style={{ width: '14%' }} />
                                        </colgroup>

                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>Nama Wisata</th>
                                                <th>Kategori</th>
                                                <th>Lokasi</th>
                                                <th>Deskripsi</th>
                                                <th>Rating</th>
                                                <th>Harga Tiket</th>
                                                <th>Jam Buka</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {hasil.map((item, index) => (
                                                <tr key={item.wisata_id}>
                                                    <td>{index + 1}</td>

                                                    <td className="wis-td-nama">
                                                        {item.nama_wisata}
                                                    </td>

                                                    <td>{getKategoriName(item.kategori_id)}</td>

                                                    <td>
                                                        <div>{item.lokasi_wisata || '-'}</div>
                                                        {item.link_gmap && (
                                                            <a
                                                                className="wis-sub-link"
                                                                href={item.link_gmap}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <IconPin /> Lihat peta
                                                            </a>
                                                        )}
                                                    </td>

                                                    <td>
                                                        {item.deskripsi_singkat && (
                                                            <div
                                                                className="wis-desk-singkat"
                                                                title={item.deskripsi_singkat}
                                                            >
                                                                {item.deskripsi_singkat}
                                                            </div>
                                                        )}

                                                        {item.deskripsi_wisata ? (
                                                            <div
                                                                className="wis-desk"
                                                                title={item.deskripsi_wisata}
                                                            >
                                                                {item.deskripsi_wisata}
                                                            </div>
                                                        ) : (
                                                            !item.deskripsi_singkat && '-'
                                                        )}
                                                    </td>

                                                    <td className="wis-rating">
                                                        <span className="wis-star">★</span>{' '}
                                                        {item.rating_wisata || '0'}
                                                    </td>

                                                    <td className="wis-harga">
                                                        {gratis(item.harga_tiket) ? (
                                                            <span className="wis-free">Gratis</span>
                                                        ) : (
                                                            formatHarga(item.harga_tiket)
                                                        )}
                                                    </td>

                                                    <td>{item.jam_buka || '-'}</td>

                                                    <td className="wis-td-aksi">
                                                        {renderAksi(item)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    </div>
                                </div>

                                {/* KARTU: layar sempit */}
                                <div className="wis-list">
                                    {hasil.map((item) => (
                                        <article className="wis-item" key={item.wisata_id}>
                                            <div>
                                                <h3 className="wis-item-name">
                                                    {item.nama_wisata}
                                                </h3>

                                                <p className="wis-item-meta">
                                                    <span>{getKategoriName(item.kategori_id)}</span>
                                                    <span>•</span>
                                                    <IconPin />
                                                    <span>{item.lokasi_wisata || '-'}</span>
                                                </p>
                                            </div>

                                            {item.deskripsi_singkat && (
                                                <p className="wis-item-singkat">
                                                    {item.deskripsi_singkat}
                                                </p>
                                            )}

                                            {item.deskripsi_wisata && (
                                                <p className="wis-item-desk">
                                                    {item.deskripsi_wisata}
                                                </p>
                                            )}

                                            <div className="wis-chips">
                                                <span className="wis-chip wis-chip-rating">
                                                    ★ {item.rating_wisata || '0'}
                                                </span>

                                                <span
                                                    className={`wis-chip${
                                                        gratis(item.harga_tiket)
                                                            ? ' wis-chip-free'
                                                            : ''
                                                    }`}
                                                >
                                                    {gratis(item.harga_tiket)
                                                        ? 'Gratis'
                                                        : formatHarga(item.harga_tiket)}
                                                </span>

                                                {item.jam_buka && (
                                                    <span className="wis-chip">
                                                        <IconJam /> {item.jam_buka}
                                                    </span>
                                                )}

                                                {item.link_gmap && (
                                                    <a
                                                        className="wis-chip wis-chip-link"
                                                        href={item.link_gmap}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <IconPin /> Lihat peta
                                                    </a>
                                                )}
                                            </div>

                                            <div className="wis-item-actions">
                                                {renderAksi(item)}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {!loading && (
                        <p className="wis-info">
                            Menampilkan {hasil.length === 0 ? 0 : `1–${hasil.length}`} dari{' '}
                            {wisata.length} data
                        </p>
                    )}

                </div>
            </div>

            {/* ================= POP UP FORM ================= */}

            {showModal && (
                <div className="wis-bg" onMouseDown={(e) => klikLatar(e, closeModal)}>
                    <form
                        className="wis-modal"
                        onSubmit={handleSubmit}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="wis-form-title"
                    >
                        <button
                            type="button"
                            className="wis-close"
                            onClick={closeModal}
                            aria-label="Tutup"
                        >
                            <IconSilang />
                        </button>

                        <div className="wis-head">
                            <div className="wis-icon">
                                {editId ? <IconEdit /> : <IconPlus />}
                            </div>

                            <div>
                                <h2 className="wis-modal-title" id="wis-form-title">
                                    {editId ? 'Edit Wisata' : 'Tambah Wisata'}
                                </h2>
                                <p className="wis-modal-sub">
                                    {editId
                                        ? 'Ubah data wisata dengan lengkap'
                                        : 'Isi data wisata dengan lengkap'}
                                </p>
                            </div>
                        </div>

                        <div className="wis-grid">

                            <div className="wis-field">
                                <label htmlFor="nama_wisata">Nama Wisata</label>
                                <input
                                    id="nama_wisata"
                                    type="text"
                                    name="nama_wisata"
                                    value={form.nama_wisata}
                                    onChange={handleChange}
                                    placeholder="contoh: coban rondo"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="wis-field">
                                <label htmlFor="kategori_id">Kategori</label>
                                <select
                                    id="kategori_id"
                                    name="kategori_id"
                                    value={form.kategori_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>
                                        Pilih Kategori
                                    </option>
                                    {kategori.map((item) => (
                                        <option
                                            key={item.kategori_id}
                                            value={item.kategori_id}
                                        >
                                            {item.nama_kategori}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="wis-field">
                                <label htmlFor="lokasi_wisata">Lokasi</label>
                                <input
                                    id="lokasi_wisata"
                                    type="text"
                                    name="lokasi_wisata"
                                    value={form.lokasi_wisata}
                                    onChange={handleChange}
                                    placeholder="contoh: Batu"
                                />
                            </div>

                            <div className="wis-field">
                                <label htmlFor="jam_buka">Jam Buka</label>
                                <input
                                    id="jam_buka"
                                    type="text"
                                    name="jam_buka"
                                    value={form.jam_buka}
                                    onChange={handleChange}
                                    placeholder="08.00-15.00"
                                />
                            </div>

                            <div className="wis-field wis-tall">
                                <label htmlFor="deskripsi_wisata">Deskripsi</label>
                                <textarea
                                    id="deskripsi_wisata"
                                    name="deskripsi_wisata"
                                    value={form.deskripsi_wisata}
                                    onChange={handleChange}
                                    placeholder="contoh: Batu"
                                />
                            </div>

                            <div className="wis-field">
                                <label htmlFor="harga_tiket">Harga Tiket</label>
                                <input
                                    id="harga_tiket"
                                    type="number"
                                    name="harga_tiket"
                                    value={form.harga_tiket}
                                    onChange={handleChange}
                                    placeholder="Rp 10 000"
                                    min="0"
                                />
                            </div>

                            <div className="wis-field">
                                <label htmlFor="deskripsi_singkat">Deskripsi Singkat</label>
                                <input
                                    id="deskripsi_singkat"
                                    type="text"
                                    name="deskripsi_singkat"
                                    value={form.deskripsi_singkat}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="wis-field">
                                <label htmlFor="rating_wisata">Rating</label>
                                <input
                                    id="rating_wisata"
                                    type="number"
                                    name="rating_wisata"
                                    value={form.rating_wisata}
                                    onChange={handleChange}
                                    placeholder="contoh: 4.8"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                />
                            </div>

                            <div className="wis-field">
                                <label htmlFor="link_gmap">Link Google Maps</label>
                                <input
                                    id="link_gmap"
                                    type="url"
                                    name="link_gmap"
                                    value={form.link_gmap}
                                    onChange={handleChange}
                                    placeholder="https://maps.google.com/..."
                                />
                            </div>

                        </div>

                        <div className="wis-actions">
                            <button
                                type="button"
                                className="wis-btn wis-btn-batal"
                                onClick={closeModal}
                            >
                                Batal
                            </button>

                            <button type="submit" className="wis-btn wis-btn-simpan">
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ================= POP UP KONFIRMASI SIMPAN ================= */}

            {konfirmSimpan && (
                <div
                    className="wis-bg wis-top"
                    onMouseDown={(e) =>
                        klikLatar(e, () => !saving && setKonfirmSimpan(false))
                    }
                >
                    <div
                        className="wis-modal wis-sm wis-center"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="wis-simpan-title"
                    >
                        <div className="wis-icon">
                            <IconSimpan />
                        </div>

                        <h2 className="wis-modal-title" id="wis-simpan-title">
                            {editId ? 'Simpan Perubahan?' : 'Simpan Wisata Baru?'}
                        </h2>

                        <p className="wis-text">
                            Data wisata <strong>{form.nama_wisata}</strong> akan{' '}
                            {editId ? 'diperbarui' : 'ditambahkan'}. Pastikan semua
                            data sudah benar.
                        </p>

                        <div className="wis-actions">
                            <button
                                type="button"
                                className="wis-btn wis-btn-batal"
                                onClick={() => setKonfirmSimpan(false)}
                                disabled={saving}
                            >
                                Periksa Lagi
                            </button>

                            <button
                                type="button"
                                className="wis-btn wis-btn-simpan"
                                onClick={doSimpan}
                                disabled={saving}
                                autoFocus
                            >
                                {saving && <span className="wis-spin" />}
                                {saving ? 'Menyimpan...' : 'Ya, Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= POP UP KONFIRMASI HAPUS ================= */}

            {hapusItem && (
                <div
                    className="wis-bg wis-top"
                    onMouseDown={(e) =>
                        klikLatar(e, () => !deleting && setHapusItem(null))
                    }
                >
                    <div
                        className="wis-modal wis-sm wis-danger wis-center"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="wis-hapus-title"
                    >
                        <div className="wis-icon wis-icon-danger">
                            <IconHapus />
                        </div>

                        <h2 className="wis-modal-title" id="wis-hapus-title">
                            Hapus Wisata?
                        </h2>

                        <p className="wis-text">
                            Wisata <strong>{hapusItem.nama_wisata}</strong> akan
                            dihapus permanen dan tidak dapat dikembalikan.
                        </p>

                        <div className="wis-actions">
                            <button
                                type="button"
                                className="wis-btn wis-btn-batal"
                                onClick={() => setHapusItem(null)}
                                disabled={deleting}
                                autoFocus
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                className="wis-btn wis-btn-danger"
                                onClick={doHapus}
                                disabled={deleting}
                            >
                                {deleting && <span className="wis-spin" />}
                                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= POP UP NOTIFIKASI ================= */}

            {notice && (
                <div
                    className="wis-bg wis-top"
                    onMouseDown={(e) => klikLatar(e, () => setNotice(null))}
                >
                    <div
                        className={`wis-modal wis-sm wis-center ${
                            notice.type === 'success' ? 'wis-ok' : 'wis-danger'
                        }`}
                        role="alertdialog"
                        aria-modal="true"
                    >
                        <div
                            className={`wis-icon ${
                                notice.type === 'success'
                                    ? 'wis-icon-ok'
                                    : 'wis-icon-danger'
                            }`}
                        >
                            {notice.type === 'success' ? <IconCek /> : <IconSilang />}
                        </div>

                        <h2 className="wis-modal-title">{notice.title}</h2>
                        <p className="wis-text">{notice.message}</p>

                        <div className="wis-actions">
                            <button
                                type="button"
                                className={`wis-btn ${
                                    notice.type === 'success'
                                        ? 'wis-btn-ok'
                                        : 'wis-btn-danger'
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

export default Wisata;
