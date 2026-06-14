const express = require('express');
const router = express.Router();
const reservasiController = require('../controllers/reservasiController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Customer (Auth)
router.post('/', verifyToken, reservasiController.createReservasi);
router.get('/riwayat', verifyToken, reservasiController.getRiwayat);
// Endpoint baru untuk auto-confirm via pembayaran
router.put('/:id/bayar', verifyToken, reservasiController.bayarReservasi); 

// Admin Only
router.get('/', verifyToken, isAdmin, reservasiController.getAllReservasi);
router.put('/:id/status', verifyToken, isAdmin, reservasiController.updateStatus);

// [BARU] Endpoint untuk menghapus riwayat reservasi (Hanya Admin)
router.delete('/:id', verifyToken, isAdmin, reservasiController.hapusReservasi);

module.exports = router;