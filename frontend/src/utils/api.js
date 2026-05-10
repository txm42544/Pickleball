const rawOrigin = import.meta.env.VITE_API_URL || '';
const isProd = Boolean(import.meta.env.PROD);
export const DEFAULT_PRODUCT_IMAGE = '/pickleball-product.svg';
export const DEFAULT_CATEGORY_IMAGE = '/pickleball-category.svg';
export const DEFAULT_HERO_IMAGE = '/pickleball-hero.svg';
export const DEFAULT_PAYMENT_IMAGE = '/pickleball-payment.svg';

const normalizeOrigin = (origin) => String(origin || '').replace(/\/+$/, '');

const detectDefaultOrigin = () => {
  if (rawOrigin) return normalizeOrigin(rawOrigin);
  if (typeof window === 'undefined') return '';

  const host = window.location.hostname;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1';
  if (isLocalHost) {
    return isProd ? 'http://localhost:3000' : '';
  }

  return normalizeOrigin(window.location.origin);
};

export const API_ORIGIN = detectDefaultOrigin();

export const withApiBase = (path) => {
  if (!path) return path;
  if (!API_ORIGIN) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return `${API_ORIGIN}${path}`;
  return `${API_ORIGIN}/${path}`;
};

export const withUploadBase = (path) => {
  if (!path) return path;
  if (!API_ORIGIN) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/uploads')) return `${API_ORIGIN}${path}`;
  if (path.startsWith('uploads/')) return `${API_ORIGIN}/${path}`;
  return path;
};

export const resolveImageUrl = (url) => {
  if (!url) return url;

  const normalized = String(url);
  const localhostMatch = normalized.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)$/i);
  if (localhostMatch) {
    // If API_ORIGIN is configured, map old localhost URLs to that origin.
    if (API_ORIGIN) {
      return `${API_ORIGIN}${localhostMatch[3]}`;
    }
    // In local mode, keep path-only URL so dev proxy can serve it.
    return localhostMatch[3];
  }

  if (normalized.startsWith('/uploads') && API_ORIGIN) {
    return `${API_ORIGIN}${normalized}`;
  }

  if (normalized.startsWith('uploads/') && API_ORIGIN) {
    return `${API_ORIGIN}/${normalized}`;
  }

  return normalized;
};

export const withFallbackImage = (event, fallback = DEFAULT_PRODUCT_IMAGE) => {
  const img = event?.currentTarget;
  if (!img) return;
  if (img.dataset.fallbackApplied === 'true') return;
  img.dataset.fallbackApplied = 'true';
  img.src = fallback;
};

export const apiFetch = (input, init) => {
  if (typeof input === 'string') {
    return fetch(withApiBase(input), init);
  }
  return fetch(input, init);
};
