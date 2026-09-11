/* eslint-disable prettier/prettier */
/**
 * POSBilling — All 12 POS Screens
 * 1.New Billing  2.Barcode Scan  3.Medicine Search  4.Customer Selection
 * 5.Prescription Billing  6.Payment  7.Split Payment  8.Hold Bill
 * 9.Print Invoice  10.Return Bill  11.Exchange Bill  12.Credit Sale
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  ScanLine, Search, Plus, Minus, Trash2, Printer, Save,
  User, IndianRupee, CreditCard, X, ChevronDown,
  UploadCloud, RefreshCw, ArrowLeftRight, FileText,
  Pause, RotateCcw, Download, Share2, Smartphone,
  Wallet, Banknote, ZapIcon, AlertCircle, CheckCircle,
} from 'lucide-react'
import { getRequest, postRequest, deleteRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

/* ══════════════════════════════════════════════════════
   FALLBACK MOCK DATA (used only when API returns empty)
══════════════════════════════════════════════════════ */
const FALLBACK_MEDICINES = [
  { id: 'm1', name: 'Crocin 650 Tablet',       salt: 'Paracetamol 650mg',  company: 'GSK',        mrp: 16.00, stock: 125, batch: 'CR08023', exp: '12/2026', pack: '15 Strips', gst: 5 },
  { id: 'm2', name: 'Amoxicillin 500mg',        salt: 'Amoxicillin 500mg',  company: 'Cipla',      mrp: 8.00,  stock: 200, batch: 'AM2401',  exp: '10/2026', pack: '10 Caps',   gst: 12 },
  { id: 'm3', name: 'Metformin 500mg',          salt: 'Metformin 500mg',    company: 'Sun Pharma', mrp: 4.50,  stock: 320, batch: 'MF2388',  exp: '02/2027', pack: '10 Tabs',   gst: 5 },
]

const FALLBACK_CUSTOMERS = [
  { id: 'CUS001', name: 'Rahul Sharma', phone: '9912345678', orders: 12, totalOrders: '₹1,45,650', due: '₹0', credit: 1258 },
  { id: 'CUS002', name: 'Priya Verma',  phone: '9823456789', orders: 8,  totalOrders: '₹2,80,000', due: '₹250', credit: 500 },
]

const RETURN_INVOICE_ITEMS = [
  { name: 'Crocin 650 Tablet', batch: 'CR08023', qty: 2, mrp: 15.00, retQty: 1, retAmt: 15.00 },
  { name: 'Paracip 500 Capsule', batch: 'PD09043', qty: 1, mrp: 20.00, retQty: 1, retAmt: 20.00 },
  { name: 'Dizle 650 Tablet', batch: 'DL06031', qty: 4, mrp: 12.00, retQty: 0, retAmt: 0 },
]

/* ══════════════════════════════════════════════════════
   SHARED MINI COMPONENTS
══════════════════════════════════════════════════════ */
const S = { fontFamily: 'Inter, sans-serif' }

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 10px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>
)

const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, ...style }}>{children}</div>
)

const SBtn = ({ label, color = '#0c3b73', bg, border, onClick, icon: Icon, full, sm, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
      padding: sm ? '6px 12px' : '10px 18px',
      width: full ? '100%' : 'auto',
      background: disabled ? '#e5e7eb' : (bg || color),
      color: bg ? color : '#fff',
      border: `1px solid ${border || (bg ? border || color + '44' : color)}`,
      borderRadius: 8, fontSize: sm ? 12 : 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
    }}>
    {Icon && <Icon size={sm ? 12 : 13} />}{label}
  </button>
)

const Row = ({ label, value, bold, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, borderBottom: '1px solid #f9fafb' }}>
    <span style={{ color: '#6b7280' }}>{label}</span>
    <span style={{ fontWeight: bold ? 700 : 600, color: color || '#111827' }}>{value}</span>
  </div>
)

const Input = ({ value, onChange, placeholder, style = {}, type = 'text', ref: r }) => (
  <input ref={r} type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box', width: '100%', ...style }}
    onFocus={e => e.target.style.borderColor = '#0c3b73'}
    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
  />
)

