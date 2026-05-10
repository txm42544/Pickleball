import axios from 'axios';

const configuredBaseURL = String(import.meta.env.VITE_API_URL || '').trim();
const isBrowser = typeof window !== 'undefined';
const isLocalHost =
  isBrowser &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');
const railwayBackendURL = 'https://pickleball-production-8622.up.railway.app';

// Production fallback should use same-origin to avoid calling localhost on Railway.
const fallbackBaseURL = isLocalHost ? 'http://localhost:3000' : railwayBackendURL;

const instance = axios.create({
  baseURL: configuredBaseURL || fallbackBaseURL,
  withCredentials: true,
});

export default instance;
