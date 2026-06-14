import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Komponen Badge Status Admin
const StatusBadge = ({ status }) => {
  let styles = {};
  switch (status?.toLowerCase()) {
    case 'dikonfirmasi':
      styles = { bg: 'rgba(93,202,165,0.1)', border: 'rgba(93,202,165,0.2)', text: '#5DCAA5', label: 'Lunas / Aktif' };
      break;
    case 'selesai':
      styles = { bg: 'rgba(160,136,96,0.1)', border: 'rgba(160,136,96,0.2)', text: '#A08860', label: 'Sesi Selesai' };
      break;
    case 'pending':
      styles = { bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.2)', text: '#C9A84C', label: 'Menunggu Bayar' };
      break;
    case 'dibatalkan':
      styles = { bg: 'rgba(224,123,90,0.1)', border: 'rgba(224,123,90,0.2)', text: '#E07B5A', label: 'Dibatalkan' };
      break;
    case 'tersedia':
      styles = { bg: 'rgba(93,202,165,0.1)', border: 'rgba(93,202,165,0.2)', text: '#5DCAA5', label: 'Tersedia' };
      break;
    case 'dipesan':
      styles = { bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.2)', text: '#C9A84C', label: 'Dipesan' };
      break;
    default:
      styles = { bg: '#F0EBE1', border: '#EDE5D5', text: '#A08860', label: status || 'Unknown' };
  }

  return (
    <span style={{
      backgroundColor: styles.bg, border: `1px solid ${styles.border}`, color: styles.text,
      padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
      letterSpacing: '0.5px', display: 'inline-block', textAlign: 'center', minWidth: '90px'
    }}>
      {styles.label}
    </span>
  );
};

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [activeMenu, setActiveMenu] = useState('monitor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [reservasiList, setReservasiList] = useState([]);
  const [mejaList, setMejaList] = useState([]);
  const [pelangganList, setPelangganList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formDataMeja, setFormDataMeja] = useState({ nomor_meja: '', deskripsi: '', harga_per_jam: '' });
  const [isSubmittingMeja, setIsSubmittingMeja] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resReservasi, resMeja, resPelanggan] = await Promise.all([
        api.get('/reservasi').catch(() => ({ data: { data: [] } })),
        api.get('/meja').catch(() => ({ data: { data: [] } })),
        api.get('/auth/admin/users').catch(() => ({ data: { data: [] } })) 
      ]);
      
      setReservasiList(resReservasi.data?.data || []);
      setMejaList(resMeja.data?.data || []);
      
      const customersOnly = (resPelanggan.data?.data || []).filter(u => u.role !== 'admin');
      setPelangganList(customersOnly);
      
    } catch (err) {
      setError('Gagal memuat data dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelesaikanSesi = async (id) => {
    if (!window.confirm('Tandai sesi ini selesai dan kosongkan meja?')) return;
    try {
      await api.put(`/reservasi/${id}/status`, { status: 'selesai' });
      setReservasiList(prev => prev.map(res => res.id === id ? { ...res, status: 'selesai' } : res));
      fetchData(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyelesaikan sesi.');
    }
  };

  const handleHapusReservasi = async (id) => {
    if (!window.confirm('Hapus riwayat reservasi ini secara permanen?')) return;
    try {
      await api.delete(`/reservasi/${id}`);
      setReservasiList(reservasiList.filter(res => res.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus riwayat.');
    }
  };

  const handleInputMejaChange = (e) => {
    setFormDataMeja({ ...formDataMeja, [e.target.name]: e.target.value });
  };

  const handleTambahMeja = async (e) => {
    e.preventDefault();
    setIsSubmittingMeja(true);
    try {
      const response = await api.post('/meja', formDataMeja); 
      setMejaList([...mejaList, response.data.data]);
      setFormDataMeja({ nomor_meja: '', deskripsi: '', harga_per_jam: '' });
      alert('Meja baru berhasil ditambahkan!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan meja.');
    } finally {
      setIsSubmittingMeja(false);
    }
  };

  const handleHapusMeja = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus meja ini?')) return;
    try {
      await api.delete(`/meja/${id}`);
      setMejaList(mejaList.filter(m => m.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus meja.');
    }
  };

  // ====================================================================
  // FUNGSI BARU: RESET STATUS MEJA JADI TERSEDIA
  // ====================================================================
  const handleResetMeja = async (id) => {
    if (!window.confirm('Paksakan meja ini untuk kembali Tersedia?')) return;
    try {
      await api.put(`/meja/${id}/status`, { status: 'tersedia' });
      setMejaList(mejaList.map(m => m.id === id ? { ...m, status: 'tersedia' } : m));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status meja.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const cleanDate = dateString.split('T')[0]; 
    return new Date(cleanDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // ====================================================================
  // LOGIKA FILTER 30 HARI & GRAFIK (BAR & PIE)
  // ====================================================================
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const filteredReservasi = reservasiList.filter(res => {
    if (!res.tanggal) return false;
    const resDate = new Date(res.tanggal);
    return resDate >= thirtyDaysAgo;
  });

  let totalTransaksiBerhasil = 0;
  let estimasiPendapatan = 0;
  
  const revenueMap = {}; 
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayCounts = { 'Minggu': 0, 'Senin': 0, 'Selasa': 0, 'Rabu': 0, 'Kamis': 0, 'Jumat': 0, 'Sabtu': 0 };
  let totalSewaMeja = 0;

  filteredReservasi.forEach(res => {
    if (res.status === 'dikonfirmasi' || res.status === 'selesai') {
      totalTransaksiBerhasil++;
      
      const start = parseInt(res.jam_mulai?.split(':')[0] || 0);
      const end = parseInt(res.jam_selesai?.split(':')[0] || 0);
      let durasi = end - start;
      if (durasi <= 0) durasi = 1;

      const harga = parseFloat(res.Meja?.harga_per_jam || 35000);
      const totalBayar = (durasi * harga);
      estimasiPendapatan += totalBayar;

      const resDateStr = res.tanggal?.split('T')[0];
      if (!revenueMap[resDateStr]) {
        revenueMap[resDateStr] = 0;
      }
      revenueMap[resDateStr] += totalBayar;

      const resDateObj = new Date(res.tanggal);
      const dayName = dayNames[resDateObj.getDay()];
      dayCounts[dayName]++;
      totalSewaMeja++;
    }
  });

  const chartData = Object.keys(revenueMap)
    .sort((a, b) => new Date(a) - new Date(b))
    .map(dateStr => {
      const d = new Date(dateStr);
      return {
        label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        value: revenueMap[dateStr],
        fullDate: dateStr
      };
    });
  const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value), 100000) : 100000;

  const pieColors = { 
    'Senin': '#89ABE3',   
    'Selasa': '#F2A174',  
    'Rabu': '#C4C4C4',    
    'Kamis': '#F7D673',   
    'Jumat': '#A3BCE2',   
    'Sabtu': '#5DCAA5',   
    'Minggu': '#E07B5A'   
  };
  
  let conicString = '';
  let currentPercentage = 0;
  const legendData = [];

  const sortedDays = Object.keys(dayCounts).sort((a, b) => dayCounts[b] - dayCounts[a]);
  
  sortedDays.forEach(day => {
    if(dayCounts[day] > 0) {
        const percentage = (dayCounts[day] / totalSewaMeja) * 100;
        const end = currentPercentage + percentage;
        conicString += `${pieColors[day]} ${currentPercentage}% ${end}%, `;
        currentPercentage = end;
        legendData.push({ day, count: dayCounts[day], color: pieColors[day], percentage: percentage.toFixed(1) });
    }
  });
  conicString = conicString ? conicString.slice(0, -2) : '#EDE5D5 0% 100%';

  // ====================================================================
  // FITUR EKSPOR LAPORAN PDF
  // ====================================================================
  const handleCetakPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(28, 17, 0); 
      doc.text('BilliardPro', 14, 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.text('Laporan Pendapatan & Reservasi', 14, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Periode: 30 Hari Terakhir`, 14, 36);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 42);

      doc.setDrawColor(201, 168, 76); 
      doc.setLineWidth(0.5);
      doc.line(14, 48, 196, 48);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(28, 17, 0);
      doc.text(`Total Transaksi Lunas: ${totalTransaksiBerhasil} Sesi`, 14, 58);
      doc.text(`Estimasi Pendapatan: Rp ${estimasiPendapatan.toLocaleString('id-ID')}`, 14, 65);

      const tableColumn = ["Tanggal", "Pelanggan", "Meja", "Waktu", "Status"];
      const tableRows = [];

      const dataLaporan = filteredReservasi.filter(res => res.status === 'dikonfirmasi' || res.status === 'selesai');
      
      dataLaporan.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

      dataLaporan.forEach(res => {
        const reservasiData = [
          formatDate(res.tanggal),
          res.User?.nama || '-',
          `Meja ${res.Meja?.nomor_meja || '-'}`,
          `${res.jam_mulai?.slice(0,5)} - ${res.jam_selesai?.slice(0,5)}`,
          res.status.toUpperCase()
        ];
        tableRows.push(reservasiData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 75,
        theme: 'grid',
        styles: { fontSize: 9, font: 'helvetica', textColor: [40, 40, 40] },
        headStyles: { fillColor: [201, 168, 76], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [253, 248, 240] }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Dicetak secara otomatis oleh Sistem BilliardPro - Halaman ${i} dari ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      doc.save(`Laporan_BilliardPro_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Gagal membuat PDF:", err);
      alert("Terjadi kesalahan saat memproses laporan PDF. Silakan cek console browser.");
    }
  };

  return (
    <div className="admin-layout">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .admin-layout { display: flex; min-height: 100vh; background-color: #FFFDF8; font-family: 'DM Sans', sans-serif; color: #1C1100; position: relative; }
        .serif { font-family: 'DM Serif Display', serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .mobile-header { display: none; }
        .sidebar-overlay { display: none; }

        .sidebar { width: 260px; background-color: #1C1100; color: #FAF0DC; display: flex; flex-direction: column; position: fixed; top: 0; bottom: 0; left: 0; z-index: 100; padding: 32px 24px; transition: transform 0.3s ease; }
        .sidebar-brand { margin-bottom: 48px; padding-bottom: 24px; border-bottom: 1px solid rgba(201,168,76,0.15); }
        .nav-menu { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; color: rgba(250,240,220,0.6); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .nav-item:hover { background: rgba(201,168,76,0.1); color: #FAF0DC; }
        .nav-item.active { background: #C9A84C; color: #1C1100; font-weight: 600; }
        .sidebar-footer { border-top: 1px solid rgba(201,168,76,0.15); padding-top: 24px; margin-top: auto; }

        .main-content { flex: 1; margin-left: 260px; padding: 48px; position: relative; width: 100%; overflow-x: hidden; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; animation: fadeIn 0.6s backwards; }

        .admin-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 32px; animation: fadeUp 0.6s 0.1s backwards; }
        .stat-box { background: #FFFFFF; border: 1.5px solid #EDE5D5; border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 10px 30px rgba(28,17,0,0.02); }

        .charts-grid { display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 24px; margin-bottom: 40px; animation: fadeUp 0.6s 0.15s backwards; }
        .chart-card { background: #FFFFFF; border: 1.5px solid #EDE5D5; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(28,17,0,0.02); display: flex; flex-direction: column; }
        
        .chart-wrapper { flex: 1; display: flex; align-items: flex-end; justify-content: space-around; min-height: 180px; gap: 12px; padding-bottom: 8px; border-bottom: 1.5px dashed #EDE5D5; margin-top: 24px; }
        .chart-bar-container { flex: 1; max-width: 50px; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; position: relative; }
        .chart-bar { width: 100%; background: linear-gradient(180deg, #C9A84C 0%, rgba(201,168,76,0.3) 100%); border-radius: 4px 4px 0 0; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .chart-bar:hover { background: #1C1100; transform: scaleY(1.05); transform-origin: bottom; }
        
        .chart-tooltip { position: absolute; bottom: calc(100% + 12px); left: 50%; transform: translateX(-50%) translateY(10px); background: #1C1100; color: #FFF; padding: 8px 12px; border-radius: 8px; font-size: 11px; white-space: nowrap; opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 8px 24px rgba(28,17,0,0.2); z-index: 10; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .chart-tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border-width: 5px; border-style: solid; border-color: #1C1100 transparent transparent transparent; }
        .chart-bar-container:hover .chart-tooltip { opacity: 1; transform: translateX(-50%) translateY(0); }
        .chart-date-label { font-size: 10px; color: #8A6A30; font-weight: 600; text-transform: uppercase; margin-top: 12px; text-align: center; letter-spacing: 0.5px; }
        
        .pie-container { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; margin-top: 16px; gap: 24px; }
        .pie-chart { width: 180px; height: 180px; border-radius: 50%; background: conic-gradient(${conicString}); box-shadow: 0 8px 24px rgba(28,17,0,0.06); transition: transform 0.4s ease; border: 2px solid #FFFFFF; }
        .pie-chart:hover { transform: scale(1.03); }
        .legend-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; width: 100%; margin-top: 16px; }
        .legend-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 11px; color: #1C1100; font-weight: 500; background: #FDF8F0; padding: 6px 10px; border-radius: 6px; border: 1px solid #EDE5D5; }
        .legend-item-left { display: flex; align-items: center; gap: 8px; }
        .legend-dot { width: 10px; height: 10px; border-radius: 3px; }

        .table-container { background: #FFFFFF; border: 1.5px solid #EDE5D5; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(28,17,0,0.02); animation: fadeUp 0.6s 0.2s backwards; }
        .table-wrapper { width: 100%; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { background: #FDF8F0; padding: 16px 24px; font-size: 11px; color: #8A6A30; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1.5px solid #EDE5D5; font-weight: 600; white-space: nowrap; }
        td { padding: 16px 24px; border-bottom: 1px solid #F5F0E6; font-size: 13px; color: #1C1100; vertical-align: middle; white-space: nowrap; }
        tr:hover { background-color: rgba(201,168,76,0.03); }

        .form-inline { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; background: #FDF8F0; padding: 24px; border-bottom: 1.5px solid #EDE5D5; }
        .input-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 150px; }
        .input-group label { font-size: 10px; color: #8A6A30; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .form-input { padding: 10px 14px; border: 1.5px solid #EDE5D5; border-radius: 8px; font-family: 'DM Sans'; font-size: 13px; outline: none; transition: 0.2s; }
        .form-input:focus { border-color: #C9A84C; }

        .btn-action { padding: 8px 14px; border-radius: 8px; border: none; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; cursor: pointer; transition: 0.2s; letter-spacing: 0.5px; }
        .btn-done { background: #1C1100; color: #C9A84C; }
        .btn-done:hover { background: #2A1A00; transform: translateY(-1px); }
        .btn-reject { background: transparent; border: 1.5px solid #E07B5A; color: #E07B5A; }
        .btn-reject:hover { background: rgba(224,123,90,0.1); }
        .btn-primary { background: #C9A84C; color: #1C1100; padding: 12px 20px; border-radius: 8px; border: none; font-weight: 600; font-size: 12px; cursor: pointer; transition: 0.2s; white-space: nowrap; height: 42px;}
        .btn-primary:hover { background: #D4B558; transform: translateY(-1px); }

        @media (max-width: 1100px) {
          .charts-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 900px) {
          .admin-layout { flex-direction: column; }
          .mobile-header { display: flex; justify-content: space-between; align-items: center; background-color: #1C1100; color: #FAF0DC; padding: 16px 24px; position: sticky; top: 0; z-index: 90; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .main-content { margin-left: 0; padding: 24px 16px; }
          .admin-header { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
          .sidebar { transform: translateX(-100%); box-shadow: 4px 0 24px rgba(0,0,0,0.5); }
          .sidebar.open { transform: translateX(0); }
          .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 95; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
          .sidebar-overlay.open { opacity: 1; pointer-events: auto; }
          .form-inline { flex-direction: column; align-items: stretch; padding: 20px 16px; }
          .input-group { width: 100%; flex: none; }
          .btn-primary { width: 100%; margin-top: 8px; }
          .chart-wrapper { justify-content: flex-start; overflow-x: auto; padding-bottom: 16px; }
          .chart-bar-container { min-width: 48px; }
        }
      `}</style>

      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: '#C9A84C', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div className="serif" style={{ fontSize: '22px', color: '#C9A84C', fontStyle: 'italic', letterSpacing: '0.5px' }}>BilliardPro</div>
        </div>
        <div style={{ width: '8px', height: '8px', background: '#5DCAA5', borderRadius: '50%', boxShadow: '0 0 0 3px rgba(93,202,165,0.2)' }} />
      </div>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="serif" style={{ fontSize: '24px', color: '#C9A84C', fontStyle: 'italic', letterSpacing: '1px', marginBottom: '4px' }}>BilliardPro</div>
          <span style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', padding: '3px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '600', letterSpacing: '1px' }}>PANEL ADMIN</span>
        </div>

        <nav className="nav-menu">
          <div className={`nav-item ${activeMenu === 'monitor' ? 'active' : ''}`} onClick={() => { setActiveMenu('monitor'); setIsSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Pantauan Jadwal
          </div>
          <div className={`nav-item ${activeMenu === 'meja' ? 'active' : ''}`} onClick={() => { setActiveMenu('meja'); setIsSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            Manajemen Meja
          </div>
          <div className={`nav-item ${activeMenu === 'pelanggan' ? 'active' : ''}`} onClick={() => { setActiveMenu('pelanggan'); setIsSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Data Pelanggan
          </div>
          <div className="nav-item" onClick={() => navigate('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Web Publik
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" onClick={logout} style={{ color: '#E07B5A' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Keluar Sistem
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="admin-header">
          <div>
            <h1 className="serif" style={{ fontSize: '32px', color: '#1C1100', marginBottom: '6px' }}>
              {activeMenu === 'monitor' ? 'Pantauan Jadwal' : activeMenu === 'meja' ? 'Katalog Meja' : 'Data Pelanggan'}
            </h1>
            <p style={{ fontSize: '14px', color: '#A08860', fontWeight: '300' }}>
              {activeMenu === 'monitor' ? 'Monitor status meja dan transaksi pelanggan.' : activeMenu === 'meja' ? 'Kelola inventaris dan harga meja.' : 'Daftar pengguna yang telah melakukan registrasi.'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FFFFFF', border: '1.5px solid #EDE5D5', padding: '8px 16px', borderRadius: '30px' }}>
            <div style={{ width: '8px', height: '8px', background: '#5DCAA5', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', fontWeight: '500', color: '#1C1100' }}>Halo, {user?.nama || 'Admin'}</span>
          </div>
        </div>

        {error && <div style={{ padding: '20px', background: '#FDECEA', color: '#E07B5A', borderRadius: '10px', marginBottom: '20px' }}>{error}</div>}

        {/* ----------------- TAB: PANTAUAN JADWAL ----------------- */}
        {activeMenu === 'monitor' && (
          <>
            <div className="admin-stats">
              <div className="stat-box">
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(93,202,165,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5DCAA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                <div>
                  <div className="serif" style={{ fontSize: '32px', color: '#1C1100', lineHeight: '1' }}>{isLoading ? '-' : totalTransaksiBerhasil}</div>
                  <div style={{ fontSize: '11px', color: '#A08860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>Transaksi Lunas (30 Hari)</div>
                </div>
              </div>
              <div className="stat-box">
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>
                <div>
                  <div className="serif" style={{ fontSize: '32px', color: '#C9A84C', lineHeight: '1' }}>{isLoading ? '-' : `Rp ${estimasiPendapatan.toLocaleString('id-ID')}`}</div>
                  <div style={{ fontSize: '11px', color: '#A08860', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>Pendapatan (30 Hari)</div>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 className="serif" style={{ fontSize: '22px', color: '#1C1100', marginBottom: '4px' }}>Tren Pendapatan</h3>
                    <p style={{ fontSize: '12px', color: '#A08860' }}>Visualisasi uang masuk 30 hari terakhir.</p>
                  </div>
                </div>
                
                <div className="chart-wrapper">
                  {chartData.length === 0 ? (
                    <div style={{ color: '#A08860', fontStyle: 'italic', fontSize: '13px', margin: 'auto' }}>Belum ada transaksi.</div>
                  ) : (
                    chartData.map((data, index) => (
                      <div key={index} className="chart-bar-container">
                        <div className="chart-tooltip">
                          <span style={{ color: '#C9A84C', fontWeight: '500' }}>{data.label}</span>
                          <span className="serif" style={{ fontSize: '14px' }}>Rp {data.value.toLocaleString('id-ID')}</span>
                        </div>
                        <div 
                          className="chart-bar" 
                          style={{ 
                            height: `${(data.value / maxRevenue) * 100}%`, 
                            minHeight: data.value > 0 ? '4px' : '0px',
                            background: data.value > 0 ? 'linear-gradient(180deg, #C9A84C 0%, rgba(201,168,76,0.6) 100%)' : 'transparent'
                          }}
                        />
                        <div className="chart-date-label">{data.label.split(' ')[0]}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="chart-card">
                <h3 className="serif" style={{ fontSize: '22px', color: '#1C1100', marginBottom: '4px' }}>Hari Teramai</h3>
                <p style={{ fontSize: '12px', color: '#A08860' }}>Persentase penyewaan berdasarkan hari.</p>
                
                <div className="pie-container">
                  <div className="pie-chart" title={`Total Penyewaan: ${totalSewaMeja} Sesi`} />
                  
                  <div className="legend-grid">
                    {legendData.map((item, idx) => (
                      <div key={idx} className="legend-item">
                        <div className="legend-item-left">
                           <div className="legend-dot" style={{ backgroundColor: item.color }} />
                           <span>{item.day}</span>
                        </div>
                        <span style={{ fontWeight: '600', color: item.color }}>{item.percentage}%</span>
                      </div>
                    ))}
                    {legendData.length === 0 && <span style={{ color: '#A08860', fontSize: '12px', gridColumn: 'span 2', textAlign: 'center' }}>Belum ada data</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="table-container">
              <div style={{ padding: '24px', borderBottom: '1.5px solid #EDE5D5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="serif" style={{ fontSize: '22px', color: '#1C1100' }}>Riwayat & Jadwal</h3>
                
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <button onClick={handleCetakPDF} className="btn-primary" style={{ height: '34px', padding: '0 16px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', background: '#1C1100', color: '#C9A84C' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Unduh Laporan PDF
                  </button>
                  <span style={{ fontSize: '11px', background: '#FDF8F0', color: '#A08860', padding: '6px 12px', borderRadius: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>30 HARI TERAKHIR</span>
                </div>
              </div>
              
              <div className="table-wrapper">
                {isLoading ? <div style={{ padding: '60px', textAlign: 'center', color: '#A08860' }}>Memuat data...</div> : filteredReservasi.length === 0 ? <div style={{ padding: '60px', textAlign: 'center', color: '#A08860' }}>Belum ada data reservasi dalam 30 hari terakhir.</div> : (
                  <table>
                    <thead><tr><th>Pelanggan</th><th>Meja</th><th>Jadwal Bermain</th><th>Status</th><th>Aksi / Kendali</th></tr></thead>
                    <tbody>
                      {filteredReservasi.map((res) => (
                        <tr key={res.id}>
                          <td><div style={{ fontWeight: '600' }}>{res.User?.nama}</div><div style={{ fontSize: '11px', color: '#A08860' }}>{res.User?.email}</div></td>
                          <td><div style={{ fontWeight: '600', color: '#C9A84C' }}>Meja {res.Meja?.nomor_meja}</div></td>
                          <td><div style={{ fontWeight: '500' }}>{formatDate(res.tanggal)}</div><div style={{ fontSize: '11px', color: '#A08860' }}>{res.jam_mulai?.slice(0,5)} — {res.jam_selesai?.slice(0,5)}</div></td>
                          <td><StatusBadge status={res.status} /></td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {res.status === 'dikonfirmasi' ? (
                                <button className="btn-action btn-done" onClick={() => handleSelesaikanSesi(res.id)}>
                                  Selesaikan Sesi
                                </button>
                              ) : res.status === 'selesai' ? (
                                <span style={{ fontSize: '12px', color: '#A08860', fontStyle: 'italic' }}>Telah Selesai</span>
                              ) : res.status === 'pending' ? (
                                 <span style={{ fontSize: '12px', color: '#C8B890', fontStyle: 'italic' }}>Belum Dibayar</span>
                              ) : <span style={{ fontSize: '12px', color: '#C8B890', fontStyle: 'italic' }}>-</span>}
                              
                              <button 
                                className="btn-action btn-reject" 
                                onClick={() => handleHapusReservasi(res.id)}
                                style={{ padding: '6px 10px', fontSize: '10px' }}
                                title="Hapus Riwayat"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {/* ----------------- TAB: DATA PELANGGAN ----------------- */}
        {activeMenu === 'pelanggan' && (
          <div className="table-container">
             <div style={{ padding: '24px', borderBottom: '1.5px solid #EDE5D5' }}>
                <h3 className="serif" style={{ fontSize: '22px', color: '#1C1100' }}>Daftar Pengguna Sistem</h3>
             </div>
             <div className="table-wrapper">
               {isLoading ? <div style={{ padding: '60px', textAlign: 'center', color: '#A08860' }}>Memuat data...</div> : pelangganList.length === 0 ? <div style={{ padding: '60px', textAlign: 'center', color: '#A08860' }}>Belum ada pelanggan yang mendaftar.</div> : (
                  <table>
                    <thead><tr><th>Nama Lengkap</th><th>Email Pelanggan</th><th>Tanggal Daftar</th><th>Status Pengguna</th></tr></thead>
                    <tbody>
                      {pelangganList.map((u) => (
                        <tr key={u.id}>
                          <td><div style={{ fontWeight: '600', color: '#1C1100' }}>{u.nama}</div></td>
                          <td><div style={{ color: '#8A6A30' }}>{u.email}</div></td>
                          <td><div style={{ fontSize: '13px', color: '#1C1100' }}>{formatDate(u.createdAt)}</div></td>
                          <td><span style={{ background: 'rgba(93,202,165,0.1)', color: '#5DCAA5', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>Terverifikasi</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               )}
             </div>
          </div>
        )}

        {/* ----------------- TAB: MANAJEMEN MEJA ----------------- */}
        {activeMenu === 'meja' && (
          <div className="table-container">
            <form className="form-inline" onSubmit={handleTambahMeja}>
              <div className="input-group" style={{ flex: '0 1 100px' }}>
                <label>Nomor Meja</label>
                <input type="text" name="nomor_meja" value={formDataMeja.nomor_meja} onChange={handleInputMejaChange} className="form-input" placeholder="Misal: 06" required />
              </div>
              <div className="input-group" style={{ flex: '2 1 200px' }}>
                <label>Deskripsi & Tipe</label>
                <input type="text" name="deskripsi" value={formDataMeja.deskripsi} onChange={handleInputMejaChange} className="form-input" placeholder="Misal: Meja Premium · 6 Lubang" required />
              </div>
              <div className="input-group" style={{ flex: '1 1 150px' }}>
                <label>Harga per Jam (Rp)</label>
                <input type="number" name="harga_per_jam" value={formDataMeja.harga_per_jam} onChange={handleInputMejaChange} className="form-input" placeholder="35000" required />
              </div>
              <button type="submit" disabled={isSubmittingMeja} className="btn-primary">
                + Tambah Meja
              </button>
            </form>

            <div className="table-wrapper">
              {isLoading ? <div style={{ padding: '60px', textAlign: 'center', color: '#A08860' }}>Memuat data...</div> : mejaList.length === 0 ? <div style={{ padding: '60px', textAlign: 'center', color: '#A08860' }}>Belum ada data meja.</div> : (
                <table>
                  <thead><tr><th>Nomor Meja</th><th>Deskripsi</th><th>Harga (Rp)</th><th>Status Saat Ini</th><th>Aksi</th></tr></thead>
                  <tbody>
                    {mejaList.map((meja) => (
                      <tr key={meja.id}>
                        <td><div style={{ fontWeight: '600', color: '#1C1100', fontSize: '16px' }}>{meja.nomor_meja}</div></td>
                        <td><div style={{ color: '#8A6A30' }}>{meja.deskripsi}</div></td>
                        <td><div style={{ fontWeight: '600', color: '#C9A84C' }}>{Number(meja.harga_per_jam).toLocaleString('id-ID')}</div></td>
                        <td><StatusBadge status={meja.status} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {/* ======================================================== */}
                            {/* TOMBOL "SET TERSEDIA" MUNCUL DI SINI */}
                            {/* ======================================================== */}
                            {meja.status !== 'tersedia' && (
                              <button 
                                className="btn-action btn-done" 
                                onClick={() => handleResetMeja(meja.id)}
                                title="Jadikan meja ini tersedia kembali"
                              >
                                Set Tersedia
                              </button>
                            )}
                            <button className="btn-action btn-reject" onClick={() => handleHapusMeja(meja.id)}>Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default DashboardAdmin;