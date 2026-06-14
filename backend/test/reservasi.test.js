const request = require('supertest');
const app = require('../server');

// 1. Mocking Model Database
jest.mock('../models', () => {
  return {
    Reservasi: {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
    },
    Meja: {
      findByPk: jest.fn(),
      update: jest.fn(),
    },
    User: {} // Mock kosong jika tidak ada interaksi langsung di dalam test
  };
});

// 2. Mocking Middleware Auth
// Penting: Mocking harus dilakukan SEBELUM rute dipanggil. 
// Supertest akan menggunakan middleware palsu ini untuk melewati validasi JWT.
jest.mock('../middleware/authMiddleware', () => ({
  verifyToken: (req, res, next) => {
    // Simulasi user login dengan ID = 1
    req.user = { id: 1 };
    next();
  },
  isAdmin: (req, res, next) => next() // Lewati pengecekan admin
}));

// Mengambil referensi dari mock untuk assertions
const { Reservasi, Meja } = require('../models');

describe('Pengujian API Reservasi (Regression Test Suite)', () => {

  // Membersihkan status mock sebelum setiap test agar tidak tercampur
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // ENDPOINT POST /api/reservasi - Membuat Reservasi
  // =========================================================================
  describe('POST /api/reservasi', () => {
    
    // Test Case 1: Happy Path
    it('1. Harus berhasil membuat reservasi jika data valid', async () => {
      // Arrange
      const input = { meja_id: 1, tanggal: "2026-06-20", jam_mulai: "10:00", jam_selesai: "12:00" };
      const createdReservasi = { id: 1, user_id: 1, ...input, status: "pending" };
      
      Meja.findByPk.mockResolvedValue({ id: 1 }); // Meja ditemukan
      Reservasi.findOne.mockResolvedValue(null); // Tidak ada bentrok
      Reservasi.create.mockResolvedValue(createdReservasi); // Simulasi sukses simpan

      // Act
      const res = await request(app).post('/api/reservasi').send(input);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(Reservasi.create).toHaveBeenCalled();
    });

    // Test Case 2: Error Scenario
    it('2. Harus gagal jika jam mulai lebih besar dari jam selesai', async () => {
      // Arrange
      const input = { meja_id: 1, tanggal: "2026-06-20", jam_mulai: "15:00", jam_selesai: "12:00" };
      Meja.findByPk.mockResolvedValue({ id: 1 }); // Meja ditemukan

      // Act
      const res = await request(app).post('/api/reservasi').send(input);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(Reservasi.create).not.toHaveBeenCalled(); // Pastikan DB tidak menyimpan
    });

    // Test Case 3: Error Scenario
    it('3. Harus gagal jika jadwal bentrok', async () => {
      // Arrange
      const input = { meja_id: 1, tanggal: "2026-06-20", jam_mulai: "10:00", jam_selesai: "12:00" };
      Meja.findByPk.mockResolvedValue({ id: 1 }); // Meja ditemukan
      
      // Simulasi ada reservasi lain di database pada jam yang sama
      Reservasi.findOne.mockResolvedValue({ id: 99, status: 'pending' }); 

      // Act
      const res = await request(app).post('/api/reservasi').send(input);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/sudah dipesan/i);
    });
  });


  // =========================================================================
  // ENDPOINT GET /api/reservasi/riwayat - Ambil Riwayat
  // =========================================================================
  describe('GET /api/reservasi/riwayat', () => {
    
    // Test Case 4: Happy Path
    it('4. Harus mengembalikan riwayat reservasi customer', async () => {
      // Arrange
      const mockData = [{ id: 1, tanggal: "2026-06-20" }];
      Reservasi.findAll.mockResolvedValue(mockData);

      // Act
      const res = await request(app).get('/api/reservasi/riwayat');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(Reservasi.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id: 1 } // Pastikan mem-filter sesuai user ID dari token mock
      }));
    });
  });


  // =========================================================================
  // ENDPOINT GET /api/reservasi - Ambil Semua (Admin)
  // =========================================================================
  describe('GET /api/reservasi', () => {
    
    // Test Case 5: Happy Path
    it('5. Harus mengambil seluruh data reservasi untuk admin', async () => {
      // Arrange
      Reservasi.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      // Act
      const res = await request(app).get('/api/reservasi');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
    });
  });


  // =========================================================================
  // ENDPOINT PUT /api/reservasi/:id/status - Update Status (Admin)
  // =========================================================================
  describe('PUT /api/reservasi/:id/status', () => {
    
    // Test Case 6: Happy Path
    it('6. Harus berhasil mengupdate status reservasi', async () => {
      // Arrange
      const mockReservasi = { 
        id: 1, 
        meja_id: 1, 
        update: jest.fn().mockResolvedValue(true) // Mock fungsi update instance
      };
      Reservasi.findByPk.mockResolvedValue(mockReservasi);
      Meja.update.mockResolvedValue([1]); // Simulasi meja berhasil diupdate

      // Act
      const res = await request(app).put('/api/reservasi/1/status').send({ status: 'dikonfirmasi' });

      // Assert
      expect(res.statusCode).toBe(200);
      expect(mockReservasi.update).toHaveBeenCalledWith({ status: 'dikonfirmasi' });
      expect(Meja.update).toHaveBeenCalled(); // Pastikan status meja juga berubah
    });

    // Test Case 7: Error Scenario
    it('7. Harus merespons 404 jika reservasi tidak ditemukan', async () => {
      // Arrange
      Reservasi.findByPk.mockResolvedValue(null);

      // Act
      const res = await request(app).put('/api/reservasi/999/status').send({ status: 'dikonfirmasi' });

      // Assert
      expect(res.statusCode).toBe(404);
    });
  });


  // =========================================================================
  // ENDPOINT PUT /api/reservasi/:id/bayar - Bayar Reservasi (Customer)
  // =========================================================================
  describe('PUT /api/reservasi/:id/bayar', () => {
    
    // Test Case 8: Happy Path
    it('8. Harus berhasil melakukan pembayaran dan auto-confirm', async () => {
      // Arrange
      const mockReservasi = { 
        id: 1, 
        meja_id: 1, 
        update: jest.fn().mockResolvedValue(true) 
      };
      Reservasi.findOne.mockResolvedValue(mockReservasi);
      Meja.update.mockResolvedValue([1]);

      // Act
      const res = await request(app).put('/api/reservasi/1/bayar');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(mockReservasi.update).toHaveBeenCalledWith({ status: 'dikonfirmasi' });
    });
  });


  // =========================================================================
  // ENDPOINT DELETE /api/reservasi/:id - Hapus Reservasi (Admin)
  // =========================================================================
  describe('DELETE /api/reservasi/:id', () => {
    
    // Test Case 9: Happy Path
    it('9. Harus berhasil menghapus reservasi berdasarkan ID', async () => {
      // Arrange
      const mockReservasi = { 
        id: 1, 
        destroy: jest.fn().mockResolvedValue(true) // Mock fungsi destroy
      };
      Reservasi.findByPk.mockResolvedValue(mockReservasi);

      // Act
      const res = await request(app).delete('/api/reservasi/1');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(mockReservasi.destroy).toHaveBeenCalled();
    });

    // Test Case 10: Error Scenario
    it('10. Harus merespons 404 jika ID yang dihapus tidak ada', async () => {
      // Arrange
      Reservasi.findByPk.mockResolvedValue(null);

      // Act
      const res = await request(app).delete('/api/reservasi/999');

      // Assert
      expect(res.statusCode).toBe(404);
    });
  });

});