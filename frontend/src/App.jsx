import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Navbar global dihapus karena halaman (Home, Login, Register) sudah memiliki header sendiri dengan desain spesifik */}
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;