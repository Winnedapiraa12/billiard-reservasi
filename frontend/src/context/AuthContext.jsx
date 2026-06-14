import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Tambahan penting agar tidak error saat refresh

  useEffect(() => {
    // Cek apakah ada data user di localStorage saat pertama load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    // Set loading ke false setelah selesai mengecek
    setIsLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Tahan render komponen anak sampai pengecekan localStorage selesai
  // Ini mencegah user "ditendang" dari halaman admin saat melakukan refresh (F5)
  if (isLoading) {
    return <div style={{ backgroundColor: '#080808', height: '100vh' }}></div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};