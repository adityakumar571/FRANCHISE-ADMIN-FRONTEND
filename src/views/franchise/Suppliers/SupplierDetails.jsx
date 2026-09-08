/* eslint-disable prettier/prettier */
/**
 * Screen 58 — Supplier Details (API-connected)
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Truck, ArrowLeft, Edit2, Phone, Mail, MapPin, Globe, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'

const Row = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid #f3f4f6' }}>
    <span style={{ color: '#9ca3af', fontSize: 12 }}>{label}</span>
    <span style={{ fontWeight: 600, color: color || '#374151', textAlign: 'right', maxWidth: 200 }}>{value || '—'}</span>
  </div>
)

const TABS = ['Contact Persons', 'Bank Details', 'Payment Terms', 'Other Details', 'Documents']

export default function SupplierDetails() {
  const navigate       = useNavigate()
  const { id }         = useParams()
  const [sup, setSup]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('Contact Persons')

  const fetchSupplier = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/suppliers/${id}`)
      setSup(res.data?.data || null)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load supplier details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchSupplier() }, [fetchSupplier])

  if (loading) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', padding: 40, textAlign: 'center', color: '#9ca3af' }}>
        Loading supplier details...
      </div>
    )
  }

  if (!sup) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '60px 20px' }}>
        <Truck size={48} color="#e5e7eb" style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 15, color: '#6b7280' }}>Supplier not found.</p>
        <button onClick={() => navigate('/franchise/suppliers')}
          style={{ marginTop: 10, padding: '9px 20px', background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Back to List
        </button>
      </div>
    )
  }

  const contacts = sup.contacts || []
  const bank     = sup.bank || {}

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Truck} title="Supplier Details" subtitle="View complete supplier information" color="#d97706">
        <button onClick={() => navigate('/franchise/suppliers')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
        <button onClick={() => navigate(`/franchise/suppliers/${sup._id}/edit`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#d97706', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Edit2 size={13} /> Edit Supplier
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Left — Identity Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#d97706', flexShrink: 0 }}>
                {sup.name?.[0] || '?'}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#111827' }}>{sup.name}</p>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: sup.status==='Active'?'#dcfce7':'#fee2e2', color: sup.status==='Active'?'#16a34a':'#dc2626' }}>{sup.status || 'Active'}</span>
              </div>
            </div>

            <Row label="Supplier Code"  value={sup.id || sup.supplierCode} />
            <Row label="Supplier Type"  value={sup.supplierType} />
            <Row label="GST No."        value={sup.gstNo} />
            <div style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
              <Phone size={13} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Phone</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '2px 0 0' }}>{sup.phone}</p>
              </div>
            </div>
            {sup.email && (
              <div style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                <Mail size={13} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Email</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '2px 0 0' }}>{sup.email}</p>
                </div>
              </div>
            )}
            {sup.website && (
              <div style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                <Globe size={13} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Website</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0c3b73', margin: '2px 0 0' }}>{sup.website}</p>
                </div>
              </div>
            )}
            {sup.createdAt && (
              <div style={{ padding: '8px 0', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                <Calendar size={13} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Since</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '2px 0 0' }}>
                    {new Date(sup.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Address */}
          {(sup.billingAddress || sup.city) && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 10px', textTransform: 'uppercase' }}>Address</p>
              <div style={{ display: 'flex', gap: 7, marginBottom: 12 }}>
                <MapPin size={14} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, fontWeight: 600 }}>Billing Address</p>
                  <p style={{ fontSize: 12, color: '#374151', margin: '3px 0 0', lineHeight: 1.5 }}>
                    {[sup.billingAddress, sup.city, sup.state, sup.pincode].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
              {sup.shippingAddress && (
                <div style={{ display: 'flex', gap: 7 }}>
                  <MapPin size={14} color="#9ca3af" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, fontWeight: 600 }}>Shipping Address</p>
                    <p style={{ fontSize: 12, color: '#374151', margin: '3px 0 0', lineHeight: 1.5 }}>{sup.shippingAddress}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Financial Summary */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase' }}>Financial Summary</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { l: 'Total Purchased',   v: sup.totalPurchased ? `₹${Number(sup.totalPurchased).toLocaleString('en-IN')}` : '—', c: '#0c3b73' },
                { l: 'Outstanding',       v: `₹${Number(sup.outstanding || 0).toLocaleString('en-IN')}`,                         c: '#dc2626' },
                { l: 'Credit Limit',      v: sup.creditLimit ? `₹${Number(sup.creditLimit).toLocaleString('en-IN')}` : '—',      c: '#16a34a' },
                { l: 'Payment Terms',     v: sup.paymentTerms || '—',                                                             c: '#374151' },
              ].map(s => (
                <div key={s.l} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px' }}>
                  <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px' }}>{s.l}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: s.c, margin: 0 }}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Tabs */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '12px 18px', border: 'none', borderBottom: tab===t?'2px solid #d97706':'2px solid transparent', background: 'none', fontSize: 12, fontWeight: tab===t?700:500, color: tab===t?'#d97706':'#6b7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ padding: 20 }}>
            {tab === 'Contact Persons' && (
              contacts.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    {['Name','Designation','Phone','Email','Action'].map(h => (
                      <th key={h} style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {contacts.map((c, i) => (
                      <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #f3f4f6' }}>{c.name}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{c.designation || '—'}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, borderBottom: '1px solid #f3f4f6' }}>{c.phone || '—'}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#0c3b73', borderBottom: '1px solid #f3f4f6' }}>{c.email || '—'}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {c.phone && <button style={{ background: '#e0f2fe', border: 'none', borderRadius: 5, padding: '4px 8px', cursor: 'pointer', fontSize: 11, color: '#0891b2' }}><Phone size={10} /></button>}
                            {c.email && <button style={{ background: '#fef3c7', border: 'none', borderRadius: 5, padding: '4px 8px', cursor: 'pointer', fontSize: 11, color: '#d97706' }}><Mail size={10} /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '30px 0', textAlign: 'center', color: '#9ca3af' }}>
                  <p style={{ fontSize: 13, margin: 0 }}>No contact persons added</p>
                </div>
              )
            )}

            {tab === 'Bank Details' && (
              Object.values(bank).some(Boolean) ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
                  {[['Bank Name', bank.name],['Account Number', bank.accountNo],['IFSC Code', bank.ifsc],['Branch', bank.branch],['Account Type', bank.accountType || 'Current Account']].map(([l,v]) => (
                    <div key={l} style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 14px' }}>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase' }}>{l}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>{v || '—'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '30px 0', textAlign: 'center', color: '#9ca3af' }}>
                  <p style={{ fontSize: 13, margin: 0 }}>No bank details available</p>
                </div>
              )
            )}

            {tab === 'Payment Terms' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
                {[['Credit Days', sup.paymentTerms || '—'],['Credit Limit', sup.creditLimit ? `₹${Number(sup.creditLimit).toLocaleString('en-IN')}` : '—'],['Delivery Time', sup.deliveryTime || '—'],['Transporter', sup.transporter || '—']].map(([l,v]) => (
                  <div key={l} style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 14px' }}>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase' }}>{l}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>{v}</p>
                  </div>
                ))}
              </div>
            )}

            {(tab === 'Other Details' || tab === 'Documents') && (
              <div style={{ padding: '30px 0', textAlign: 'center', color: '#9ca3af' }}>
                <Truck size={36} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: 13, margin: 0 }}>{tab === 'Documents' ? 'No documents uploaded yet' : 'No additional details'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
