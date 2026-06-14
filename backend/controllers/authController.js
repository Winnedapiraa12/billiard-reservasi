const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ nama, email, password: hashedPassword });
    res.status(201).json({ success: true, message: 'Registrasi berhasil', data: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Email sudah terdaftar atau input tidak valid.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, message: 'Login berhasil', data: { token, user: { id: user.id, nama: user.nama, role: user.role } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// [ADMIN] Ambil semua data pengguna untuk ditampilkan di Dashboard Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      // Mengambil data penting saja, tanpa password
      attributes: ['id', 'nama', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, message: 'Data pelanggan berhasil diambil', data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data pelanggan', error: error.message });
  }
};