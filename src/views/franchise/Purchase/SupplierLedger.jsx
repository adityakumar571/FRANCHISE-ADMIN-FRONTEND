/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { BookOpen, ArrowDownCircle, ArrowUpCircle, Eye, Download, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function SupplierLedger() {
  const [suppliers, setSuppliers]   = useState([])
  const [selected, setSelected]     = useState(null)
  const [ledger, setLedger]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Load all suppliers with outstanding
  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      // Try ledger endpoint first, fallback to regular suppliers
      let res
      try {
        res = await getRequest('/franchise/purchase/supplier-ledger')
      } catch (err) {
        console.log('Ledger endpoint not available, using suppliers endpoint')
        res = await getRequest('/franchise-suppliers/suppliers')
      }
      
      let suppliersList = []
      if (Array.isArray(res?.data)) {
        suppliersList = res.data
      } else if (Array.isArray(res?.data?.data)) {
        suppliersList = res.data.data
      } else if (Array.isArray(res?.data?.suppliers)) {
        suppliersList = res.data.suppliers
      }
      
      console.log('✅ Loaded suppliers for ledger:', suppliersList.length)
      setSuppliers(suppliersList)
    } catch (err) {
      console.error('Failed to load suppliers:', err)
      toast.error('Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }, [refreshKey])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])
  // Load ledger for selected supplier
  const loadLedger = useCallback(async (supplierId) => {
    setLedgerLoading(true)
    try {
      const res = await getRequest(`/franchise/suppliers/${supplierId}/ledger`)
      setLedger(res.data?.data || [])
    } catch { toast.error('Failed to load ledger') }
    finally  { setLedgerLoading(false) }
  }, [])

  const handleSelect = (supplierId, name) => {
    if (supplierId === selected) { 
      setSelected(null); 
      setLedger([]); 
      return 
    }
    setSelected(supplierId)
    loadLedger(supplierId)
  }

  const totalDue = suppliers.reduce((sum, s) => sum + (s.outstanding || 0), 0)

  const txnCols = [
    { title: 'Date',       key: 'date' },
    { title: 'Type',       key: 'type', render: v => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'capitalize' }}>
        {v === 'purchase' || v === 'Purchase'
          ? <ArrowDownCircle size={12} color="#e11d48" />
          : <ArrowUpCircle  size={12} color="#16a34a" />}
        {v}
      </span>
    )},
    { title: 'Reference',  key: 'refNo' },
    { title: 'Debit (₹)',  key: 'debit',   align: 'right', render: v => v ? <span style={{ color: '#e11d48', fontWeight: 600 }}>₹{Number(v).toLocaleString()}</span> : '—' },
    { title: 'Credit (₹)', key: 'credit',  align: 'right', render: v => v ? <span style={{ color: '#16a34a', fontWeight: 600 }}>₹{Number(v).toLocaleString()}</span> : '—' },
    { title: 'Balance (₹)',key: 'balance', align: 'right', render: v => <span style={{ fontWeight: 700 }}>₹{Number(v || 0).toLocaleString()}</span> },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={BookOpen} title="Supplier Ledger" subtitle="Outstanding dues and transaction history per supplier" color="#0891b2">
        <button 
          onClick={() => setRefreshKey(k => k + 1)} 
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </PageHeader>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Outstanding',   value: `₹${totalDue.toLocaleString('en-IN')}`, color: '#e11d48' },
          { label: 'Suppliers with Dues', value: suppliers.filter(s => (s.outstanding || 0) > 0).length, color: '#0891b2' },
          { label: 'Total Suppliers',     value: suppliers.length, color: '#0c3b73' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', border: `1px solid ${s.color}30`, borderLeft: `4px solid ${s.color}`, minWidth: 160 }}>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Supplier Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
          {Array(3).fill(0).map((_,i) => <div key={i} style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb', height: 100 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {suppliers.map(s => {
            const supplierName = s.companyName || s.name || 'Unknown Supplier'
            const supplierId = s._id
            return (
              <div key={supplierId} onClick={() => handleSelect(supplierId, supplierName)}
                style={{ background: '#fff', borderRadius: 10, padding: '16px 18px', border: `2px solid ${supplierId === selected ? '#0c3b73' : '#e5e7eb'}`, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (supplierId !== selected) e.currentTarget.style.borderColor='#bfdbfe' }}
                onMouseLeave={e => { if (supplierId !== selected) e.currentTarget.style.borderColor='#e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: '#111827' }}>{supplierName}</p>
                  {(s.outstanding || 0) > 0
                    ? <span style={{ fontSize: 11, fontWeight: 700, color: '#e11d48', background: '#fff1f2', padding: '2px 8px', borderRadius: 20 }}>DUE</span>
                    : <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: 20 }}>CLEAR</span>
                  }
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px' }}>Total Purchase</p>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>₹{Number(s.totalPurchase || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px' }}>Outstanding</p>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: (s.outstanding || 0) > 0 ? '#e11d48' : '#16a34a' }}>
                      ₹{Number(s.outstanding || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
          {suppliers.length === 0 && !loading && (
            <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#9ca3af', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 12px', color: '#d1d5db' }} />
              <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>No supplier ledger data available</p>
              <p style={{ fontSize: 12, margin: 0 }}>Start purchasing from suppliers to see their ledger</p>
            </div>
          )}
        </div>
      )}

      {/* Transaction Ledger for selected supplier */}
      {selected && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#111827' }}>
              Transactions — {suppliers.find(s => s._id === selected)?.companyName || suppliers.find(s => s._id === selected)?.name || 'Supplier'}
            </h3>
            <button 
              onClick={() => toast.success('Export feature coming soon')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#374151' }}
            >
              <Download size={12} /> Export
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{txnCols.map(c => <Th key={c.key} c={c.title} align={c.align} />)}</tr></thead>
              <tbody>
                {ledgerLoading
                  ? Array(3).fill(0).map((_,i) => <tr key={i}>{Array(6).fill(0).map((_,j) => <td key={j} style={{ padding: '10px 12px' }}><div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                  : ledger.length === 0
                    ? <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>No transactions found</td></tr>
                    : ledger.map((row, i) => (
                      <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        {txnCols.map(c => (
                          <Td key={c.key} style={{ textAlign: c.align }}>
                            {c.render ? c.render(row[c.key]) : row[c.key] || '—'}
                          </Td>
                        ))}
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
