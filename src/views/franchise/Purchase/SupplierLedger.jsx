/* eslint-disable prettier/prettier */
/**
 * SupplierLedger — Payable / outstanding information per supplier
 */
import { useState } from 'react'
import { BookOpen, TrendingDown, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

const MOCK_SUPPLIERS = [
  { name: 'Medico Agencies', totalPurchase: 124500, totalPaid: 100000, outstanding: 24500, lastActivity: '2026-08-22' },
  { name: 'PharmaDist Pvt Ltd', totalPurchase: 85000, totalPaid: 85000, outstanding: 0, lastActivity: '2026-08-20' },
  { name: 'SunPharma Dist', totalPurchase: 42000, totalPaid: 30000, outstanding: 12000, lastActivity: '2026-08-18' },
]

const MOCK_TRANSACTIONS = {
  'Medico Agencies': [
    { date: '2026-08-22', type: 'purchase', ref: 'GRN-1050', debit: 24500, credit: 0, balance: 24500 },
    { date: '2026-08-18', type: 'payment', ref: 'PAY-088', debit: 0, credit: 50000, balance: 0 },
    { date: '2026-08-15', type: 'purchase', ref: 'GRN-1045', debit: 50000, credit: 0, balance: 50000 },
  ],
}

const SupplierLedger = () => {
  const [selected, setSelected] = useState(null)
  const totalDue = MOCK_SUPPLIERS.reduce((sum, s) => sum + s.outstanding, 0)

  const txnColumns = [
    { title: 'Date',    key: 'date' },
    { title: 'Type',    key: 'type', render: (v) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'capitalize' }}>
        {v === 'purchase' ? <ArrowDownCircle size={12} color="#e11d48" /> : <ArrowUpCircle size={12} color="#16a34a" />} {v}
      </span>
    )},
    { title: 'Reference', key: 'ref' },
    { title: 'Debit (₹)',  key: 'debit',  align: 'right', render: (v) => v ? <span style={{ color: '#e11d48', fontWeight: 600 }}>₹{v.toLocaleString()}</span> : '—' },
    { title: 'Credit (₹)', key: 'credit', align: 'right', render: (v) => v ? <span style={{ color: '#16a34a', fontWeight: 600 }}>₹{v.toLocaleString()}</span> : '—' },
    { title: 'Balance (₹)', key: 'balance', align: 'right', render: (v) => <span style={{ fontWeight: 700 }}>₹{v.toLocaleString()}</span> },
  ]

  return (
    <div>
      <PageHeader icon={BookOpen} title="Supplier Ledger" subtitle="Outstanding dues and transaction history per supplier" color="#0891b2" />

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={sumCard('#e11d48')}><p style={sumLabel}>Total Outstanding</p><p style={sumVal}>₹{totalDue.toLocaleString()}</p></div>
        <div style={sumCard('#0891b2')}><p style={sumLabel}>Suppliers with Dues</p><p style={sumVal}>{MOCK_SUPPLIERS.filter((s) => s.outstanding > 0).length}</p></div>
      </div>

      {/* Supplier list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 24 }}>
        {MOCK_SUPPLIERS.map((s) => (
          <div key={s.name} onClick={() => setSelected(s.name === selected ? null : s.name)}
            style={{ background: '#fff', borderRadius: 10, padding: '16px 18px', border: `2px solid ${s.name === selected ? '#0c3b73' : '#e5e7eb'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: '#111827' }}>{s.name}</p>
              {s.outstanding > 0 ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#e11d48', background: '#fff1f2', padding: '2px 8px', borderRadius: 20 }}>DUE</span>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: 20 }}>CLEAR</span>
              )}
            </div>
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px' }}>Total Purchase</p><p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>₹{s.totalPurchase.toLocaleString()}</p></div>
              <div><p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px' }}>Outstanding</p><p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: s.outstanding > 0 ? '#e11d48' : '#16a34a' }}>₹{s.outstanding.toLocaleString()}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction detail */}
      {selected && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Transactions — {selected}</h3>
          <DataTable columns={txnColumns} data={MOCK_TRANSACTIONS[selected] || []} loading={false} total={(MOCK_TRANSACTIONS[selected] || []).length} page={1} limit={20} />
        </div>
      )}
    </div>
  )
}

const sumCard = (color) => ({ background: '#fff', borderRadius: 10, padding: '16px 20px', border: `1px solid ${color}30`, borderLeft: `4px solid ${color}` })
const sumLabel = { fontSize: 12, color: '#9ca3af', margin: '0 0 4px', fontWeight: 500 }
const sumVal   = { fontSize: 22, fontWeight: 700, margin: 0, color: '#111827' }

export default SupplierLedger
