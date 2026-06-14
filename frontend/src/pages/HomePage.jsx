import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const StatusBadge = ({ status }) => {
  let styles = {};
  switch (status?.toLowerCase()) {
    case 'tersedia':
      styles = { bg: 'rgba(93,202,165,0.1)', border: 'rgba(93,202,165,0.2)', text: '#5DCAA5', label: 'Tersedia' };
      break;
    case 'dipesan':
      styles = { bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.2)', text: '#C9A84C', label: 'Dipesan' };
      break;
    case 'digunakan':
      styles = { bg: 'rgba(224,123,90,0.1)', border: 'rgba(224,123,90,0.2)', text: '#E07B5A', label: 'Digunakan' };
      break;
    default:
      styles = { bg: '#F0EBE1', border: '#EDE5D5', text: '#A08860', label: status || 'Unknown' };
  }

  return (
    <span style={{
      backgroundColor: styles.bg, border: `1px solid ${styles.border}`, color: styles.text,
      padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '600',
      letterSpacing: '0.5px', fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: '4px'
    }}>
      {status?.toLowerCase() === 'tersedia' && <div style={{width: '4px', height: '4px', borderRadius: '50%', backgroundColor: styles.text, animation: 'fadeIn 1s infinite alternate'}} />}
      {styles.label}
    </span>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [mejaList, setMejaList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('semua');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk Hamburger Menu Mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mengambil katalog meja dari Backend Asli
  useEffect(() => {
    const fetchMeja = async () => {
      try {
        const response = await api.get('/meja');
        setMejaList(response.data.data || []);
        setIsLoading(false);
      } catch (err) {
        setError('Gagal memuat data meja. Pastikan server backend berjalan.');
        setIsLoading(false);
      }
    };
    fetchMeja();
  }, []);

  const totalMeja = mejaList.length;
  const mejaTersedia = mejaList.filter(m => m.status === 'tersedia').length;
  const mejaDigunakan = mejaList.filter(m => m.status === 'digunakan').length;

  const filteredMeja = filterStatus === 'semua' ? mejaList : mejaList.filter(m => m.status === filterStatus);

  const handleReservasiClick = (mejaId) => {
    if (!user) navigate('/login', { state: { from: '/reservasi', mejaId } });
    else navigate('/reservasi', { state: { mejaId } });
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
  };

  const tanggalHariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="home-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .home-root {
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
          50%      { opacity: 0.6; transform: scale(1.05); }
        }

        /* NAVBAR */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          height: 60px; background-color: #1C1100; border-bottom: 1px solid rgba(201,168,76,0.15);
          display: flex; justify-content: space-between; align-items: center; padding: 0 48px;
        }

        /* ELEMEN DESKTOP DEFAULT */
        .desktop-menu { display: flex; align-items: center; gap: 16px; }
        .hamburger-btn { display: none; background: transparent; border: none; color: #C9A84C; cursor: pointer; }
        .mobile-sidebar { display: none; }
        .mobile-menu-overlay { display: none; }

        /* HERO SECTION */
        .hero-section {
          position: relative;
          background-color: #1C1100;
          padding: 120px 48px 140px 48px;
          clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%);
          overflow: hidden;
        }
        .dot-grid {
          position: absolute; inset: 0; opacity: 0.4;
          background-image: radial-gradient(circle, rgba(201,168,76,0.15) 1px, transparent 1px);
          background-size: 28px 28px; z-index: 1;
        }

        /* STATS CARDS */
        .stats-container {
          display: flex; gap: 20px;
          margin-top: -80px; position: relative; z-index: 10;
          padding: 0 48px;
          animation: fadeUp 0.8s 0.2s backwards;
        }
        .stat-card {
          flex: 1; background: #FFFFFF; border: 1.5px solid #EDE5D5;
          border-radius: 16px; padding: 24px;
          box-shadow: 0 10px 30px rgba(28,17,0,0.03);
          display: flex; align-items: center; gap: 16px;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .stat-card:hover { transform: translateY(-4px); border-color: rgba(201,168,76,0.4); }

        /* GRID MEJA */
        .grid-container {
          padding: 40px 48px 80px 48px;
        }
        .meja-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;
          margin-top: 24px;
        }
        .meja-card {
          background: #FFFFFF; border: 1.5px solid #EDE5D5; border-radius: 16px;
          padding: 24px; position: relative; overflow: hidden;
          box-shadow: 0 4px 15px rgba(28,17,0,0.02);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          animation: fadeUp 0.6s backwards;
        }
        .meja-card:hover {
          transform: translateY(-4px); border-color: rgba(201,168,76,0.4);
          box-shadow: 0 12px 30px rgba(201,168,76,0.08);
        }

        /* FILTER PILLS */
        .filter-pill {
          background: transparent; border: 1.5px solid #EDE5D5; color: #8A6A30;
          padding: 8px 18px; border-radius: 30px; font-size: 12px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: 0.2s;
        }
        .filter-pill.active {
          background: rgba(201,168,76,0.1); border-color: #C9A84C; color: #8A5A10;
        }

        /* TOMBOL RESERVASI */
        .btn-reservasi {
          width: 100%; padding: 12px; border-radius: 10px; border: none;
          font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 12px; letter-spacing: 0.5px;
          cursor: pointer; transition: 0.2s ease; margin-top: 20px;
        }
        .btn-tersedia { background-color: #C9A84C; color: #1C1100; }
        .btn-tersedia:hover { background-color: #D4B558; box-shadow: 0 4px 15px rgba(201,168,76,0.3); transform: translateY(-1px); }
        .btn-disabled { background-color: #F5F0E6; color: #A08860; cursor: not-allowed; border: 1px solid #EDE5D5; }

        /* GUEST BANNER */
        .guest-banner {
          margin: 0 48px 30px 48px; background: #FFFFFF; border: 1.5px dashed rgba(201,168,76,0.4);
          border-radius: 16px; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between;
          animation: fadeIn 1s 0.4s backwards;
        }

        /* =========================================
           RESPONSIVE MOBILE (HAMBURGER KIRI ALA ADMIN)
           ========================================= */
        @media (max-width: 768px) {
          .navbar, .hero-section, .stats-container, .grid-container, .guest-banner { padding-left: 24px; padding-right: 24px; }
          .stats-container { flex-direction: column; margin-top: -40px; }
          .hero-section { clip-path: polygon(0 0, 100% 0, 100% 95%, 0 100%); padding-top: 100px; padding-bottom: 80px; }
          .guest-banner { flex-direction: column; gap: 16px; text-align: center; }

          /* Sembunyikan Menu Desktop & Tampilkan Hamburger */
          .desktop-menu { display: none !important; }
          .hamburger-btn { display: flex; align-items: center; padding: 4px; margin-right: 4px; }

          /* Overlay Gelap */
          .mobile-menu-overlay {
            display: block; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6); z-index: 95; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
          }
          .mobile-menu-overlay.open { opacity: 1; pointer-events: auto; }

          /* Sidebar Animasi dari Kiri */
          .mobile-sidebar {
            display: flex; flex-direction: column; position: fixed; top: 0; left: -280px; bottom: 0; 
            width: 260px; background-color: #1C1100; color: #FAF0DC; z-index: 100; padding: 32px 24px;
            transition: left 0.3s ease; box-shadow: 4px 0 24px rgba(0,0,0,0.5);
          }
          .mobile-sidebar.open { left: 0; }

          /* Styling Identik dengan Admin Sidebar */
          .mobile-sidebar .sidebar-brand { margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid rgba(201,168,76,0.15); display: flex; justify-content: space-between; align-items: flex-start; }
          .mobile-sidebar .nav-menu { flex: 1; display: flex; flex-direction: column; gap: 8px; }
          .mobile-sidebar .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; color: rgba(250,240,220,0.6); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; text-decoration: none; }
          .mobile-sidebar .nav-item:hover { background: rgba(201,168,76,0.1); color: #FAF0DC; }
          .mobile-sidebar .nav-item.active { background: #C9A84C; color: #1C1100; font-weight: 600; }
          .mobile-sidebar .sidebar-footer { border-top: 1px solid rgba(201,168,76,0.15); padding-top: 24px; margin-top: auto; display: flex; flex-direction: column; gap: 8px; }
        }
      `}</style>

      {/* OVERLAY GELAP MENU MOBILE */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>

      {/* SIDEBAR MOBILE (MUNCUL DARI KIRI) */}
      <aside className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div>
            <div className="serif" style={{ fontSize: '24px', color: '#C9A84C', fontStyle: 'italic', letterSpacing: '1px', marginBottom: '4px' }}>BilliardPro</div>
            <span style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', padding: '3px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '600', letterSpacing: '1px' }}>
              {user ? (user.role === 'admin' ? 'ADMIN' : 'PELANGGAN') : 'TAMU'}
            </span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(250,240,220,0.6)', cursor: 'pointer', padding: '4px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <nav className="nav-menu">
          <div className="nav-item active" onClick={() => setIsMobileMenuOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Beranda
          </div>
          {user && (
            <div className="nav-item" onClick={() => { navigate(user.role === 'admin' ? '/admin' : '/riwayat'); setIsMobileMenuOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              {user.role === 'admin' ? 'Dashboard Admin' : 'Riwayat Reservasi'}
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          {user ? (
            <>
              <div style={{ padding: '0 16px 12px', fontSize: '13px', color: '#FAF0DC', fontWeight: '500' }}>Halo, {user.nama}</div>
              <div className="nav-item" onClick={handleLogout} style={{ color: '#E07B5A' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Keluar Sistem
              </div>
            </>
          ) : (
            <>
              <div className="nav-item" onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                Masuk
              </div>
              <div className="nav-item" onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }} style={{ background: '#C9A84C', color: '#1C1100', fontWeight: '600' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                Daftar Akun Baru
              </div>
            </>
          )}
        </div>
      </aside>

      {/* NAVBAR (KONTEN) */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Tombol Hamburger (Hanya Tampil di Mobile, Di KIRI) */}
          <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          
          <div className="serif" style={{ fontSize: '20px', color: '#C9A84C', fontStyle: 'italic', letterSpacing: '1px' }}>
            BilliardPro
          </div>
        </div>

        {/* Menu Desktop Asli (Hanya Tampil di Desktop) */}
        <div className="desktop-menu">
          {!user ? (
            <>
              <span style={{ fontSize: '11px', color: 'rgba(250,240,220,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tamu</span>
              <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: "'DM Sans'" }}>Masuk</button>
              <button onClick={() => navigate('/register')} style={{ background: '#C9A84C', border: 'none', color: '#1C1100', padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: "'DM Sans'" }}>Daftar</button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#FAF0DC', fontWeight: '500' }}>{user.nama}</span>
                {user.role === 'admin' && <span style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '600' }}>ADMIN</span>}
              </div>
              <button onClick={() => navigate(user.role === 'admin' ? '/admin' : '/riwayat')} style={{ background: 'transparent', border: 'none', color: 'rgba(250,240,220,0.6)', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans'", fontWeight: '500' }}>{user.role === 'admin' ? 'Dashboard' : 'Riwayat'}</button>
              <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(250,240,220,0.2)', color: 'rgba(250,240,220,0.6)', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans'" }}>Keluar</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO SECTION DENGAN DIAGONAL CUT */}
      <section className="hero-section">
        <div className="dot-grid" />
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)', animation: 'pulseBlob 8s ease-in-out infinite', zIndex: 2 }} />
        <div style={{ position: 'absolute', bottom: '0', left: '10%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(93,202,165,0.05) 0%, transparent 70%)', animation: 'pulseBlob 6s ease-in-out infinite reverse', zIndex: 2 }} />

        <div style={{ position: 'relative', zIndex: 5, animation: 'fadeUp 0.8s backwards' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '6px', height: '6px', backgroundColor: '#5DCAA5', borderRadius: '50%', boxShadow: '0 0 0 3px rgba(93,202,165,0.2)' }} />
            <span style={{ fontSize: '11px', color: '#5DCAA5', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '600' }}>LIVE STATUS</span>
            <span style={{ fontSize: '11px', color: 'rgba(250,240,220,0.3)', marginLeft: '12px' }}>{tanggalHariIni}</span>
          </div>
          
          <h1 className="serif" style={{ fontSize: '42px', color: '#FAF0DC', fontWeight: '400', lineHeight: '1.2', marginBottom: '12px' }}>
            Eksplorasi <span style={{ fontStyle: 'italic', color: '#C9A84C' }}>ketersediaan</span> meja.
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(250,240,220,0.5)', fontWeight: '300', maxWidth: '400px', lineHeight: '1.6' }}>
            Pantau status meja billiard secara real-time dan amankan jadwal bermain Anda dengan sistem reservasi digital kami.
          </p>
        </div>
      </section>

      {/* STATS CARDS (Overlapping Diagonal) */}
      <section className="stats-container">
        {[
          { 
            label: 'Total Meja', 
            val: totalMeja, 
            color: '#C9A84C', 
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="10" rx="2" />
                <path d="M5 17v2M19 17v2" />
                <circle cx="12" cy="12" r="1.5" />
              </svg>
            )
          },
          { 
            label: 'Tersedia', 
            val: mejaTersedia, 
            color: '#5DCAA5', 
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5DCAA5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )
          },
          { 
            label: 'Sedang Dipakai', 
            val: mejaDigunakan, 
            color: '#E07B5A', 
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E07B5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l2.5 2.5" />
              </svg>
            )
          }
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${stat.color}15`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <div className="serif" style={{ fontSize: '28px', color: '#1C1100', lineHeight: '1' }}>
                {isLoading ? '-' : stat.val}
              </div>
              <div style={{ fontSize: '11px', color: '#A08860', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* MAIN CONTENT: GRID & FILTER */}
      <section className="grid-container">
        
        {/* Guest Banner */}
        {!user && (
          <div className="guest-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
              <div>
                <h3 className="serif" style={{ fontSize: '18px', color: '#1C1100', marginBottom: '2px' }}>Ingin membuat reservasi?</h3>
                <p style={{ fontSize: '12px', color: '#A08860' }}>Masuk ke akun Anda terlebih dahulu untuk mengamankan meja.</p>
              </div>
            </div>
            <button onClick={() => navigate('/login')} style={{ background: '#1C1100', color: '#C9A84C', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: "'DM Sans'" }}>Masuk Sekarang</button>
          </div>
        )}

        {/* Section Header & Filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1.5px solid #EDE5D5', paddingBottom: '16px', animation: 'fadeIn 0.8s 0.3s backwards' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#C9A84C', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>KATALOG</div>
            <h2 className="serif" style={{ fontSize: '24px', color: '#1C1100' }}>Daftar Meja</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['semua', 'tersedia', 'dipesan'].map(f => (
              <button key={f} className={`filter-pill ${filterStatus === f ? 'active' : ''}`} onClick={() => setFilterStatus(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Meja */}
        {error ? (
          <div style={{ textAlign: 'center', padding: '80px 0', animation: 'fadeIn 0.5s' }}>
            <p style={{ color: '#E07B5A', marginBottom: '12px' }}>{error}</p>
            <button onClick={() => window.location.reload()} className="filter-pill active">Coba Lagi</button>
          </div>
        ) : isLoading ? (
          <div className="meja-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="meja-card" style={{ opacity: 0.6 }}>
                <div style={{ height: '24px', width: '40%', background: '#EDE5D5', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ height: '14px', width: '60%', background: '#F5F0E6', borderRadius: '4px', marginBottom: '24px' }} />
                <div style={{ height: '1px', background: '#EDE5D5', marginBottom: '16px' }} />
                <div style={{ height: '20px', width: '50%', background: '#EDE5D5', borderRadius: '4px', marginBottom: '24px' }} />
                <div style={{ height: '40px', width: '100%', background: '#F5F0E6', borderRadius: '8px' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="meja-grid">
            {filteredMeja.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#A08860' }}>Tidak ada meja dengan status ini.</div>
            ) : (
              filteredMeja.map((meja, index) => {
                const isTersedia = meja.status === 'tersedia';
                
                return (
                  <div key={meja.id} className="meja-card" style={{ animationDelay: `${0.1 * index}s` }}>
                    {/* Top Accent Line */}
                    {isTersedia && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #C9A84C, #E8D5A3)' }} />}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <h3 className="serif" style={{ fontSize: '22px', color: '#1C1100' }}>Meja {meja.nomor_meja}</h3>
                        <p style={{ fontSize: '11px', color: '#8A6A30', marginTop: '2px' }}>{meja.deskripsi}</p>
                      </div>
                      <StatusBadge status={meja.status} />
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#EDE5D5', margin: '16px 0' }} />

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span className="serif" style={{ fontSize: '20px', color: '#C9A84C' }}>Rp {Number(meja.harga_per_jam).toLocaleString('id-ID')}</span>
                      <span style={{ fontSize: '12px', color: '#A08860' }}>/ jam</span>
                    </div>

                    <button 
                      onClick={() => isTersedia && handleReservasiClick(meja.id)}
                      disabled={!isTersedia}
                      className={`btn-reservasi ${isTersedia ? 'btn-tersedia' : 'btn-disabled'}`}
                    >
                      {isTersedia ? 'Reservasi Sekarang' : 'Tidak Tersedia'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;