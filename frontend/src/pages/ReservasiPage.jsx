import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const ReservasiPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  // Ambil mejaId dari state jika diklik dari halaman Beranda
  const preselectedMejaId = location.state?.mejaId || '';

  // States
  const [mejaList, setMejaList] = useState([]);
  const [formData, setFormData] = useState({
    meja_id: preselectedMejaId,
    tanggal: '',
    jam_mulai: '',
    jam_selesai: '',
    catatan: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Ambil daftar meja untuk dropdown
  useEffect(() => {
    const fetchMeja = async () => {
      try {
        const response = await api.get('/meja');
        setMejaList(response.data.data || []);
      } catch (err) {
        console.error('Gagal mengambil data meja', err);
      }
    };
    fetchMeja();
  }, []);

  // Handler Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIKA KALKULASI HARGA DINAMIS ---
  let durasiJam = 0;
  let totalHarga = 0;
  let selectedMeja = null;

  if (formData.meja_id && formData.jam_mulai && formData.jam_selesai) {
    const start = new Date(`1970-01-01T${formData.jam_mulai}:00`);
    const end = new Date(`1970-01-01T${formData.jam_selesai}:00`);
    const diffMs = end - start;

    if (diffMs > 0) {
      durasiJam = diffMs / (1000 * 60 * 60); // Ubah milidetik ke jam
      // Cari data meja yang dipilih
      selectedMeja = mejaList.find(m => m.id.toString() === formData.meja_id.toString());
      if (selectedMeja) {
        totalHarga = durasiJam * selectedMeja.harga_per_jam;
      }
    }
  }

  // Handler Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.meja_id || !formData.tanggal || !formData.jam_mulai || !formData.jam_selesai) {
      return setError('Harap lengkapi semua field yang wajib diisi.');
    }

    if (formData.jam_mulai >= formData.jam_selesai) {
      return setError('Jam selesai harus lebih besar dari jam mulai.');
    }

    setIsLoading(true);
    try {
      // 1. Tembak API untuk membuat reservasi
      const response = await api.post('/reservasi', formData);
      
      // 2. Arahkan ke halaman Checkout membawa data pesanan!
      navigate('/checkout', { state: { reservasiData: response.data.data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat reservasi. Pastikan jadwal tidak bentrok.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reservasi-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .reservasi-root {
          background-color: #FFFDF8;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          color: #1C1100;
          display: flex;
          flex-direction: column;
        }

        .serif { font-family: 'DM Serif Display', serif; }

        /* ANIMASI */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* NAVBAR */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          height: 60px; background-color: #1C1100; border-bottom: 1px solid rgba(201,168,76,0.15);
          display: flex; justify-content: space-between; align-items: center; padding: 0 48px;
        }

        /* MAIN CONTAINER */
        .main-content {
          flex: 1; display: flex; justify-content: center; align-items: center;
          padding: 120px 24px 60px; position: relative;
        }

        /* DEKORASI */
        .dot-grid {
          position: absolute; inset: 0; opacity: 0.4; pointer-events: none;
          background-image: radial-gradient(circle, rgba(201,168,76,0.15) 1px, transparent 1px);
          background-size: 28px 28px; z-index: 1; 
        }
        .bg-blob {
          position: absolute; top: 10%; left: 10%; width: 400px; height: 400px;
          border-radius: 50%; background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
          z-index: 1; pointer-events: none;
        }

        /* FORM CARD */
        .form-card {
          position: relative; z-index: 10; background: #FFFFFF; border: 1.5px solid #EDE5D5; border-radius: 20px;
          width: 100%; max-width: 680px; padding: 48px 56px; box-shadow: 0 20px 40px rgba(28,17,0,0.04);
          animation: fadeUp 0.8s backwards;
        }
        .form-header { text-align: center; margin-bottom: 36px; }

        /* FORM INPUTS */
        .input-group { margin-bottom: 18px; }
        .input-label { display: block; font-size: 11px; color: #8A6A30; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 6px; text-transform: uppercase; }
        .form-input {
          width: 100%; background-color: #FFFDF8; border: 1.5px solid #EDE5D5; border-radius: 10px; padding: 12px 14px;
          color: #1C1100; font-size: 14px; font-weight: 400; font-family: 'DM Sans', sans-serif; outline: none; transition: 0.25s;
        }
        .form-input::placeholder { color: #C8B890; font-weight: 300; }
        .form-input:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
        
        textarea.form-input { resize: vertical; min-height: 80px; }
        select.form-input { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%23C9A84C%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E"); background-repeat: no-repeat; background-position: right 14px center; background-size: 16px; padding-right: 40px; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* BUTTON */
        .btn-submit {
          width: 100%; padding: 14px; background-color: #C9A84C; color: #1C1100;
          font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          border: none; border-radius: 10px; letter-spacing: 0.6px; margin-top: 12px;
          transition: 0.2s; cursor: pointer;
        }
        .btn-submit:hover:not(:disabled) { background-color: #D4B558; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(201,168,76,0.25); }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        @media (max-width: 768px) {
          .navbar { padding: 0 24px; }
          .main-content { padding: 100px 20px 40px; }
          .form-card { padding: 32px 24px; }
          .grid-2 { grid-template-columns: 1fr; gap: 0; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="serif" style={{ fontSize: '20px', color: '#C9A84C', fontStyle: 'italic', letterSpacing: '1px' }}>BilliardPro</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#FAF0DC', fontWeight: '500' }}>{user?.nama || 'Pengguna'}</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'rgba(250,240,220,0.6)', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans'", fontWeight: '500' }}>Beranda</button>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid rgba(250,240,220,0.2)', color: 'rgba(250,240,220,0.6)', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans'" }}>Keluar</button>
        </div>
      </nav>

      <main className="main-content">
        <div className="dot-grid" />
        <div className="bg-blob" />

        <div className="form-card">
          <div className="form-header" style={{ animation: 'fadeUp 0.6s 0.1s backwards' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: 'rgba(201,168,76,0.1)', borderRadius: '50%', marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h1 className="serif" style={{ fontSize: '32px', color: '#1C1100', marginBottom: '8px' }}>Pesan Jadwal Meja</h1>
            <p style={{ fontSize: '13px', color: '#A08860', fontWeight: '300' }}>Tentukan meja, tanggal, dan waktu bermain Anda dengan mudah.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ animation: 'fadeUp 0.6s 0.2s backwards' }}>
              <label className="input-label">Pilih Meja <span style={{ color: '#E07B5A' }}>*</span></label>
              <select name="meja_id" value={formData.meja_id} onChange={handleChange} className="form-input" required>
                <option value="" disabled>-- Silakan Pilih Meja --</option>
                {mejaList.map((meja) => (
                  <option key={meja.id} value={meja.id} disabled={meja.status !== 'tersedia'}>
                    Meja {meja.nomor_meja} {meja.status !== 'tersedia' ? `(Sedang ${meja.status})` : `- Rp ${Number(meja.harga_per_jam).toLocaleString('id-ID')}/jam`}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ animation: 'fadeUp 0.6s 0.3s backwards' }}>
              <label className="input-label">Tanggal Bermain <span style={{ color: '#E07B5A' }}>*</span></label>
              <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} className="form-input" required min={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="grid-2">
              <div className="input-group" style={{ animation: 'fadeUp 0.6s 0.4s backwards' }}>
                <label className="input-label">Jam Mulai <span style={{ color: '#E07B5A' }}>*</span></label>
                <input type="time" name="jam_mulai" value={formData.jam_mulai} onChange={handleChange} className="form-input" required />
              </div>
              <div className="input-group" style={{ animation: 'fadeUp 0.6s 0.5s backwards' }}>
                <label className="input-label">Jam Selesai <span style={{ color: '#E07B5A' }}>*</span></label>
                <input type="time" name="jam_selesai" value={formData.jam_selesai} onChange={handleChange} className="form-input" required />
              </div>
            </div>

            <div className="input-group" style={{ animation: 'fadeUp 0.6s 0.6s backwards' }}>
              <label className="input-label">Catatan Tambahan (Opsional)</label>
              <textarea name="catatan" value={formData.catatan} onChange={handleChange} className="form-input" placeholder="Misal: Tolong siapkan 2 stik tambahan..." />
            </div>

            {/* KOTAK RINGKASAN BIAYA (Otomatis Muncul) */}
            {durasiJam > 0 && selectedMeja && (
              <div style={{ background: '#FDF8F0', border: '1.5px dashed #C9A84C', padding: '16px 20px', borderRadius: '12px', marginBottom: '18px', animation: 'fadeIn 0.5s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#8A6A30' }}>Durasi Bermain:</span>
                  <span style={{ fontWeight: '600', color: '#1C1100' }}>{durasiJam} Jam</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
                  <span style={{ color: '#8A6A30' }}>Total Tagihan:</span>
                  <span className="serif" style={{ fontWeight: '600', color: '#C9A84C', fontSize: '20px' }}>Rp {totalHarga.toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}

            {error && <div style={{ fontSize: '13px', color: '#E07B5A', marginBottom: '12px', textAlign: 'center', animation: 'fadeIn 0.3s' }}>{error}</div>}

            <div style={{ animation: 'fadeUp 0.6s 0.7s backwards' }}>
              <button type="submit" disabled={isLoading} className="btn-submit">
                {isLoading ? 'MEMPROSES...' : 'LANJUT KE PEMBAYARAN'}
              </button>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '16px', animation: 'fadeUp 0.6s 0.8s backwards' }}>
               <Link to="/" style={{ fontSize: '12px', color: '#A08860', textDecoration: 'none', borderBottom: '1px solid #EDE5D5', paddingBottom: '2px' }}>
                 Batal dan kembali ke Beranda
               </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ReservasiPage;