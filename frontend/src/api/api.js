import axios from 'axios';

// Sesuaikan URL ini dengan port backend Node.js Anda (biasanya 5000)
const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// Interceptor: Otomatis menyisipkan Token JWT ke setiap request API
api.interceptors.request.use(
  (config) => {
    // Di AuthContext, kita menyimpan token dengan nama 'token'
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;