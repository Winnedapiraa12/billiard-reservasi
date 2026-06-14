import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Import semua halaman yang sudah kita buat
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ReservasiPage from '../pages/ReservasiPage';
import RiwayatPage from '../pages/RiwayatPage';
import DashboardAdmin from '../pages/DashboardAdmin';
import CheckoutPage from '../pages/CheckoutPage'; // <-- Import Halaman Checkout

// Wrapper untuk rute yang membutuhkan Login (Tamu akan dilempar ke halaman Login)
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

// Wrapper untuk rute khusus Admin (Bukan admin akan dilempar ke halaman Beranda)
const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rute Publik (Bisa diakses siapa saja) */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rute Pelanggan (Harus Login terlebih dahulu) */}
      <Route path="/reservasi" element={
        <ProtectedRoute>
          <ReservasiPage />
        </ProtectedRoute>
      } />
      <Route path="/riwayat" element={
        <ProtectedRoute>
          <RiwayatPage />
        </ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      } />
      
      {/* Rute Khusus Admin (Harus Login dan memiliki Role 'admin') */}
      <Route path="/admin" element={
        <AdminRoute>
          <DashboardAdmin />
        </AdminRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;