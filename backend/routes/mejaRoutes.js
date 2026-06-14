const express = require('express');
const router = express.Router();
const mejaController = require('../controllers/mejaController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Public
router.get('/', mejaController.getAllMeja);

// Admin Only
router.post('/', verifyToken, isAdmin, mejaController.createMeja);

// 🚨 [PENTING] Rute spesifik (/status) WAJIB ditaruh di atas rute dinamis (/:id)
router.put('/:id/status', verifyToken, isAdmin, mejaController.updateStatusMeja);

// Rute dinamis
router.put('/:id', verifyToken, isAdmin, mejaController.updateMeja);
router.delete('/:id', verifyToken, isAdmin, mejaController.deleteMeja);

module.exports = router;