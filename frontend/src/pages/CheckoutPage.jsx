import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); 
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false); 
  const [countdown, setCountdown] = useState(300);
  const [paymentMethod, setPaymentMethod] = useState('');

  const reservasiData = location.state?.reservasiData;

  useEffect(() => {
    if (!reservasiData) navigate('/');
    
    let timer;
    if (!paymentSuccess) {
      timer = setInterval(() => setCountdown(prev => prev > 0 ? prev - 1 : 0), 1000);
    }
    return () => clearInterval(timer);
  }, [reservasiData, navigate, paymentSuccess]);

  const handleBayar = async () => {
    if (!paymentMethod) return alert('Silakan pilih metode pembayaran terlebih dahulu.');
    
    setIsProcessing(true);
    try {
      await api.put(`/reservasi/${reservasiData.id}/bayar`);
      
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(true);
      }, 1500);
    } catch (error) {
      alert('Gagal memproses pembayaran. Coba lagi.');
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!reservasiData) return null;

  const mnt = Math.floor(countdown / 60).toString().padStart(2, '0');
  const dtk = (countdown % 60).toString().padStart(2, '0');

  const startJam = parseInt(reservasiData.jam_mulai.split(':')[0]);
  const endJam = parseInt(reservasiData.jam_selesai.split(':')[0]);
  const estimasiDurasi = endJam - startJam;
  const tagihanSimulasi = estimasiDurasi > 0 ? estimasiDurasi * 35000 : 35000;

  const methodName = paymentMethod === 'bca' ? 'BCA Virtual Account' 
                   : paymentMethod === 'mandiri' ? 'Mandiri Virtual Account' 
                   : paymentMethod === 'gopay' ? 'GoPay' : 'N/A';

  return (
    <div className="checkout-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .checkout-root {
          min-height: 100vh; background-color: #1C1100; display: flex; 
          justify-content: center; align-items: center; padding: 40px 24px; 
          font-family: 'DM Sans', sans-serif;
        }

        .checkout-card {
          background: #FFFDF8; width: 100%; max-width: 500px; border-radius: 24px; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.4); position: relative; overflow: hidden;
          margin: auto;
        }

        .payment-option {
          border: 1.5px solid #EDE5D5; border-radius: 12px; padding: 16px; 
          margin-bottom: 12px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: space-between;
        }
        .payment-option:hover { border-color: rgba(201,168,76,0.4); background: #FDF8F0; }
        .payment-option.selected { border-color: #C9A84C; background: rgba(201,168,76,0.05); }
        
        .radio-circle { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #EDE5D5; display: flex; justify-content: center; align-items: center; }
        .payment-option.selected .radio-circle { border-color: #C9A84C; }
        .radio-dot { width: 10px; height: 10px; border-radius: 50%; background: #C9A84C; transform: scale(0); transition: 0.2s; }
        .payment-option.selected .radio-dot { transform: scale(1); }

        .btn-pay {
          width: 100%; padding: 16px; border-radius: 12px; border: none; background: #C9A84C; color: #1C1100; 
          font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; margin-top: 24px;
        }
        .btn-pay:hover:not(:disabled) { background: #D4B558; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(201,168,76,0.3); }
        .btn-pay:disabled { background: #EDE5D5; color: #A08860; cursor: not-allowed; }

        .btn-print { background: #1C1100; color: #C9A84C; }
        .btn-print:hover { background: #2A1A00; }

        @media print {
          body { background: white; margin: 0; padding: 0; }
          .checkout-root { background: white; padding: 0; align-items: flex-start; }
          .no-print { display: none !important; }
          .print-area {
            box-shadow: none !important;
            border: 1px solid #000;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 400px !important;
            margin: 0;
          }
        }
      `}</style>

      {paymentSuccess ? (
        <div className="checkout-card print-area" style={{ maxWidth: '400px' }}>
          <div style={{ padding: '40px 32px 32px' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #A08860', paddingBottom: '24px', marginBottom: '24px' }}>
              <div className="serif" style={{ fontSize: '28px', color: '#1C1100', fontStyle: 'italic', marginBottom: '8px' }}>BilliardPro</div>
              <div style={{ fontSize: '12px', color: '#8A6A30' }}>BUKTI RESERVASI LUNAS</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#8A6A30' }}>Nama Pemesan</span>
                <span style={{ color: '#1C1100', fontWeight: '600' }}>{user?.nama || 'Pelanggan'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#8A6A30' }}>Nomor Meja</span>
                <span style={{ color: '#1C1100', fontWeight: '600' }}>Meja {reservasiData.meja_id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#8A6A30' }}>Tanggal</span>
                <span style={{ color: '#1C1100', fontWeight: '600' }}>{reservasiData.tanggal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#8A6A30' }}>Waktu Bermain</span>
                <span style={{ color: '#1C1100', fontWeight: '600' }}>{reservasiData.jam_mulai} — {reservasiData.jam_selesai} ({estimasiDurasi} Jam)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#8A6A30' }}>Metode Bayar</span>
                <span style={{ color: '#1C1100', fontWeight: '600' }}>{methodName}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #A08860', borderBottom: '1px dashed #A08860', padding: '16px 0', margin: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#1C1100', fontWeight: '600' }}>Total Dibayar</span>
              <span className="serif" style={{ fontSize: '24px', color: '#C9A84C', fontWeight: '600' }}>Rp {tagihanSimulasi.toLocaleString('id-ID')}</span>
            </div>

            <div style={{ textAlign: 'center', fontSize: '11px', color: '#A08860', fontStyle: 'italic', lineHeight: '1.5' }}>
              Tunjukkan e-tiket ini kepada petugas kasir saat Anda tiba di lokasi. Selamat bermain!
            </div>
          </div>

          <div className="no-print" style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={handlePrint} className="btn-pay btn-print" style={{ marginTop: '0' }}>
              CETAK STRUK / SIMPAN PDF
            </button>
            <button onClick={() => navigate('/riwayat')} className="btn-pay" style={{ background: '#F5F0E6', color: '#A08860', marginTop: '0' }}>
              KEMBALI KE RIWAYAT
            </button>
          </div>
        </div>
      ) : (
        <div className="checkout-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #C9A84C, #E8D5A3)' }} />
          <div style={{ padding: '32px 32px 24px', textAlign: 'center', borderBottom: '1.5px dashed #EDE5D5' }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', color: '#1C1100' }}>Selesaikan Pembayaran</div>
            <div style={{ fontSize: '12px', color: '#E07B5A', fontWeight: '600', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E07B5A', animation: 'pulseBlob 1s infinite alternate' }} />
              Batas Waktu: {mnt}:{dtk}
            </div>
          </div>

          <div style={{ padding: '24px 32px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#A08860', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Total Tagihan</div>
                <div style={{ color: '#1C1100', fontSize: '13px', marginTop: '4px' }}>Meja {reservasiData.meja_id} ({reservasiData.jam_mulai} - {reservasiData.jam_selesai})</div>
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '28px', color: '#C9A84C' }}>
                Rp {tagihanSimulasi.toLocaleString('id-ID')}
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#1C1100', fontWeight: '600', marginBottom: '16px' }}>Pilih Metode Pembayaran</div>

            <div className={`payment-option ${paymentMethod === 'bca' ? 'selected' : ''}`} onClick={() => setPaymentMethod('bca')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#0066AE', color: '#FFF', fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>BCA</div>
                <div style={{ fontSize: '14px', color: '#1C1100', fontWeight: '500' }}>BCA Virtual Account</div>
              </div>
              <div className="radio-circle"><div className="radio-dot"/></div>
            </div>

            <div className={`payment-option ${paymentMethod === 'mandiri' ? 'selected' : ''}`} onClick={() => setPaymentMethod('mandiri')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#F2A123', color: '#002E5D', fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>MANDIRI</div>
                <div style={{ fontSize: '14px', color: '#1C1100', fontWeight: '500' }}>Mandiri Virtual Account</div>
              </div>
              <div className="radio-circle"><div className="radio-dot"/></div>
            </div>

            <div className={`payment-option ${paymentMethod === 'gopay' ? 'selected' : ''}`} onClick={() => setPaymentMethod('gopay')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#00AED6', color: '#FFF', fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>GOPAY</div>
                <div style={{ fontSize: '14px', color: '#1C1100', fontWeight: '500' }}>GoPay App</div>
              </div>
              <div className="radio-circle"><div className="radio-dot"/></div>
            </div>

            {paymentMethod && (
              <div style={{ background: '#FDF8F0', border: '1.5px dashed #C9A84C', borderRadius: '12px', padding: '16px', marginTop: '20px', animation: 'fadeIn 0.4s' }}>
                <div style={{ fontSize: '11px', color: '#8A6A30', marginBottom: '8px' }}>
                  {paymentMethod === 'bca' || paymentMethod === 'mandiri' ? 'Nomor Virtual Account Anda:' : 'Scan/Buka Aplikasi untuk Membayar:'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'DM Sans', monospace", fontSize: '18px', fontWeight: '600', letterSpacing: '2px', color: '#1C1100' }}>
                    {paymentMethod === 'bca' ? '8809 1102 3345' : paymentMethod === 'mandiri' ? '8990 4455 1200' : '0812-XXXX-XXXX'}
                  </span>
                </div>
              </div>
            )}

            <button onClick={handleBayar} disabled={isProcessing || countdown === 0 || !paymentMethod} className="btn-pay">
              {isProcessing ? 'MEMVERIFIKASI PEMBAYARAN...' : countdown === 0 ? 'WAKTU HABIS' : 'LANJUTKAN PEMBAYARAN'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button onClick={() => navigate('/riwayat')} style={{ background: 'transparent', border: 'none', color: '#A08860', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}>
                Batalkan Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;