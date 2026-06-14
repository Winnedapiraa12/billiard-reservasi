import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // States
  const [step, setStep] = useState(1);
  const [namaDepan, setNamaDepan] = useState('');
  const [namaBelakang, setNamaBelakang] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Smart Redirect jika sudah login
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // Logika Password Strength
  const getStrengthBars = () => {
    const len = password.length;
    const dim = '#EDE5D5';
    const weak = '#E07B5A';
    const med = '#C9A84C';
    const good = '#5DCAA5';

    if (len === 0) return [dim, dim, dim, dim];
    if (len < 4) return [weak, dim, dim, dim];
    if (len < 8) return [med, med, dim, dim];
    if (len < 12) return [med, med, med, dim];
    return [good, good, good, good];
  };
  const strengthBars = getStrengthBars();

  // Handler Navigasi Step
  const handleNextStep1 = () => {
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!namaDepan || !namaBelakang || !email) return setError('Semua field wajib diisi.');
    if (!emailRegex.test(email)) return setError('Format email tidak valid.');
    setStep(2);
  };

  const handleNextStep2 = () => {
    setError('');
    if (password.length < 8) return setError('Password minimal 8 karakter.');
    if (password !== konfirmasi) return setError('Konfirmasi password tidak cocok.');
    setStep(3);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(step - 1);
  };

  // Handler Submit Final
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!termsChecked) return setError('Anda harus menyetujui Syarat & Ketentuan.');

    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        nama: `${namaDepan} ${namaBelakang}`,
        email,
        password
      });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      if (err.response?.status === 409) setError('Email sudah terdaftar.');
      else setError('Terjadi kesalahan, silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .register-root {
          display: flex;
          flex-direction: row;
          height: 100vh;
          overflow: hidden;
          background-color: #FFFDF8;
          font-family: 'DM Sans', sans-serif;
        }

        .serif { font-family: 'DM Serif Display', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes pulseBlob {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes dotPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.4); }
          50%      { box-shadow: 0 0 0 6px rgba(201,168,76,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .panel-left {
          width: 45%; background-color: #1C1100; position: relative;
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 44px 48px; z-index: 10;
        }
        .panel-left::after {
          content: ''; position: absolute; top: 0; right: -1px;
          width: 60px; height: 100%; background: #FFFDF8;
          clip-path: polygon(60px 0, 60px 100%, 0 100%); z-index: 10;
        }

        .dot-grid {
          position: absolute; inset: 0; opacity: 0.4;
          background-image: radial-gradient(circle, rgba(201,168,76,0.15) 1px, transparent 1px);
          background-size: 28px 28px; z-index: 1;
        }

        .panel-right {
          flex: 1; background-color: #FFFDF8; display: flex;
          align-items: center; justify-content: center;
          padding: 44px 52px; position: relative; z-index: 5;
        }

        .form-input {
          width: 100%; background-color: #FFFFFF; border: 1.5px solid #EDE5D5;
          border-radius: 10px; padding: 10px 14px; color: #1C1100;
          font-size: 13px; font-weight: 400; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.25s, box-shadow 0.25s;
          position: relative; z-index: 20;
        }
        .form-input::placeholder { color: #C8B890; font-weight: 300; }
        .form-input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }

        .btn-submit {
          padding: 13px; background-color: #C9A84C; color: #1C1100;
          font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          border: none; border-radius: 10px; letter-spacing: 0.6px;
          transition: transform 0.15s, box-shadow 0.2s, background 0.2s; cursor: pointer;
          position: relative; z-index: 20;
        }
        .btn-submit:hover:not(:disabled) {
          background-color: #D4B558; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(201,168,76,0.3);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.7; cursor: default; }

        .btn-secondary {
          padding: 13px; background-color: #EDE5D5; color: #1C1100;
          font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          border: none; border-radius: 10px; letter-spacing: 0.6px;
          transition: transform 0.15s, background 0.2s; cursor: pointer;
          position: relative; z-index: 20;
        }
        .btn-secondary:hover { background-color: #E8DCC8; transform: translateY(-1px); }

        .checkbox-custom {
          width: 16px; height: 16px; border: 1.5px solid #C9A84C; border-radius: 5px;
          background-color: #FFFFFF; display: flex; justify-content: center; align-items: center;
          transition: background 0.2s; cursor: pointer; flex-shrink: 0;
          position: relative; z-index: 20;
        }
        .checkbox-custom.checked { background-color: rgba(201,168,76,0.15); }

        .link-hover { 
          color: #8A5A10; font-weight: 600; cursor: pointer; transition: color 0.2s;
          position: relative; z-index: 50; /* Z-INDEX Tinggi agar bisa diklik */
        }
        .link-hover:hover { color: #C9A84C; }

        .mobile-brand { display: none; }
        @media (max-width: 767px) {
          .panel-left { display: none !important; }
          .panel-right { padding: 40px 28px !important; }
          .mobile-brand { display: block; text-align: center; color: #C9A84C; font-size: 28px; margin-bottom: 24px; }
        }
      `}</style>

      {/* ========================================================= */}
      {/* PANEL KIRI (ESPRESSO)                                     */}
      {/* ========================================================= */}
      <div className="panel-left">
        <div className="dot-grid" />
        
        {/* Dekorasi Animasi Lingkaran */}
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)', animation: 'pulseBlob 6s ease-in-out infinite', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', right: '30px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)', animation: 'pulseBlob 8s ease-in-out infinite reverse', zIndex: 2, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 5 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginBottom: '28px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '20px', padding: '5px 12px', animation: 'fadeIn 0.8s backwards' }}>
            <div style={{ width: '5px', height: '5px', backgroundColor: '#C9A84C', borderRadius: '50%', animation: 'dotPulse 2s infinite' }} />
            <span style={{ fontSize: '11px', color: '#C9A84C', letterSpacing: '1px', fontWeight: '500' }}>Reservasi Online</span>
          </div>

          {/* Ikon Gembok (Sama dengan halaman Login) */}
          <div style={{ width: '72px', height: '72px', position: 'relative', marginBottom: '32px', animation: 'float 4s ease-in-out infinite' }}>
            <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(201,168,76,0.2)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', inset: '10px', border: '1px solid rgba(201,168,76,0.35)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', inset: '20px', backgroundColor: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.5)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          <h1 className="serif" style={{ fontSize: '32px', color: '#FAF0DC', lineHeight: '1.2', animation: 'fadeUp 0.9s 0.1s backwards' }}>
            Mulai <br /><span style={{ fontStyle: 'italic', color: '#C9A84C' }}>pengalaman</span> <br />baru bersama kami.
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(250,240,220,0.45)', fontWeight: '300', lineHeight: '1.7', maxWidth: '240px', marginTop: '12px', marginBottom: '36px', animation: 'fadeUp 0.9s 0.2s backwards' }}>
            Platform manajemen reservasi eksklusif untuk memastikan kenyamanan waktu bermain Anda.
          </p>

          {/* Feature List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { i: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', t: 'Akun aman', d: 'Enkripsi JWT end-to-end', delay: '0.3s' },
              { i: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', t: 'Real-time', d: 'Status meja selalu terkini', delay: '0.4s' },
              { i: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', t: 'Riwayat lengkap', d: 'Semua tercatat otomatis', delay: '0.5s' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', animation: `fadeUp 0.8s ${item.delay} backwards` }}>
                <div style={{ width: '28px', height: '28px', backgroundColor: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2"><path d={item.i}/></svg>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '12px', color: 'rgba(250,240,220,0.85)', fontWeight: '500' }}>{item.t}</strong>
                  <span style={{ fontSize: '12px', color: 'rgba(250,240,220,0.55)', fontWeight: '400' }}>{item.d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(201,168,76,0.1)', paddingTop: '20px', position: 'relative', zIndex: 5, animation: 'fadeIn 1s 0.6s backwards' }}>
          <div className="serif" style={{ fontSize: '16px', color: '#C9A84C', fontStyle: 'italic', letterSpacing: '1px' }}>BilliardPro</div>
          <div style={{ fontSize: '10px', color: 'rgba(201,168,76,0.4)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>Premium Billiard Experience</div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PANEL KANAN (WARM WHITE)                                  */}
      {/* ========================================================= */}
      <div className="panel-right">
        {/* Dekorasi Kanan dengan pointer-events: none agar tidak memblokir klik */}
        <div style={{ position: 'absolute', top: '30px', right: '30px', width: '120px', height: '120px', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '50%', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '50px', right: '80px', width: '60px', height: '60px', border: '1px solid rgba(201,168,76,0.06)', borderRadius: '50%', pointerEvents: 'none', zIndex: 1 }} />

        <div style={{ maxWidth: '340px', width: '100%', position: 'relative', zIndex: 20 }}>
          <div className="serif mobile-brand">BilliardPro</div>

          {/* STEP INDICATOR DINAMIS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '28px', animation: 'fadeIn 0.6s backwards' }}>
            <div style={{ width: '7px', height: '7px', backgroundColor: '#C9A84C', borderRadius: '50%', boxShadow: step === 1 ? '0 0 0 3px rgba(201,168,76,0.18)' : 'none', animation: step === 1 ? 'dotPulse 2s infinite' : 'none' }} />
            <div style={{ flex: 1, height: '1.5px', borderRadius: '2px', background: step >= 2 ? 'linear-gradient(90deg, #C9A84C, #E8D5A3)' : '#EDE5D5', backgroundSize: step >= 2 ? '200%' : 'auto', animation: step >= 2 ? 'shimmer 2s linear infinite' : 'none' }} />
            <div style={{ width: '7px', height: '7px', backgroundColor: step >= 2 ? '#C9A84C' : '#E8DCC8', borderRadius: '50%', boxShadow: step === 2 ? '0 0 0 3px rgba(201,168,76,0.18)' : 'none', animation: step === 2 ? 'dotPulse 2s infinite' : 'none', transition: 'background-color 0.4s' }} />
            <div style={{ flex: 1, height: '1.5px', borderRadius: '2px', background: step >= 3 ? 'linear-gradient(90deg, #C9A84C, #E8D5A3)' : '#EDE5D5', backgroundSize: step >= 3 ? '200%' : 'auto', animation: step >= 3 ? 'shimmer 2s linear infinite' : 'none' }} />
            <div style={{ width: '7px', height: '7px', backgroundColor: step >= 3 ? '#C9A84C' : '#E8DCC8', borderRadius: '50%', boxShadow: step === 3 ? '0 0 0 3px rgba(201,168,76,0.18)' : 'none', animation: step === 3 ? 'dotPulse 2s infinite' : 'none', transition: 'background-color 0.4s' }} />
            <div style={{ fontSize: '10px', color: '#C9A070', letterSpacing: '0.5px', marginLeft: '4px' }}>{step} / 3</div>
          </div>

          <div style={{ animation: 'fadeUp 0.7s 0.1s backwards' }}>
            <h2 className="serif" style={{ fontSize: '26px', color: '#1C1100', fontWeight: '400', marginBottom: '4px' }}>Buat Akun</h2>
            <p style={{ fontSize: '13px', color: '#A08860', fontWeight: '300', marginBottom: '24px' }}>Isi data diri kamu di bawah ini</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Animasi per-step */}
            <div key={step} style={{ animation: 'fadeUp 0.4s backwards' }}>
              
              {/* === STEP 1 === */}
              {step === 1 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#8A6A30', fontWeight: '500', letterSpacing: '0.5px', marginBottom: '6px' }}>Nama Depan</label>
                      <input className="form-input" type="text" value={namaDepan} onChange={(e) => setNamaDepan(e.target.value)} placeholder="John" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#8A6A30', fontWeight: '500', letterSpacing: '0.5px', marginBottom: '6px' }}>Nama Belakang</label>
                      <input className="form-input" type="text" value={namaBelakang} onChange={(e) => setNamaBelakang(e.target.value)} placeholder="Doe" />
                    </div>
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#8A6A30', fontWeight: '500', letterSpacing: '0.5px', marginBottom: '6px' }}>Email</label>
                    <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" />
                  </div>
                </>
              )}

              {/* === STEP 2 === */}
              {step === 2 && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '11px', color: '#8A6A30', fontWeight: '500', letterSpacing: '0.5px' }}>Password</label>
                      <span style={{ fontSize: '10px', color: '#C0A878' }}>min. 8 karakter</span>
                    </div>
                    <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                      {strengthBars.map((color, i) => (
                        <div key={i} style={{ flex: 1, height: '3px', borderRadius: '3px', backgroundColor: color, transition: 'background 0.4s ease' }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#8A6A30', fontWeight: '500', letterSpacing: '0.5px', marginBottom: '6px' }}>Konfirmasi Password</label>
                    <input className="form-input" type="password" value={konfirmasi} onChange={(e) => setKonfirmasi(e.target.value)} placeholder="••••••••" />
                  </div>
                </>
              )}

              {/* === STEP 3 === */}
              {step === 3 && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div className={`checkbox-custom ${termsChecked ? 'checked' : ''}`} onClick={() => setTermsChecked(!termsChecked)}>
                    {termsChecked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                  <p style={{ fontSize: '12px', color: '#8A7850', lineHeight: '1.6' }}>
                    Saya menyetujui <span className="link-hover" style={{fontWeight: 600}}>Syarat & Ketentuan</span> serta <span className="link-hover" style={{fontWeight: 600}}>Kebijakan Privasi</span> BilliardPro.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && <div style={{ fontSize: '12px', color: '#E07B5A', marginTop: '-6px', marginBottom: '10px', animation: 'fadeIn 0.3s' }}>{error}</div>}

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', animation: 'fadeUp 0.7s 0.45s backwards' }}>
              {step > 1 && (
                <button type="button" onClick={handlePrevStep} className="btn-secondary" style={{ width: '35%' }}>
                  KEMBALI
                </button>
              )}
              
              {step < 3 ? (
                <button type="button" onClick={step === 1 ? handleNextStep1 : handleNextStep2} className="btn-submit" style={{ flex: 1, marginBottom: 0 }}>
                  SELANJUTNYA
                </button>
              ) : (
                <button type="submit" disabled={isLoading} className="btn-submit" style={{ flex: 1, marginBottom: 0 }}>
                  {isLoading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
                </button>
              )}
            </div>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', animation: 'fadeIn 0.7s 0.5s backwards' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#EDE5D5' }} />
            <div style={{ padding: '0 12px', fontSize: '11px', color: '#C8B890' }}>atau</div>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#EDE5D5' }} />
          </div>

          {/* Link Login Diperbaiki */}
          <div style={{ textAlign: 'center', fontSize: '13px', color: '#9A8860', animation: 'fadeIn 0.7s 0.55s backwards', position: 'relative', zIndex: 50 }}>
            Sudah punya akun? <span className="link-hover" onClick={() => navigate('/login')} style={{ padding: '10px 0' }}>Masuk di sini</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;