/* eslint-disable prettier/prettier */
import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  // Hydrate from localStorage on mount (persists across refreshes)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('franchise_user')
      if (stored) setUser(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('franchise_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('franchise_user')
    localStorage.removeItem('franchise_context')
    localStorage.removeItem('franchise_subdomain')
  }

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// Legacy compatibility — RolesContext alias
const RolesContext = AuthContext
export const RolesProvider = AuthProvider
export const useRoles = useAuth

export default AuthContext
