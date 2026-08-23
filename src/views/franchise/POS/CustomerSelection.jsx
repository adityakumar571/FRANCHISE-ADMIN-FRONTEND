/* eslint-disable prettier/prettier */
/**
 * Screen 4 — Customer Selection
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, ArrowLeft, Plus, CheckCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { Th, Td, SBtn } from './posHelpers'
import { CUSTOMERS } from './posMockData'

export default function CustomerSelection() {
  const navigate      = useNavigate()
  const [q, setQ]     = useState('')
  const [sel, setSel] = useState(null)

  const filtered = CUSTOMERS.filter(c =>
    q === '' || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q) || c.id.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Users} title="Customer Selection" subtitle="Search and select customer for billing" color="#7c3aed">
        <SBtn label="Back to Billing" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/billing')} />
        <SBtn label="+ Add New Customer" icon={Plus} sm onClick={() => navigate('/franchise/customers/add')} />
      </PageHeader>

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={q} onChange={e => setQ(e.target.value)} autoFocus
            placeholder="Search customer by name / mobile / ID..."
            style={{ width: '100%', padding: '10px 12px 10px 32px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Recent Customers */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Recent Customers</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12, marginBottom: 20 }}>
          {CUSTOMERS.map(c => (
            <div key={c.id} onClick={() => setSel(c)}
              style={{ padding: '14px', background: sel?.id === c.id ? '#e0e7ff' : '#fff', border: `2px solid ${sel?.id===c.id?'#7c3aed':'#e5e7eb'}`, borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => { if (sel?.id !== c.id) e.currentTarget.style.borderColor='#7c3aed' }}
              onMouseLeave={e => { if (sel?.id !== c.id) e.currentTarget.style.borderColor='#e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>
                  {c.name[0]}
                </div>
                {sel?.id === c.id && <CheckCircle size={16} color="#7c3aed" />}
              </div>
              <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#111827' }}>{c.name}</p>
              <p style={{ margin: '0 0 6px', fontSize: 11, color: '#9ca3af' }}>{c.phone}</p>
              <p style={{ margin: '0 0 2px', fontSize: 11, color: '#6b7280' }}>{c.orders} Orders · {c.totalPurchase}</p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: c.due !== '₹0' ? '#dc2626' : '#16a34a' }}>Due: {c.due}</p>
            </div>
          ))}
        </div>
      </div>

      {/* All Customers Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>All Customers ({filtered.length})</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Name','Mobile','Total Orders','Total Purchase','Due Amount','Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0c3b73' }}>{c.name[0]}</div>
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
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <SBtn label="Cancel" bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/billing')} />
          <SBtn label="Confirm Selection" sm disabled={!sel} onClick={() => navigate('/franchise/pos/billing')} />
        </div>
      </div>
    </div>
  )
}
