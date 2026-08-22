/* eslint-disable prettier/prettier */
/**
 * PurchaseReturns — Return damaged/incorrect/expired stock to supplier
 */
import { useState } from 'react'
import { RotateCcw, Plus, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'

const MOCK = [
  { _id: 'PR-101', grnRef: 'GRN-1049', supplier: 'Medico Agencies', reason: 'Damaged', items: 2, status: 'pending', date: '2026-08-21' },
  { _id: 'PR-100', grnRef: 'GRN-1048', supplier: 'PharmaDist', reason: 'Near Expiry', items: 1, status: 'completed', date: '2026-08-18' },
]

const EMPTY_ITEM = { medicine: '', batchNo: '', qty: 1, reason: 'damaged' }

const PurchaseReturns = () => {
  const [tab, setTab]       = useState('list')
  const [supplier, setSupp] = useState('')
  const [grnRef, setGrn]    = useState('')
  const [items, setItems]   = useState([{ ...EMPTY_ITEM }])
  const [loading]           = useState(false)

  const addItem  = () => setItems((p) => [...p, { ...EMPTY_ITEM }])
  const delItem  = (i) => setItems((p) => p.filter((_, idx) => idx !== i))
  const setItem  = (i, f, v) => setItems((p) => p.map((it, idx) => idx === i ? { ...it, [f]: v } : it))

  const handleSave = (e) => {
    e.preventDefault()
    toast.success('Purchase return submitted')
    setTab('list')
  }

  const columns = [
    { title: 'Return No.', key: '_id', render: (v) => <span style={{ fontWeight: 700, color: '#d97706' }}>{v}</span> },
    { title: 'GRN Ref.', key: 'grnRef' },
    { title: 'Supplier', key: 'supplier' },
    { title: 'Reason', key: 'reason' },
    { title: 'Items', key: 'items', align: 'center' },
    { title: 'Date', key: 'date' },
    { title: 'Status', key: 'status', render: (v) => <StatusBadge status={v} /> },
  ]

  return (
    <div>
      <PageHeader icon={RotateCcw} title="Purchase Returns" subtitle="Return damaged, incorrect or expired stock to suppliers" color="#d97706">
        <button onClick={() => setTab(tab === 'list' ? 'new' : 'list')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: tab === 'new' ? '#e5e7eb' : '#0c3b73', color: tab === 'new' ? '#374151' : '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          {tab === 'new' ? '← Back to List' : <><Plus size={14} /> New Return</>}
        </button>
      </PageHeader>

      {tab === 'list' ? (
        <DataTable columns={columns} data={MOCK} loading={false} total={MOCK.length} page={1} limit={20} />
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 20px' }}>New Purchase Return</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={lbl}>Supplier *</label>
                <input value={supplier} onChange={(e) => setSupp(e.target.value)} placeholder="Supplier name" style={inp} />
              </div>
              <div>
                <label style={lbl}>GRN Reference</label>
                <input value={grnRef} onChange={(e) => setGrn(e.target.value)} placeholder="GRN No." style={inp} />
              </div>
            </div>

            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'auto', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Medicine', 'Batch No.', 'Qty', 'Reason', ''].map((h) => (
                      <th key={h} style={{ padding: '8px 10px', fontWeight: 600, color: '#374151', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '6px 8px' }}><input value={item.medicine} onChange={(e) => setItem(i, 'medicine', e.target.value)} placeholder="Medicine" style={cell} /></td>
                      <td style={{ padding: '6px 8px' }}><input value={item.batchNo} onChange={(e) => setItem(i, 'batchNo', e.target.value)} placeholder="Batch" style={{ ...cell, width: 100 }} /></td>
                      <td style={{ padding: '6px 8px' }}><input type="number" min={1} value={item.qty} onChange={(e) => setItem(i, 'qty', e.target.value)} style={{ ...cell, width: 60 }} /></td>
                      <td style={{ padding: '6px 8px' }}>
                        <select value={item.reason} onChange={(e) => setItem(i, 'reason', e.target.value)} style={{ ...cell, background: '#fff' }}>
                          <option value="damaged">Damaged</option>
                          <option value="expired">Expired</option>
                          <option value="near_expiry">Near Expiry</option>
                          <option value="incorrect">Incorrect</option>
                          <option value="other">Other</option>
                        </select>
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                        {items.length > 1 && <button type="button" onClick={() => delItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e11d48' }}><Trash2 size={13} /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, border: '1px solid #d9780640', background: '#d9780610', color: '#d97706', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}>
              <Plus size={13} /> Add Item
            </button>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setTab('list')} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', borderRadius: 8, border: 'none', background: '#d97706', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                <Save size={14} /> Submit Return
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

export default PurchaseReturns
