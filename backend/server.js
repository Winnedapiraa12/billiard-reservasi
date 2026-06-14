require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const mejaRoutes = require('./routes/mejaRoutes');
const reservasiRoutes = require('./routes/reservasiRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ========================================================================
// Mount Routes (MENGGUNAKAN /api AGAR TERSAMBUNG DENGAN FRONTEND)
// ========================================================================
app.use('/api/auth', authRoutes);
app.use('/api/meja', mejaRoutes);
app.use('/api/reservasi', reservasiRoutes);

// Error Handler Global (Menangkap semua error agar server tidak mati)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database terhubung & tersinkronisasi');
    app.listen(PORT, () => {
      console.log(`Server Backend jalan di http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.log('Gagal sync database:', err);
  });