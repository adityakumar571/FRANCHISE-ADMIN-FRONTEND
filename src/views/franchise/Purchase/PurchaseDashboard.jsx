/* eslint-disable prettier/prettier */
/**
 * Purchase Dashboard — Today's Purchases
 * Matches the screenshot exactly
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart, RefreshCw, Download, Search, Filter,
  Eye, Phone, MessageSquare, TrendingUp, TrendingDown,
  ShoppingBag, Tag, IndianRupee, Truck, Plus,
  RotateCcw, ClipboardList, List, MoreHorizontal,
  CheckCircle, Clock, AlertTriangle, Zap,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

/* ═══════════════ MOCK DATA ═══════════════ */
const HOURLY_DATA = [
  { t: '12 AM', v: 0     },
  { t: '03 AM', v: 0     },
  { t: '06 AM', v: 2400  },
  { t: '09 AM', v: 8600  },
  { t: '11 AM', v: 24850, highlight: true },
  { t: '12 PM', v: 28000 },
  { t: '03 PM', v: 30200 },
  { t: '06 PM', v: 31800 },
  { t: '09 PM', v: 32450 },
]

const PAYMENT_PIE = [
  { name: 'Cash',            value: 10250, pct: '31.57%', color: '#16a34a' },
  { name: 'UPI',             value: 12600, pct: '38.83%', color: '#7c3aed' },
  { name: 'Credit (Supplier)',value: 9600,  pct: '29.60%', color: '#d97706' },
]

const INVOICES = [
  { no: 'PUR-2025-1524', date: '20 May 2025', supplier: 'Gupta Pharma',      verified: true,  mode: 'Cash',   items: 78, gross: 11250.00, disc: 850.00,  tax: 607.50, net: 9792.50, status: 'Paid'     },
  { no: 'PUR-2025-1523', date: '20 May 2025', supplier: 'R.K. Distributors', verified: true,  mode: 'UPI',    items: 61, gross: 8750.00,  disc: 620.00,  tax: 465.00, net: 7675.00, status: 'Paid'     },
  { no: 'PUR-2025-1522', date: '20 May 2025', supplier: 'Medico Agency',     verified: true,  mode: 'Credit', items: 54, gross: 7650.00,  disc: 580.00,  tax: 397.50, net: 6672.50, status: 'Credit'   },
  { no: 'PUR-2025-1521', date: '20 May 2025', supplier: 'Health Distributor',verified: false, mode: 'Cash',   items: 32, gross: 3900.00,  disc: 220.00,  tax: 198.00, net: 3482.00, status: 'Paid'     },
  { no: 'PUR-2025-1520', date: '20 May 2025', supplier: 'Shree Pharma',      verified: false, mode: 'UPI',    items: 23, gross: 1900.00,  disc: 80.00,   tax: 92.00,  net: 1728.00, status: 'Paid'     },
]

const TOP_ITEMS = [
  { rank: 1, name: 'Dolo 650 Tablet',     qty: 50,  amount: 950.00  },
  { rank: 2, name: 'Crocin 650mg Tablet', qty: 40,  amount: 800.00  },
  { rank: 3, name: 'Calpol 650mg Tablet', qty: 30,  amount: 600.00  },
  { rank: 4, name: 'Azithral 500mg Tablet',qty: 25, amount: 562.50  },
  { rank: 5, name: 'Pantop DSR Capsule',  qty: 20,  amount: 480.00  },
]

