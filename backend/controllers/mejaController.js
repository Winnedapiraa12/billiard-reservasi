const { Meja } = require('../models');

// [PUBLIC] Ambil semua data meja
exports.getAllMeja = async (req, res) => {
  try {
    const mejas = await Meja.findAll();
    res.json({ success: true, message: 'Data meja berhasil diambil', data: mejas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data meja', error: error.message });
  }
};

// [ADMIN] Tambah meja baru
exports.createMeja = async (req, res) => {
  try {
    const { nomor_meja, deskripsi, harga_per_jam } = req.body;
    const meja = await Meja.create({ nomor_meja, deskripsi, harga_per_jam });
    res.status(201).json({ success: true, message: 'Meja berhasil ditambahkan', data: meja });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Gagal menambah meja', error: error.message });
  }
};

// [ADMIN] Update meja (termasuk status)
exports.updateMeja = async (req, res) => {
  try {
    const { id } = req.params;
    const { nomor_meja, deskripsi, harga_per_jam, status } = req.body;
    const meja = await Meja.findByPk(id);
    
    if (!meja) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan' });

    await meja.update({ nomor_meja, deskripsi, harga_per_jam, status });
    res.json({ success: true, message: 'Meja berhasil diupdate', data: meja });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Gagal update meja', error: error.message });
  }
};

// [ADMIN] Hapus meja
exports.deleteMeja = async (req, res) => {
  try {
    const { id } = req.params;
    const meja = await Meja.findByPk(id);
    if (!meja) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan' });

    await meja.destroy();
    res.json({ success: true, message: 'Meja berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus meja', error: error.message });
  }
};

// ====================================================================
// [FITUR BARU] Update KHUSUS status meja (untuk tombol Set Tersedia)
// ====================================================================
exports.updateStatusMeja = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Menerima status 'tersedia' dari frontend
    const meja = await Meja.findByPk(id);
    
    if (!meja) return res.status(404).json({ success: false, message: 'Meja tidak ditemukan' });

    await meja.update({ status });
    res.json({ success: true, message: `Status meja berhasil diubah menjadi ${status}`, data: meja });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengubah status meja', error: error.message });
  }
};