/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RefreshCw, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { getRequest, deleteRequest } from '../../../Helpers'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function AlternativeMedicines() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const [med, setMed]         = useState(null)
  const [alts, setAlts]       = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [medRes, altRes] = await Promise.allSettled([
        getRequest(`/franchise/medicines/${id}`),
        getRequest(`/franchise/medicines/${id}/alternatives`),
      ])
      if (medRes.status === 'fulfilled') setMed(medRes.value.data?.data)
      if (altRes.status === 'fulfilled') setAlts(altRes.value.data?.data || [])
    } catch { toast.error('Failed to load alternatives') }
    finally  { setLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const removeAlt = async (altId) => {
    try {
      await deleteRequest(`/franchise/medicines/${id}/alternatives/${altId}`)
      setAlts(p => p.filter(a => a._id !== altId))
      toast.success('Alternative removed')
    } catch { toast.error('Failed to remove alternative') }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={RefreshCw} title="Alternative Medicines" subtitle="View alternative medicine suggestions" color="#7c3aed">
        <button onClick={() => navigate(`/franchise/medicines/${id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#7c3aed', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Plus size={14} /> Add Alternative
        </button>
      </PageHeader>

      {/* Selected Medicine Card */}
      <div style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: 14, padding: '20px 24px', color: '#fff', display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>💊</div>
        <div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{med?.name || '—'}</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.85 }}>{med?.salt} · {med?.company}</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.75 }}>MRP: ₹{Number(med?.mrp || 0).toFixed(2)} · Stock: {med?.stock ?? 0} units</p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 11, opacity: 0.75, textTransform: 'uppercase' }}>Alternatives Found</p>
          <p style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 900 }}>{alts.length}</p>
        </div>
      </div>

      {/* Alternatives Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Alternative Medicines ({alts.length})</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Medicine Name" /><Th c="Salt / Strength" /><Th c="Company" />
              <Th c="MRP (₹)" align="right" /><Th c="Stock" align="center" /><Th c="Action" />
            </tr></thead>
            <tbody>
              {loading
                ? Array(3).fill(0).map((_,i) => <tr key={i}>{Array(6).fill(0).map((_,j) => <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : alts.length === 0
                  ? <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No alternatives found</td></tr>
                  : alts.map((a, i) => (
                    <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>💊</div>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{a.name}</span>
                        </div>
                      </Td>
                      <Td style={{ color: '#6b7280', fontSize: 12 }}>{a.salt}</Td>
                      <Td style={{ fontSize: 12 }}>{a.company}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>₹ {Number(a.mrp || 0).toFixed(2)}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 700, color: a.stock === 0 ? '#dc2626' : a.stock < 30 ? '#d97706' : '#16a34a' }}>
                        {a.stock === 0 ? 'Out of Stock' : a.stock}
                      </Td>
                      <Td>
                        <button onClick={() => removeAlt(a._id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                          <Trash2 size={10} /> Remove
                        </button>
                      </Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
