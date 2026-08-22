/* eslint-disable prettier/prettier */
/**
 * SalesReturns — Process sales return referencing original bill
 * SOW §13: Returns reference original sale where possible
 */
import { useState } from 'react'
import { RotateCcw, Search, Plus, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'

const MOCK_RETURNS = [
  { _id: 'RET-201', billRef: 'BILL-4501', customer: 'Rahul Sharma', items: 1, amount: 12.50, reason: 'Wrong medicine', status: 'completed', date: '2026-08-22' },
  { _id: 'RET-200', billRef: 'BILL-4490', customer: 'Priya Patel', items: 2, amount: 25.00, reason: 'Expired', status: 'pending', date: '2026-08-21' },
]

const EMPTY_ITEM = { medicine: '', batch: '', qty: 1, salePrice: '' }

const SalesReturns = () => {
  const [tab, setTab]     = useState('list')
  const [billRef, setBill] = useState('')
  const [customer, setCust] = useState('')
  const [items, setItems] = useState([{ ...EMPTY_ITEM }])
  const [reason, setReason] = useState('')

  const addItem  = () => setItems((p) => [...p, { ...EMPTY_ITEM }])
  const delItem  = (i) => setItems((p) => p.filter((_, idx) => idx !== i))
  const setItem  = (i, f, v) => setItems((p) => p.map((it, idx) => idx === i ? { ...it, [f]: v } : it))

  const totalRefund = items.reduce((s, it) => s + (parseFloat(it.salePrice || 0) * parseInt(it.qty || 0)), 0)

  const handleSave = (e) => {
    e.preventDefault()
    toast.success('Return processed and stock adjusted')
    setTab('list')
  }

  const columns = [
    { title: 'Return No.', key: '_id', render: (v) => <span style={{ fontWeight: 700, color: '#d97706' }}>{v}</span> },
    { title: 'Bill Ref.',  key: 'billRef' },
    { title: 'Customer',   key: 'customer' },
    { title: 'Items',      key: 'items', align: 'center' },
    { title: 'Amount',     key: 'amount', render: (v) => `₹${v.toFixed(2)}` },
    { title: 'Reason',     key: 'reason' },
    { title: 'Date',       key: 'date' },
    { title: 'Status',     key: 'status', render: (v) => <StatusBadge status={v} /> },
  ]

  return (
    <div>
      <PageHeader icon={RotateCcw} title="Sales Returns" subtitle="Process customer returns and adjust stock" color="#d97706">
        <button onClick={() => setTab(tab === 'new' ? 'list' : 'new')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: tab === 'new' ? '#e5e7eb' : '#0c3b73', color: tab === 'new' ? '#374151' : '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          {tab === 'new' ? '← Back to List' : <><Plus size={14} /> New Return</>}
        </button>
      </PageHeader>

      {tab === 'list' ? (
        <DataTable columns={columns} data={MOCK_RETURNS} loading={false} total={MOCK_RETURNS.length} page={1} limit={20} />
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24, maxWidth: 680 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Process Sales Return</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={lbl}>Bill Reference</label>
                <input value={billRef} onChange={(e) => setBill(e.target.value)} placeholder="BILL-XXXX" style={inp} />
              </div>
              <div>
                <label style={lbl}>Customer Name</label>
                <input value={customer} onChange={(e) => setCust(e.target.value)} placeholder="Customer name" style={inp} />
              </div>
            </div>

            {/* Return items */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'auto', marginBottom: 14 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr style={{ background: '#f9fafb' }}>
                  {['Medicine', 'Batch', 'Qty', 'Sale Price (₹)', 'Refund', ''].map((h) => (
                    <th key={h} style={{ padding: '8px 10px', fontWeight: 600, color: '#374151', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '6px 8px' }}><input value={item.medicine} onChange={(e) => setItem(i, 'medicine', e.target.value)} placeholder="Medicine" style={cell} /></td>
                      <td style={{ padding: '6px 8px' }}><input value={item.batch} onChange={(e) => setItem(i, 'batch', e.target.value)} placeholder="Batch" style={{ ...cell, width: 80 }} /></td>
                      <td style={{ padding: '6px 8px' }}><input type="number" min={1} value={item.qty} onChange={(e) => setItem(i, 'qty', e.target.value)} style={{ ...cell, width: 55 }} /></td>
                      <td style={{ padding: '6px 8px' }}><input type="number" step="0.01" value={item.salePrice} onChange={(e) => setItem(i, 'salePrice', e.target.value)} placeholder="0.00" style={{ ...cell, width: 80 }} /></td>
                      <td style={{ padding: '6px 8px', fontWeight: 700 }}>₹{(parseFloat(item.salePrice || 0) * parseInt(item.qty || 0)).toFixed(2)}</td>
                      <td style={{ padding: '6px 8px' }}>
                        {items.length > 1 && <button type="button" onClick={() => delItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e11d48' }}><Trash2 size={13} /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <button type="button" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, border: '1px solid #d9780640', background: '#d9780610', color: '#d97706', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={13} /> Add Item
              </button>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Total Refund: ₹{totalRefund.toFixed(2)}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Return Reason</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for return…" rows={2}
                style={{ ...inp, height: 'auto', paddingTop: 9, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setTab('list')} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', borderRadius: 8, border: 'none', background: '#d97706', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                <Save size={14} /> Process Return
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

const lbl  = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }
const inp  = { width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 7, padding: '0 11px', fontSize: 13, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }
const cell = { width: '100%', height: 30, border: '1px solid #e5e7eb', borderRadius: 5, padding: '0 7px', fontSize: 12, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }

export default SalesReturns