/* ══════════════════════════════════════════════════════
   BILL SUMMARY PANEL (shared right panel)
══════════════════════════════════════════════════════ */
function BillSummary({ cart, discount, setDiscount, onPay, onHold, onReturn, onExchange, onCredit }) {
  const subtotal   = cart.reduce((s, i) => s + i.mrp * i.qty, 0)
  const discAmt    = subtotal * (discount / 100)
  const taxable    = subtotal - discAmt
  const gst5       = cart.filter(i => i.gst === 5).reduce((s, i) => s + i.mrp * i.qty, 0) * 0.05
  const gst12      = cart.filter(i => i.gst === 12).reduce((s, i) => s + i.mrp * i.qty, 0) * 0.12
  const totalGst   = gst5 + gst12
  const total      = taxable + totalGst
  const items      = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <Card style={{ overflow: 'hidden', position: 'sticky', top: 10 }}>
      <div style={{ padding: '12px 16px', background: '#0c3b73', color: '#fff' }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Bill Summary</p>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Row label="Items"        value={items} />
        <Row label="Total Qty"    value={items} />
        <Row label="MRP Total"    value={`₹ ${subtotal.toFixed(2)}`} />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
          <span style={{ color: '#6b7280' }}>Discount %</span>
          <input type="number" value={discount} min={0} max={100} onChange={e => setDiscount(+e.target.value || 0)}
            style={{ width: 60, padding: '3px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, textAlign: 'center', outline: 'none' }} />
        </div>
        <Row label="Disc. Amount" value={`- ₹ ${discAmt.toFixed(2)}`} color="#dc2626" />
        <Row label="GST (5%)"     value={`₹ ${gst5.toFixed(2)}`} />
        <Row label="GST (12%)"    value={`₹ ${gst12.toFixed(2)}`} />
        <Row label="Round Off"    value="₹ 0.00" />
        <div style={{ borderTop: '2px solid #0c3b73', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Total Amount</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#0c3b73' }}>₹ {total.toFixed(2)}</span>
        </div>
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SBtn label="Proceed to Pay [F5]" icon={IndianRupee} full onClick={onPay} disabled={cart.length === 0} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <SBtn label="Hold Bill" icon={Pause}      bg="#fef3c7" color="#d97706" border="#fde68a" sm full onClick={onHold} />
          <SBtn label="Return"    icon={RotateCcw}  bg="#fee2e2" color="#dc2626" border="#fecdd3" sm full onClick={onReturn} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <SBtn label="Exchange"  icon={ArrowLeftRight} bg="#e0e7ff" color="#0c3b73" border="#c7d2fe" sm full onClick={onExchange} />
          <SBtn label="Credit"    icon={CreditCard}     bg="#dcfce7" color="#16a34a" border="#bbf7d0" sm full onClick={onCredit} />
        </div>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════
   CART TABLE
══════════════════════════════════════════════════════ */
function CartTable({ cart, onQty, onRemove }) {
  if (cart.length === 0) return (
    <div style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af' }}>
      <ScanLine size={40} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
      <p style={{ fontSize: 13, margin: 0 }}>Start adding medicines to create bill</p>
    </div>
  )
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{['Medicine Name','Batch','Qty','MRP','Disc%','Amount'].map(h => <Th key={h} c={h} />)}<Th c="" /></tr></thead>
        <tbody>
          {cart.map(item => {
            const itemId = item._id || item.id
            return (
            <tr key={itemId} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
              <Td>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 12 }}>{item.name}</p>
                <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>Exp: {item.exp} · {item.pack || item.packSize}</p>
              </Td>
              <Td style={{ fontFamily: 'monospace', fontSize: 11 }}>{item.batch}</Td>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button onClick={() => onQty(itemId, -1)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={9} /></button>
                  <span style={{ width: 24, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>{item.qty}</span>
                  <button onClick={() => onQty(itemId, +1)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={9} /></button>
                </div>
              </Td>
              <Td style={{ fontWeight: 600 }}>₹{Number(item.mrp || 0).toFixed(2)}</Td>
              <Td>
                <input type="number" defaultValue={0} min={0} max={100}
                  style={{ width: 46, padding: '3px 6px', border: '1px solid #e5e7eb', borderRadius: 5, fontSize: 12, textAlign: 'center', outline: 'none' }} />
              </Td>
              <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹{(Number(item.mrp || 0) * item.qty).toFixed(2)}</Td>
              <Td>
                <button onClick={() => onRemove(itemId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 2 }}><Trash2 size={13} /></button>
              </Td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   SCREEN 2 — BARCODE SCAN MODAL
══════════════════════════════════════════════════════ */
function BarcodeScanModal({ onClose, onAdd }) {
  const [barcodeVal, setBarcodeVal] = useState('')
  const [scanned, setScanned]       = useState(null)
  const [mode, setMode]             = useState('manual')
  const [searching, setSearching]   = useState(false)

  const handleScan = async () => {
    if (!barcodeVal.trim()) return
    setSearching(true)
    try {
      const res = await getRequest(`/franchise/pos/medicines/barcode/${encodeURIComponent(barcodeVal.trim())}`)
      const med = res.data?.data
      if (med) setScanned(med)
      else toast.error('Medicine not found for this barcode')
    } catch {
      // fallback to local mock
      const med = FALLBACK_MEDICINES.find(m => m.batch === barcodeVal || m.id === barcodeVal) || FALLBACK_MEDICINES[0]
      setScanned(med)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 560, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ScanLine size={18} color="#0c3b73" /></div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Barcode Scan</p>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Place the barcode under the scanner</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        </div>

        {/* Scanner area */}
        <div style={{ background: '#0c1a2e', borderRadius: 12, padding: 24, marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: '100%', maxWidth: 320, height: 120, border: '2px solid #16a34a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: '#0a1520' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              {Array.from({length: 28}, (_, i) => (
                <div key={i} style={{ width: i % 3 === 0 ? 3 : 1.5, height: 60 + (i % 5) * 12, background: '#fff', opacity: 0.85, borderRadius: 1 }} />
              ))}
            </div>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: '#ef4444', transform: 'translateY(-50%)', opacity: 0.7 }} />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', fontFamily: 'monospace', letterSpacing: 3 }}>890 1234 567890</p>
        </div>

        <Input value={barcodeVal} onChange={e => setBarcodeVal(e.target.value)} placeholder="Or type barcode / batch number..." style={{ marginBottom: 12 }} />

        {scanned && (
          <div style={{ padding: '12px 14px', background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 8, marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>{scanned.name}</p>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: '#6b7280' }}>Batch: {scanned.batch} · Exp: {scanned.exp} · Stock: {scanned.stock} Strips</p>
            <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 700, color: '#0c3b73' }}>MRP: ₹{scanned.mrp} &nbsp;·&nbsp; Stock: {scanned.stock}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
            {['manual', 'torch'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                style={{ flex: 1, padding: '8px', border: `1px solid ${mode===m?'#0c3b73':'#e5e7eb'}`, borderRadius: 7, background: mode===m?'#0c3b7310':'#fff', color: mode===m?'#0c3b73':'#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                {m === 'manual' ? <><FileText size={12} /> Manual Entry</> : <><ZapIcon size={12} /> Torch On</>}
              </button>
            ))}
          </div>
          {scanned
            ? <SBtn label="Add to Bill [+]" icon={Plus} onClick={() => { onAdd(scanned); onClose() }} />
            : <SBtn label={searching ? 'Scanning...' : 'Scan'} icon={ScanLine} onClick={handleScan} disabled={searching} />
          }
        </div>
      </Card>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   SCREEN 3 — MEDICINE SEARCH MODAL
══════════════════════════════════════════════════════ */
function MedicineSearchModal({ onClose, onAdd }) {
  const [q, setQ]          = useState('crocin')
  const [category, setCat] = useState('All Categories')
  const [company, setCom]  = useState('All Companies')
  const [type, setType]    = useState('All Types')
  const [selected, setSel] = useState(null)
  const [qty, setQty]      = useState(1)
  const [results, setResults] = useState(FALLBACK_MEDICINES)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef()

  const fetchMedicines = useCallback(async (query) => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/pos/medicines/search?q=${encodeURIComponent(query)}&limit=15`)
      const data = res.data?.data?.medicines || []
      setResults(data.length > 0 ? data : FALLBACK_MEDICINES.filter(m =>
        !query || m.name.toLowerCase().includes(query.toLowerCase())
      ))
    } catch {
      setResults(FALLBACK_MEDICINES.filter(m =>
        !query || m.name.toLowerCase().includes(query.toLowerCase())
      ))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchMedicines(q), 350)
  }, [q, fetchMedicines])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Medicine Search</p>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        </div>

        <div style={{ padding: 16, flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16, alignItems: 'start' }}>
          {/* Left - Search + Results */}
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
                <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search medicine..."
                  style={{ width: '100%', padding: '8px 10px 8px 28px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#f9fafb' }} />
              </div>
              {[['All Categories','setCat'], ['All Companies','setCom'], ['All Types','setType']].map(([ph]) => (
                <select key={ph} style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#f9fafb', cursor: 'pointer', color: '#374151' }}>
                  <option>{ph}</option>
                </select>
              ))}
              <button style={{ padding: '7px 12px', border: '1px solid #dc2626', borderRadius: 7, fontSize: 12, color: '#dc2626', background: '#fff1f2', cursor: 'pointer', fontWeight: 600 }}>Clear</button>
            </div>

            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>Medicine List ({results.length} Results)</p>

            {/* Results Table */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Medicine Name','Tablet / Strength','Company','MRP','Stock'].map(h => <Th key={h} c={h} />)}</tr></thead>
                <tbody>
                  {loading
                    ? Array(4).fill(0).map((_, i) => (
                      <tr key={i}>{Array(5).fill(0).map((_, j) => (
                        <td key={j} style={{ padding: '10px' }}>
                          <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} />
                        </td>
                      ))}</tr>
                    ))
                    : results.map(m => (
                    <tr key={m.id || m._id} onClick={() => setSel(m)}
                      style={{ cursor: 'pointer', background: selected?.id === m.id || selected?._id === m._id ? '#e0e7ff' : '' }}
                      onMouseEnter={e => { if (selected?.id !== m.id) e.currentTarget.style.background='#fafafa' }}
                      onMouseLeave={e => { if (selected?.id !== m.id) e.currentTarget.style.background='' }}>
                      <Td style={{ fontWeight: 600 }}>{m.name}</Td>
                      <Td style={{ color: '#6b7280', fontSize: 11 }}>{m.salt}</Td>
                      <Td>{m.company}</Td>
                      <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹ {Number(m.mrp || 0).toFixed(2)}</Td>
                      <Td style={{ color: (m.stock || m.currentStock || 0) < 30 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{m.stock || m.currentStock || 0}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right - Selected Item Detail */}
          {selected && (
            <div style={{ background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 10, padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>{selected.name}</p>
              {[['Batch', selected.batch], ['Exp', selected.exp], ['Stock', `${selected.stock} Strips`], ['MRP', `₹ ${selected.mrp}`]].map(([l,v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, borderBottom: '1px solid #e0e7ff' }}>
                  <span style={{ color: '#6b7280' }}>{l}</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', margin: '0 0 6px', textTransform: 'uppercase' }}>Quantity</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={11} /></button>
                  <span style={{ width: 30, textAlign: 'center', fontWeight: 700, fontSize: 15 }}>{qty}</span>
                  <button onClick={() => setQty(q => q+1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={11} /></button>
                </div>
                <SBtn label={`Add to Bill [F4]`} icon={Plus} full onClick={() => { onAdd({ ...selected, qty }); onClose() }} />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   SCREEN 4 — CUSTOMER SELECTION MODAL
══════════════════════════════════════════════════════ */
function CustomerSelectionModal({ onClose, onSelect }) {
  const [q, setQ]           = useState('')
  const [customers, setCustomers] = useState(FALLBACK_CUSTOMERS)
  const [loading, setLoading]     = useState(false)
  const debounceRef = useRef()

  const fetchCustomers = useCallback(async (query) => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/pos/customers/search?q=${encodeURIComponent(query)}&limit=20`)
      const data = res.data?.data?.customers || []
      setCustomers(data.length > 0 ? data : FALLBACK_CUSTOMERS.filter(c =>
        !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query)
      ))
    } catch {
      setCustomers(FALLBACK_CUSTOMERS.filter(c =>
        !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query)
      ))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCustomers('') }, [fetchCustomers])

  const handleSearch = (val) => {
    setQ(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchCustomers(val), 350)
  }

  const filtered = customers

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 680, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Customer Selection</p>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        </div>

        <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={q} onChange={e => handleSearch(e.target.value)} placeholder="Search customer by name / mobile / ID..."
                style={{ width: '100%', padding: '9px 10px 9px 28px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <SBtn label="+ Add New Customer" icon={Plus} sm />
          </div>

          {/* Recent Customers */}
          <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 10px' }}>Recent Customers</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 16 }}>
            {loading
              ? Array(4).fill(0).map((_, i) => (
                <div key={i} style={{ padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, height: 90 }} />
              ))
              : filtered.slice(0,4).map(c => (
              <div key={c._id || c.id} onClick={() => { onSelect(c); onClose() }}
                style={{ padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#0c3b73'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#e5e7eb'}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                  {c.name?.[0]?.toUpperCase()}
                </div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#111827' }}>{c.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 10, color: '#9ca3af' }}>{c.phone}</p>
                <p style={{ margin: '4px 0 0', fontSize: 10, color: '#6b7280' }}>{c.orders || 0} Orders · {c.totalOrders || c.totalPurchase || '₹0'}</p>
                <p style={{ margin: '2px 0 0', fontSize: 10, color: c.due !== '₹0' ? '#dc2626' : '#16a34a', fontWeight: 600 }}>Due: {c.due || '₹0'}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 8px' }}>All Customers</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <thead><tr>{['Name','Mobile','Total Orders','Total Purchase','Due Amount','Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c._id || c.id} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <Td style={{ fontWeight: 600 }}>{c.name}</Td>
                  <Td>{c.phone}</Td>
                  <Td>{c.orders || 0}</Td>
                  <Td style={{ fontWeight: 600, color: '#0c3b73' }}>{c.totalOrders || c.totalPurchase || '₹0'}</Td>
                  <Td style={{ fontWeight: 600, color: c.due !== '₹0' ? '#dc2626' : '#16a34a' }}>{c.due || '₹0'}</Td>
                  <Td>
                    <button onClick={() => { onSelect(c); onClose() }}
                      style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', border: 'none', borderRadius: 6, background: '#0c3b73', color: '#fff', cursor: 'pointer' }}>
                      Select
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   SCREEN 5 — PRESCRIPTION BILLING MODAL
══════════════════════════════════════════════════════ */
function PrescriptionModal({ onClose, onAdd }) {
  const detectedMeds = [
    { name: 'Azithral 500 Tablet',    mrp: 85.00, stock: 45, qty: 1 },
    { name: 'Paracip 500mg Tablet',   mrp: 20.00, stock: 120, qty: 2 },
    { name: 'Tab. IBS Tablet',        mrp: 15.00, stock: 188, qty: 2 },
    { name: 'Vitamin D3 60K Capsule', mrp: 10.00, stock: 129, qty: 1 },
    { name: 'LevoFlox 500 Capsule',   mrp: 18.00, stock: 125, qty: 1 },
    { name: 'Laprol 400mg Tablet',    mrp: 12.50, stock: 90,  qty: 1 },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: '#0c3b73', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>PharmaNexus</span> Prescription Billing
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <SBtn label="Upload Prescription" icon={UploadCloud} bg="#e0e7ff" color="#0c3b73" border="#c7d2fe" sm />
            <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
          </div>
        </div>

        <div style={{ padding: 16, flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '200px 1fr 200px', gap: 16 }}>
          {/* Prescription Preview */}
          <div style={{ background: '#f9fafb', border: '1px dashed #e5e7eb', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <div style={{ width: '100%', background: '#e5e7eb', borderRadius: 6, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={32} color="#9ca3af" />
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '8px 0 0', textAlign: 'center' }}>Prescription Image</p>
          </div>

          {/* Detected Medicines */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: 0 }}>Detected Medicines (6)</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <thead><tr>{['Medicine Name','MRP','Stock','Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
              <tbody>
                {detectedMeds.map((m, i) => (
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td style={{ fontWeight: 600 }}>{m.name}</Td>
                    <Td style={{ fontWeight: 700 }}>₹{m.mrp.toFixed(2)}</Td>
                    <Td style={{ color: m.stock < 30 ? '#dc2626' : '#374151' }}>{m.stock}</Td>
                    <Td>
                      <button style={{ background: '#fee2e2', border: 'none', borderRadius: 5, padding: '4px 6px', cursor: 'pointer' }}>
                        <Trash2 size={11} color="#dc2626" />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bill Summary */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 10px' }}>Bill Summary</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Row label="Items" value="6" />
              <Row label="MRP Total" value="₹ 327.50" />
              <Row label="Discount" value="-₹ 10.02" color="#dc2626" />
              <Row label="Taxable" value="₹ 311.00" />
              <Row label="GST (5%)" value="₹ 23.52" />
              <Row label="GST (12%)" value="₹ 6.18" />
              <Row label="Round Off" value="₹ 0.18" />
              <div style={{ borderTop: '2px solid #0c3b73', marginTop: 8, paddingTop: 8 }}>
                <Row label="Total Amount" value="₹ 346.32" bold color="#0c3b73" />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <SBtn label="Proceed to Pay [F5]" icon={IndianRupee} full
                onClick={() => { detectedMeds.forEach(m => onAdd(m)); onClose() }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   SCREEN 6 — PAYMENT MODAL
══════════════════════════════════════════════════════ */
function PaymentModal({ cart, total, customer, onClose, onConfirm }) {
  const [method, setMethod]   = useState('Cash')
  const [received, setReceived] = useState(total.toFixed(2))
  const [processing, setProcessing] = useState(false)
  const change = Math.max(0, parseFloat(received || 0) - total)

  const items    = cart.reduce((s, i) => s + i.qty, 0)
  const subtotal = cart.reduce((s, i) => s + i.mrp * i.qty, 0)
  const discount = 0
  const gst      = subtotal * 0.05
  const totalPayable = total

  const METHODS = [
    { key: 'Cash',   icon: Banknote,     color: '#16a34a', bg: '#dcfce7' },
    { key: 'UPI/QR', icon: Smartphone,   color: '#7c3aed', bg: '#f5f3ff' },
    { key: 'Card',   icon: CreditCard,   color: '#0891b2', bg: '#e0f2fe' },
    { key: 'Wallet', icon: Wallet,       color: '#d97706', bg: '#fef3c7' },
    { key: 'Credit', icon: FileText,     color: '#dc2626', bg: '#fee2e2' },
    { key: 'EMI',    icon: RefreshCw,    color: '#6b7280', bg: '#f3f4f6' },
  ]

  const handleConfirm = async () => {
    setProcessing(true)
    try {
      const paymentModeMap = { 'UPI/QR': 'UPI', 'EMI': 'Credit' }
      const payMode = paymentModeMap[method] || method
      await postRequest({
        url: '/franchise/pos/sales/invoice',
        cred: {
          customerId:   customer?._id || customer?.id,
          customerName: customer?.name || 'Walk-in Customer',
          customerPhone:customer?.phone,
          items: cart.map(i => ({
            medicineId:   i._id || i.id,
            medicineName: i.name,
            batchNo:      i.batch,
            qty:          i.qty,
            mrp:          i.mrp,
            discountPct:  0,
            gstPct:       i.gst || 5,
            amount:       i.mrp * i.qty,
          })),
          subtotal,
          discountAmt: discount,
          gstAmt:      gst,
          roundOff:    0,
          totalAmt:    totalPayable,
          paymentMode: payMode,
          paidAmt:     parseFloat(received || totalPayable),
          dueAmt:      method === 'Credit' ? totalPayable : 0,
        },
      })
      toast.success('Invoice created successfully!')
      onConfirm()
    } catch {
      // Still complete the sale locally on failure
      toast.error('Could not save to server. Proceeding locally.')
      onConfirm()
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 720, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Payment</p>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        </div>

        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, overflowY: 'auto' }}>
          {/* Left - Bill Details */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 10px', textTransform: 'uppercase' }}>Bill Details</p>
            <Card style={{ padding: '14px 16px', marginBottom: 14 }}>
              <Row label="Items"        value={`${items} Items`} />
              <Row label="Total Qty"    value={items} />
              <Row label="Subtotal"     value={`₹ ${subtotal.toFixed(2)}`} />
              <Row label="Discount"     value={`- ₹ ${discount.toFixed(2)}`} color="#dc2626" />
              <Row label="Taxable Amt"  value={`₹ ${(subtotal - discount).toFixed(2)}`} />
              <Row label="GST (5%)"     value={`₹ ${gst.toFixed(2)}`} />
              <Row label="Round Off"    value="₹ 0.00" />
              <div style={{ borderTop: '2px solid #0c3b73', marginTop: 8, paddingTop: 8 }}>
                <Row label="Total Payable" value={`₹ ${totalPayable.toFixed(2)}`} bold color="#0c3b73" />
              </div>
            </Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', margin: '0 0 5px', textTransform: 'uppercase' }}>Received Amount</p>
                <input type="number" value={received} onChange={e => setReceived(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '2px solid #0c3b73', borderRadius: 8, fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'right', boxSizing: 'border-box', color: '#0c3b73' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f9fafb', borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Change</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#16a34a' }}>₹ {change.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right - Payment Method */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 10px', textTransform: 'uppercase' }}>Select Payment Method</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {METHODS.map(m => (
                <button key={m.key} onClick={() => setMethod(m.key)}
                  style={{ padding: '12px 8px', border: `2px solid ${method === m.key ? m.color : '#e5e7eb'}`, borderRadius: 10, background: method === m.key ? m.bg : '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <m.icon size={18} color={m.color} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: method === m.key ? m.color : '#374151' }}>{m.key}</span>
                </button>
              ))}
            </div>
            <SBtn label={processing ? 'Processing...' : `Confirm Payment [F6]`} icon={CheckCircle} full onClick={handleConfirm} disabled={processing} />
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   SCREEN 7 — SPLIT PAYMENT MODAL
══════════════════════════════════════════════════════ */
function SplitPaymentModal({ total, onClose, onConfirm }) {
  const [cash, setCash]   = useState(500.00)
  const [upi, setUpi]     = useState(0)
  const [card, setCard]   = useState(0)
  const totalPaid = cash + upi + card

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 540 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Split Payment</p>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        </div>

        <div style={{ padding: 20 }}>
          {/* Bill Amount */}
          <div style={{ background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 10, padding: '14px 18px', marginBottom: 20, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', textTransform: 'uppercase' }}>Bill Amount</p>
            <p style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 800, color: '#0c3b73' }}>₹ {total.toFixed(2)}</p>
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Split Payment</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Cash',  value: cash, set: setCash,  color: '#16a34a', bg: '#dcfce7', icon: Banknote },
              { label: 'UPI',   value: upi,  set: setUpi,   color: '#7c3aed', bg: '#f5f3ff', icon: Smartphone },
              { label: 'Card',  value: card, set: setCard,  color: '#0891b2', bg: '#e0f2fe', icon: CreditCard },
            ].map(p => (
              <div key={p.label} style={{ padding: '12px', background: p.bg, borderRadius: 10, border: `1px solid ${p.color}33` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <p.icon size={14} color={p.color} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.label}</span>
                </div>
                <input type="number" value={p.value} onChange={e => p.set(parseFloat(e.target.value)||0)} min={0}
                  style={{ width: '100%', padding: '7px 8px', border: `1px solid ${p.color}44`, borderRadius: 7, fontSize: 14, fontWeight: 700, outline: 'none', background: '#fff', textAlign: 'right', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 8px' }}>Payment Summary</p>
            {[['Cash', `₹ ${cash.toFixed(2)}`], ['UPI', `₹ ${upi.toFixed(2)}`], ['Card', `₹ ${card.toFixed(2)}`]].map(([l,v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                <span style={{ color: '#6b7280' }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ fontWeight: 700 }}>Total Paid</span>
              <span style={{ fontWeight: 800, color: totalPaid >= total ? '#16a34a' : '#dc2626' }}>₹ {totalPaid.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 14, fontWeight: 700, color: '#0c3b73' }}>
            <span>Total Paid</span>
            <span>₹ {totalPaid.toFixed(2)}</span>
          </div>
          <SBtn label="Confirm Payment [F5]" icon={CheckCircle} full onClick={onConfirm} disabled={totalPaid < total} />
        </div>
      </Card>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   SCREEN 8 — HOLD BILL MODAL
══════════════════════════════════════════════════════ */
function HoldBillModal({ cart, onClose, onHold }) {
  const [customer, setCustomer]   = useState('Walk-In Customer')
  const [note, setNote]           = useState('')
  const [holdBills, setHoldBills] = useState([])
  const [loadingBills, setLoadingBills] = useState(true)
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    (async () => {
      setLoadingBills(true)
      try {
        const res = await getRequest('/franchise/pos/hold-bills')
        setHoldBills(res.data?.data || [])
      } catch {
        setHoldBills([])
      } finally {
        setLoadingBills(false)
      }
    })()
  }, [])

  const handleHoldBill = async () => {
    setSaving(true)
    try {
      const subtotal = cart.reduce((s, i) => s + i.mrp * i.qty, 0)
      await postRequest({
        url: '/franchise/pos/hold-bills',
        cred: {
          customerName: customer || 'Walk-In Customer',
          items: cart.map(i => ({ medicineName: i.name, qty: i.qty, mrp: i.mrp, amount: i.mrp * i.qty })),
          subtotal,
          totalAmt: subtotal,
          note,
        },
      })
      toast.success('Bill held successfully')
      onHold({ customer, note })
      onClose()
    } catch {
      toast.error('Failed to hold bill')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteHold = async (id) => {
    try {
      await deleteRequest(`/franchise/pos/hold-bills/${id}`)
      setHoldBills(p => p.filter(b => b.id !== id && b._id !== id))
    } catch {
      toast.error('Failed to delete hold bill')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 860, display: 'flex', gap: 0, overflow: 'hidden', flexDirection: 'row', maxHeight: '88vh' }}>

        {/* Left — Hold Form */}
        <div style={{ flex: 1, padding: 20, borderRight: '1px solid #f3f4f6', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}><Pause size={16} color="#d97706" /> Hold Bill</p>
            <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
          </div>

          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>Customer</p>
            <Input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Customer name" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>Note (Optional)</p>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Note about this bill..."
              rows={2} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
          </div>
          <SBtn label={saving ? 'Holding...' : 'Hold Bill [F3]'} icon={Pause} full bg="#fef3c7" color="#d97706" border="#fde68a"
            disabled={saving}
            onClick={handleHoldBill} />
        </div>

        {/* Right — Today's Hold Bills */}
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          <p style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>Hold Bills (Today)</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <thead><tr>{['Bill Name','Items','Amount','Time','Action'].map(h => <Th key={h} c={h} />)}</tr></thead>
            <tbody>
              {loadingBills
                ? Array(3).fill(0).map((_, i) => (
                  <tr key={i}>{Array(5).fill(0).map((_, j) => (
                    <td key={j} style={{ padding: '10px' }}>
                      <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4 }} />
                    </td>
                  ))}</tr>
                ))
                : holdBills.length === 0
                  ? <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>No hold bills today</td></tr>
                  : holdBills.map(b => (
                  <tr key={b._id || b.id} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 12 }}>{b.name}</p>
                      <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{b.note}</p>
                    </Td>
                    <Td>{b.items}</Td>
                    <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹ {Number(b.amount || 0).toFixed(2)}</Td>
                    <Td style={{ color: '#6b7280', fontSize: 11 }}>{b.time}</Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button style={{ fontSize: 10, fontWeight: 600, padding: '4px 8px', border: 'none', borderRadius: 5, background: '#e0e7ff', color: '#0c3b73', cursor: 'pointer' }}>Resume</button>
                        <button onClick={() => handleDeleteHold(b._id || b.id)} style={{ padding: '4px 6px', border: 'none', borderRadius: 5, background: '#fee2e2', cursor: 'pointer' }}><Trash2 size={10} color="#dc2626" /></button>
                      </div>
                    </Td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <button style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer' }}>View All Hold Bills →</button>
        </div>
      </Card>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   SCREEN 9 — PRINT INVOICE MODAL
══════════════════════════════════════════════════════ */
function PrintInvoiceModal({ cart, customer, total, onClose }) {
  const [printer, setPrinter]   = useState('PDF / A4 Printer')
  const [paperSize, setPaper]   = useState('A4')
  const [fontSize, setFontSize] = useState('10')
  const [copies, setCopies]     = useState(1)

  const invNo   = 'INV-2025-07534'
  const invDate = '30-05-2025'
  const subtotal = cart.reduce((s, i) => s + i.mrp * i.qty, 0)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 820, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}><Printer size={15} color="#0c3b73" /> Print Invoice</p>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', flex: 1, overflow: 'hidden' }}>
          {/* Invoice Preview */}
          <div style={{ padding: 20, overflowY: 'auto', borderRight: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase' }}>Invoice Preview</p>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
              {/* Store Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #e5e7eb' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0c3b73' }}>Araya Medical Store</p>
                  <p style={{ margin: 0, fontSize: 10, color: '#6b7280' }}>Shop No. 12A, Main Market, Lucknow</p>
                  <p style={{ margin: 0, fontSize: 10, color: '#6b7280' }}>GST: 09AAAPA1234K1ZM · DL: UP-LKO-001</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: '#374151' }}>{invNo}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 10, color: '#6b7280' }}>{invDate}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 10, color: '#6b7280' }}>Qty in Quantities</p>
                </div>
              </div>

              {/* Items */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr>{['# Medicine Name','Batch','Qty','MRP','Disc%','Amount'].map(h => <Th key={h} c={h} />)}</tr>
                </thead>
                <tbody>
                  {(cart.length > 0 ? cart : MEDICINES.slice(0,3)).map((item, i) => (
                    <tr key={i}>
                      <Td style={{ fontSize: 11 }}>{item.name}</Td>
                      <Td style={{ fontSize: 10, fontFamily: 'monospace' }}>{item.batch}</Td>
                      <Td style={{ fontSize: 11 }}>{item.qty || 1}</Td>
                      <Td style={{ fontSize: 11 }}>₹{item.mrp.toFixed(2)}</Td>
                      <Td style={{ fontSize: 11 }}>0%</Td>
                      <Td style={{ fontSize: 11, fontWeight: 600 }}>₹{(item.mrp * (item.qty || 1)).toFixed(2)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span>Total Print</span>
                  <span>₹ {subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                  <span>Total</span>
                  <span style={{ color: '#0c3b73' }}>₹ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Print Options */}
          <div style={{ padding: 16, overflowY: 'auto' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 14px', textTransform: 'uppercase' }}>Print Options</p>

            {[
              { label: 'Printer', value: printer, opts: ['PDF / A4 Printer', 'Thermal 80mm', 'Thermal 58mm'], set: setPrinter },
              { label: 'Paper Size', value: paperSize, opts: ['A4', 'A5', 'Thermal 80mm', 'Thermal 58mm'], set: setPaper },
              { label: 'Font Size', value: fontSize, opts: ['8', '9', '10', '11', '12'], set: setFontSize },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>{f.label}</p>
                <select value={f.value} onChange={e => f.set(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', background: '#f9fafb' }}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>Copies</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setCopies(c => Math.max(1,c-1))} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={11} /></button>
                <span style={{ fontSize: 16, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{copies}</span>
                <button onClick={() => setCopies(c => c+1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={11} /></button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SBtn label="Print Invoice" icon={Printer} full onClick={onClose} />
              <SBtn label="Download PDF"  icon={Download} full bg="#f0fdf4" color="#16a34a" border="#bbf7d0" />
              <SBtn label="Share Invoice" icon={Share2}   full bg="#f0f9ff" color="#0891b2" border="#bae6fd" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   SCREEN 10 — RETURN BILL MODAL
══════════════════════════════════════════════════════ */
function ReturnBillModal({ onClose }) {
  const [invoice, setInvoice]     = useState('INV-2025-07524')
  const [customer, setCustomer]   = useState('Walk-In Customer')
  const [invoiceDate, setInvDate] = useState('30-05-2025')
  const [processing, setProcessing] = useState(false)

  const totalReturn = RETURN_INVOICE_ITEMS.reduce((s, i) => s + i.retAmt, 0)

  const handleReturn = async () => {
    setProcessing(true)
    try {
      const returnItems = RETURN_INVOICE_ITEMS.filter(i => i.retQty > 0)
      await postRequest({
        url: '/franchise/pos/sales/returns',
        cred: {
          originalInvoiceNo: invoice,
          items:             returnItems,
          totalReturnAmt:    totalReturn,
          reason:            'Customer return',
        },
      })
      toast.success('Return processed successfully!')
      onClose()
    } catch {
      toast.error('Return processing failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 820, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}><RotateCcw size={15} color="#dc2626" /> Return Bill</p>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', flex: 1, overflow: 'hidden' }}>
          {/* Left - Return Items */}
          <div style={{ padding: 20, overflowY: 'auto', borderRight: '1px solid #f3f4f6' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Original Invoice', value: invoice, set: setInvoice, type: 'text' },
                { label: 'Customer',         value: customer, set: setCustomer, type: 'text' },
                { label: 'Invoice Date',     value: invoiceDate, set: setInvDate, type: 'text' },
              ].map(f => (
                <div key={f.label}>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>{f.label}</p>
                  <Input value={f.value} onChange={e => f.set(e.target.value)} />
                </div>
              ))}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <thead><tr>{['','Medicine Name','Batch','Qty','MRP','Return Qty','Return Amt'].map(h => <Th key={h} c={h} />)}</tr></thead>
              <tbody>
                {RETURN_INVOICE_ITEMS.map((item, i) => (
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td>
                      <input type="checkbox" defaultChecked={item.retQty > 0}
                        style={{ width: 14, height: 14, cursor: 'pointer', accentColor: '#0c3b73' }} />
                    </Td>
                    <Td style={{ fontWeight: 600 }}>{item.name}</Td>
                    <Td style={{ fontFamily: 'monospace', fontSize: 11 }}>{item.batch}</Td>
                    <Td>{item.qty}</Td>
                    <Td>₹{item.mrp.toFixed(2)}</Td>
                    <Td>
                      <input type="number" defaultValue={item.retQty} min={0} max={item.qty}
                        style={{ width: 50, padding: '4px 6px', border: '1px solid #e5e7eb', borderRadius: 5, fontSize: 12, textAlign: 'center', outline: 'none' }} />
                    </Td>
                    <Td style={{ fontWeight: 700, color: '#dc2626' }}>₹{item.retAmt.toFixed(2)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right - Return Summary */}
          <div style={{ padding: 16, background: '#f9fafb' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase' }}>Return Summary</p>
            <Row label="Total Items" value={RETURN_INVOICE_ITEMS.filter(i=>i.retQty>0).length} />
            <Row label="Return Qty"  value={RETURN_INVOICE_ITEMS.reduce((s,i)=>s+i.retQty,0)} />
            <div style={{ borderTop: '2px solid #dc2626', marginTop: 10, paddingTop: 10 }}>
              <Row label="Refund Amount" value={`₹ ${totalReturn.toFixed(2)}`} bold color="#dc2626" />
            </div>
            <div style={{ marginTop: 16 }}>
              <SBtn label={processing ? 'Processing...' : 'Process Return [F5]'} icon={RotateCcw} full bg="#fee2e2" color="#dc2626" border="#fecdd3"
                disabled={processing}
                onClick={handleReturn} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   SCREEN 11 — EXCHANGE BILL MODAL
══════════════════════════════════════════════════════ */
function ExchangeBillModal({ onClose }) {
  const [invoice, setInvoice] = useState('INV-2025-07624')
  const [date, setDate]       = useState('30-06-2025')
  const [exchType]            = useState('Medicine')
  const [upgrade]             = useState('Upgrade')
  const [processing, setProcessing] = useState(false)

  const returnItems = [{ name: 'Crocin 650 Tablet', batch: 'CR08023', qty: 10.00, mrp: 15.00, disc: 0 }]
  const newItems    = [{ name: 'Grace Advance Tablet', qty: 10.00, mrp: 10.00 }]

  const handleExchange = async () => {
    setProcessing(true)
    try {
      const totalReturnAmt = returnItems.reduce((s, i) => s + i.qty * i.mrp, 0)
      const totalNewAmt    = newItems.reduce((s, i) => s + i.qty * i.mrp, 0)
      await postRequest({
        url: '/franchise/pos/sales/exchange',
        cred: {
          returnItems:        returnItems,
          newItems:           newItems,
          totalReturnAmt,
          totalNewAmt,
          paymentMode:        'Cash',
          originalInvoiceNo:  invoice,
        },
      })
      toast.success('Exchange processed successfully!')
      onClose()
    } catch {
      toast.error('Exchange processing failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 860, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}><ArrowLeftRight size={15} color="#0c3b73" /> Exchange Bill</p>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        </div>

        <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
          {/* Top Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>Original Invoice</p>
              <Input value={invoice} onChange={e => setInvoice(e.target.value)} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>Invoice Date</p>
              <Input value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>Exchange Type</p>
              <select style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', background: '#f9fafb' }}>
                <option>Medicine</option><option>Product</option>
              </select>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>Type</p>
              <select style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', background: '#f9fafb' }}>
                <option>Upgrade</option><option>Downgrade</option><option>Same</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Return Items */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', margin: '0 0 8px' }}>Return Items</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                <thead><tr>{['Medicine Name','Batch','Qty','MRP','Disc%'].map(h => <Th key={h} c={h} />)}</tr></thead>
                <tbody>
                  {returnItems.map((it, i) => (
                    <tr key={i}><Td style={{fontWeight:600}}>{it.name}</Td><Td style={{fontFamily:'monospace',fontSize:11}}>{it.batch}</Td><Td>{it.qty}</Td><Td>₹{it.mrp}</Td><Td>{it.disc}%</Td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* New Items */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', margin: '0 0 8px' }}>New Items</p>
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input placeholder="Search medicine to exchange..." style={{ width: '100%', padding: '8px 10px 8px 28px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none', boxSizing: 'border-box', background: '#f9fafb' }} />
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                <thead><tr>{['Medicine Name','Qty','MRP'].map(h => <Th key={h} c={h} />)}</tr></thead>
                <tbody>
                  {newItems.map((it, i) => (
                    <tr key={i}><Td style={{fontWeight:600}}>{it.name}</Td><Td>{it.qty}</Td><Td>₹{it.mrp}</Td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb', borderRadius: 10, padding: '12px 16px' }}>
            <div>
              <span style={{ fontSize: 13, color: '#6b7280', marginRight: 16 }}>Net Payable</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#0c3b73' }}>₹ 3.00</span>
            </div>
            <SBtn label={processing ? 'Processing...' : 'Process Exchange [F5]'} icon={ArrowLeftRight} disabled={processing} onClick={handleExchange} />
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   SCREEN 12 — CREDIT SALE MODAL
══════════════════════════════════════════════════════ */
function CreditSaleModal({ cart, total, customer: selectedCustomer, onClose }) {
  const [customer, setCustomer] = useState(selectedCustomer?.name || 'Rahul Sharma')
  const [dueDate, setDueDate]   = useState('')
  const [note, setNote]         = useState('Customer will pay in next week')
  const [processing, setProcessing] = useState(false)

  const availableCredit = selectedCustomer?.credit || 1258.00
  const subtotal        = cart.reduce((s, i) => s + i.mrp * i.qty, 0) || 560.00
  const discount        = 0
  const creditLimit     = 1710.00
  const remaining       = creditLimit - subtotal

  const handleCreditSale = async () => {
    setProcessing(true)
    try {
      await postRequest({
        url: '/franchise/pos/sales/credit-sale',
        cred: {
          customerId:   selectedCustomer?._id || selectedCustomer?.id,
          customerName: customer,
          items: cart.map(i => ({
            medicineId:   i._id || i.id,
            medicineName: i.name,
            qty:          i.qty,
            mrp:          i.mrp,
            amount:       i.mrp * i.qty,
          })),
          totalAmt:   subtotal,
          creditAmt:  subtotal,
          notes:      note,
        },
      })
      toast.success('Credit sale saved!')
      onClose()
    } catch {
      toast.error('Credit sale failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 720, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}><CreditCard size={15} color="#16a34a" /> Credit Sale</p>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        </div>

        <div style={{ padding: 20, flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20 }}>
          {/* Left */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>{customer}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>CUS001 · 9912345678</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>Available Credit</p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#16a34a' }}>₹ {availableCredit.toFixed(2)}</p>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>Customer</p>
              <Input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Select customer..." />
            </div>

            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 8px' }}>Credit Details</p>
              <Row label="Due Date"     value={dueDate || 'N/A'} />
              <Row label="Credit Limit" value={`₹ ${creditLimit.toFixed(2)}`} />
              <Row label="Remaining"    value={`₹ ${remaining.toFixed(2)}`} color={remaining < 0 ? '#dc2626' : '#16a34a'} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>Due Date</p>
              <Input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#374151', margin: '0 0 5px' }}>Note</p>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Right - Bill Summary */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 10px', textTransform: 'uppercase' }}>Bill Summary</p>
            <Card style={{ padding: '12px 14px', marginBottom: 12 }}>
              <Row label="Total Amount"   value={`₹ ${subtotal.toFixed(2)}`} />
              <Row label="Previous Due"   value="₹ 0.00" />
              <Row label="Discount"       value="₹ 0.00" color="#dc2626" />
              <Row label="Credit Limit"   value={`₹ ${creditLimit.toFixed(2)}`} />
              <div style={{ borderTop: '2px solid #16a34a', marginTop: 8, paddingTop: 8 }}>
                <Row label="Remaining Credit" value={`₹ ${remaining.toFixed(2)}`} bold color={remaining < 0 ? '#dc2626' : '#16a34a'} />
              </div>
            </Card>

            {remaining < 0 && (
              <div style={{ padding: '10px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, marginBottom: 12, display: 'flex', gap: 7, alignItems: 'center' }}>
                <AlertCircle size={13} color="#dc2626" />
                <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>Credit limit exceeded</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SBtn label={processing ? 'Saving...' : 'Save as Credit Sale [F5]'} icon={Save} full bg="#dcfce7" color="#16a34a" border="#bbf7d0" disabled={processing} onClick={handleCreditSale} />
              <SBtn label="Send SMS / WhatsApp"     icon={Smartphone} full bg="#e0f2fe" color="#0891b2" border="#bae6fd" sm />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN POS BILLING COMPONENT
══════════════════════════════════════════════════════ */
export default function POSBilling() {
  const [cart, setCart]       = useState([])
  const [customer, setCust]   = useState(null)
  const [discount, setDisc]   = useState(0)
  const [search, setSearch]   = useState('')
  const [suggest, setSuggest] = useState([])
  const searchRef             = useRef()

  // Modal states
  const [modal, setModal] = useState(null)
  // null | 'barcode' | 'search' | 'customer' | 'prescription' | 'payment' | 'split' | 'hold' | 'print' | 'return' | 'exchange' | 'credit'

  const subtotal = cart.reduce((s, i) => s + i.mrp * i.qty, 0)
  const total    = subtotal * (1 - discount / 100) * 1.05

  const debounceSearch = useRef()

  const handleSearchInput = val => {
    setSearch(val)
    if (val.length < 2) { setSuggest([]); return }
    clearTimeout(debounceSearch.current)
    debounceSearch.current = setTimeout(async () => {
      try {
        const res = await getRequest(`/franchise/pos/medicines/search?q=${encodeURIComponent(val)}&limit=6`)
        const data = res.data?.data?.medicines || []
        setSuggest(data.length > 0 ? data : FALLBACK_MEDICINES.filter(m => m.name.toLowerCase().includes(val.toLowerCase())).slice(0, 6))
      } catch {
        setSuggest(FALLBACK_MEDICINES.filter(m => m.name.toLowerCase().includes(val.toLowerCase())).slice(0, 6))
      }
    }, 300)
  }

  const addToCart = med => {
    const medId = med._id || med.id
    setCart(p => {
      const ex = p.find(i => (i._id || i.id) === medId)
      if (ex) return p.map(i => (i._id || i.id) === medId ? { ...i, qty: i.qty + (med.qty || 1) } : i)
      return [...p, { ...med, id: medId, qty: med.qty || 1 }]
    })
    setSearch(''); setSuggest([])
    searchRef.current?.focus()
  }

  const updateQty = (id, delta) => setCart(p =>
    p.map(i => (i._id || i.id) === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
  )
  const removeItem = id => setCart(p => p.filter(i => (i._id || i.id) !== id))

  const close = () => setModal(null)

  return (
    <div style={{ ...S, display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>

      {/* ── Modals ── */}
      {modal === 'barcode'      && <BarcodeScanModal       onClose={close} onAdd={addToCart} />}
      {modal === 'search'       && <MedicineSearchModal    onClose={close} onAdd={addToCart} />}
      {modal === 'customer'     && <CustomerSelectionModal onClose={close} onSelect={setCust} />}
      {modal === 'prescription' && <PrescriptionModal      onClose={close} onAdd={addToCart} />}
      {modal === 'payment'      && <PaymentModal cart={cart} total={total} customer={customer} onClose={close} onConfirm={() => { setCart([]); setCust(null); close() }} />}
      {modal === 'split'        && <SplitPaymentModal total={total} onClose={close} onConfirm={() => { setCart([]); close() }} />}
      {modal === 'hold'         && <HoldBillModal cart={cart} onClose={close} onHold={() => { setCart([]); setCust(null) }} />}
      {modal === 'print'        && <PrintInvoiceModal cart={cart} customer={customer} total={total} onClose={close} />}
      {modal === 'return'       && <ReturnBillModal onClose={close} />}
      {modal === 'exchange'     && <ExchangeBillModal onClose={close} />}
      {modal === 'credit'       && <CreditSaleModal cart={cart} total={total} customer={customer} onClose={close} />}

      {/* ── TOP ACTION BAR ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', marginBottom: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ScanLine size={17} color="#0c3b73" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>New Billing</p>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>
              {customer ? `👤 ${customer.name}` : 'Walk-In Customer'}
            </p>
          </div>
        </div>
        <SBtn label="Scan Barcode [F2]"    icon={ScanLine}     bg="#e0e7ff" color="#0c3b73" border="#c7d2fe" sm onClick={() => setModal('barcode')} />
        <SBtn label="Search Medicine [F3]" icon={Search}       bg="#dcfce7" color="#16a34a" border="#bbf7d0" sm onClick={() => setModal('search')} />
        <SBtn label="Prescription [F4]"    icon={UploadCloud}  bg="#fef3c7" color="#d97706" border="#fde68a" sm onClick={() => setModal('prescription')} />
        <SBtn label="Return Bill"          icon={RotateCcw}    bg="#fee2e2" color="#dc2626" border="#fecdd3" sm onClick={() => setModal('return')} />
        <SBtn label="Exchange"             icon={ArrowLeftRight} bg="#f5f3ff" color="#7c3aed" border="#e9d5ff" sm onClick={() => setModal('exchange')} />
        <SBtn label="Hold Bills"           icon={Pause}        bg="#f9fafb" color="#6b7280" border="#e5e7eb" sm onClick={() => setModal('hold')} />
      </div>

      {/* ── MAIN GRID: Left (cart) + Right (summary) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14, alignItems: 'start' }}>

        {/* LEFT — Customer + Search + Cart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Customer + Search row */}
          <Card style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <button onClick={() => setModal('customer')}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb', cursor: 'pointer', fontSize: 12, color: '#374151', fontWeight: 600, flex: 1 }}>
                <User size={13} color="#9ca3af" />
                {customer ? customer.name : 'Walk-In Customer'}
                <ChevronDown size={12} color="#9ca3af" style={{ marginLeft: 'auto' }} />
              </button>
              <SBtn label="+ Add Customer" icon={Plus} bg="#e0e7ff" color="#0c3b73" border="#c7d2fe" sm onClick={() => setModal('customer')} />
            </div>

            {/* Medicine Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
              <input ref={searchRef} value={search} onChange={e => handleSearchInput(e.target.value)}
                placeholder="Search medicine name / batch / barcode..."
                style={{ width: '100%', padding: '10px 12px 10px 32px', border: '2px solid #0c3b73', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                autoFocus />
              {suggest.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, marginTop: 4, overflow: 'hidden' }}>
                  {suggest.map(m => (
                    <div key={m._id || m.id} onClick={() => addToCart(m)}
                      style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{m.name}</p>
                        <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>Batch: {m.batch} · Exp: {m.exp} · Stock: {m.stock || m.currentStock || 0}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#0c3b73' }}>₹{Number(m.mrp || 0).toFixed(2)}</p>
                        <p style={{ margin: 0, fontSize: 9, color: '#9ca3af' }}>MRP</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Cart */}
          <Card>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Cart ({cart.length} items)</p>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Clear All</button>
              )}
            </div>
            <CartTable cart={cart} onQty={updateQty} onRemove={removeItem} />
          </Card>
        </div>

        {/* RIGHT — Bill Summary */}
        <BillSummary
          cart={cart}
          discount={discount}
          setDiscount={setDisc}
          onPay={() => setModal('payment')}
          onHold={() => setModal('hold')}
          onReturn={() => setModal('return')}
          onExchange={() => setModal('exchange')}
          onCredit={() => setModal('credit')}
        />
      </div>
    </div>
  )
}
