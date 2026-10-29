// ─────────────────────────────────────────────────────────────────────────────
// Common API Endpoint Configuration
// Centralized backend URL configuration supporting environment overrides & Render deployment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Base URL for the backend API.
 * Uses VITE_API_URL if provided in environment, otherwise defaults to the Render production server.
 */
export const API_BASE_URL: string = (
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  'https://prince-esavai-backend.onrender.com'
).replace(/\/+$/, '');

/**
 * Root endpoint for REST API routes (/api)
 */
export const API_ROOT: string = `${API_BASE_URL}/api`;

/**
 * Common modular endpoints mapping
 */
export const API_ENDPOINTS = {
  auth: `${API_ROOT}/auth`,
  aadhaar: `${API_ROOT}/aadhaar`,
  pan: `${API_ROOT}/pan`,
  voter: `${API_ROOT}/voter`,
  ration: `${API_ROOT}/ration`,
  driving: `${API_ROOT}/driving`,
  vehicle: `${API_ROOT}/vehicle`,
  farmer: `${API_ROOT}/farmer`,
  pricing: `${API_ROOT}/pricing`,
  payments: `${API_ROOT}/payments`,
} as const;

/**
 * Helper to construct an absolute API URL for any given sub-path
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith('/api/')) {
    return `${API_BASE_URL}${cleanPath}`;
  }
  return `${API_ROOT}${cleanPath}`;
}

