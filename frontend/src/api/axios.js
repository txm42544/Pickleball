import axios from 'axios';

const configuredBaseURL = String(import.meta.env.VITE_API_URL || '').trim();
const isBrowser = typeof window !== 'undefined';
const currentHost = isBrowser ? window.location.hostname : '';
const isLocalHost =
  isBrowser && (currentHost === 'localhost' || currentHost === '127.0.0.1');
const railwayBackendURL = 'https://pickleball-production-8622.up.railway.app';

const DEPLOY_HOST_MAP = {
  'illustrious-delight-production-1319.up.railway.app': railwayBackendURL,
};
const mappedBaseURL = DEPLOY_HOST_MAP[currentHost] || '';

// Production fallback should use same-origin to avoid calling localhost on Railway.
const fallbackBaseURL = isLocalHost ? 'http://localhost:3000' : railwayBackendURL;
const finalBaseURL = mappedBaseURL || configuredBaseURL || fallbackBaseURL;

const instance = axios.create({
  baseURL: finalBaseURL,
  withCredentials: true,
});

export default instance;
