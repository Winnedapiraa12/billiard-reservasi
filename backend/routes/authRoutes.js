const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Tambahkan isAdmin di sini
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
// router.get('/profile', verifyToken, authController.getProfile); // Opsional jika butuh

// [Rute Baru] Endpoint untuk mengambil data pelanggan (Khusus Admin)
router.get('/admin/users', verifyToken, isAdmin, authController.getAllUsers);

module.exports = router;