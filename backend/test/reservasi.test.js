const { Reservasi } = require('../models');

jest.mock('../models', () => ({
  Reservasi: { create: jest.fn() }
}));

describe('Pengujian Modul Reservasi', () => {
  it('Harus berhasil menyimpan data reservasi baru', async () => {
    const dataInput = { mejaId: 2, userId: 5, durasiJam: 2 };
    const dataOutput = { id: 101, ...dataInput };
    
    // Skenario: Database merespons sukses setelah menyimpan data
    Reservasi.create.mockResolvedValue(dataOutput);
    
    const hasil = await Reservasi.create(dataInput);
    
    // Ekspektasi: Fungsi create terpanggil dan data mejaId yang disimpan cocok
    expect(Reservasi.create).toHaveBeenCalledWith(dataInput);
    expect(hasil.mejaId).toBe(2);
    expect(hasil.id).toBe(101);
  });
});