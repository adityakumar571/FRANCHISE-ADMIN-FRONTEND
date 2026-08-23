/* eslint-disable prettier/prettier */
/**
 * Screen 3 — Medicine Search
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowLeft, Plus, Minus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { Th, Td, SBtn, FieldLabel } from './posHelpers'
import { MEDICINES } from './posMockData'

export default function MedicineSearch() {
  const navigate     = useNavigate()
  const [q, setQ]    = useState('')
  const [cat, setCat] = useState('All Categories')
  const [sel, setSel] = useState(null)
  const [qty, setQty] = useState(1)

  const results = MEDICINES.filter(m =>
    q === '' || m.name.toLowerCase().includes(q.toLowerCase()) || m.salt.toLowerCase().includes(q.toLowerCase()) || m.company.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Search} title="Medicine Search" subtitle="Search and find medicines from inventory" color="#16a34a">
        <SBtn label="Back to Billing" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/billing')} />
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 18, alignItems: 'start' }}>
        {/* Left — Search + Table */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          {/* Filter Row */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search medicine name, salt, company..." autoFocus
                style={{ width: '100%', padding: '9px 12px 9px 30px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
            </div>
            {['All Categories','Analgesic','Antibiotic','Antidiabetic','Cardiac','Vitamin'].map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{ padding: '7px 12px', border: `1px solid ${cat===c?'#16a34a':'#e5e7eb'}`, borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: cat===c?'#dcfce7':'#fff', color: cat===c?'#16a34a':'#374151', whiteSpace: 'nowrap' }}>
                {c}
              </button>
            ))}
          </div>

          <div style={{ padding: '10px 16px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Medicine List — <strong>{results.length} Results</strong></p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Medicine Name','Tablet / Strength','Company','MRP','Stock'].map(h => <Th key={h} c={h} />)}</tr></thead>
              <tbody>
                {results.map(m => (
                  <tr key={m.id} onClick={() => { setSel(m); setQty(1) }}
                    style={{ cursor: 'pointer', background: sel?.id === m.id ? '#e0e7ff' : '' }}
                    onMouseEnter={e => { if (sel?.id !== m.id) e.currentTarget.style.background = '#f9fafb' }}
                    onMouseLeave={e => { if (sel?.id !== m.id) e.currentTarget.style.background = '' }}>
                    <Td><span style={{ fontWeight: 600 }}>{m.name}</span></Td>
                    <Td style={{ color: '#6b7280', fontSize: 11 }}>{m.salt}</Td>
                    <Td>{m.company}</Td>
                    <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹ {m.mrp.toFixed(2)}</Td>
                    <Td style={{ fontWeight: 700, color: m.stock < 30 ? '#dc2626' : '#16a34a' }}>{m.stock}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right — Item Detail */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>Medicine Detail</p>
          {sel ? (
            <>
              <div style={{ padding: '14px', background: 'linear-gradient(135deg,#e0e7ff,#f0fdf4)', borderRadius: 10, marginBottom: 14 }}>
                <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 800, color: '#111827' }}>{sel.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{sel.salt}</p>
              </div>
              {[['Batch', sel.batch], ['Expiry', sel.exp], ['Company', sel.company], ['Pack', sel.pack], ['MRP', `₹ ${sel.mrp.toFixed(2)}`], ['Stock', `${sel.stock} ${sel.pack}`], ['GST', `${sel.gst}%`]].map(([l,v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#9ca3af' }}>{l}</span>
                  <span style={{ fontWeight: 600, color: l === 'MRP' ? '#0c3b73' : l === 'Stock' ? (sel.stock < 30 ? '#dc2626' : '#16a34a') : '#111827' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <FieldLabel>Quantity</FieldLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                  <span style={{ fontSize: 22, fontWeight: 800, minWidth: 36, textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => setQty(q => q+1)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#6b7280' }}>Total</span>
                  <span style={{ fontWeight: 800, color: '#0c3b73' }}>₹ {(sel.mrp * qty).toFixed(2)}</span>
                </div>
                <SBtn label={`Add to Bill [F4]`} icon={Plus} full onClick={() => navigate('/franchise/pos/billing')} />
              </div>
            </>
          ) : (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#9ca3af' }}>
              <Search size={36} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 13, margin: 0 }}>Click a medicine to see its details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
