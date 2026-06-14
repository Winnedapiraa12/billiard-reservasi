const { User } = require('../models');


jest.mock('../models', () => ({
  User: { findOne: jest.fn() }
}));

describe('Pengujian Modul User (Oleh Anggota 3)', () => {
  it('Harus berhasil mencari data user berdasarkan email untuk proses login', async () => {
    const mockUser = { id: 3, nama: 'Budi', email: 'budi@example.com' };
    
    
    User.findOne.mockResolvedValue(mockUser);
    
    const hasil = await User.findOne({ where: { email: 'budi@example.com' } });
    
    
    expect(User.findOne).toHaveBeenCalled();
    expect(hasil.email).toBe('budi@example.com');
    expect(hasil.nama).toBe('Budi');
  });
});