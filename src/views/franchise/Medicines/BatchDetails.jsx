/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Package, ArrowLeft, Plus, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>

const STATUS_CFG = {
  'Active':        { bg: '#dcfce7', color: '#16a34a' },
  'Expiring Soon': { bg: '#fef3c7', color: '#d97706' },
  'Out of Stock':  { bg: '#fee2e2', color: '#dc2626' },
  'Expired':       { bg: '#f3f4f6', color: '#6b7280' },
}

export default function BatchDetails() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const [med, setMed]           = useState(null)
  const [batches, setBatches]   = useState([])
  const [loading, setLoading]   = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [medRes, batchRes] = await Promise.allSettled([
        getRequest(`/franchise/medicines/${id}`),
        getRequest(`/franchise/medicines/${id}/batches`),
      ])
      if (medRes.status === 'fulfilled')   setMed(medRes.value.data?.data)
      if (batchRes.status === 'fulfilled') setBatches(batchRes.value.data?.data || [])
    } catch { toast.error('Failed to load batch details') }
    finally  { setLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const totalBatches = batches.length
  const inStock      = batches.filter(b => b.stock > 0 && b.status !== 'Expired').reduce((s, b) => s + (b.stock || 0), 0)
  const nearExpiry   = batches.filter(b => b.status === 'Expiring Soon').length

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Package} title="Batch Details" subtitle="Manage batch information and expiry" color="#0891b2">
        <button onClick={() => navigate(`/franchise/medicines/${id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#0891b2', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Plus size={14} /> Add New Batch
        </button>
      </PageHeader>

      {/* Medicine Identity Card */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,#e0e7ff,#f0fdf4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>💊</div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>{med?.name || '—'}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>{med?.salt} · {med?.company}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { label: 'Total Batches', value: loading ? '...' : totalBatches, color: '#0891b2' },
            { label: 'In Stock',      value: loading ? '...' : inStock,      color: '#16a34a' },
            { label: 'Near Expiry',   value: loading ? '...' : nearExpiry,   color: '#d97706' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '10px 20px', background: '#f9fafb', borderRadius: 8 }}>
              <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase' }}>{s.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {nearExpiry > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} color="#d97706" />
          <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>
            {nearExpiry} batch(es) are expiring soon. Please take action.
          </span>
        </div>
      )}

      {/* Batch Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Batch No." /><Th c="Mfg. Date" /><Th c="Exp. Date" />
              <Th c="Stock" align="center" /><Th c="Purchase Price (₹)" align="right" />
              <Th c="MRP (₹)" align="right" /><Th c="Supplier" /><Th c="Status" />
            </tr></thead>
            <tbody>
              {loading
                ? Array(4).fill(0).map((_,i) => (
                  <tr key={i}>{Array(8).fill(0).map((_,j) => <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>
                ))
                : batches.length === 0
                  ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No batches found</td></tr>
                  : batches.map((b, i) => {
                    const cfg = STATUS_CFG[b.status] || STATUS_CFG['Active']
                    return (
                      <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <Td><span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#0891b2' }}>{b.batch || b.batchNo}</span></Td>
                        <Td style={{ color: '#6b7280', fontSize: 12 }}>{b.mfgDate}</Td>
                        <Td style={{ color: b.status === 'Expired' ? '#dc2626' : b.status === 'Expiring Soon' ? '#d97706' : '#374151', fontWeight: b.status !== 'Active' ? 700 : 400, fontSize: 12 }}>{b.expDate || b.expiryDate}</Td>
                        <Td style={{ textAlign: 'center', fontWeight: 700, color: b.stock === 0 ? '#dc2626' : '#111827' }}>{b.stock ?? 0}</Td>
                        <Td style={{ textAlign: 'right' }}>₹{Number(b.purchasePrice || 0).toFixed(2)}</Td>
                        <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>₹{Number(b.mrp || 0).toFixed(2)}</Td>
                        <Td style={{ fontSize: 12 }}>{b.supplier || b.supplierName || '—'}</Td>
                        <Td><span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{b.status || 'Active'}</span></Td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {batches.length} batches</span>
        </div>
      </div>
    </div>
  )
}
