import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

// Komponen Badge Status khusus Reservasi
const ReservasiBadge = ({ status }) => {
  let styles = {};
  switch (status?.toLowerCase()) {
    case 'dikonfirmasi':
      styles = { bg: 'rgba(93,202,165,0.1)', border: 'rgba(93,202,165,0.2)', text: '#5DCAA5', label: 'Dikonfirmasi' };
      break;
    case 'pending':
      styles = { bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.2)', text: '#C9A84C', label: 'Menunggu Konfirmasi' };
      break;
    case 'dibatalkan':
      styles = { bg: 'rgba(224,123,90,0.1)', border: 'rgba(224,123,90,0.2)', text: '#E07B5A', label: 'Dibatalkan' };
      break;
    default:
      styles = { bg: '#F0EBE1', border: '#EDE5D5', text: '#A08860', label: status || 'Unknown' };
  }

  return (
    <span style={{
      backgroundColor: styles.bg, border: `1px solid ${styles.border}`, color: styles.text,
      padding: '6px 14px', borderRadius: '30px', fontSize: '11px', fontWeight: '600',
      letterSpacing: '0.5px', fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: '6px'
    }}>
      {status?.toLowerCase() === 'pending' && <div style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: styles.text, animation: 'pulseBlob 1.5s infinite alternate'}} />}
      {status?.toLowerCase() === 'dikonfirmasi' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      )}
      {styles.label}
    </span>
  );
};

const RiwayatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const [riwayatList, setRiwayatList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const successMsg = location.state?.successMsg || '';

  // Mengambil data Riwayat dari Backend Asli
  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        // Catatan: Sesuaikan '/reservasi/riwayat' dengan route GET riwayat di reservasiRoutes.js Anda.
        const response = await api.get('/reservasi/riwayat');
        
        // Memasukkan data dari database ke state (Sesuai format controller: res.json({ data: riwayat }))
        setRiwayatList(response.data.data || []);
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat riwayat reservasi Anda. Pastikan server berjalan.');
        setIsLoading(false);
      }
    };
    fetchRiwayat();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="riwayat-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .riwayat-root {
          background-color: #FFFDF8;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          color: #1C1100;
        }

        .serif { font-family: 'DM Serif Display', serif; }

        /* ANIMASI */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes pulseBlob {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%      { opacity: 0.8; transform: scale(1.2); }
        }

        /* NAVBAR */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          height: 60px; background-color: #1C1100; border-bottom: 1px solid rgba(201,168,76,0.15);
          display: flex; justify-content: space-between; align-items: center; padding: 0 48px;
        }

        /* MAIN CONTENT */
        .main-container {
          padding: 120px 48px 80px;
          max-width: 900px;
          margin: 0 auto;
        }

        /* LIST CARD */
        .riwayat-card {
          background: #FFFFFF;
          border: 1.5px solid #EDE5D5;
          border-radius: 16px;
          padding: 24px 32px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          animation: fadeUp 0.6s backwards;
        }
        .riwayat-card:hover {
          transform: translateY(-3px);
          border-color: rgba(201,168,76,0.4);
          box-shadow: 0 12px 30px rgba(28,17,0,0.03);
        }

        .detail-row {
          display: flex; gap: 40px; margin-top: 12px;
        }
        .detail-item {
          display: flex; flex-direction: column; gap: 4px;
        }
        .detail-label {
          font-size: 10px; color: #C8B890; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;
        }
        .detail-value {
          font-size: 14px; color: #1C1100; font-weight: 500;
        }

        /* SKELETON */
        .skeleton-card {
          background: #FFFFFF; border: 1.5px solid #EDE5D5; border-radius: 16px;
          padding: 24px 32px; margin-bottom: 16px; animation: pulseBlob 1.5s infinite alternate;
        }

        @media (max-width: 768px) {
          .navbar { padding: 0 24px; }
          .main-container { padding: 100px 24px 60px; }
          .riwayat-card { flex-direction: column; align-items: flex-start; gap: 20px; padding: 24px; }
          .detail-row { flex-direction: column; gap: 16px; }
          .badge-container { width: 100%; text-align: left; border-top: 1px solid #EDE5D5; padding-top: 16px; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="serif" style={{ fontSize: '20px', color: '#C9A84C', fontStyle: 'italic', letterSpacing: '1px' }}>
          BilliardPro
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#FAF0DC', fontWeight: '500' }}>{user?.nama || 'Pengguna'}</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'rgba(250,240,220,0.6)', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans'", fontWeight: '500' }}>Beranda</button>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid rgba(250,240,220,0.2)', color: 'rgba(250,240,220,0.6)', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans'" }}>Keluar</button>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="main-container">
        
        {/* Pesan Sukses (Jika redirect dari form reservasi) */}
        {successMsg && (
          <div style={{ background: '#F0FBF6', border: '1px solid #5DCAA5', color: '#2E7D32', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', marginBottom: '24px', animation: 'fadeIn 0.5s' }}>
            {successMsg}
          </div>
        )}

        <div style={{ marginBottom: '40px', animation: 'fadeUp 0.6s 0.1s backwards' }}>
          <div style={{ fontSize: '11px', color: '#C9A84C', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
            AKUN SAYA
          </div>
          <h1 className="serif" style={{ fontSize: '36px', color: '#1C1100', marginBottom: '8px' }}>Riwayat Reservasi</h1>
          <p style={{ fontSize: '14px', color: '#A08860', fontWeight: '300' }}>Pantau status dan detail jadwal bermain Anda di sini.</p>
        </div>

        {error ? (
          <div style={{ textAlign: 'center', padding: '60px 0', animation: 'fadeIn 0.5s' }}>
            <p style={{ color: '#E07B5A', marginBottom: '12px' }}>{error}</p>
            <button onClick={() => window.location.reload()} style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid #C9A84C', color: '#8A5A10', padding: '8px 20px', borderRadius: '30px', fontSize: '12px', cursor: 'pointer' }}>Muat Ulang</button>
          </div>
        ) : isLoading ? (
          <div>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card" style={{ opacity: 0.5 }}>
                <div style={{ width: '30%', height: '24px', background: '#EDE5D5', borderRadius: '4px', marginBottom: '16px' }} />
                <div style={{ width: '60%', height: '14px', background: '#F5F0E6', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {riwayatList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', border: '1.5px dashed #EDE5D5', borderRadius: '16px', animation: 'fadeIn 0.5s' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F5F0E6', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8B890" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <h3 className="serif" style={{ fontSize: '20px', color: '#1C1100', marginBottom: '4px' }}>Belum ada reservasi</h3>
                <p style={{ fontSize: '13px', color: '#A08860', marginBottom: '20px' }}>Anda belum memiliki riwayat pemesanan meja.</p>
                <Link to="/" style={{ background: '#1C1100', color: '#C9A84C', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '600' }}>Buat Reservasi Sekarang</Link>
              </div>
            ) : (
              riwayatList.map((riwayat, index) => (
                <div key={riwayat.id} className="riwayat-card" style={{ animationDelay: `${0.1 * index}s` }}>
                  <div>
                    <h3 className="serif" style={{ fontSize: '24px', color: '#1C1100' }}>
                      Meja {riwayat.Meja?.nomor_meja || 'N/A'}
                    </h3>
                    
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-label">Tanggal</span>
                        <span className="detail-value">{formatDate(riwayat.tanggal)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Waktu Bermain</span>
                        <span className="detail-value">{riwayat.jam_mulai.slice(0,5)} — {riwayat.jam_selesai.slice(0,5)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Biaya / Jam</span>
                        <span className="detail-value" style={{ color: '#C9A84C' }}>Rp {Number(riwayat.Meja?.harga_per_jam || 0).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="badge-container">
                    <ReservasiBadge status={riwayat.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default RiwayatPage;