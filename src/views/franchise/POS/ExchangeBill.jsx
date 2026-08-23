/* eslint-disable prettier/prettier */
/**
 * Screen 11 — Exchange Bill
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, ArrowLeft, Search, Plus, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { Th, Td, SBtn, TextInput, FieldLabel, SelectInput } from './posHelpers'
import { MEDICINES } from './posMockData'

const RETURN_ROW = [{ name: 'Crocin 650 Tablet', batch: 'CR08023', qty: 10.00, mrp: 15.00, disc: 0 }]
const NEW_ROW    = [{ name: 'Grace Advance Tablet', qty: 10.00, mrp: 10.00 }]

export default function ExchangeBill() {
  const navigate    = useNavigate()
  const [invoice, setInvoice]   = useState('INV-2025-07624')
  const [date, setDate]         = useState('30-06-2025')
  const [exchType, setExchType] = useState('Medicine')
  const [upgradeType, setUpgradeType] = useState('Upgrade')
  const [newSearch, setNewSearch] = useState('')
  const [newItems, setNewItems] = useState(NEW_ROW)

  const returnTotal = RETURN_ROW.reduce((s,r) => s + r.qty * r.mrp, 0)
  const newTotal    = newItems.reduce((s,r) => s + r.qty * r.mrp, 0)
  const netPayable  = newTotal - returnTotal

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={ArrowLeftRight} title="Exchange Bill" subtitle="Exchange medicines against a previous invoice" color="#0c3b73">
        <SBtn label="Back to Billing" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/billing')} />
      </PageHeader>

      {/* Invoice Info */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          <div><FieldLabel>Original Invoice</FieldLabel><TextInput value={invoice} onChange={e => setInvoice(e.target.value)} /></div>
          <div><FieldLabel>Invoice Date</FieldLabel><TextInput value={date} onChange={e => setDate(e.target.value)} /></div>
          <div>
            <FieldLabel>Exchange Type</FieldLabel>
            <SelectInput value={exchType} onChange={e => setExchType(e.target.value)}>
              <option>Medicine</option><option>Product</option>
            </SelectInput>
          </div>
          <div>
            <FieldLabel>Type</FieldLabel>
            <SelectInput value={upgradeType} onChange={e => setUpgradeType(e.target.value)}>
              <option>Upgrade</option><option>Downgrade</option><option>Same</option>
            </SelectInput>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Return Items */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', background: '#fff1f2' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#dc2626' }}>↩ Return Items</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Medicine Name','Batch','Qty','MRP','Disc%'].map(h => <Th key={h} c={h} />)}</tr></thead>
              <tbody>
                {RETURN_ROW.map((it, i) => (
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td style={{ fontWeight: 600 }}>{it.name}</Td>
                    <Td style={{ fontFamily: 'monospace', fontSize: 11 }}>{it.batch}</Td>
                    <Td>{it.qty}</Td>
                    <Td>₹{it.mrp}</Td>
                    <Td>{it.disc}%</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: '#6b7280' }}>Return Total</span>
            <span style={{ color: '#dc2626' }}>₹ {returnTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* New Items */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', background: '#f0fdf4' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#16a34a' }}>↪ New Items</p>
          </div>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={newSearch} onChange={e => setNewSearch(e.target.value)} placeholder="Search medicine to exchange..."
                style={{ width: '100%', padding: '8px 10px 8px 28px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Medicine Name','Qty','MRP',''].map(h => <Th key={h} c={h} />)}</tr></thead>
              <tbody>
                {newItems.map((it, i) => (
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td style={{ fontWeight: 600 }}>{it.name}</Td>
                    <Td>{it.qty}</Td>
                    <Td>₹{it.mrp}</Td>
                    <Td>
                      <button onClick={() => setNewItems(p => p.filter((_,j) => j!==i))}
                        style={{ background: '#fee2e2', border: 'none', borderRadius: 5, padding: '4px 6px', cursor: 'pointer' }}>
                        <Trash2 size={10} color="#dc2626" />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: '#6b7280' }}>New Total</span>
            <span style={{ color: '#16a34a' }}>₹ {newTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Net Payable */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', gap: 32 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Return Amount</p>
            <p style={{ margin: '3px 0 0', fontSize: 18, fontWeight: 800, color: '#dc2626' }}>₹ {returnTotal.toFixed(2)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>New Amount</p>
            <p style={{ margin: '3px 0 0', fontSize: 18, fontWeight: 800, color: '#16a34a' }}>₹ {newTotal.toFixed(2)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Net Payable</p>
            <p style={{ margin: '3px 0 0', fontSize: 24, fontWeight: 900, color: netPayable >= 0 ? '#0c3b73' : '#16a34a' }}>₹ {Math.abs(netPayable).toFixed(2)}</p>
          </div>
        </div>
        <SBtn label="Process Exchange [F5]" icon={ArrowLeftRight} onClick={() => navigate('/franchise/pos/billing')} />
      </div>
    </div>
  )
}
