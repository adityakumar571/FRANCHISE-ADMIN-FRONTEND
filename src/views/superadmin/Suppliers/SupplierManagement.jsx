import React, { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CSpinner,
  CBadge,
} from '@coreui/react'
import { getRequest } from '../../../Helpers'

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log('✅ Component Mounted')
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    console.log('🚀 Fetching suppliers...')
    setLoading(true)
    
    try {
      const token = Cookies.get('SA_TOKEN') || Cookies.get('LMS')
      console.log('🔑 Token exists:', !!token)
      
      const response = await getRequest('/api/suppliers/admin/list?page=1&limit=20')
      console.log('📡 Response:', response)
      
      if (response.success) {
        setSuppliers(response.data.suppliers || [])
        console.log('✅ Loaded', response.data.suppliers?.length, 'suppliers')
      }
    } catch (error) {
      console.error('❌ Error:', error)
    } finally {
      setLoading(false)
    }
  }

  console.log('🎨 Rendering...')

  return (
    <div className="p-4">
      <h2>Supplier Management</h2>
      
      <CCard className="mt-3">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <strong>Suppliers ({suppliers.length})</strong>
            <CButton color="primary" size="sm" onClick={fetchSuppliers}>
              Refresh
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p className="mt-2">Loading...</p>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>No suppliers found</p>
              <p className="small">Check console for API logs</p>
            </div>
          ) : (
            <div>
              <p className="text-success">✅ Loaded {suppliers.length} suppliers</p>
              <ul>
                {suppliers.slice(0, 5).map((s) => (
                  <li key={s._id}>{s.companyName} - {s.email}</li>
                ))}
              </ul>
            </div>
          )}
        </CCardBody>
      </CCard>

      <CCard className="mt-3">
        <CCardHeader>Debug Info</CCardHeader>
        <CCardBody>
          <p><strong>Component Status:</strong> Working ✅</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Suppliers Count:</strong> {suppliers.length}</p>
          <p><strong>Check Console:</strong> Press F12 to see detailed logs</p>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default SupplierManagement
