const { Reservasi, Meja, User } = require('../models');
const { Op } = require('sequelize'); // <-- Kita panggil Op untuk logika Lebih Besar/Lebih Kecil

// [AUTH] Buat reservasi baru (Customer)
exports.createReservasi = async (req, res) => {
  try {
    const { meja_id, tanggal, jam_mulai, jam_selesai, catatan } = req.body;
    const user_id = req.user.id; // Dari JWT payload

    // 1. Validasi sederhana: Cek apakah meja ada
    const meja = await Meja.findByPk(meja_id);
    if (!meja) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan' });

    // 2. Validasi Logika Waktu: Jam selesai harus lebih besar dari jam mulai
    if (jam_mulai >= jam_selesai) {
      return res.status(400).json({ success: false, message: 'Jam selesai harus lebih besar dari jam mulai.' });
    }

    // 3. Validasi Anti-Bentrok Jadwal
    const jadwalBentrok = await Reservasi.findOne({
      where: {
        meja_id: meja_id,
        tanggal: tanggal,
        status: {
          [Op.in]: ['pending', 'dikonfirmasi'] // Cek reservasi yang masih aktif
        },
        [Op.and]: [
          { jam_mulai: { [Op.lt]: jam_selesai } }, 
          { jam_selesai: { [Op.gt]: jam_mulai } }  
        ]
      }
    });

    if (jadwalBentrok) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maaf, meja ini sudah dipesan pada rentang waktu tersebut. Silakan pilih jam lain.' 
      });
    }

    // 4. Buat reservasi jika tidak ada bentrok (Status default: pending)
    const reservasi = await Reservasi.create({
      user_id, meja_id, tanggal, jam_mulai, jam_selesai, catatan
    });

    res.status(201).json({ success: true, message: 'Reservasi berhasil diajukan', data: reservasi });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Gagal membuat reservasi', error: error.message });
  }
};

// [AUTH] Ambil riwayat reservasi user yang sedang login
exports.getRiwayat = async (req, res) => {
  try {
    const user_id = req.user.id;
    const riwayat = await Reservasi.findAll({
      where: { user_id },
      include: [{ model: Meja, attributes: ['nomor_meja', 'harga_per_jam'] }],
      order: [['createdAt', 'DESC']] // Diperbaiki menjadi createdAt
    });
    res.json({ success: true, message: 'Riwayat berhasil diambil', data: riwayat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat', error: error.message });
  }
};

// [ADMIN] Ambil semua data reservasi
exports.getAllReservasi = async (req, res) => {
  try {
    const reservasi = await Reservasi.findAll({
      include: [
        { model: User, attributes: ['nama', 'email'] },
        { model: Meja, attributes: ['nomor_meja'] }
      ],
      order: [['createdAt', 'DESC']] // Diperbaiki menjadi createdAt
    });
    res.json({ success: true, message: 'Data semua reservasi diambil', data: reservasi });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data', error: error.message });
  }
};

// [ADMIN] Update status reservasi (terima/tolak manual)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'dikonfirmasi' atau 'dibatalkan'

    const reservasi = await Reservasi.findByPk(id);
    if (!reservasi) return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });

    await reservasi.update({ status });

    // Jika dikonfirmasi, otomatis ubah status meja jadi 'dipesan'
    if (status === 'dikonfirmasi') {
      await Meja.update({ status: 'dipesan' }, { where: { id: reservasi.meja_id } });
    }

    res.json({ success: true, message: `Status reservasi diubah menjadi ${status}`, data: reservasi });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Gagal update status', error: error.message });
  }
};

// =====================================================================
// [FITUR BARU] Simulasi Pembayaran (Auto-Confirm) untuk Customer
// =====================================================================
exports.bayarReservasi = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Cari reservasi milik user ini yang masih pending
    const reservasi = await Reservasi.findOne({ where: { id, user_id, status: 'pending' } });
    if (!reservasi) return res.status(404).json({ success: false, message: 'Tagihan tidak ditemukan atau sudah dibayar.' });

    // Auto-Confirm: Ubah status reservasi menjadi dikonfirmasi
    await reservasi.update({ status: 'dikonfirmasi' });
    
    // Langsung ubah status meja menjadi dipesan
    await Meja.update({ status: 'dipesan' }, { where: { id: reservasi.meja_id } });

    res.json({ success: true, message: 'Pembayaran berhasil! Meja telah otomatis dipesan.', data: reservasi });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Pembayaran gagal', error: error.message });
  }
};

// =====================================================================
// [ADMIN] Menghapus riwayat reservasi
// =====================================================================
exports.hapusReservasi = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservasi = await Reservasi.findByPk(id);
    if (!reservasi) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    await reservasi.destroy();
    res.json({ success: true, message: 'Riwayat reservasi berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus riwayat.', error: error.message });
  }
};