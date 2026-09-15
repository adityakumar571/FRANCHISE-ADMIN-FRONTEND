/* eslint-disable prettier/prettier */
/**
 * Screen 11 — Exchange Bill (API Integrated)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, ArrowLeft, Search, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { Th, Td, SBtn, TextInput, FieldLabel, SelectInput } from './posHelpers'
import { getRequest, postRequest } from '../../../Helpers'

export default function ExchangeBill() {
  const navigate    = useNavigate()
  const [invoice, setInvoice]     = useState('')
  const [date, setDate]           = useState('')
  const [exchType, setExchType]   = useState('Medicine')
  const [upgradeType, setUpgradeType] = useState('Upgrade')
  const [newSearch, setNewSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [returnItems, setReturnItems] = useState([])
  const [newItems, setNewItems]   = useState([])
  const [loadingInv, setLoadingInv] = useState(false)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [processing, setProcessing] = useState(false)

  const fetchInvoice = async () => {
    if (!invoice.trim()) return
    setLoadingInv(true)
    try {
      const res = await getRequest(`franchise/pos/sales/invoice-by-no/${encodeURIComponent(invoice.trim())}`)
      const inv = res?.data
      if (inv) {
        setDate(inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-IN') : '')
        setReturnItems((inv.items || []).map(it => ({
          medicineId: it.medicineId,
          name:  it.medicineName || it.name || '',
          batch: it.batchNo || it.batch || '',
          qty:   it.qty || 0,
          mrp:   it.mrp || 0,
          disc:  it.discountPct || 0,
          amount: it.amount || 0,
        })))
      }
    } catch {
      toast.error('Invoice not found')
      setReturnItems([])
    } finally {
      setLoadingInv(false)
    }
  }

  const searchMedicines = async () => {
    if (!newSearch.trim()) return
    setLoadingSearch(true)
    try {
      const res = await getRequest(`franchise/pos/medicines/search?q=${encodeURIComponent(newSearch.trim())}`)
      // API returns { medicines: [...] } inside data
      const list = res?.data?.medicines || res?.data || []
      setSearchResults(Array.isArray(list) ? list : [])
    } catch {
      toast.error('Search failed')
    } finally {
      setLoadingSearch(false)
    }
  }

  const addNewItem = (med) => {
    setNewItems(p => [...p, {
      medicineId: med.id || med._id,
      name: med.name,
      qty: 1,
      mrp: med.mrp || 0,
      amount: med.mrp || 0,
    }])
    setSearchResults([])
    setNewSearch('')
  }

  const returnTotal = returnItems.reduce((s,r) => s + r.qty * r.mrp, 0)
  const newTotal    = newItems.reduce((s,r) => s + r.qty * r.mrp, 0)
  const netPayable  = newTotal - returnTotal

  const processExchange = async () => {
    if (returnItems.length === 0 || newItems.length === 0) {
      toast.error('Add both return and new items')
      return
    }
    setProcessing(true)
    try {
      await postRequest('franchise/pos/sales/exchange', {
        originalInvoiceNo: invoice,
        exchangeType: exchType,
        upgradeType,
        returnItems: returnItems.map(it => ({
          medicineId:   it.medicineId,
          medicineName: it.name,
          batchNo:      it.batch,
          qty:          it.qty,
          mrp:          it.mrp,
          amount:       it.qty * it.mrp,
        })),
        newItems: newItems.map(it => ({
          medicineId:   it.medicineId,
          medicineName: it.name,
          qty:          it.qty,
          mrp:          it.mrp,
          amount:       it.qty * it.mrp,
        })),
        totalReturnAmt: returnTotal,
        totalNewAmt:    newTotal,
        paymentMode:    'Cash',
      })
      toast.success('Exchange processed successfully')
      navigate('/franchise/pos/billing')
    } catch {
      toast.error('Failed to process exchange')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={ArrowLeftRight} title="Exchange Bill" subtitle="Exchange medicines against a previous invoice" color="#0c3b73">
        <SBtn label="Back to Billing" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/billing')} />
      </PageHeader>

      {/* Invoice Info */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          <div>
            <FieldLabel>Original Invoice</FieldLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              <TextInput value={invoice} onChange={e => setInvoice(e.target.value)} onKeyDown={e => e.key==='Enter' && fetchInvoice()} placeholder="INV-XXXX" />
              <button onClick={fetchInvoice} disabled={loadingInv}
                style={{ padding: '9px 12px', background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {loadingInv ? '...' : 'Fetch'}
              </button>
            </div>
          </div>
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
                {returnItems.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>Fetch invoice to load items</td></tr>
                ) : returnItems.map((it, i) => (
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
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={newSearch} onChange={e => setNewSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchMedicines()}
                placeholder="Search medicine to exchange..."
                style={{ width: '100%', padding: '8px 10px 8px 28px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
            </div>
            {searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 14, right: 14, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: 200, overflowY: 'auto' }}>
                {searchResults.map((m, i) => (
                  <div key={i} onClick={() => addNewItem(m)}
                    style={{ padding: '9px 12px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}
                    onMouseEnter={e => e.currentTarget.style.background='#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background=''}>
                    <span style={{ fontWeight: 600 }}>{m.name}</span>
                    <span style={{ color: '#6b7280', marginLeft: 8, fontSize: 12 }}>₹{m.mrp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Medicine Name','Qty','MRP',''].map(h => <Th key={h} c={h} />)}</tr></thead>
              <tbody>
                {newItems.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>Search and add medicines</td></tr>
                ) : newItems.map((it, i) => (
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
        <SBtn label={processing ? 'Processing...' : 'Process Exchange [F5]'} icon={ArrowLeftRight}
          disabled={processing} onClick={processExchange} />
      </div>
    </div>
  )
}