const ALERTS = [
  { name: 'Clavm 625 Tablet',    type: 'rate',     msg: 'Best rate available at Gupta Pharma\n₹2.00 cheaper than your last purchase', btnLabel: 'View Rates',      btnColor: '#16a34a', icon: TrendingDown, iconColor: '#16a34a' },
  { name: 'Azithral 500mg Tablet',type: 'scheme',  msg: 'Stock available with 4 suppliers\nEffective rate: ₹17.20 per strip',         btnLabel: 'View Suppliers',   btnColor: '#d97706', icon: Truck,        iconColor: '#d97706' },
  { name: 'Dolo 650 Tablet',     type: 'scheme',   msg: '10+2 scheme available\nBest rate: ₹69.50',                                    btnLabel: 'View Scheme',     btnColor: '#7c3aed', icon: Tag,          iconColor: '#7c3aed' },
  { name: 'Pantop DSR Capsule',  type: 'stock',    msg: 'Stock running low\nAvailable qty: 25 strips',                                  btnLabel: 'Purchase Now',    btnColor: '#dc2626', icon: AlertTriangle, iconColor: '#dc2626' },
  { name: 'Calpol 650 Tablet',   type: 'price',    msg: 'Price dropped by ₹1.50\nNew best rate: ₹13.25',                               btnLabel: 'View Details',    btnColor: '#0891b2', icon: TrendingDown, iconColor: '#0891b2' },
]

const MODE_CFG = {
  Cash:   { bg: '#dcfce7', color: '#16a34a' },
  UPI:    { bg: '#f5f3ff', color: '#7c3aed' },
  Credit: { bg: '#fef3c7', color: '#d97706' },
  Cheque: { bg: '#e0e7ff', color: '#0c3b73' },
}

const STATUS_CFG = {
  Paid:   { bg: '#dcfce7', color: '#16a34a' },
  Credit: { bg: '#fef3c7', color: '#d97706' },
  Unpaid: { bg: '#fee2e2', color: '#dc2626' },
}

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '9px 12px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '9px 12px', fontSize: 12, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>
)

