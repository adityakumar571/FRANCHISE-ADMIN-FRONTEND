/* eslint-disable prettier/prettier */
/**
 * StockAdjustments — Record stock corrections, damages, adjustments
 * SOW §11.3: Approval for sensitive stock adjustments
 */
import { useState } from 'react'
import { Activity, Plus, Trash2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'

const MOCK = [
  { _id: 'ADJ-301', date: '2026-08-22', medicine: 'Azithromycin 500mg', type: 'quarantine', qty: -60, reason: 'Expired stock quarantine', status: 'completed', by: 'Rahul Kumar' },
  { _id: 'ADJ-300', date: '2026-08-20', medicine: 'Paracetamol 650mg', type: 'damaged', qty: -10, reason: 'Packaging damage', status: 'pending', by: 'Amit Singh' },
  { _id: 'ADJ-299', date: '2026-08-18', medicine: 'Metformin 500mg', type: 'correction', qty: +5, reason: 'Physical count correction', status: 'completed', by: 'Priya Sharma' },
]

const EMPTY = { medicine: '', batch: '', type: 'damaged', qty: '', reason: '' }

const StockAdjustments = () => {
  const [tab, setTab] = useState('list')
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.medicine || !form.qty) { toast.error('Fill in required fields'); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Adjustment submitted for approval')
      setTab('list')
      setForm(EMPTY)
    }, 600)
  }

  const columns = [
    { title: 'Adj. No.', key: '_id', render: (v) => <span style={{ fontWeight: 700, color: '#7c3aed' }}>{v}</span> },
    { title: 'Medicine', key: 'medicine', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Type', key: 'type', render: (v) => <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{v}</span> },
    { title: 'Qty Change', key: 'qty', align: 'center', render: (v) => (
      <span style={{ fontWeight: 700, color: v < 0 ? '#e11d48' : '#16a34a' }}>{v > 0 ? `+${v}` : v}</span>
    )},
    { title: 'Reason', key: 'reason' },
    { title: 'Date', key: 'date' },
    { title: 'By', key: 'by' },
    { title: 'Status', key: 'status', render: (v) => <StatusBadge status={v} /> },
  ]

  return (
    <div>
      <PageHeader icon={Activity} title="Stock Adjustments" subtitle="Record damaged, expired or correction entries" color="#7c3aed">
        <button onClick={() => setTab(tab === 'new' ? 'list' : 'new')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: tab === 'new' ? '#e5e7eb' : '#0c3b73', color: tab === 'new' ? '#374151' : '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          {tab === 'new' ? '← Back to List' : <><Plus size={14} /> New Adjustment</>}
        </button>
      </PageHeader>

      {tab === 'list' ? (
        <DataTable columns={columns} data={MOCK} loading={false} total={MOCK.length} page={1} limit={20} />
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24, maxWidth: 600 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>New Stock Adjustment</h3>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#92400e' }}>
            ⚠️ Stock adjustments require approval. Submit the form and await manager confirmation.
          </div>
          <form onSubmit={handleSave}>
            {[
              { label: 'Medicine *', name: 'medicine', placeholder: 'Medicine name' },
              { label: 'Batch No.', name: 'batch', placeholder: 'Batch number' },
            ].map((f) => (
              <div key={f.name} style={{ marginBottom: 14 }}>
                <label style={lbl}>{f.label}</label>
                <input name={f.name} value={form[f.name]} onChange={onChange} placeholder={f.placeholder} style={inp} />
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Adjustment Type *</label>
                <select name="type" value={form.type} onChange={onChange} style={{ ...inp, background: '#fff' }}>
                  <option value="damaged">Damaged</option>
                  <option value="expired">Expired / Quarantine</option>
                  <option value="correction">Physical Count Correction</option>
                  <option value="transfer">Stock Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Quantity * (use - for reduction)</label>
                <input type="number" name="qty" value={form.qty} onChange={onChange} placeholder="e.g. -10 or +5" style={inp} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Reason / Remarks *</label>
              <textarea name="reason" value={form.reason} onChange={onChange} placeholder="Describe reason for adjustment" rows={3}
                style={{ ...inp, height: 'auto', paddingTop: 9, paddingBottom: 9, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setTab('list')} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', borderRadius: 8, border: 'none', background: loading ? '#a78bfa' : '#7c3aed', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                <Save size={14} /> {loading ? 'Submitting…' : 'Submit for Approval'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }
const inp = { width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 7, padding: '0 11px', fontSize: 13, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }

export default StockAdjustments
