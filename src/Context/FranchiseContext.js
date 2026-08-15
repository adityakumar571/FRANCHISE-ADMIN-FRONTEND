/* eslint-disable prettier/prettier */
/**
 * FranchiseContext
 *
 * Holds authenticated franchise session data:
 *   - franchiseUser  : { _id, userId, name, role }
 *   - franchiseInfo  : { _id, franchiseName, franchiseCode, subdomain, logo }
 *
 * Loaded from localStorage on mount (persisted after FranchiseLogin).
 * Cleared on logout.
 */
import React, { createContext, useContext, useState, useCallback } from 'react'
import Cookies from 'js-cookie'

export const FranchiseContext = createContext()

export const FranchiseProvider = ({ children }) => {
  const [franchiseUser, setFranchiseUserState] = useState(() => {
    try {
      const s = localStorage.getItem('franchise_user')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  const [franchiseInfo, setFranchiseInfoState] = useState(() => {
    try {
      const s = localStorage.getItem('franchise_context')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  const setFranchiseUser = useCallback((user) => {
    setFranchiseUserState(user)
    if (user) localStorage.setItem('franchise_user', JSON.stringify(user))
    else localStorage.removeItem('franchise_user')
  }, [])

  const setFranchiseInfo = useCallback((info) => {
    setFranchiseInfoState(info)
    if (info) {
      localStorage.setItem('franchise_context', JSON.stringify(info))
      localStorage.setItem('franchise_subdomain', info.subdomain || '')
    } else {
      localStorage.removeItem('franchise_context')
      localStorage.removeItem('franchise_subdomain')
    }
  }, [])

  const logoutFranchise = useCallback(() => {
    Cookies.remove('LMS', { path: '/' })
    localStorage.removeItem('franchise_user')
    localStorage.removeItem('franchise_context')
    localStorage.removeItem('franchise_subdomain')
    setFranchiseUserState(null)
    setFranchiseInfoState(null)
  }, [])

  const isAuthenticated = !!Cookies.get('LMS') && !!franchiseUser

  return (
    <FranchiseContext.Provider
      value={{
        franchiseUser,
        franchiseInfo,
        setFranchiseUser,
        setFranchiseInfo,
        logoutFranchise,
        isAuthenticated,
      }}
    >
      {children}
    </FranchiseContext.Provider>
  )
}

export const useFranchise = () => useContext(FranchiseContext)
