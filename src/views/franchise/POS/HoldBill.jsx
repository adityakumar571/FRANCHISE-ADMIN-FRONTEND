/* eslint-disable prettier/prettier */
/**
 * Screen 8 — Hold Bill
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pause, ArrowLeft, Trash2, Play } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { Th, Td, SBtn, TextInput, FieldLabel } from './posHelpers'
import { HOLD_BILLS } from './posMockData'

export default function HoldBill() {
  const navigate = useNavigate()
  const [customer, setCustomer] = useState('Walk-In Customer')
  const [note, setNote]         = useState('')
  const [bills, setBills]       = useState(HOLD_BILLS)

  const handleHold = () => {
    const newBill = { id: `HB00${bills.length+1}`, name: customer, items: 0, amount: 0, time: new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}), note }
    setBills(p => [newBill, ...p])
    navigate('/franchise/pos/billing')
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Pause} title="Hold Bill" subtitle="Hold current bill and manage held bills" color="#d97706">
        <SBtn label="Back to Billing" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/billing')} />
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Hold Form */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10 }}>
            <Pause size={18} color="#d97706" />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#92400e' }}>Hold Current Bill</p>
              <p style={{ margin: 0, fontSize: 11, color: '#a16207' }}>Bill will be saved and can be resumed later</p>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <FieldLabel>Customer Name</FieldLabel>
            <TextInput value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Customer name or Walk-In" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <FieldLabel>Note (Optional)</FieldLabel>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note for this held bill..." rows={3}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
          </div>
          <SBtn label="Hold Bill [F3]" icon={Pause} full bg="#fef3c7" color="#d97706" border="#fde68a" onClick={handleHold} />
        </div>

        {/* Hold Bills List */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Hold Bills (Today) — {bills.length} Bills</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Bill Name','Items','Amount','Time','Note','Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{b.name}</p>
                      <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{b.id}</p>
                    </Td>
                    <Td style={{ fontWeight: 600 }}>{b.items}</Td>
                    <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹ {b.amount.toFixed(2)}</Td>
                    <Td style={{ color: '#6b7280', fontSize: 12 }}>{b.time}</Td>
                    <Td style={{ color: '#9ca3af', fontSize: 12 }}>{b.note}</Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => navigate('/franchise/pos/billing')}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '5px 10px', border: 'none', borderRadius: 6, background: '#e0e7ff', color: '#0c3b73', cursor: 'pointer' }}>
                          <Play size={10} /> Resume
                        </button>
                        <button onClick={() => setBills(p => p.filter(x => x.id !== b.id))}
                          style={{ padding: '5px 7px', border: 'none', borderRadius: 6, background: '#fee2e2', cursor: 'pointer' }}>
                          <Trash2 size={11} color="#dc2626" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 18px', borderTop: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Bills are automatically cleared at day close</p>
          </div>
        </div>
      </div>
    </div>
  )
}
