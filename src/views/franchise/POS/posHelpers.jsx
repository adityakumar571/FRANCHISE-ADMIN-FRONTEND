/* eslint-disable prettier/prettier */
/* ── Shared mini-components for all POS screens ── */
import { Minus, Plus, Trash2 } from 'lucide-react'

export const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)

export const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>
)

export const BillRow = ({ label, value, bold, color, large }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: large ? 15 : 13, borderBottom: '1px solid #f9fafb' }}>
    <span style={{ color: '#6b7280', fontWeight: bold ? 700 : 400 }}>{label}</span>
    <span style={{ fontWeight: bold ? 800 : 600, color: color || '#111827' }}>{value}</span>
  </div>
)

export const SBtn = ({ label, color = '#fff', bg = '#0c3b73', border, onClick, icon: Icon, full, sm, disabled, type = 'button' }) => (
  <button type={type} onClick={onClick} disabled={disabled}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: sm ? '7px 13px' : '10px 20px',
      width: full ? '100%' : 'auto',
      background: disabled ? '#e5e7eb' : bg,
      color: disabled ? '#9ca3af' : color,
      border: `1px solid ${border || bg}`,
      borderRadius: 8, fontSize: sm ? 12 : 13, fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
    }}>
    {Icon && <Icon size={sm ? 12 : 14} />}{label}
  </button>
)

export const FieldLabel = ({ children }) => (
  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#374151', margin: '0 0 5px' }}>{children}</p>
)

export const TextInput = ({ value, onChange, placeholder, type = 'text', style = {} }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box', color: '#111827', ...style }}
    onFocus={e => e.target.style.borderColor = '#0c3b73'}
    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
  />
)

export const SelectInput = ({ value, onChange, children, style = {} }) => (
  <select value={value} onChange={onChange}
    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', cursor: 'pointer', ...style }}>
    {children}
  </select>
)

export const QtyControl = ({ qty, onInc, onDec }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    <button onClick={onDec} style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={10} /></button>
    <span style={{ width: 28, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>{qty}</span>
    <button onClick={onInc} style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={10} /></button>
  </div>
)

export const CartTable = ({ cart, onQty, onRemove }) => {
  if (cart.length === 0) return (
    <div style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af' }}>
      <p style={{ fontSize: 32, margin: '0 0 10px' }}>💊</p>
      <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px', color: '#374151' }}>Cart is empty</p>
      <p style={{ fontSize: 12, margin: 0 }}>Start adding medicines to create bill</p>
    </div>
  )
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{['Medicine Name','Batch','Qty','MRP','Disc%','Amount',''].map(h => <Th key={h} c={h} />)}</tr></thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.id} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
              <Td>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{item.name}</p>
                <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>Exp: {item.exp} · {item.pack}</p>
              </Td>
              <Td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{item.batch}</Td>
              <Td><QtyControl qty={item.qty} onDec={() => onQty(item.id, -1)} onInc={() => onQty(item.id, 1)} /></Td>
              <Td style={{ fontWeight: 600 }}>₹{item.mrp.toFixed(2)}</Td>
              <Td>
                <input type="number" defaultValue={0} min={0} max={100}
                  style={{ width: 48, padding: '4px 6px', border: '1px solid #e5e7eb', borderRadius: 5, fontSize: 12, textAlign: 'center', outline: 'none' }} />
              </Td>
              <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹{(item.mrp * item.qty).toFixed(2)}</Td>
              <Td>
                <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 2 }}><Trash2 size={13} /></button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const BillSummaryPanel = ({ cart, discount, setDiscount, footer }) => {
  const subtotal = cart.reduce((s, i) => s + i.mrp * i.qty, 0)
  const discAmt  = subtotal * (discount / 100)
  const taxable  = subtotal - discAmt
  const gst5     = cart.filter(i => i.gst === 5).reduce((s, i) => s + i.mrp * i.qty, 0) * 0.05
  const gst12    = cart.filter(i => i.gst === 12).reduce((s, i) => s + i.mrp * i.qty, 0) * 0.12
  const gstTotal = gst5 + gst12
  const total    = taxable + gstTotal

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', position: 'sticky', top: 10 }}>
      <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', color: '#fff' }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Bill Summary</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.8 }}>{cart.length} items · {cart.reduce((s,i) => s+i.qty, 0)} qty</p>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <BillRow label="Items"      value={cart.reduce((s,i) => s+i.qty, 0)} />
        <BillRow label="MRP Total"  value={`₹ ${subtotal.toFixed(2)}`} />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, borderBottom: '1px solid #f9fafb', alignItems: 'center' }}>
          <span style={{ color: '#6b7280' }}>Discount %</span>
          <input type="number" value={discount} min={0} max={100} onChange={e => setDiscount(+e.target.value || 0)}
            style={{ width: 60, padding: '3px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, textAlign: 'center', outline: 'none' }} />
        </div>
        <BillRow label="Disc. Amt"  value={`- ₹ ${discAmt.toFixed(2)}`}    color="#dc2626" />
        <BillRow label="Taxable"    value={`₹ ${taxable.toFixed(2)}`} />
        <BillRow label="GST (5%)"   value={`₹ ${gst5.toFixed(2)}`} />
        <BillRow label="GST (12%)"  value={`₹ ${gst12.toFixed(2)}`} />
        <BillRow label="Round Off"  value="₹ 0.00" />
        <div style={{ borderTop: '2px solid #0c3b73', marginTop: 8, paddingTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Total Amount</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0c3b73' }}>₹ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {footer && <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>{footer}</div>}
    </div>
  )
}

export const calcTotal = (cart, discount = 0) => {
  const subtotal = cart.reduce((s, i) => s + i.mrp * i.qty, 0)
  const discAmt  = subtotal * (discount / 100)
  const taxable  = subtotal - discAmt
  const gst      = taxable * 0.05
  return taxable + gst
}
