/* eslint-disable prettier/prettier */
/**
 * GRNInward — Real API integration
 */
import { useState, useEffect } from 'react'
import { Package, Plus, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { getRequest, postRequest } from '../../../Helpers'

const EMPTY_ITEM = { medicine: '', batchNo: '', expiry: '', qty: 1, freeQty: 0, ptr: '', rack: '' }

const GRNInward = () => {
  const [tab, setTab]             = useState('list')
  const [grns, setGrns]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [poRef, setPoRef]         = useState('')
  const [supplier, setSupplier]   = useState('')
  const [invoiceNo, setInvoice]   = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [items, setItems]         = useState([{ ...EMPTY_ITEM }])

  const fetchGRNs = async () => {
    setLoading(true)
    try {
      const res = await getRequest('/franchise/purchase/grn')
      setGrns(res.data?.data?.grns || [])
    } catch {
      toast.error('Failed to load GRNs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGRNs() }, [])

  const addItem  = () => setItems((p) => [...p, { ...EMPTY_ITEM }])
  const delItem  = (i) => setItems((p) => p.filter((_, idx) => idx !== i))
  const setItem  = (i, field, val) => setItems((p) => p.map((it, idx) => idx === i ? { ...it, [field]: val } : it))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!supplier) { toast.error('Supplier is required'); return }
    if (!items.some(it => it.medicine)) { toast.error('Add at least one medicine'); return }
    setSaving(true)
    try {
      await postRequest({ url: '/franchise/purchase/grn', cred: {
        supplier, poRef, invoiceNo, invoiceDate,
        items: items.map(it => ({
          medicineName: it.medicine,
          batchNo: it.batchNo,
          expiry: it.expiry,
          qty: Number(it.qty),
          freeQty: Number(it.freeQty),
          ptr: Number(it.ptr),
          rack: it.rack,
        })),
      }})
      toast.success('GRN created and stock updated')
      setTab('list')
      setPoRef(''); setSupplier(''); setInvoice(''); setInvoiceDate('')
      setItems([{ ...EMPTY_ITEM }])
      fetchGRNs()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create GRN')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { title: 'GRN No.',  key: 'grnNo',    render: (v) => <span style={{ fontWeight: 700, color: '#0c3b73' }}>{v}</span> },
    { title: 'PO Ref.',  key: 'poRef' },
    { title: 'Supplier', key: 'supplier' },
    { title: 'Items',    key: 'items', align: 'center' },
    { title: 'Date',     key: 'date' },
    { title: 'Status',   key: 'status', render: (v) => <StatusBadge status={v} /> },
  ]

  return (
    <div>
      <PageHeader icon={Package} title="GRN / Inward Entry" subtitle="Record goods received and update stock" color="#16a34a">
        <button onClick={() => setTab(tab === 'list' ? 'new' : 'list')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: tab === 'new' ? '#e5e7eb' : '#0c3b73', color: tab === 'new' ? '#374151' : '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          {tab === 'new' ? '← Back to List' : <><Plus size={14} /> New GRN</>}
        </button>
      </PageHeader>

      {tab === 'list' ? (
        <DataTable columns={columns} data={grns} loading={false} total={grns.length} page={1} limit={20} />
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 20px' }}>New Goods Receipt Note</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
              <Field label="PO Reference"     value={poRef}        onChange={(e) => setPoRef(e.target.value)}      placeholder="e.g. PO-2401" />
              <Field label="Supplier *"       value={supplier}     onChange={(e) => setSupplier(e.target.value)}   placeholder="Supplier name" />
              <Field label="Invoice Number"   value={invoiceNo}    onChange={(e) => setInvoice(e.target.value)}    placeholder="Invoice No." />
              <Field label="Invoice Date"     value={invoiceDate}  onChange={(e) => setInvoiceDate(e.target.value)} type="date" />
            </div>

            {/* Items */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Received Items</label>
                <button type="button" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, border: '1px solid #16a34a40', background: '#16a34a10', color: '#16a34a', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <Plus size={13} /> Add Item
                </button>
              </div>

              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 800 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Medicine', 'Batch No.', 'Expiry', 'Qty', 'Free Qty', 'PTR (₹)', 'Rack', ''].map((h) => (
                        <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '5px 8px' }}><input value={item.medicine} onChange={(e) => setItem(i, 'medicine', e.target.value)} placeholder="Medicine" style={cellInput} /></td>
                        <td style={{ padding: '5px 8px' }}><input value={item.batchNo} onChange={(e) => setItem(i, 'batchNo', e.target.value)} placeholder="Batch" style={cellInput} /></td>
                        <td style={{ padding: '5px 8px' }}><input type="month" value={item.expiry} onChange={(e) => setItem(i, 'expiry', e.target.value)} style={{ ...cellInput, width: 120 }} /></td>
                        <td style={{ padding: '5px 8px' }}><input type="number" min={1} value={item.qty} onChange={(e) => setItem(i, 'qty', e.target.value)} style={{ ...cellInput, width: 60 }} /></td>
                        <td style={{ padding: '5px 8px' }}><input type="number" min={0} value={item.freeQty} onChange={(e) => setItem(i, 'freeQty', e.target.value)} style={{ ...cellInput, width: 60 }} /></td>
                        <td style={{ padding: '5px 8px' }}><input type="number" step="0.01" value={item.ptr} onChange={(e) => setItem(i, 'ptr', e.target.value)} placeholder="0.00" style={{ ...cellInput, width: 80 }} /></td>
                        <td style={{ padding: '5px 8px' }}><input value={item.rack} onChange={(e) => setItem(i, 'rack', e.target.value)} placeholder="e.g. A01" style={{ ...cellInput, width: 70 }} /></td>
                        <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                          {items.length > 1 && (
                            <button type="button" onClick={() => delItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e11d48' }}><Trash2 size={13} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setTab('list')} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', borderRadius: 8, border: 'none', background: saving ? '#86efac' : '#16a34a', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              <Save size={14} /> {saving ? 'Saving…' : 'Create GRN & Update Stock'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

const Field = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: '100%', height: 38, border: '1px solid #e5e7eb', borderRadius: 7, padding: '0 11px', fontSize: 13, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }} />
  </div>
)

const cellInput = { width: '100%', height: 30, border: '1px solid #e5e7eb', borderRadius: 5, padding: '0 7px', fontSize: 12, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }

export default GRNInward
