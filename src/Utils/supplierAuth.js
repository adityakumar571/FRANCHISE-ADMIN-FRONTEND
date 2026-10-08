/**
 * Supplier Authentication Utilities
 */

import Cookies from 'js-cookie'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/'

/**
 * Check if supplier is logged in
 * @returns {boolean}
 */
export const isSupplierLoggedIn = () => {
  const token = Cookies.get('supplierToken')
  return !!token
}

/**
 * Get supplier token from cookie
 * @returns {string|null}
 */
export const getSupplierToken = () => {
  return Cookies.get('supplierToken') || null
}

/**
 * Get supplier info from localStorage
 * @returns {Object|null}
 */
export const getSupplierInfo = () => {
  try {
    const supplierId = localStorage.getItem('supplierId')
    const supplierName = localStorage.getItem('supplierName')
    const supplierEmail = localStorage.getItem('supplierEmail')
    const supplierCode = localStorage.getItem('supplierCode')
    
    if (!supplierId) return null
    
    return {
      id: supplierId,
      name: supplierName,
      email: supplierEmail,
      code: supplierCode
    }
  } catch (error) {
    console.error('Error getting supplier info:', error)
    return null
  }
}

/**
 * Complete supplier logout - clears session, cookies, localStorage
 * @returns {Promise<boolean>} Success status
 */
export const logoutSupplier = async () => {
  try {
    const token = getSupplierToken()
    
    // Call backend logout API if token exists
    if (token) {
      try {
        await axios.post(
          `${API_BASE_URL}suppliers/auth/logout`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            withCredentials: true
          }
        )
        console.log('✅ Backend session cleared')
      } catch (apiError) {
        console.error('Backend logout error:', apiError)
        // Continue with client-side cleanup even if API fails
      }
    }
    
    // Clear ALL supplier-related data from cookies
    Cookies.remove('supplierToken', { path: '/' })
    Cookies.remove('LMS', { path: '/' })
    
    // Clear ALL supplier-related data from localStorage
    const supplierKeys = [
      'supplierToken',
      'supplierId',
      'supplierName',
      'supplierEmail',
      'supplierCode',
      'tenantId'
    ]
    
    supplierKeys.forEach(key => {
      localStorage.removeItem(key)
    })
    
    console.log('✅ Client-side session cleared')
    return true
    
  } catch (error) {
    console.error('Logout error:', error)
    
    // Force clear everything even if there's an error
    Cookies.remove('supplierToken', { path: '/' })
    Cookies.remove('LMS', { path: '/' })
    localStorage.clear()
    
    return false
  }
}

/**
 * Save supplier session after login
 * @param {string} token - JWT token
 * @param {Object} supplier - Supplier data
 */
export const saveSupplierSession = (token, supplier) => {
  // Store token in cookie (7 days expiry)
  Cookies.set('supplierToken', token, { 
    expires: 7,
    path: '/',
    sameSite: 'strict'
  })
  
  // Store supplier info in localStorage
  localStorage.setItem('supplierId', supplier._id)
  localStorage.setItem('supplierName', supplier.companyName || supplier.name)
  localStorage.setItem('supplierEmail', supplier.email)
  
  if (supplier.supplierCode) {
    localStorage.setItem('supplierCode', supplier.supplierCode)
  }
  
  console.log('✅ Supplier session saved')
}

/**
 * Clear all supplier data (emergency cleanup)
 */
export const clearAllSupplierData = () => {
  // Clear cookies
  Cookies.remove('supplierToken', { path: '/' })
  Cookies.remove('LMS', { path: '/' })
  
  // Clear localStorage
  const allKeys = Object.keys(localStorage)
  allKeys.forEach(key => {
    if (key.toLowerCase().includes('supplier') || key === 'tenantId') {
      localStorage.removeItem(key)
    }
  })
  
  console.log('✅ All supplier data cleared')
}
