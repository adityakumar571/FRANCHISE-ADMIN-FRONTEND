/* eslint-disable prettier/prettier */
/**
 * Screen 4 — Customer Selection
 * Real API integration
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, ArrowLeft, Plus, CheckCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { Th, Td, SBtn } from './posHelpers'
import { getRequest, postRequest } from '../../../Helpers/index'
import toast from 'react-hot-toast'

export default function CustomerSelection() {
  const navigate        = useNavigate()
  const [q, setQ]       = useState('')
  const [sel, setSel]   = useState(null)
  const [customers, setCustomers]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [addModal, setAddModal]       = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' })
  const [saving, setSaving]           = useState(false)
  const debounceRef = useRef()

  const fetchCustomers = async (query = '') => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/pos/customers/search?q=${encodeURIComponent(query)}&limit=20`)
      setCustomers(res.data?.data?.customers || [])
    } catch {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCustomers() }, [])

  const handleSearch = (val) => {
    setQ(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchCustomers(val), 400)
  }

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Name and phone are required')
      return
    }
    setSaving(true)
    try {
      await postRequest({ url: '/franchise/pos/customers', cred: newCustomer })
      toast.success('Customer added')
      setAddModal(false)
      setNewCustomer({ name: '', phone: '', email: '' })
      fetchCustomers()
    } catch {
      toast.error('Failed to add customer')
    } finally {
      setSaving(false)
    }
  }

  const recentCustomers = customers.slice(0, 4)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Users} title="Customer Selection" subtitle="Search and select customer for billing" color="#7c3aed">
        <SBtn label="Back to Billing" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/billing')} />
        <SBtn label="+ Add New Customer" icon={Plus} sm onClick={() => setAddModal(true)} />
      </PageHeader>

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={q}
            onChange={e => handleSearch(e.target.value)}
            autoFocus
            placeholder="Search customer by name / mobile / ID..."
            style={{ width: '100%', padding: '10px 12px 10px 32px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Recent Customers Cards */}
      {!q && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Recent Customers</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12, marginBottom: 20 }}>
            {loading
              ? Array(4).fill(0).map((_, i) => (
                <div key={i} style={{ padding: 14, border: '2px solid #e5e7eb', borderRadius: 10, height: 110, background: '#f9fafb' }} />
              ))
              : recentCustomers.map(c => (
                <div key={c.id} onClick={() => setSel(c)}
                  style={{ padding: '14px', background: sel?.id === c.id ? '#e0e7ff' : '#fff', border: `2px solid ${sel?.id === c.id ? '#7c3aed' : '#e5e7eb'}`, borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => { if (sel?.id !== c.id) e.currentTarget.style.borderColor = '#7c3aed' }}
                  onMouseLeave={e => { if (sel?.id !== c.id) e.currentTarget.style.borderColor = '#e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>
                      {c.name?.[0]?.toUpperCase()}
                    </div>
                    {sel?.id === c.id && <CheckCircle size={16} color="#7c3aed" />}
                  </div>
                  <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#111827' }}>{c.name}</p>
                  <p style={{ margin: '0 0 6px', fontSize: 11, color: '#9ca3af' }}>{c.phone}</p>
                  <p style={{ margin: '0 0 2px', fontSize: 11, color: '#6b7280' }}>{c.orders} Orders · {c.totalPurchase}</p>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: c.due !== '₹0' ? '#dc2626' : '#16a34a' }}>Due: {c.due}</p>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* All Customers Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>All Customers ({customers.length})</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Name', 'Mobile', 'Total Orders', 'Total Purchase', 'Due Amount', 'Action'].map(h => <Th key={h} c={h} />)}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} style={{ padding: '10px' }}>
                        <div style={{ height: 14, background: '#f3f4f6', borderRadius: 4 }} />
                      </td>
                    ))}
                  </tr>
                ))
                : customers.map(c => (
                  <tr key={c.id}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0c3b73' }}>
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                      </div>
                    </Td>
                    <Td>{c.phone}</Td>
                    <Td>{c.orders}</Td>
                    <Td style={{ fontWeight: 600, color: '#0c3b73' }}>{c.totalPurchase}</Td>
                    <Td style={{ fontWeight: 600, color: c.due !== '₹0' ? '#dc2626' : '#16a34a' }}>{c.due}</Td>
                    <Td>
                      <SBtn label="Select" sm bg="#0c3b73" color="#fff" onClick={() => { setSel(c); navigate('/franchise/pos/billing') }} />
                    </Td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <SBtn label="Cancel" bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/billing')} />
          <SBtn label="Confirm Selection" sm disabled={!sel} onClick={() => navigate('/franchise/pos/billing')} />
        </div>
      </div>

      {/* Add Customer Modal */}
      {addModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Add New Customer</h3>
            {[
              { label: 'Name *', key: 'name', placeholder: 'Customer name' },
              { label: 'Phone *', key: 'phone', placeholder: '10-digit mobile number' },
              { label: 'Email', key: 'email', placeholder: 'email@example.com' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
                <input
                  value={newCustomer[f.key]}
                  onChange={e => setNewCustomer(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <SBtn label="Cancel" bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => setAddModal(false)} />
              <SBtn label={saving ? 'Saving...' : 'Add Customer'} sm disabled={saving} onClick={handleAddCustomer} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
