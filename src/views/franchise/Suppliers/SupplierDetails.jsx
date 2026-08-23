/* eslint-disable prettier/prettier */
/**
 * Screen 58 — Supplier Details
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Truck, ArrowLeft, Edit2, Phone, Mail, MapPin, Globe, Calendar } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { SUPPLIERS, CONTACTS } from './supplierMockData'

const Row = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid #f3f4f6' }}>
    <span style={{ color: '#9ca3af', fontSize: 12 }}>{label}</span>
    <span style={{ fontWeight: 600, color: color || '#374151', textAlign: 'right', maxWidth: 200 }}>{value || '—'}</span>
  </div>
)

const TABS = ['Contact Persons', 'Bank Details', 'Payment Terms', 'Other Details', 'Documents']

export default function SupplierDetails() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const sup      = SUPPLIERS.find(s => s.id === id) || SUPPLIERS[0]
  const [tab, setTab] = useState('Contact Persons')

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Truck} title="Supplier Details" subtitle="View complete supplier information" color="#d97706">
        <button onClick={() => navigate('/franchise/suppliers')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
        <button onClick={() => navigate(`/franchise/suppliers/${sup.id}/edit`)}
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
                {sup.name[0]}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#111827' }}>{sup.name}</p>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: sup.status==='Active'?'#dcfce7':'#fee2e2', color: sup.status==='Active'?'#16a34a':'#dc2626' }}>{sup.status}</span>
              </div>
            </div>

            <Row label="Supplier Code"   value={sup.id} />
            <Row label="GST No."         value={sup.gstNo} />
            <div style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
              <Phone size={13} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Phone</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '2px 0 0' }}>{sup.phone}</p>
              </div>
            </div>
            <div style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
              <Mail size={13} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Email</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '2px 0 0' }}>{sup.email}</p>
              </div>
            </div>
            <div style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
              <Globe size={13} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Website</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0c3b73', margin: '2px 0 0' }}>www.medicoagency.com</p>
              </div>
            </div>
            <div style={{ padding: '8px 0', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
              <Calendar size={13} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Since</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '2px 0 0' }}>12 Jan 2019</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 10px', textTransform: 'uppercase' }}>Address</p>
            <div style={{ display: 'flex', gap: 7, marginBottom: 12 }}>
              <MapPin size={14} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, fontWeight: 600 }}>Head Office</p>
                <p style={{ fontSize: 12, color: '#374151', margin: '3px 0 0', lineHeight: 1.5 }}>
                  132, Wholesale Market,<br />Yahiyaganj,<br />Lucknow - 226001, Uttar Pradesh
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <MapPin size={14} color="#9ca3af" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, fontWeight: 600 }}>Shipping Address</p>
                <p style={{ fontSize: 12, color: '#374151', margin: '3px 0 0', lineHeight: 1.5 }}>
                  132, AF Inroads Market,<br />Near Transport Nagar,<br />Lucknow - 226018, Uttar Pradesh
                </p>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase' }}>Financial Summary</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { l: 'Total Purchased',  v: '₹1,45,85,230.00',  c: '#0c3b73' },
                { l: 'This Year',        v: '₹1,16,89,800.00',  c: '#7c3aed' },
                { l: 'Total Outstanding',v: `₹${sup.outstanding.toLocaleString('en-IN',{minimumFractionDigits:2})}`, c: '#dc2626' },
                { l: 'Credit Limit',     v: `₹${(sup.creditLimit/100000).toFixed(1)}L`, c: '#16a34a' },
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
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>
                    {['Name','Designation','Phone','Email','Action'].map(h => (
                      <th key={h} style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {CONTACTS.map((c, i) => (
                      <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #f3f4f6' }}>{c.name}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{c.designation}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, borderBottom: '1px solid #f3f4f6' }}>{c.phone}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#0c3b73', borderBottom: '1px solid #f3f4f6' }}>{c.email}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button style={{ background: '#e0f2fe', border: 'none', borderRadius: 5, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#0891b2' }}>
                              <Phone size={10} />
                            </button>
                            <button style={{ background: '#fef3c7', border: 'none', borderRadius: 5, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#d97706' }}>
                              <Mail size={10} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'Bank Details' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
                {[['Bank Name','State Bank of India'],['Account Number','1234567890123'],['IFSC Code','SBIN0001234'],['Branch','Yahiyaganj, Lucknow'],['Account Type','Current Account']].map(([l,v]) => (
                  <div key={l} style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 14px' }}>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase' }}>{l}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>{v}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'Payment Terms' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
                {[['Credit Days','30 Days'],['Credit Limit',`₹${(sup.creditLimit/100000).toFixed(1)}L`],['Payment Mode','NEFT / Cheque'],['Discount','2% on payment within 7 days']].map(([l,v]) => (
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
