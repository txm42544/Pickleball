/**
 * API Configuration
 * Sử dụng VITE_API_URL từ .env, nếu không có thì dùng localhost:3000
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Ví dụ sử dụng:
// import { API_URL } from '../config/api';
// axios.get(`${API_URL}/api/products`)
