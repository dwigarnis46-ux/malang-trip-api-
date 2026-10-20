import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

function IconEdit() {
    return (
        <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none"
             stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
             strokeLinejoin="round" aria-hidden="true">
            <path d="M11 2.5l2.5 2.5L5.5 13H3v-2.5L11 2.5z" />
        </svg>
    );
}

function IconHapus() {
    return (
        <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none"
             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
             strokeLinejoin="round" aria-hidden="true">
            <path d="M2 4.5h12M6 4.5V3h4v1.5M3.5 4.5l.7 8.5h7.6l.7-8.5" />
        </svg>
    );
}

function Kategori() {
    const [kategori, setKategori] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cari, setCari] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [namaKategori, setNamaKategori] = useState('');
    const [saving, setSaving] = useState(false);

    const [hapusItem, setHapusItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const loadKategori = async () => {
        try {
            setLoading(true);
            const response = await api.get('/kategori');
            setKategori(response.data.data || []);
        } catch (error) {
            console.error('Gagal mengambil kategori:', error);
            alert('Gagal mengambil data kategori.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadKategori();
    }, []);

    const hasil = useMemo(() => {
        const kata = cari.trim().toLowerCase();
        if (!kata) return kategori;
        return kategori.filter((item) =>
            String(item.nama_kategori || '').toLowerCase().includes(kata)
        );
    }, [kategori, cari]);

    const openTambah = () => {
        setEditId(null);
        setNamaKategori('');
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditId(item.kategori_id);
        setNamaKategori(item.nama_kategori);
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
        setEditId(null);
        setNamaKategori('');
    };

    const closeHapus = () => {
        if (deleting) return;
        setHapusItem(null);
    };

    // Tutup pop up dengan tombol Esc
    useEffect(() => {
        if (!showModal && !hapusItem) return;
        const onKey = (e) => {
            if (e.key !== 'Escape') return;
            if (hapusItem) closeHapus();
            else closeModal();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!namaKategori.trim()) {
            alert('Nama kategori wajib diisi.');
            return;
        }

        try {
            setSaving(true);

            if (editId) {
                await api.patch(`/kategori/${editId}`, {
                    nama_kategori: namaKategori,
                });
            } else {
                await api.post('/kategori', {
                    nama_kategori: namaKategori,
                });
            }

            setShowModal(false);
            setEditId(null);
            setNamaKategori('');
            await loadKategori();
        } catch (error) {
            console.error('Gagal menyimpan kategori:', error);
            alert(error.response?.data?.message || 'Gagal menyimpan kategori.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!hapusItem) return;

        try {
            setDeleting(true);
            await api.delete(`/kategori/${hapusItem.kategori_id}`);
            setHapusItem(null);
            await loadKategori();
        } catch (error) {
            console.error('Gagal menghapus kategori:', error);
            alert(error.response?.data?.message || 'Gagal menghapus kategori.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bitter:wght@400;500;600;700&display=swap');

                /* Menyatukan latar dengan sidebar */
                html,
                body,
                #root {
                    background: #f8fbff;
                }

                /*
                  Desain dasar: area konten 424px (mockup).
                  --u = 1 satuan desain, dibatasi 1.64px supaya sepadan
                  dengan ukuran sidebar, dan tidak pernah di bawah 1px.
                */
                .kat-page {
                    container-type: inline-size;
                    width: 100%;
                    min-height: 100vh;
                    min-height: 100dvh;
                    background: #f8fbff;
                }

                .kat-page *,
                .kat-modal-bg *,
                .kat-page *::before,
                .kat-modal-bg *::before {
                    box-sizing: border-box;
                }

                .kat-inner {
                    --u: clamp(1px, calc(100cqw / 424), 1.64px);
                    --line: #a9c9ea;
                    --blue: #2c4fa5;
                    width: 100%;
                    padding: calc(13 * var(--u)) 5.4cqw calc(20 * var(--u)) 4.2cqw;
                    font-family: 'Bitter', Georgia, 'Times New Roman', serif;
                    color: #222;
                }

                .kat-title {
                    margin: 0;
                    color: #1f1f1f;
                    font-size: calc(14.5 * var(--u));
                    line-height: calc(18 * var(--u));
                    font-weight: 400;
                }

                .kat-subtitle {
                    margin: calc(1 * var(--u)) 0 0;
                    color: #222;
                    font-size: calc(11 * var(--u));
                    line-height: calc(15 * var(--u));
                }

                /* ----- toolbar ----- */

                .kat-toolbar {
                    display: flex;
                    gap: calc(8 * var(--u));
                    margin-top: calc(17 * var(--u));
                }

                .kat-search {
                    flex: 236 1 0;
                    min-width: 0;
                    height: calc(20 * var(--u));
                    padding: 0 calc(8 * var(--u));
                    background: #fff;
                    border: 1px solid var(--line);
                    border-radius: calc(3 * var(--u));
                    outline: none;
                    color: #333;
                    font-family: inherit;
                    font-size: calc(10.5 * var(--u));
                }

                .kat-search::placeholder {
                    color: #8d9bb0;
                    opacity: 1;
                }

                .kat-search:focus {
                    border-color: #477ac0;
                    box-shadow: 0 0 0 2px rgba(53, 118, 178, .12);
                }

                .kat-btn-tambah {
                    flex: 139 1 0;
                    min-width: 0;
                    height: calc(19 * var(--u));
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

                .kat-btn-tambah:hover {
                    background: #23438f;
                }

                /* ----- tabel ----- */

                .kat-card {
                    min-height: calc(217 * var(--u));
                    margin-top: calc(9 * var(--u));
                    background: #fff;
                    border: 1px solid var(--line);
                    border-radius: calc(4 * var(--u));
                    overflow-x: auto;
                }

                /* Garis tegak digambar sebagai lapisan di atas tabel (::after)
                   supaya tampil dari nama kolom sampai dasar kartu,
                   walaupun baris datanya sedikit. */
                .kat-table-inner {
                    position: relative;
                    width: 100%;
                    min-width: 330px;
                    min-height: calc(217 * var(--u) - 2px);
                    background: #fff;
                }

                .kat-table-inner::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background-image:
                        linear-gradient(#dbe3ee, #dbe3ee),
                        linear-gradient(#dbe3ee, #dbe3ee);
                    background-repeat: no-repeat;
                    background-size: 1px 100%;
                    background-position: 12% 0, 62% 0;
                }

                .kat-table-inner.kat-no-lines::after {
                    display: none;
                }

                .kat-table {
                    width: 100%;
                    table-layout: fixed;
                    border-collapse: collapse;
                }

                .kat-table th {
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

                .kat-table td {
                    height: calc(32 * var(--u));
                    padding: 0 calc(8 * var(--u));
                    border: none;
                    border-bottom: 1px solid #dbe3ee;
                    color: #222;
                    font-size: calc(11 * var(--u));
                    text-align: center;
                    vertical-align: middle;
                    overflow-wrap: break-word;
                }

                .kat-table td:nth-child(3) {
                    white-space: nowrap;
                }

                .kat-table tbody tr:hover td {
                    background: rgba(47, 111, 190, .06);
                }

                .kat-aksi {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: calc(10 * var(--u));
                }

                .kat-pill {
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

                .kat-pill:hover {
                    filter: brightness(.96);
                }

                .kat-pill svg {
                    width: calc(8 * var(--u));
                    height: calc(8 * var(--u));
                }

                .kat-pill-edit {
                    width: calc(36 * var(--u));
                    background: #cfe3fb;
                    color: #3a64b4;
                }

                .kat-pill-hapus {
                    width: calc(44 * var(--u));
                    background: #fbc2c7;
                    color: #d03a48;
                }

                .kat-message {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: calc(120 * var(--u));
                    color: #8a99ad;
                    font-size: calc(10.5 * var(--u));
                    text-align: center;
                }

                .kat-info {
                    margin: calc(2 * var(--u)) 0 0;
                    padding-top: calc(2 * var(--u));
                    color: #7f9cc4;
                    font-size: calc(8 * var(--u));
                    line-height: calc(12 * var(--u));
                }

                /* ----- pop up ----- */

                .kat-modal-bg {
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
                    animation: kat-fade .18s ease both;
                }

                .kat-modal {
                    position: relative;
                    width: calc(310 * var(--u));
                    max-width: 100%;
                    padding: calc(24 * var(--u)) calc(22 * var(--u)) calc(20 * var(--u));
                    background: #fff;
                    border-radius: calc(8 * var(--u));
                    overflow: hidden;
                    box-shadow:
                        0 2px 6px rgba(14, 32, 66, .08),
                        0 24px 60px rgba(14, 32, 66, .32);
                    color: #222;
                    animation: kat-pop .22s cubic-bezier(.2, .9, .3, 1.2) both;
                }

                .kat-modal::before {
                    content: '';
                    position: absolute;
                    inset: 0 0 auto 0;
                    height: calc(4 * var(--u));
                    background: linear-gradient(90deg, #2c4fa5, #5aa8ff);
                }

                .kat-modal-danger::before {
                    background: linear-gradient(90deg, #d03a48, #f08a93);
                }

                .kat-modal-close {
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
                    font-family: inherit;
                    font-size: calc(14 * var(--u));
                    line-height: 1;
                    cursor: pointer;
                    transition: background .15s ease, color .15s ease;
                }

                .kat-modal-close:hover {
                    background: #e1ebf7;
                    color: #1f2d45;
                }

                .kat-modal-head {
                    display: flex;
                    align-items: center;
                    gap: calc(12 * var(--u));
                    padding-right: calc(24 * var(--u));
                }

                .kat-modal-icon {
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

                .kat-modal-icon svg {
                    width: calc(17 * var(--u));
                    height: calc(17 * var(--u));
                }

                .kat-modal-icon-danger {
                    background: #fde8ea;
                    color: #d03a48;
                }

                .kat-modal-title {
                    margin: 0;
                    color: #173e68;
                    font-size: calc(15 * var(--u));
                    line-height: calc(19 * var(--u));
                    font-weight: 600;
                }

                .kat-modal-sub {
                    margin: calc(2 * var(--u)) 0 0;
                    color: #5c6b80;
                    font-size: calc(10.5 * var(--u));
                    line-height: calc(14 * var(--u));
                }

                .kat-field {
                    margin-top: calc(22 * var(--u));
                }

                .kat-field label {
                    display: block;
                    margin-bottom: calc(6 * var(--u));
                    color: #2a3b57;
                    font-size: calc(10.5 * var(--u));
                    line-height: calc(14 * var(--u));
                    font-weight: 600;
                }

                .kat-field input {
                    display: block;
                    width: 100%;
                    height: calc(28 * var(--u));
                    padding: 0 calc(10 * var(--u));
                    background: #fbfdff;
                    border: 1px solid var(--line);
                    border-radius: calc(5 * var(--u));
                    outline: none;
                    color: #222;
                    font-family: inherit;
                    font-size: calc(11 * var(--u));
                    transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
                }

                .kat-field input::placeholder {
                    color: #8d9bb0;
                    opacity: 1;
                }

                .kat-field input:focus {
                    background: #fff;
                    border-color: #477ac0;
                    box-shadow: 0 0 0 calc(3 * var(--u)) rgba(71, 122, 192, .16);
                }

                .kat-modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: calc(10 * var(--u));
                    margin-top: calc(24 * var(--u));
                }

                .kat-btn-batal,
                .kat-btn-simpan,
                .kat-btn-danger {
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

                .kat-btn-batal {
                    background: #fff;
                    border: 1px solid #b9d1ee;
                    color: #2a3b57;
                }

                .kat-btn-batal:hover {
                    background: #f1f7fd;
                }

                .kat-btn-simpan {
                    background: linear-gradient(180deg, #3a62c0, #2c4fa5);
                    border: 1px solid #2c4fa5;
                    color: #fff;
                    box-shadow: 0 calc(3 * var(--u)) calc(8 * var(--u)) rgba(44, 79, 165, .3);
                }

                .kat-btn-simpan:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 calc(5 * var(--u)) calc(12 * var(--u)) rgba(44, 79, 165, .38);
                }

                .kat-btn-danger {
                    background: linear-gradient(180deg, #e0505d, #d03a48);
                    border: 1px solid #d03a48;
                    color: #fff;
                    box-shadow: 0 calc(3 * var(--u)) calc(8 * var(--u)) rgba(208, 58, 72, .3);
                }

                .kat-btn-danger:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 calc(5 * var(--u)) calc(12 * var(--u)) rgba(208, 58, 72, .38);
                }

                .kat-btn-simpan:disabled,
                .kat-btn-danger:disabled,
                .kat-btn-batal:disabled {
                    opacity: .65;
                    cursor: not-allowed;
                    transform: none;
                }

                .kat-spin {
                    width: calc(9 * var(--u));
                    height: calc(9 * var(--u));
                    border: 2px solid rgba(255, 255, 255, .45);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: kat-spin .7s linear infinite;
                }

                /* varian konfirmasi hapus (rata tengah) */

                .kat-modal-center {
                    text-align: center;
                }

                .kat-modal-center .kat-modal-icon {
                    width: calc(46 * var(--u));
                    height: calc(46 * var(--u));
                    margin: calc(4 * var(--u)) auto 0;
                    border-radius: 50%;
                    box-shadow: 0 0 0 calc(6 * var(--u)) #fef3f4;
                }

                .kat-modal-center .kat-modal-icon svg {
                    width: calc(21 * var(--u));
                    height: calc(21 * var(--u));
                }

                .kat-modal-center .kat-modal-title {
                    margin-top: calc(18 * var(--u));
                    font-size: calc(16 * var(--u));
                    line-height: calc(20 * var(--u));
                }

                .kat-confirm-text {
                    margin: calc(8 * var(--u)) 0 0;
                    color: #4a586c;
                    font-size: calc(10.5 * var(--u));
                    line-height: calc(16 * var(--u));
                }

                .kat-confirm-text strong {
                    color: #1f1f1f;
                    font-weight: 700;
                }

                .kat-modal-center .kat-modal-actions {
                    justify-content: center;
                    margin-top: calc(22 * var(--u));
                }

                .kat-modal-center .kat-btn-batal,
                .kat-modal-center .kat-btn-danger {
                    flex: 1;
                }

                @keyframes kat-fade {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                @keyframes kat-pop {
                    from { opacity: 0; transform: translateY(14px) scale(.96); }
                    to   { opacity: 1; transform: none; }
                }

                @keyframes kat-spin {
                    to { transform: rotate(360deg); }
                }

                /* ----- area sempit ----- */

                @container (max-width: 460px) {
                    .kat-toolbar {
                        flex-direction: column;
                    }

                    .kat-search,
                    .kat-btn-tambah {
                        flex: none;
                        width: 100%;
                        height: 36px;
                        font-size: 13px;
                    }

                    .kat-title {
                        font-size: 17px;
                    }

                    .kat-subtitle {
                        font-size: 12px;
                        line-height: 18px;
                    }

                    .kat-table th,
                    .kat-table td {
                        font-size: 12px;
                    }

                    .kat-info {
                        font-size: 10px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .kat-modal-bg,
                    .kat-modal {
                        animation: none;
                    }
                }
            `}</style>

            <div className="kat-page">
                <div className="kat-inner">

                    <h1 className="kat-title">Kelola Kategori</h1>
                    <p className="kat-subtitle">
                        Daftar kategori wisata yang ada di Malang
                    </p>

                    <div className="kat-toolbar">
                        <input
                            className="kat-search"
                            type="text"
                            value={cari}
                            onChange={(e) => setCari(e.target.value)}
                            placeholder="cari kategori"
                            aria-label="Cari kategori"
                        />

                        <button className="kat-btn-tambah" onClick={openTambah}>
                            + Tambah kategori
                        </button>
                    </div>

                    <div className="kat-card">
                        {loading ? (
                            <div className="kat-message">
                                Memuat data kategori...
                            </div>
                        ) : (
                            <div
                                className={`kat-table-inner${
                                    hasil.length === 0 ? ' kat-no-lines' : ''
                                }`}
                            >
                                <table className="kat-table">
                                    <colgroup>
                                        <col style={{ width: '12%' }} />
                                        <col style={{ width: '50%' }} />
                                        <col style={{ width: '38%' }} />
                                    </colgroup>

                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Nama Kategori</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {hasil.map((item, index) => (
                                            <tr key={item.kategori_id}>
                                                <td>{index + 1}</td>
                                                <td>{item.nama_kategori}</td>
                                                <td>
                                                    <span className="kat-aksi">
                                                        <button
                                                            className="kat-pill kat-pill-edit"
                                                            onClick={() => openEdit(item)}
                                                        >
                                                            <IconEdit /> Edit
                                                        </button>

                                                        <button
                                                            className="kat-pill kat-pill-hapus"
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
                                    <div className="kat-message">
                                        {kategori.length === 0
                                            ? 'Belum ada kategori.'
                                            : 'Kategori tidak ditemukan.'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!loading && (
                        <p className="kat-info">
                            Menampilkan {hasil.length === 0 ? 0 : `1–${hasil.length}`} dari{' '}
                            {kategori.length} data
                        </p>
                    )}

                </div>
            </div>

            {hapusItem && (
                <div
                    className="kat-modal-bg"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeHapus();
                    }}
                >
                    <div
                        className="kat-modal kat-modal-danger kat-modal-center"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="kat-hapus-title"
                    >
                        <button
                            type="button"
                            className="kat-modal-close"
                            onClick={closeHapus}
                            aria-label="Tutup"
                        >
                            ×
                        </button>

                        <div className="kat-modal-icon kat-modal-icon-danger">
                            <IconHapus />
                        </div>

                        <h2 className="kat-modal-title" id="kat-hapus-title">
                            Hapus Kategori?
                        </h2>

                        <p className="kat-confirm-text">
                            Kategori <strong>{hapusItem.nama_kategori}</strong>{' '}
                            akan dihapus permanen dan tidak dapat dikembalikan.
                        </p>

                        <div className="kat-modal-actions">
                            <button
                                type="button"
                                className="kat-btn-batal"
                                onClick={closeHapus}
                                disabled={deleting}
                                autoFocus
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                className="kat-btn-danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting && <span className="kat-spin" />}
                                {deleting ? 'Menghapus...' : 'Ya, hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div
                    className="kat-modal-bg"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <form
                        className="kat-modal"
                        onSubmit={handleSubmit}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="kat-modal-title"
                    >
                        <button
                            type="button"
                            className="kat-modal-close"
                            onClick={closeModal}
                            aria-label="Tutup"
                        >
                            ×
                        </button>

                        <div className="kat-modal-head">
                            <div className="kat-modal-icon">
                                {editId ? (
                                    <IconEdit />
                                ) : (
                                    <svg viewBox="0 0 16 16" width="1em" height="1em"
                                         fill="none" stroke="currentColor" strokeWidth="1.8"
                                         strokeLinecap="round" aria-hidden="true">
                                        <path d="M8 3v10M3 8h10" />
                                    </svg>
                                )}
                            </div>

                            <div>
                                <h2 className="kat-modal-title" id="kat-modal-title">
                                    {editId ? 'Edit Kategori' : 'Tambah Kategori'}
                                </h2>

                                <p className="kat-modal-sub">
                                    {editId
                                        ? 'Ubah data kategori wisata dengan lengkap'
                                        : 'Isi data kategori wisata dengan lengkap'}
                                </p>
                            </div>
                        </div>

                        <div className="kat-field">
                            <label htmlFor="nama_kategori">Nama Kategori</label>
                            <input
                                id="nama_kategori"
                                type="text"
                                value={namaKategori}
                                onChange={(e) => setNamaKategori(e.target.value)}
                                placeholder="contoh: Alam"
                                autoFocus
                                required
                            />
                        </div>

                        <div className="kat-modal-actions">
                            <button
                                type="button"
                                className="kat-btn-batal"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                className="kat-btn-simpan"
                                disabled={saving}
                            >
                                {saving && <span className="kat-spin" />}
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </>
    );
}

export default Kategori;
