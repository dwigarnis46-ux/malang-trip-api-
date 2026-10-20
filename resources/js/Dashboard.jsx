import { useEffect, useState } from 'react';
import api from './api/axios';

const WARNA_BAR = [
    ['#5aa8ff', '#3b8df0'],
    ['#b79cf2', '#9a78e6'],
    ['#4fc99d', '#2fae82'],
];

const IKON = ['🌄', '🗂', '🖼', '▶'];

function Dashboard() {
    const [wisata, setWisata] = useState([]);
    const [kategori, setKategori] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gagal, setGagal] = useState(false);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setGagal(false);

            const [wisataResponse, kategoriResponse] = await Promise.all([
                api.get('/wisata'),
                api.get('/kategori'),
            ]);

            setWisata(wisataResponse.data.data || []);
            setKategori(kategoriResponse.data.data || []);
        } catch (error) {
            console.error('Gagal mengambil data dashboard:', error);
            setGagal(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    /* ===== DATA ===== */

    const totalGaleri = wisata.reduce(
        (total, item) => total + (item.galeri?.length || 0),
        0
    );

    const totalVideo = wisata.reduce(
        (total, item) => total + (item.video?.length || 0),
        0
    );

    const statistikKategori = kategori.map((item) => ({
        nama: item.nama_kategori,
        jumlah: wisata.filter(
            (w) => Number(w.kategori_id) === Number(item.kategori_id)
        ).length,
    }));

    const jumlahTerbesar = Math.max(
        ...statistikKategori.map((item) => item.jumlah),
        1
    );

    const wisataTerpopuler = [...wisata]
        .sort(
            (a, b) =>
                Number(b.rating_wisata || 0) - Number(a.rating_wisata || 0)
        )
        .slice(0, 5);

    const statCards = [
        { label: 'Total Wisata', value: wisata.length },
        { label: 'Total Kategori', value: kategori.length },
        { label: 'Total Galeri', value: totalGaleri },
        { label: 'Total Video', value: totalVideo },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bitter:wght@400;500;600;700&display=swap');

                /* Seluruh ukuran fleksibel (clamp + container query),
                   jadi nyaman di HP, tablet, laptop, maupun layar lebar. */

                .dashboard-page {
                    container-type: inline-size;
                    width: 100%;
                    min-height: 100vh;
                    min-height: 100dvh;
                    background: #f8fbff;
                }

                .dashboard-page *,
                .dashboard-page *::before,
                .dashboard-page *::after {
                    box-sizing: border-box;
                }

                .dashboard-inner {
                    --border: #a3c2e6;
                    --blue: #3576b2;
                    display: flex;
                    flex-direction: column;
                    gap: clamp(16px, 2.6cqw, 34px);
                    width: 100%;
                    min-height: 100vh;
                    min-height: 100dvh;
                    padding: clamp(14px, 3cqw, 40px);
                    font-family: 'Bitter', Georgia, 'Times New Roman', serif;
                    color: #222;
                }

                /* ========== KARTU STATISTIK ========== */

                .dashboard-stat-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: clamp(10px, 1.8cqw, 24px);
                }

                .dashboard-stat-card {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    min-height: clamp(84px, 9cqw, 124px);
                    padding: clamp(14px, 1.9cqw, 26px);
                    background: #fff;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    box-shadow: 0 1px 2px rgba(23, 62, 104, .04);
                    transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
                }

                .dashboard-stat-card:hover {
                    transform: translateY(-3px);
                    border-color: #5f95cc;
                    box-shadow: 0 10px 22px rgba(53, 118, 178, .14);
                }

                .dashboard-stat-info {
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: clamp(4px, .6cqw, 8px);
                }

                .dashboard-stat-label {
                    color: #2b2b2b;
                    font-size: clamp(13px, 1.25cqw, 17px);
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .dashboard-stat-value {
                    color: #111;
                    font-size: clamp(24px, 2.4cqw, 36px);
                    line-height: 1.1;
                    font-weight: 700;
                }

                

                /* ========== BOX KONTEN ========== */

                .dashboard-content-grid {
                    flex: 1;
                    display: grid;
                    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
                    gap: clamp(12px, 1.8cqw, 24px);
                }

                .dashboard-box {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    min-height: 320px;
                    padding: clamp(14px, 1.8cqw, 26px);
                    background: #fff;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    box-shadow: 0 1px 2px rgba(23, 62, 104, .04);
                }

                .dashboard-box-title {
                    margin: 0;
                    color: #222;
                    font-size: clamp(15px, 1.45cqw, 20px);
                    line-height: 1.4;
                    font-weight: 500;
                }

                /* ========== GRAFIK ========== */

                .dashboard-chart {
                    flex: 1;
                    display: flex;
                    min-height: 220px;
                    margin-top: clamp(16px, 2cqw, 28px);
                    padding-top: 28px;
                    overflow-x: auto;
                    overflow-y: hidden;
                }

                .dashboard-chart-item {
                    flex: 1 0 clamp(48px, 6cqw, 90px);
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    outline: none;
                }

                .dashboard-chart-zone {
                    position: relative;
                    flex: 1;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    background: repeating-linear-gradient(
                        to top,
                        #e8eef6 0,
                        #e8eef6 1px,
                        transparent 1px,
                        transparent 25%
                    );
                }

                .dashboard-chart-bar {
                    flex-shrink: 0;
                    width: clamp(16px, 38%, 36px);
                    min-height: 4px;
                    border-radius: 5px 5px 0 0;
                    transform-origin: bottom;
                    animation: dashboard-grow .7s cubic-bezier(.2, .8, .2, 1) both;
                    transition: filter .2s ease;
                }

                .dashboard-chart-item:hover .dashboard-chart-bar,
                .dashboard-chart-item:focus-visible .dashboard-chart-bar {
                    filter: brightness(1.08) saturate(1.1);
                }

                .dashboard-chart-tip {
                    position: absolute;
                    left: 50%;
                    transform: translate(-50%, 4px);
                    padding: 2px 8px;
                    background: #173e68;
                    color: #fff;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    line-height: 1.5;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity .15s ease, transform .15s ease;
                }

                .dashboard-chart-item:hover .dashboard-chart-tip,
                .dashboard-chart-item:focus-visible .dashboard-chart-tip {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }

                .dashboard-chart-label {
                    margin-top: 10px;
                    padding: 0 2px;
                    color: #6f8fc4;
                    font-size: clamp(10px, .85cqw, 12px);
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                @keyframes dashboard-grow {
                    from { transform: scaleY(0); }
                    to   { transform: scaleY(1); }
                }

                /* ========== TERPOPULER ========== */

                .dashboard-popular-list {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    margin-top: clamp(12px, 1.6cqw, 22px);
                }

                .dashboard-popular-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 8px;
                    border-radius: 8px;
                    transition: background .15s ease;
                }

                .dashboard-popular-item:hover {
                    background: #f1f7fd;
                }

                .dashboard-popular-number {
                    flex-shrink: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #eaf3fc;
                    color: var(--blue);
                    border-radius: 50%;
                    font-size: 13px;
                    font-weight: 700;
                }

                .dashboard-popular-number.rank-1 { background: #fff1cc; color: #a8690a; }
                .dashboard-popular-number.rank-2 { background: #e9edf2; color: #5b6673; }
                .dashboard-popular-number.rank-3 { background: #fde3d2; color: #a2531f; }

                .dashboard-popular-info {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .dashboard-popular-name {
                    color: #2a2a2a;
                    font-size: clamp(13px, 1.1cqw, 15px);
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .dashboard-popular-category {
                    color: #8a8a8a;
                    font-size: 12px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .dashboard-popular-rating {
                    flex-shrink: 0;
                    padding: 3px 9px;
                    background: #eaf3fc;
                    color: var(--blue);
                    border-radius: 999px;
                    font-size: 12px;
                    font-weight: 700;
                    white-space: nowrap;
                }

                /* ========== LOADING / KOSONG / ERROR ========== */

                .dashboard-skeleton {
                    display: inline-block;
                    width: 2ch;
                    height: .9em;
                    border-radius: 6px;
                    background: linear-gradient(90deg, #e9f0f8 25%, #f6f9fd 50%, #e9f0f8 75%);
                    background-size: 200% 100%;
                    animation: dashboard-shimmer 1.2s linear infinite;
                }

                @keyframes dashboard-shimmer {
                    from { background-position: 200% 0; }
                    to   { background-position: -200% 0; }
                }

                .dashboard-message {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    min-height: 160px;
                    color: #8a8a8a;
                    font-size: 14px;
                    text-align: center;
                }

                .dashboard-retry {
                    padding: 7px 16px;
                    background: #2c4fa5;
                    color: #fff;
                    border: none;
                    border-radius: 6px;
                    font-family: inherit;
                    font-size: 13px;
                    cursor: pointer;
                }

                .dashboard-retry:hover { background: #23438f; }

                /* ========== RESPONSIVE ========== */

                @container (max-width: 900px) {
                    .dashboard-content-grid {
                        grid-template-columns: minmax(0, 1fr);
                    }
                }

                @container (max-width: 700px) {
                    .dashboard-stat-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                @container (max-width: 380px) {
                    .dashboard-stat-grid {
                        grid-template-columns: minmax(0, 1fr);
                    }
                    
                }

                @media (prefers-reduced-motion: reduce) {
                    .dashboard-page *,
                    .dashboard-page *::before,
                    .dashboard-page *::after {
                        animation: none !important;
                        transition: none !important;
                    }
                }
            `}</style>

            <div className="dashboard-page">
                <div className="dashboard-inner">

                    {/* KARTU STATISTIK */}
                    <div className="dashboard-stat-grid">
                        {statCards.map((card, i) => (
                            <div className="dashboard-stat-card" key={card.label}>
                                <div className="dashboard-stat-info">
                                    <span className="dashboard-stat-label">
                                        {card.label}
                                    </span>
                                    <strong className="dashboard-stat-value">
                                        {loading ? (
                                            <span className="dashboard-skeleton" />
                                        ) : (
                                            card.value
                                        )}
                                    </strong>
                                </div>
                                
                            </div>
                        ))}
                    </div>

                    <div className="dashboard-content-grid">

                        {/* STATISTIK PER KATEGORI */}
                        <div className="dashboard-box">
                            <h2 className="dashboard-box-title">
                                Statistik Wisata Per Kategori
                            </h2>

                            {loading ? (
                                <div className="dashboard-message">Memuat data...</div>
                            ) : gagal ? (
                                <div className="dashboard-message">
                                    Data gagal dimuat.
                                    <button className="dashboard-retry" onClick={loadDashboard}>
                                        Coba lagi
                                    </button>
                                </div>
                            ) : statistikKategori.length === 0 ? (
                                <div className="dashboard-message">
                                    Belum ada data kategori.
                                </div>
                            ) : (
                                <div className="dashboard-chart">
                                    {statistikKategori.map((item, index) => {
                                        const persen = (item.jumlah / jumlahTerbesar) * 100;
                                        const [atas, bawah] = WARNA_BAR[index % WARNA_BAR.length];

                                        return (
                                            <div
                                                className="dashboard-chart-item"
                                                key={index}
                                                tabIndex={0}
                                                aria-label={`${item.nama}: ${item.jumlah} wisata`}
                                            >
                                                <div className="dashboard-chart-zone">
                                                    <span
                                                        className="dashboard-chart-tip"
                                                        style={{ bottom: `calc(${persen}% + 8px)` }}
                                                    >
                                                        {item.jumlah} wisata
                                                    </span>
                                                    <div
                                                        className="dashboard-chart-bar"
                                                        style={{
                                                            height: `${persen}%`,
                                                            background: `linear-gradient(${atas}, ${bawah})`,
                                                            animationDelay: `${index * 70}ms`,
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    className="dashboard-chart-label"
                                                    title={item.nama}
                                                >
                                                    {item.nama}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* WISATA TER POPULER */}
                        <div className="dashboard-box">
                            <h2 className="dashboard-box-title">
                                Wisata Ter Populer
                            </h2>

                            {loading ? (
                                <div className="dashboard-message">Memuat data...</div>
                            ) : wisataTerpopuler.length === 0 ? (
                                <div className="dashboard-message">
                                    Belum ada data wisata.
                                </div>
                            ) : (
                                <div className="dashboard-popular-list">
                                    {wisataTerpopuler.map((item, index) => (
                                        <div
                                            className="dashboard-popular-item"
                                            key={item.wisata_id}
                                        >
                                            <div
                                                className={`dashboard-popular-number${
                                                    index < 3 ? ` rank-${index + 1}` : ''
                                                }`}
                                            >
                                                {index + 1}
                                            </div>

                                            <div className="dashboard-popular-info">
                                                <span className="dashboard-popular-name">
                                                    {item.nama_wisata}
                                                </span>
                                                <span className="dashboard-popular-category">
                                                    {item.kategori?.nama_kategori || 'Tanpa kategori'}
                                                </span>
                                            </div>

                                            <div className="dashboard-popular-rating">
                                                ★ {Number(item.rating_wisata || 0).toFixed(1)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
