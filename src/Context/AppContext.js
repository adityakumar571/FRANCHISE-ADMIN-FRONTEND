/* eslint-disable react/prop-types */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

export const AppContext = createContext()

// Read subdomain the same way as getTenant() in Helpers/index.js
const getSubdomain = () => {
  const host  = window.location.hostname
  const parts = host.split('.')
  if (parts.length === 1 || host === '127.0.0.1') {
    return import.meta.env.VITE_TENANT_ID || ''
  }
  const subdomain = parts[0]
  if (['app', 'www', 'admin', 'portal', 'dashboard'].includes(subdomain)) return ''
  return subdomain
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const AppProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const [tenantDetails, setTenantDetailsState] = useState(() => {
    const saved = localStorage.getItem('tenantDetails')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user))
  }, [user])

  useEffect(() => {
    localStorage.setItem('tenantDetails', JSON.stringify(tenantDetails))
  }, [tenantDetails])

  /**
   * Fetch fresh user profile from the API.
   * Keeps clerkId / user._id always up to date.
   */
  const refreshUserProfile = useCallback(async () => {
    const token     = Cookies.get('LMS')
    const subdomain = getSubdomain()
    if (!token || !subdomain) return
    try {
      const res = await axios.get(`${BASE_URL}auth/profile`, {
        headers: {
          Authorization:   token,
          'x-tenant-id':   subdomain,
          'Cache-Control': 'no-cache',
          Pragma:          'no-cache',
        },
      })
      const profile = res?.data?.data
      if (profile) setUserState({ user: profile })
    } catch (err) {
      // silently fail — user stays from localStorage
      console.error('[AppContext] Failed to refresh user profile:', err)
    }
  }, [])

  /**
   * Fetch fresh tenant details from the API.
   * Called on app mount + exposed so any component can trigger a refresh.
   */
  const refreshTenantDetails = useCallback(async () => {
    const subdomain = getSubdomain()
    if (!subdomain) return
    try {
      const res = await axios.get(`${BASE_URL}schools?subdomain=${subdomain}`, {
        headers: {
          'x-tenant-id':   subdomain,
          'Cache-Control': 'no-cache',
          Pragma:          'no-cache',
        },
      })
      const data = res?.data?.data?.tenants?.[0] || null
      if (data) setTenantDetailsState(data)
    } catch (err) {
      console.error('[AppContext] Failed to refresh tenant details:', err)
    }
  }, [])

  // Refresh both on every app mount
  useEffect(() => {
    refreshTenantDetails()
    refreshUserProfile()
  }, [refreshTenantDetails, refreshUserProfile])

  return (
    <AppContext.Provider
      value={{
        user,
        setUser:               setUserState,
        tenantDetails,
        setTenantDetails:      setTenantDetailsState,
        refreshTenantDetails,
        refreshUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
