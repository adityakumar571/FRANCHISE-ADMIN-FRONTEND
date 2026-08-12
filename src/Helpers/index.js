import { deleteCookie } from '../Hooks/cookie'
import axios from 'axios'
import Cookies from 'js-cookie'
import { confirmDialog } from 'primereact/confirmdialog'

// ── Base URL ──────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL

// ── Tenant subdomain detection ────────────────────────────────────────────────
export const getTenant = () => {
  const host  = window.location.hostname
  const parts = host.split('.')

  // plain localhost / 127.0.0.1 → use env fallback
  if (parts.length === 1 || host === '127.0.0.1') {
    return import.meta.env.VITE_TENANT_ID || ''
  }

  const subdomain = parts[0]

  // skip generic/admin subdomains
  if (['app', 'www', 'admin', 'portal', 'dashboard'].includes(subdomain)) return ''

  return subdomain
}

// ── Build common headers ──────────────────────────────────────────────────────
const getHeaders = () => {
  const token    = Cookies.get('LMS')
  const tenantId = getTenant()
  const headers  = { 'x-tenant-id': tenantId }
  if (token) headers['Authorization'] = token   // only set if token exists
  return headers
}

// ── Axios instance with default config ───────────────────────────────────────
const api = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,   // send cookies on every request
})

// Inject fresh headers before every request + force no-cache so browser never
// serves a stale response from memory cache
api.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    ...getHeaders(),
    'Cache-Control': 'no-cache',
    'Pragma':        'no-cache',
  }
  return config
})

// Handle 401 globally — clear stale cookie
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      deleteCookie('LMS')
      console.warn('[api] 401 — token cleared')
    }
    return Promise.reject(err)
  }
)

// ── Request helpers ───────────────────────────────────────────────────────────

export const getRequest = (url) =>
  api.get(url)

export const postRequest = ({ url, cred }) =>
  api.post(url, cred)

export const putRequest = ({ url, cred }) =>
  api.put(url, cred)

export const patchRequest = ({ url, cred }) =>
  api.patch(url, cred)

export const deleteRequest = (url) =>
  api.delete(url)

export const fileUpload = ({ url, cred }) =>
  api.post(url, cred, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ── Legacy generic request (kept for backward compatibility) ──────────────────
export const request = ({ method, url, cred }) =>
  api[method](url, cred)

// ── Delete with confirm dialog ────────────────────────────────────────────────
export const deleteRequest1 = async (url) => {
  const confirmed = await new Promise((resolve) =>
    confirmDialog({
      message:         'Are you sure you want to delete this item?',
      header:          'Confirm Deletion',
      icon:            'warning',
      acceptClassName: 'p-button-danger',
      acceptText:      'Delete',
      accept:          () => resolve(true),
      reject:          () => resolve(false),
    })
  )
  if (!confirmed) return
  return api.delete(url)
}

// ── Static token export (used in a few older components) ─────────────────────
export const token = Cookies.get('LMS')
