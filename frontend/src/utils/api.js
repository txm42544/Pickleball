const rawOrigin = import.meta.env.VITE_API_URL || '';

export const API_ORIGIN = rawOrigin.replace(/\/+$/, '');

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
  return path;
};

export const resolveImageUrl = (url) => {
  if (!url) return url;
  if (!API_ORIGIN) return url;

  const normalized = String(url);
  if (/^https?:\/\/(localhost|127\.0\.0\.1):3000/i.test(normalized)) {
    return normalized.replace(/^https?:\/\/(localhost|127\.0\.0\.1):3000/i, API_ORIGIN);
  }

  if (normalized.startsWith('/uploads')) {
    return `${API_ORIGIN}${normalized}`;
  }

  return normalized;
};

export const apiFetch = (input, init) => {
  if (typeof input === 'string') {
    return fetch(withApiBase(input), init);
  }
  return fetch(input, init);
};
