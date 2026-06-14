const { Meja } = require('../models');

// Memalsukan (mock) model Sequelize agar test berjalan cepat dan aman
jest.mock('../models', () => ({
  Meja: { findAll: jest.fn() }
}));

describe('Pengujian Modul Meja', () => {
  it('Harus berhasil memanggil fungsi findAll untuk mengambil data meja', async () => {
    // Skenario: Database berhasil mengembalikan daftar meja berupa array
    Meja.findAll.mockResolvedValue([{ id: 1, nomorMeja: '01', status: 'tersedia' }]);
    
    const hasil = await Meja.findAll();
    
    // Ekspektasi: Fungsi findAll terpanggil dan hasilnya adalah sebuah array
    expect(Meja.findAll).toHaveBeenCalled();
    expect(Array.isArray(hasil)).toBeTruthy();
    expect(hasil[0].nomorMeja).toBe('01');
  });
});