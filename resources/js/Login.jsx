import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api/axios';

const GAMBAR_LATAR =
    'https://i.pinimg.com/1200x/3d/c0/4b/3dc04b36e84ac814ac6554f2eaa0d239.jpg';

function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/admin/login', form);

            localStorage.setItem('admin_token', response.data.token);
            localStorage.setItem(
                'admin_data',
                JSON.stringify(response.data.admin)
            );

            setShowSuccess(true);

            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (error) {
            console.error('Login gagal:', error);

            setError(
                error.response?.data?.message ||
                'Tidak dapat terhubung ke server.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bitter:wght@400;500;600;700&display=swap');

                html,
                body,
                #root {
                    width: 100%;
                    min-width: 0;
                    min-height: 100%;
                    margin: 0;
                    padding: 0;
                }

                body {
                    margin: 0;
                }

                .login-page,
                .login-page * {
                    box-sizing: border-box;
                }

                /*
                  Desain dasar: bingkai 684 x 428 (mockup).
                  --u = 1 satuan desain, mengikuti ukuran layar sehingga
                  kartu selalu proporsional seperti di desain.
                */
                .login-page {
                    --u: clamp(1px, min(calc(100vw / 684), calc(100dvh / 428)), 1.8px);
                    position: fixed;
                    inset: 0;
                    display: flex;
                    overflow: auto;
                    padding: 16px;
                    background-color: #5f9ccb;
                    background-image: url('${GAMBAR_LATAR}');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    font-family: 'Bitter', Georgia, 'Times New Roman', serif;
                }

                /* KARTU LOGIN */

                .login-card {
                    width: calc(282 * var(--u));
                    max-width: 100%;
                    margin: auto;
                    padding: calc(21 * var(--u)) calc(26 * var(--u)) calc(28 * var(--u)) calc(17 * var(--u));
                    background: #fbfeff;
                    border-radius: calc(5 * var(--u));
                    box-shadow: 0 6px 24px rgba(10, 30, 60, .14);
                }

                .login-card h1 {
                    margin: 0 0 0 calc(2 * var(--u));
                    color: #173e68;
                    font-size: calc(15.5 * var(--u));
                    line-height: calc(20 * var(--u));
                    font-weight: 700;
                }

                .login-welcome {
                    margin: calc(5.5 * var(--u)) 0 0 calc(-1 * var(--u));
                    color: #333;
                    font-size: calc(10.5 * var(--u));
                    line-height: calc(21 * var(--u));
                    font-weight: 400;
                }

                .login-error {
                    margin: calc(8 * var(--u)) 0 0;
                    padding: calc(7 * var(--u)) calc(10 * var(--u));
                    color: #c62828;
                    background: #fff0f0;
                    border: 1px solid #f2c5c5;
                    border-radius: calc(4 * var(--u));
                    font-size: calc(10 * var(--u));
                    line-height: 1.5;
                    overflow-wrap: anywhere;
                }

                .login-form {
                    margin: 0;
                    padding: 0;
                }

                .login-form-group label {
                    display: block;
                    color: #222;
                    font-size: calc(13 * var(--u));
                    line-height: calc(16 * var(--u));
                    font-weight: 400;
                }

                .login-form-group-user {
                    margin-top: calc(21.5 * var(--u));
                }

                .login-form-group-user label {
                    margin-bottom: calc(14 * var(--u));
                }

                .login-form-group-pass {
                    margin-top: calc(12 * var(--u));
                }

                .login-form-group-pass label {
                    margin-bottom: calc(7 * var(--u));
                }

                .login-form-group input {
                    display: block;
                    width: 100%;
                    height: calc(27 * var(--u));
                    padding: 0 calc(11 * var(--u));
                    color: #333;
                    background: #fff;
                    border: 1px solid #a9c9ea;
                    border-radius: calc(4 * var(--u));
                    outline: none;
                    font-family: inherit;
                    font-size: calc(12 * var(--u));
                    transition: border-color .15s ease, box-shadow .15s ease;
                }

                .login-form-group input::placeholder {
                    color: #8f8f8f;
                    opacity: 1;
                }

                .login-form-group input:focus {
                    border-color: #477ac0;
                    box-shadow: 0 0 0 2px rgba(53, 118, 178, .14);
                }

                .login-button {
                    display: block;
                    width: calc(203 * var(--u));
                    max-width: 100%;
                    height: calc(27 * var(--u));
                    margin: calc(45 * var(--u)) auto 0;
                    /* kartu punya padding kiri 17 & kanan 26, jadi digeser 4.5
                       agar tombol benar-benar di tengah kartu */
                    transform: translateX(calc(4.5 * var(--u)));
                    padding: 0;
                    border: none;
                    border-radius: calc(3 * var(--u));
                    background: #2c4fa5;
                    color: #fff;
                    font-family: inherit;
                    font-size: calc(12 * var(--u));
                    font-weight: 400;
                    cursor: pointer;
                    transition: background .2s ease;
                }

                .login-button:hover {
                    background: #23438f;
                }

                .login-button:disabled {
                    opacity: .7;
                    cursor: not-allowed;
                }

                /* POP-UP LOGIN BERHASIL */

                .login-success-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: rgba(16, 35, 60, 0.38);
                    animation: successFadeIn .25s ease;
                }

                .login-success-popup {
                    width: 100%;
                    max-width: 360px;
                    padding: 32px 28px;
                    border-radius: 16px;
                    background: #fff;
                    box-shadow: 0 16px 50px rgba(0, 0, 0, 0.18);
                    text-align: center;
                    animation: successPopIn .3s ease;
                }

                .login-success-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 68px;
                    height: 68px;
                    margin: 0 auto 18px;
                    border-radius: 50%;
                    background: #e5f8ec;
                    color: #219653;
                    font-family: Arial, sans-serif;
                    font-size: 38px;
                    font-weight: 700;
                }

                .login-success-popup h2 {
                    margin: 0 0 10px;
                    color: #173e68;
                    font-size: 25px;
                    line-height: 1.35;
                }

                .login-success-popup p {
                    margin: 0;
                    color: #626b75;
                    font-size: 15px;
                    line-height: 1.7;
                }

                .login-success-progress {
                    width: 100%;
                    height: 4px;
                    margin-top: 24px;
                    overflow: hidden;
                    border-radius: 10px;
                    background: #e8edf4;
                }

                .login-success-progress-bar {
                    width: 100%;
                    height: 100%;
                    border-radius: 10px;
                    background: #2c4fa5;
                    transform-origin: left;
                    animation: successProgress 1.5s linear forwards;
                }

                @keyframes successFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                @keyframes successPopIn {
                    from { opacity: 0; transform: scale(.88) translateY(10px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                @keyframes successProgress {
                    from { transform: scaleX(1); }
                    to   { transform: scaleX(0); }
                }

                /* HP: kartu mengisi lebar layar dengan proporsi yang sama */

                @media (max-width: 600px) {
                    .login-page {
                        --u: min(calc((100vw - 32px) / 282), 1.35px);
                    }

                    .login-success-popup {
                        padding: 28px 22px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .login-success-overlay,
                    .login-success-popup,
                    .login-success-progress-bar {
                        animation: none;
                    }
                }
            `}</style>

            <div className="login-page">
                <div className="login-card">

                    <h1>Masuk ke Admin</h1>

                    <p className="login-welcome">
                        Selamat Datang&nbsp; kembali, silahkan login kembali
                        <br />
                        untuk mengakses panel admin
                    </p>

                    {error && (
                        <div className="login-error" role="alert">
                            {error}
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-form-group login-form-group-user">
                            <label htmlFor="username">Username:</label>

                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="masukan username"
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="login-form-group login-form-group-pass">
                            <label htmlFor="password">Password</label>

                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="masukan password"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading || showSuccess}
                        >
                            {loading ? 'Memproses...' : 'Login →'}
                        </button>
                    </form>

                </div>
            </div>

            {/* POP-UP SUKSES */}

            {showSuccess && (
                <div
                    className="login-success-overlay"
                    role="status"
                    aria-live="polite"
                >
                    <div className="login-success-popup">
                        <div className="login-success-icon">✓</div>

                        <h2>Login Berhasil!</h2>

                        <p>
                            Selamat datang kembali.
                            <br />
                            Anda akan diarahkan ke Dashboard.
                        </p>

                        <div className="login-success-progress">
                            <div className="login-success-progress-bar" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Login;