const fmt = v => `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

/* ═══════════════ MAIN ═══════════════ */
export default function PurchaseDashboard() {
  const navigate    = useNavigate()
  const [view, setView]   = useState('Day Wise')
  const [payFilter, setPayFilter] = useState('All Payment Mode')
  const [suppFilter, setSuppFilter] = useState('All Suppliers')
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState('All')

  const totalPurchase  = 32450.00
  const totalItems     = 248
  const totalDiscount  = 2350.00
  const totalTax       = 1850.00
  const netPurchase    = 28250.00
  const totalPaid      = 28250.00

  const filteredInvoices = INVOICES.filter(inv => {
    const matchSearch = search === '' || inv.no.toLowerCase().includes(search.toLowerCase()) || inv.supplier.toLowerCase().includes(search.toLowerCase())
    const matchPay    = payFilter === 'All Payment Mode' || inv.mode === payFilter
    const matchSupp   = suppFilter === 'All Suppliers' || inv.supplier === suppFilter
    const matchQuick  = quickFilter === 'All' || inv.status === quickFilter || (quickFilter === 'Unpaid' && inv.status !== 'Paid' && inv.status !== 'Credit')
    return matchSearch && matchPay && matchSupp && matchQuick
  })

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Today's Purchases</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>
            Dashboard &nbsp;›&nbsp; Purchase &nbsp;›&nbsp; Today's Purchases
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#374151' }}>
            📅 20 May 2025, Tuesday
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
            <RefreshCw size={12} /> Refresh
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#0c3b73', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      {/* ── 6 KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
        {[
          { label: 'Total Purchase Value',  value: fmt(totalPurchase), sub: '5 Invoices',           color: '#0c3b73', bg: '#e0e7ff', icon: ShoppingCart },
          { label: 'Total Items Purchased', value: totalItems,          sub: '32 Different Items',  color: '#7c3aed', bg: '#f5f3ff', icon: ShoppingBag  },
          { label: 'Total Discount',        value: fmt(totalDiscount),  sub: `${((totalDiscount/totalPurchase)*100).toFixed(2)}% of Purchase`, color: '#16a34a', bg: '#dcfce7', icon: Tag },
          { label: 'Total Tax (GST)',        value: fmt(totalTax),       sub: `${((totalTax/totalPurchase)*100).toFixed(2)}% of Purchase`,     color: '#d97706', bg: '#fef3c7', icon: IndianRupee },
          { label: 'Net Purchase Value',    value: fmt(netPurchase),    sub: 'After Discount & Tax', color: '#0891b2', bg: '#e0f2fe', icon: TrendingUp   },
          { label: 'Total Paid',            value: fmt(totalPaid),      sub: `Due: ₹0.00`,           color: '#dc2626', bg: '#fee2e2', icon: CheckCircle  },
        ].map(k => (
          <div key={k.label}
            style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '14px 14px' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.07)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <k.icon size={16} color={k.color} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.3 }}>{k.label}</span>
            </div>
            <p style={{ fontSize: 19, fontWeight: 800, color: '#111827', margin: '0 0 3px', lineHeight: 1 }}>{k.value}</p>
            <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Row 2: Chart + Pie + Supplier Summary ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px 260px', gap: 14 }}>

        {/* Purchase Overview Chart */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Purchase Overview</p>
            <div style={{ display: 'flex', gap: 0, border: '1px solid #e5e7eb', borderRadius: 7, overflow: 'hidden' }}>
              {['Day Wise','Today','This Week','This Month'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding: '5px 10px', border: 'none', background: view===v?'#0c3b73':'#fff', color: view===v?'#fff':'#374151', fontSize: 11, fontWeight: view===v?700:400, cursor: 'pointer', borderRight: '1px solid #e5e7eb' }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={HOURLY_DATA} margin={{ top: 16, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="purGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0c3b73" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0c3b73" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => v === 0 ? '₹0' : `₹${(v/1000).toFixed(0)}K`} width={46} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)', fontSize: 11 }}
                formatter={v => [fmt(v), 'Purchase']}
                labelFormatter={label => `${label}`}
              />
              <Area type="monotone" dataKey="v" stroke="#0c3b73" strokeWidth={2.5} fill="url(#purGrad)"
                dot={(props) => {
                  const { cx, cy, payload } = props
                  if (!payload.highlight) return <circle key={`dot-${cx}`} cx={cx} cy={cy} r={3} fill="#0c3b73" />
                  return (
                    <g key={`dot-hl-${cx}`}>
                      <circle cx={cx} cy={cy} r={5} fill="#0c3b73" stroke="#fff" strokeWidth={2} />
                      <rect x={cx - 44} y={cy - 32} width={88} height={24} rx={5} fill="#0c3b73" />
                      <text x={cx} y={cy - 23} fill="#fff" fontSize={8.5} textAnchor="middle">11:00 AM</text>
                      <text x={cx} y={cy - 13} fill="#fff" fontSize={9} textAnchor="middle" fontWeight="700">Purchase ₹24,850</text>
                    </g>
                  )
                }}
                activeDot={{ r: 5, fill: '#0c3b73' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Purchase by Payment Mode */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Purchase by Payment Mode</p>
          <div style={{ position: 'relative', flex: 1 }}>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={PAYMENT_PIE} cx="50%" cy="50%" innerRadius={48} outerRadius={68}
                  dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {PAYMENT_PIE.map((p, i) => <Cell key={i} fill={p.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 11 }} formatter={v => [fmt(v), '']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <p style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: 0 }}>₹32,450</p>
              <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Total</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
            {PAYMENT_PIE.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#374151' }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>
                  {fmt(p.value)} <span style={{ color: p.color }}>({p.pct})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Summary */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Supplier Summary <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>(Today)</span></p>
            <button style={{ fontSize: 11, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
          </div>
          {[
            { label: 'Total Suppliers',   value: '5',            bold: false },
            { label: 'New Suppliers',     value: '0',            bold: false },
            { label: 'Total Purchase',    value: fmt(32450),     bold: false },
            { label: 'Total Discount',    value: fmt(2350),      bold: false },
            { label: 'Total Tax (GST)',   value: fmt(1850),      bold: false },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>
              <span style={{ color: '#6b7280' }}>{s.label}</span>
              <span style={{ fontWeight: 600, color: '#374151' }}>{s.value}</span>
            </div>
          ))}
          <div style={{ borderTop: '2px solid #0c3b73', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800 }}>
            <span style={{ color: '#0c3b73' }}>Net Purchase</span>
            <span style={{ color: '#0c3b73' }}>{fmt(28250)}</span>
          </div>
        </div>
      </div>

      {/* ── Row 3: Invoice List + Right Panel ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 14, alignItems: 'start' }}>

        {/* Invoice List */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Purchase Invoice List <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>({filteredInvoices.length} Invoices)</span></p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Invoice / Supplier / DC No..."
                  style={{ padding: '6px 10px 6px 26px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 11, outline: 'none', background: '#f9fafb', width: 200 }} />
              </div>
              <select value={payFilter} onChange={e => setPayFilter(e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 11, background: '#f9fafb', cursor: 'pointer', outline: 'none' }}>
                {['All Payment Mode','Cash','UPI','Credit','Cheque'].map(o => <option key={o}>{o}</option>)}
              </select>
              <select value={suppFilter} onChange={e => setSuppFilter(e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 11, background: '#f9fafb', cursor: 'pointer', outline: 'none' }}>
                <option>All Suppliers</option>
                {INVOICES.map(i => i.supplier).filter((v,i,a) => a.indexOf(v)===i).map(s => <option key={s}>{s}</option>)}
              </select>
              <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 11, background: '#fff', cursor: 'pointer' }}>
                <Filter size={11} /> Filter
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <Th c="#" /><Th c="Invoice No." /><Th c="Invoice Date" /><Th c="Supplier Name" />
                <Th c="Payment Mode" /><Th c="Items" align="center" />
                <Th c="Gross Amount (₹)" align="right" /><Th c="Discount (₹)" align="right" />
                <Th c="Tax (₹)" align="right" /><Th c="Net Amount (₹)" align="right" />
                <Th c="Status" /><Th c="Action" />
              </tr></thead>
              <tbody>
                {filteredInvoices.map((inv, i) => {
                  const mCfg = MODE_CFG[inv.mode] || { bg: '#f3f4f6', color: '#6b7280' }
                  const sCfg = STATUS_CFG[inv.status] || STATUS_CFG.Unpaid
                  return (
                    <tr key={inv.no} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <Td style={{ color: '#9ca3af' }}>{i+1}</Td>
                      <Td><span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#0c3b73' }}>{inv.no}</span></Td>
                      <Td style={{ color: '#6b7280', fontSize: 11 }}>{inv.date}</Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 600 }}>{inv.supplier}</span>
                          {inv.verified && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 10, background: '#dcfce7', color: '#16a34a' }}>Verified</span>}
                        </div>
                      </Td>
                      <Td><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: mCfg.bg, color: mCfg.color }}>{inv.mode}</span></Td>
                      <Td style={{ textAlign: 'center', fontWeight: 600 }}>{inv.items}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(inv.gross)}</Td>
                      <Td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>{fmt(inv.disc)}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(inv.tax)}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>{fmt(inv.net)}</Td>
                      <Td><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: sCfg.bg, color: sCfg.color }}>{inv.status}</span></Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button style={{ background: '#e0e7ff', border: 'none', borderRadius: 5, padding: '4px 6px', cursor: 'pointer' }}><Eye size={11} color="#0c3b73" /></button>
                          <button style={{ background: '#f3f4f6', border: 'none', borderRadius: 5, padding: '4px 6px', cursor: 'pointer' }}><Phone size={11} color="#6b7280" /></button>
                          <button style={{ background: '#dcfce7', border: 'none', borderRadius: 5, padding: '4px 6px', cursor: 'pointer' }}><MessageSquare size={11} color="#16a34a" /></button>
                        </div>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                  <td colSpan={6} style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, color: '#374151' }}>Total</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: '#374151' }}>{fmt(INVOICES.reduce((s,i)=>s+i.gross,0))}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{fmt(INVOICES.reduce((s,i)=>s+i.disc,0))}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700 }}>{fmt(INVOICES.reduce((s,i)=>s+i.tax,0))}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 800, color: '#0c3b73' }}>{fmt(INVOICES.reduce((s,i)=>s+i.net,0))}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 11, color: '#6b7280' }}>Showing 1 to {filteredInvoices.length} of {filteredInvoices.length} invoices</span>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Top Purchased Items */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Top Purchased Items <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>(Today)</span></p>
              <button style={{ fontSize: 11, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <Th c="#" /><Th c="Medicine Name" /><Th c="Qty" align="center" /><Th c="Amount (₹)" align="right" />
              </tr></thead>
              <tbody>
                {TOP_ITEMS.map((t, i) => (
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td style={{ color: '#9ca3af', fontSize: 11 }}>{t.rank}</Td>
                    <Td style={{ fontWeight: 500, fontSize: 11 }}>{t.name}</Td>
                    <Td style={{ textAlign: 'center', fontWeight: 600, fontSize: 11 }}>{t.qty}</Td>
                    <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73', fontSize: 11 }}>{fmt(t.amount)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Filters */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Quick Filters</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {['All','Cash','UPI','Credit','Paid','Unpaid','Partially Paid'].map(f => (
                <button key={f} onClick={() => setQuickFilter(f)}
                  style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${quickFilter===f?'#0c3b73':'#e5e7eb'}`, background: quickFilter===f?'#0c3b73':'#fff', color: quickFilter===f?'#fff':'#374151', fontSize: 11, fontWeight: quickFilter===f?700:400, cursor: 'pointer' }}>
                  {f}
                </button>
              ))}
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb', cursor: 'pointer', fontSize: 12, color: '#374151', marginTop: 4 }}>
              📅 Custom Date
            </button>
          </div>

          {/* Quick Actions */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Quick Actions</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {[
                { label: 'New Purchase',    icon: ShoppingCart, color: '#0c3b73', bg: '#e0e7ff', to: '/franchise/purchase/orders' },
                { label: 'Purchase Return', icon: RotateCcw,    color: '#dc2626', bg: '#fee2e2', to: '/franchise/purchase/returns' },
                { label: 'Add Supplier',    icon: Truck,        color: '#16a34a', bg: '#dcfce7', to: '/franchise/suppliers/add' },
                { label: 'Pending Bills',   icon: Clock,        color: '#d97706', bg: '#fef3c7', to: '/franchise/purchase/orders' },
                { label: 'Purchase Order',  icon: ClipboardList,color: '#7c3aed', bg: '#f5f3ff', to: '/franchise/purchase/orders' },
                { label: 'View Suppliers',  icon: List,         color: '#0891b2', bg: '#e0f2fe', to: '/franchise/suppliers' },
                { label: 'Scheme List',     icon: Tag,          color: '#f97316', bg: '#fff7ed', to: '/franchise/live-rates/scheme-comparison' },
                { label: 'More',            icon: MoreHorizontal,color:'#6b7280', bg: '#f3f4f6', to: '/franchise/purchase' },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.to)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 4px', border: '1px solid #f3f4f6', borderRadius: 8, background: '#fff', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = a.color + '08' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.background = '#fff' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <a.icon size={13} color={a.color} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 600, color: '#374151', textAlign: 'center', lineHeight: 1.2 }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Smart Purchase Alerts ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={14} color="#d97706" fill="#d97706" />
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Smart Purchase Alerts</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 0 }}>
          {ALERTS.map((a, i) => (
            <div key={i} style={{ padding: '14px 14px', borderRight: i < ALERTS.length-1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <a.icon size={14} color={a.iconColor} />
                <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 }}>{a.name}</p>
              </div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{a.msg}</p>
              <button
                style={{ padding: '6px 14px', border: 'none', borderRadius: 7, background: a.btnColor, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                {a.btnLabel}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
