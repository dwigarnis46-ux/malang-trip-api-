import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Sidebar() {
    const navigate = useNavigate();
    const [showLogout, setShowLogout] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: (
                <svg viewBox="0 0 32 32" fill="none">
                    <path d="M3 14.5L16 3L29 14.5" />
                    <path d="M7 12V29H25V12" />
                    <path d="M13 29V19H19V29" />
                </svg>
            ),
        },
        {
            name: 'Kategori',
            path: '/kategori',
            icon: (
                <svg viewBox="0 0 32 32" fill="none">
                    <path d="M10 4H22V8H10Z" />
                    <path d="M7 7H4V29H28V7H25" />
                    <path d="M10 14H22M10 20H22M10 25H22" />
                </svg>
            ),
        },
        {
            name: 'Wisata',
            path: '/wisata',
            icon: (
                <svg viewBox="0 0 32 32" fill="none">
                    <path d="M16 29S5 20 5 12A11 11 0 0 1 27 12C27 20 16 29 16 29Z" />
                    <circle cx="16" cy="12" r="3.5" />
                    <path d="M7 25C7 22.5 11 21 16 21C21 21 25 22.5 25 25C25 27.5 21 29 16 29C11 29 7 27.5 7 25Z" />
                </svg>
            ),
        },
        {
            name: 'Galeri',
            path: '/galeri',
            icon: (
                <svg viewBox="0 0 32 32" fill="none">
                    <rect x="3" y="4" width="26" height="24" rx="1" />
                    <circle cx="10" cy="11" r="2.5" />
                    <path d="M5 25L13 17L18 21L22 16L28 23" />
                </svg>
            ),
        },
        {
            name: 'Video',
            path: '/video',
            icon: (
                <svg viewBox="0 0 32 32" fill="none">
                    <rect x="3" y="3" width="26" height="22" rx="3" />
                    <path
                        d="M13 9L22 15L13 20V9Z"
                        className="video-play"
                    />
                    <path d="M5 29H27" />
                    <path d="M8 25V29M24 25V29" />
                </svg>
            ),
        },
    ];

    const closeLogout = () => {
        if (loggingOut) return;
        setShowLogout(false);
    };

    // Tutup pop up logout dengan tombol Esc
    useEffect(() => {
        if (!showLogout) return;

        const onKey = (e) => {
            if (e.key === 'Escape') closeLogout();
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const handleLogout = () => {
        setLoggingOut(true);

        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');

        // jeda singkat agar status "Keluar..." sempat terlihat
        setTimeout(() => {
            setShowLogout(false);
            setLoggingOut(false);
            navigate('/login');
        }, 350);
    };

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-background-pattern"></div>

                <div className="sidebar-logo">
                    <img
                        src="/images/logo.png"
                        alt="Explore Malang"
                    />
                </div>

                <nav className="sidebar-menu">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-menu-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <span className="sidebar-icon">
                                {item.icon}
                            </span>

                            <span className="sidebar-menu-text">
                                {item.name}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                <button
                    type="button"
                    className="sidebar-menu-item sidebar-logout"
                    onClick={() => setShowLogout(true)}
                >
                    <span className="sidebar-icon">
                        <svg viewBox="0 0 32 32" fill="none">
                            <path d="M4 3H21V12" />
                            <path d="M4 3V29H21V25" />
                            <path d="M13 16H29M23 10L29 16L23 22" />
                        </svg>
                    </span>

                    <span className="sidebar-menu-text">
                        Logout
                    </span>
                </button>
            </aside>

            {/* ================= POP UP LOGOUT ================= */}

            {showLogout && (
                <div
                    className="sb-bg"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeLogout();
                    }}
                >
                    <div
                        className="sb-modal"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="sb-logout-title"
                    >
                        <button
                            type="button"
                            className="sb-close"
                            onClick={closeLogout}
                            aria-label="Tutup"
                            disabled={loggingOut}
                        >
                            <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none"
                                 stroke="currentColor" strokeWidth="1.8"
                                 strokeLinecap="round" aria-hidden="true">
                                <path d="M4 4l8 8M12 4l-8 8" />
                            </svg>
                        </button>

                        <div className="sb-icon">
                            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                                <path d="M4 3H21V12" />
                                <path d="M4 3V29H21V25" />
                                <path d="M13 16H29M23 10L29 16L23 22" />
                            </svg>
                        </div>

                        <h2 className="sb-title" id="sb-logout-title">
                            Keluar dari Admin?
                        </h2>

                        <p className="sb-text">
                            Kamu akan keluar dari panel admin dan perlu login
                            kembali untuk mengaksesnya.
                        </p>

                        <div className="sb-actions">
                            <button
                                type="button"
                                className="sb-btn sb-btn-batal"
                                onClick={closeLogout}
                                disabled={loggingOut}
                                autoFocus
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                className="sb-btn sb-btn-keluar"
                                onClick={handleLogout}
                                disabled={loggingOut}
                            >
                                {loggingOut && <span className="sb-spin" />}
                                {loggingOut ? 'Keluar...' : 'Ya, Keluar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bitter:wght@400;600;700&display=swap');

                .sidebar {
                    width: 253px;
                    min-width: 253px;
                    height: 100vh;
                    position: fixed;
                    top: 0;
                    left: 0;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    padding: 0 0 17px;
                    overflow: hidden;
                    background: linear-gradient(
                        145deg,
                        #0751b6 0%,
                        #06439b 48%,
                        #064ca9 100%
                    );
                    border: 2px solid rgba(255, 255, 255, 0.7);
                    border-radius: 5px;
                    z-index: 1000;
                    font-family: Georgia, 'Times New Roman', serif;
                }

                .sidebar-background-pattern {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    overflow: hidden;
                    background: linear-gradient(
                        132deg,
                        transparent 0%,
                        rgba(255, 255, 255, 0.025) 27%,
                        transparent 27.5%,
                        transparent 53%,
                        rgba(0, 25, 95, 0.1) 53.5%,
                        transparent 78%
                    );
                }

                .sidebar-background-pattern::before {
                    content: '';
                    position: absolute;
                    width: 260px;
                    height: 360px;
                    top: -125px;
                    right: -145px;
                    transform: rotate(43deg);
                    background: rgba(27, 112, 221, 0.25);
                }

                .sidebar-background-pattern::after {
                    content: '';
                    position: absolute;
                    width: 310px;
                    height: 440px;
                    left: -175px;
                    top: 180px;
                    transform: rotate(34deg);
                    background: rgba(22, 99, 201, 0.2);
                }

                .sidebar-logo {
                    height: 145px;
                    min-height: 145px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 5px;
                    position: relative;
                    z-index: 1;
                    box-sizing: border-box;
                }

                .sidebar-logo img {
                    display: block;
                    width: 100%;
                    max-width: 245px;
                    height: 135px;
                    object-fit: contain;
                    object-position: center;
                    transform: scale(1.2);
                }

                .sidebar-menu {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 0 20px;
                    position: relative;
                    z-index: 1;
                }

                .sidebar-menu-item {
                    height: 64px;
                    min-height: 64px;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 21px;
                    box-sizing: border-box;
                    padding: 0 18px;
                    color: #fff;
                    text-decoration: none;
                    background: transparent;
                    border: none;
                    border-radius: 5px;
                    font-family: Georgia, 'Times New Roman', serif;
                    font-size: 20px;
                    font-weight: 700;
                    text-align: left;
                    cursor: pointer;
                    position: relative;
                    z-index: 1;
                    transition: background 0.2s ease;
                }

                .sidebar-menu-item:hover {
                    background: rgba(255, 255, 255, 0.12);
                }

                .sidebar-menu-item.active {
                    background: transparent;
                }

                .sidebar-icon {
                    width: 32px;
                    min-width: 32px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                }

                .sidebar-icon svg {
                    width: 34px;
                    height: 34px;
                    stroke: currentColor;
                    stroke-width: 2.6;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }

                .sidebar-icon svg .video-play {
                    fill: #fff;
                    stroke: #fff;
                    stroke-width: 1.5;
                }

                .sidebar-menu-text {
                    white-space: nowrap;
                }

                .sidebar-logout {
                    margin-top: auto;
                    flex-shrink: 0;
                    padding-left: 43px;
                    gap: 20px;
                    margin-bottom: 0;
                }

                @media (max-width: 700px) {
                    .sidebar {
                        width: 230px;
                        min-width: 230px;
                    }

                    .sidebar-logo img {
                        width: 210px;
                    }

                    .sidebar-menu-item {
                        font-size: 18px;
                    }
                }

                /* ================= POP UP LOGOUT ================= */

                .sb-bg,
                .sb-bg *,
                .sb-bg *::before {
                    box-sizing: border-box;
                }

                .sb-bg {
                    position: fixed;
                    inset: 0;
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    background: rgba(14, 32, 66, .45);
                    -webkit-backdrop-filter: blur(3px);
                    backdrop-filter: blur(3px);
                    font-family: 'Bitter', Georgia, 'Times New Roman', serif;
                    animation: sb-fade .18s ease both;
                }

                .sb-modal {
                    position: relative;
                    width: 340px;
                    max-width: 100%;
                    padding: 32px 26px 24px;
                    background: #fff;
                    border-radius: 12px;
                    overflow: hidden;
                    text-align: center;
                    box-shadow:
                        0 2px 6px rgba(14, 32, 66, .08),
                        0 24px 60px rgba(14, 32, 66, .32);
                    animation: sb-pop .22s cubic-bezier(.2, .9, .3, 1.2) both;
                }

                .sb-modal::before {
                    content: '';
                    position: absolute;
                    inset: 0 0 auto 0;
                    height: 5px;
                    background: linear-gradient(90deg, #2c4fa5, #5aa8ff);
                }

                .sb-close {
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    background: #f1f5fa;
                    border: none;
                    border-radius: 50%;
                    color: #5b6b82;
                    font-size: 13px;
                    cursor: pointer;
                    transition: background .15s ease, color .15s ease;
                }

                .sb-close:hover {
                    background: #e1ebf7;
                    color: #1f2d45;
                }

                .sb-icon {
                    width: 60px;
                    height: 60px;
                    margin: 6px auto 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #e6f0fd;
                    border-radius: 50%;
                    color: #2c4fa5;
                    box-shadow: 0 0 0 8px #eef4fd;
                }

                .sb-icon svg {
                    width: 28px;
                    height: 28px;
                    stroke: currentColor;
                    stroke-width: 2.4;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }

                .sb-title {
                    margin: 24px 0 0;
                    color: #173e68;
                    font-size: 20px;
                    line-height: 1.3;
                    font-weight: 600;
                }

                .sb-text {
                    margin: 10px 0 0;
                    color: #4a586c;
                    font-size: 14px;
                    line-height: 1.6;
                }

                .sb-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 26px;
                }

                .sb-btn {
                    flex: 1;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    height: 40px;
                    padding: 0 16px;
                    border-radius: 7px;
                    font-family: inherit;
                    font-size: 14px;
                    cursor: pointer;
                    transition: transform .12s ease, box-shadow .15s ease, background .15s ease;
                }

                .sb-btn-batal {
                    background: #fff;
                    border: 1px solid #b9d1ee;
                    color: #2a3b57;
                }

                .sb-btn-batal:hover {
                    background: #f1f7fd;
                }

                .sb-btn-keluar {
                    background: linear-gradient(180deg, #3a62c0, #2c4fa5);
                    border: 1px solid #2c4fa5;
                    color: #fff;
                    box-shadow: 0 4px 10px rgba(44, 79, 165, .3);
                }

                .sb-btn-keluar:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 14px rgba(44, 79, 165, .38);
                }

                .sb-btn:disabled,
                .sb-close:disabled {
                    opacity: .65;
                    cursor: not-allowed;
                    transform: none;
                }

                .sb-spin {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255, 255, 255, .45);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: sb-spin .7s linear infinite;
                }

                @keyframes sb-fade {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                @keyframes sb-pop {
                    from { opacity: 0; transform: translateY(14px) scale(.96); }
                    to   { opacity: 1; transform: none; }
                }

                @keyframes sb-spin {
                    to { transform: rotate(360deg); }
                }

                @media (prefers-reduced-motion: reduce) {
                    .sb-bg,
                    .sb-modal {
                        animation: none;
                    }
                }
            `}</style>
        </>
    );
}

export default Sidebar;
