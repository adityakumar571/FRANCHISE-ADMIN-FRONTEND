/**
 * useRoles — shared hook to fetch roles from /api/roles
 * Returns: { roles, roleNames, loading }
 * roles     — full role objects [{ _id, name, color, description, isSystem, isActive }]
 * roleNames — just names array ['SuperAdmin', 'Admin', 'Accounts', ...]
 */
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

const BASE_URL     = import.meta.env.VITE_API_BASE_URL
const getSubdomain = () => localStorage.getItem('franchise_subdomain') || import.meta.env.VITE_TENANT_ID || ''
const getToken     = () => Cookies.get('LMS') || ''

const rolesApi = axios.create({ baseURL: BASE_URL })
rolesApi.interceptors.request.use(cfg => {
  cfg.headers['Authorization'] = `Bearer ${getToken()}`
  cfg.headers['x-tenant-id']   = getSubdomain()
  return cfg
})

// Simple in-memory cache so multiple components don't re-fetch
let _cache = null
let _cacheTime = 0
const CACHE_TTL = 30000  // 30 seconds

export function useRoles() {
  const [roles, setRoles]     = useState([])
  const [loading, setLoading] = useState(false)

  const fetchRoles = useCallback(async (force = false) => {
    // Use cache if fresh
    if (!force && _cache && Date.now() - _cacheTime < CACHE_TTL) {
      setRoles(_cache)
      return
    }
    setLoading(true)
    try {
      const res = await rolesApi.get('roles')
      const list = res.data?.data?.roles || []
      _cache = list
      _cacheTime = Date.now()
      setRoles(list)
    } catch {
      // Fallback to system defaults if API unavailable
      const defaults = ['SuperAdmin','Admin','Accounts','Staff','Customer','Vendor','HRManager','HRStaff']
      setRoles(defaults.map(name => ({ _id: name, name, color: '#0c3b73', isSystem: true, isActive: true })))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  const roleNames = roles.filter(r => r.isActive !== false).map(r => r.name)
  const roleMap   = Object.fromEntries(roles.map(r => [r.name, r]))

  const getRoleColor = (roleName) => roleMap[roleName]?.color || '#6b7280'

  return { roles, roleNames, roleMap, loading, getRoleColor, refetchRoles: () => fetchRoles(true) }
}
