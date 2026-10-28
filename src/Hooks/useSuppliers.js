/* eslint-disable prettier/prettier */
/**
 * useSuppliers — shared hook
 * Fetches global supplier list from /franchise-suppliers/suppliers
 * Returns: { suppliers, loadingSuppliers }
 * suppliers shape: [{ _id, companyName, phone, city }]
 */
import { useState, useEffect } from 'react'
import { getRequest } from '../Helpers'

export function useSuppliers() {
  const [suppliers,        setSuppliers]        = useState([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)

  useEffect(() => {
    setLoadingSuppliers(true)
    getRequest('/franchise-suppliers/suppliers')
      .then(res => {
        // Handle all possible response shapes
        const list =
          res?.data?.data?.suppliers ||
          res?.data?.data            ||
          res?.data?.suppliers       ||
          (Array.isArray(res?.data) ? res.data : [])
        setSuppliers(list)
      })
      .catch(() => setSuppliers([]))
      .finally(() => setLoadingSuppliers(false))
  }, [])

  return { suppliers, loadingSuppliers }
}
