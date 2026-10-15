/* eslint-disable prettier/prettier */
/**
 * Supplier Profile - View and edit supplier information
 */
import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Building2, Edit2, Save, X, Loader2 } from 'lucide-react'
import { getRequest, putRequest } from '../../Helpers'
import toast from 'react-hot-toast'
import PageHeader from './components/PageHeader'

const SupplierProfile = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    gstNumber: '',
    panNumber: '',
    businessType: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      console.log('📋 Fetching supplier profile...')
      const response = await getRequest('/suppliers/auth/profile')
      console.log('📋 Profile response:', response)
      
      if (response?.success && response?.data) {
        const data = response.data
        setProfile({
          companyName: data.companyName || '',
          contactPerson: data.contactPerson || '',
          email: data.email || '',
          phone: data.phone || '',
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            pincode: data.address?.pincode || ''
          },
          gstNumber: data.gstNumber || '',
          panNumber: data.panNumber || '',
          businessType: data.businessType || ''
        })
        
        // Update localStorage with fresh data
        localStorage.setItem('supplierName', data.companyName || 'Supplier')
        localStorage.setItem('supplierEmail', data.email || '')
        localStorage.setItem('supplierPhone', data.phone || '')
        
        console.log('✅ Profile loaded successfully')
      }
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log('💾 Saving profile:', profile)
      const response = await putRequest({
        url: '/suppliers/auth/profile',
        cred: profile
      })
      
      if (response?.success) {
        toast.success('Profile updated successfully!')
        
        // Update localStorage
        localStorage.setItem('supplierName', profile.companyName)
        localStorage.setItem('supplierEmail', profile.email)
        localStorage.setItem('supplierPhone', profile.phone)
        
        setEditing(false)
        
        // Refresh to show updated data
        fetchProfile()
      }
    } catch (error) {
      console.error('❌ Failed to update profile:', error)
      toast.error(error?.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader 
          icon={User} 
          title="My Profile" 
          subtitle="Manage your supplier account information" 
          color="#0c3b73"
        />
        <div style={{ 
          background: '#fff', 
          borderRadius: 10, 
          padding: '60px', 
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <Loader2 size={40} color="#0c3b73" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 16, color: '#6b7280' }}>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader 
        icon={User} 
        title="My Profile" 
        subtitle="Manage your supplier account information" 
        color="#0c3b73"
      >
        {!editing ? (
          <button onClick={() => setEditing(true)} style={editBtn}>
            <Edit2 size={14} /> Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setEditing(false); fetchProfile() }} style={cancelBtn}>
              <X size={14} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} style={saveBtn}>
              {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </PageHeader>

      <div style={{ 
        background: '#fff', 
        borderRadius: 10, 
        padding: '24px', 
        border: '1px solid #e5e7eb' 
      }}>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 20 
        }}>
          {/* Company Name */}
          <div>
            <label style={labelStyle}>
              <Building2 size={16} style={{ marginRight: 8 }} />
              Company Name
            </label>
            <input
              type="text"
              value={profile.companyName}
              onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              disabled={!editing}
              style={inputStyle(editing)}
            />
          </div>

          {/* Contact Person */}
          <div>
            <label style={labelStyle}>
              <User size={16} style={{ marginRight: 8 }} />
              Contact Person
            </label>
            <input
              type="text"
              value={profile.contactPerson}
              onChange={(e) => setProfile({ ...profile, contactPerson: e.target.value })}
              disabled={!editing}
              style={inputStyle(editing)}
            />
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>
              <Mail size={16} style={{ marginRight: 8 }} />
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              disabled={true} // Email should not be editable
              style={inputStyle(false)}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle}>
              <Phone size={16} style={{ marginRight: 8 }} />
              Phone
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={!editing}
              style={inputStyle(editing)}
            />
          </div>

          {/* GST Number */}
          <div>
            <label style={labelStyle}>GST Number</label>
            <input
              type="text"
              value={profile.gstNumber}
              onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value })}
              disabled={!editing}
              style={inputStyle(editing)}
            />
          </div>

          {/* PAN Number */}
          <div>
            <label style={labelStyle}>PAN Number</label>
            <input
              type="text"
              value={profile.panNumber}
              onChange={(e) => setProfile({ ...profile, panNumber: e.target.value })}
              disabled={!editing}
              style={inputStyle(editing)}
            />
          </div>

          {/* Business Type */}
          <div>
            <label style={labelStyle}>Business Type</label>
            {editing ? (
              <select
                value={profile.businessType}
                onChange={(e) => setProfile({ ...profile, businessType: e.target.value })}
                style={inputStyle(editing)}
              >
                <option value="">Select Type</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distributor">Distributor</option>
                <option value="Retailer">Retailer</option>
                <option value="Wholesaler">Wholesaler</option>
                <option value="Service Provider">Service Provider</option>
              </select>
            ) : (
              <input
                type="text"
                value={profile.businessType}
                disabled={true}
                style={inputStyle(false)}
              />
            )}
          </div>

          {/* Street Address */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>
              <MapPin size={16} style={{ marginRight: 8 }} />
              Street Address
            </label>
            <textarea
              value={profile.address.street}
              onChange={(e) => setProfile({ ...profile, address: { ...profile.address, street: e.target.value } })}
              disabled={!editing}
              rows={2}
              style={{ ...inputStyle(editing), resize: 'vertical' }}
            />
          </div>

          {/* City */}
          <div>
            <label style={labelStyle}>City</label>
            <input
              type="text"
              value={profile.address.city}
              onChange={(e) => setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })}
              disabled={!editing}
              style={inputStyle(editing)}
            />
          </div>

          {/* State */}
          <div>
            <label style={labelStyle}>State</label>
            <input
              type="text"
              value={profile.address.state}
              onChange={(e) => setProfile({ ...profile, address: { ...profile.address, state: e.target.value } })}
              disabled={!editing}
              style={inputStyle(editing)}
            />
          </div>

          {/* Pincode */}
          <div>
            <label style={labelStyle}>Pincode</label>
            <input
              type="text"
              value={profile.address.pincode}
              onChange={(e) => setProfile({ ...profile, address: { ...profile.address, pincode: e.target.value } })}
              disabled={!editing}
              style={inputStyle(editing)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 8
}

const inputStyle = (editing) => ({
  width: '100%',
  height: 40,
  padding: '0 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  background: editing ? '#fff' : '#f9fafb',
  color: editing ? '#111827' : '#6b7280',
  cursor: editing ? 'text' : 'not-allowed'
})

const editBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  background: '#fff',
  color: '#0c3b73',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer'
}

const cancelBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  background: '#fff',
  color: '#6b7280',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer'
}

const saveBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  background: '#0c3b73',
  color: '#fff',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer'
}

export default SupplierProfile
