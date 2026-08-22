/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { useFranchise } from '../../../Context/FranchiseContext'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, ShoppingCart, Users, Package, IndianRupee,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Store, Activity, Clock,
  BarChart2, UserCheck, ClipboardList, Wallet, Bell, RefreshCw,
  Calendar, Star, Phone, ChevronRight, Eye, Search,
} from 'lucide-react'

/* ─── Reusable components ─── */
const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', ...style }}>{children}</div>
)
const CardHeader = ({ title, action, onAction, badge }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{title}</span>
      {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#e11d4818', color: '#e11d48', border: '1px solid #fecdd3' }}>{badge}</span>}
    </div>
    {action && <button onClick={onAction} style={{ fontSize: 12, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>{action}</button>}
  </div>
)

/* ─── Top KPI strip ─── */
const KpiCard = ({ icon: Icon, label, value, change, up, color }) => (
  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '14px 16px', flex: '1 1 150px', minWidth: 140 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{label}</span>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={15} color={color} />
      </div>
    </div>
    <p style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{value}</p>
    {change && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {up ? <ArrowUpRight size={11} color="#16a34a" /> : <ArrowDownRight size={11} color="#dc2626" />}
        <span style={{ fontSize: 11, color: up ? '#16a34a' : '#dc2626', fontWeight: 500 }}>{change}</span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>vs Yesterday</span>
      </div>
    )}
  </div>
)

/* ─── Mock data ─── */
const KPIS = [
  { icon: IndianRupee,  label: "Today's Sales",     value: '₹48,650', change: '18.6%', up: true,  color: '#0c3b73' },
  { icon: ShoppingCart, label: "Today's Purchase",   value: '₹32,450', change: '12.4%', up: true,  color: '#7c3aed' },
  { icon: TrendingUp,   label: 'Gross Profit',       value: '₹16,200', change: '16.8%', up: true,  color: '#16a34a' },
  { icon: Store,        label: 'Total Orders',        value: '56',      change: '8',     up: true,  color: '#d97706' },
  { icon: Package,      label: 'Stock Value',         value: '₹8,52,600', change: null, up: null,  color: '#0891b2' },
]

const WHOLESALE = [
  { rank: 1, name: 'Gupta Pharma',       verified: true,  rating: 4.8, basic: 63.00, scheme: '10+1', gst: 1.70, other: 0.00, effective: 63.00, best: true,  stock: 120, delivery: 'Same Day' },
  { rank: 2, name: 'R.K. Distributors',  verified: true,  rating: 4.6, basic: 64.00, scheme: 'No Scheme', gst: 1.73, other: 0.00, effective: 64.00, best: false, stock: 85,  delivery: 'Same Day' },
  { rank: 3, name: 'Medico Agency',      verified: true,  rating: 4.5, basic: 64.50, scheme: '5+1',  gst: 1.74, other: 0.00, effective: 64.50, best: false, stock: 200, delivery: 'Next Day' },
  { rank: 4, name: 'Health Distributor', verified: true,  rating: 4.3, basic: 65.00, scheme: '10+2', gst: 1.76, other: 0.00, effective: 65.00, best: false, stock: 60,  delivery: 'Same Day' },
  { rank: 5, name: 'Shree Pharma',       verified: false, rating: 4.2, basic: 66.00, scheme: 'No Scheme', gst: 1.78, other: 0.00, effective: 66.00, best: false, stock: 150, delivery: 'Next Day' },
]

const RATE_ALERTS = [
  { name: 'Clavm 625 Tablet',   rate: '₹63.00', note: 'Rate decreased by ₹2.00' },
  { name: 'Dolo 650 Tablet',    rate: '₹17.20', note: 'Best rate available' },
  { name: 'Pan-D Tablet',       rate: '₹92.00', note: 'Rate decreased by ₹6.00' },
  { name: 'Azithral 500 Tablet', rate: '₹69.50', note: 'Stock low with suppliers' },
  { name: 'Crocin 650 Tablet',  rate: '₹18.60', note: 'New scheme 10+2 available' },
]

const TOP_MOVING = [
  { rank: 1, name: 'Clavm 625 Tablet',    qty: 650, sales: '₹42,250' },
  { rank: 2, name: 'Dolo 650 Tablet',     qty: 920, sales: '₹36,800' },
  { rank: 3, name: 'Calpol 650 Tablet',   qty: 480, sales: '₹19,200' },
  { rank: 4, name: 'Azithral 500 Tablet', qty: 350, sales: '₹15,750' },
  { rank: 5, name: 'Pantop DSR Capsule',  qty: 300, sales: '₹12,600' },
]

const EXPIRY = [
  { name: 'Augmentin 625',  expiry: '25 Days',  qty: '120 Strip', urgent: true },
  { name: 'Monocef 200',    expiry: '32 Days',  qty: '85 Strip',  urgent: false },
  { name: 'Calpol 650',     expiry: '40 Days',  qty: '60 Strip',  urgent: false },
  { name: 'Zincovit Tablet',expiry: '45 Days',  qty: '75 Strip',  urgent: false },
  { name: 'Dolo 650',       expiry: '60 Days',  qty: '140 Strip', urgent: false },
]

const RECENT_SALES = [
  { inv: 'INV-2025-1524', customer: 'Walk-in Customer', amount: '₹1,250', mode: 'Cash',   time: '09:25 AM' },
  { inv: 'INV-2025-1523', customer: 'Rahul Sharma',    amount: '₹2,450', mode: 'UPI',    time: '09:10 AM' },
  { inv: 'INV-2025-1522', customer: 'Priya Verma',     amount: '₹3,650', mode: 'Card',   time: '08:45 AM' },
  { inv: 'INV-2025-1521', customer: 'Walk-in Customer', amount: '₹850',  mode: 'Cash',   time: '08:30 AM' },
  { inv: 'INV-2025-1520', customer: 'Amit Kumar',      amount: '₹1,150', mode: 'UPI',    time: '08:15 AM' },
]

const RECENT_PURCHASES = [
  { billNo: 'PUR-2025-125', supplier: 'MedPlus Pharma',           amount: '₹25,430', date: '21 May 2025', status: 'Paid' },
  { billNo: 'PUR-2025-124', supplier: 'HealthCare Distributors',  amount: '₹18,750', date: '20 May 2025', status: 'Paid' },
  { billNo: 'PUR-2025-123', supplier: 'Universal Medicines',      amount: '₹15,600', date: '20 May 2025', status: 'Paid' },
  { billNo: 'PUR-2025-122', supplier: 'Sarthi Pharma',            amount: '₹12,350', date: '19 May 2025', status: 'Due' },
]

const LOW_STOCK = [
  { name: 'Paracetamol 650mg', left: 'Only 15 strips left', color: '#dc2626' },
  { name: 'Azithromycin 500mg', left: 'Only 8 strips left', color: '#dc2626' },
  { name: 'Pantoprazole 40mg', left: 'Only 12 strips left', color: '#dc2626' },
  { name: 'Vitamin D3 60000 IU', left: 'Only 5 strips left — Critical', color: '#e11d48' },
  { name: 'Amoxicillin 500mg', left: 'Only 7 strips left', color: '#dc2626' },
]

const modeColor = { Cash: '#16a34a', UPI: '#7c3aed', Card: '#2563eb', Credit: '#d97706' }

/* ─── Sparkline (CSS only) ─── */
const Sparkline = ({ values, color = '#0c3b73' }) => {
  const max = Math.max(...values)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 28 }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, background: color, borderRadius: 2, height: `${Math.max(15, (v / max) * 100)}%`, opacity: i === values.length - 1 ? 1 : 0.4 }} />
      ))}
    </div>
  )
}

/* ─── Price trend chart (7 points) ─── */
const PRICE_TREND = [67, 66, 65, 66, 65, 65, 63]

/* ════════════════════════════════════════════ */
export default function FranchiseDashboard() {
  const navigate = useNavigate()
  const { franchiseUser, franchiseInfo } = useFranchise()
  const [searchMed, setSearchMed] = useState('')

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 13 }}>

      {/* ─── Page heading ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
            Welcome back! Here is what is happening with your store. &nbsp;&bull;&nbsp; {dateStr}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            20 May 2025, Tuesday
          </span>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* ─── KPI Strip ─── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* ─── ROW 1: Live Wholesale + Price Trend ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>

        {/* Live Wholesale Rate Comparison */}
        <Card>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Live Wholesale Rate Comparison</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#dc2626', background: '#fff1f2', border: '1px solid #fecdd3', padding: '2px 7px', borderRadius: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
                LIVE
              </span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Updated: 09:30 AM</span>
            </div>
            <button style={{ fontSize: 12, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All Medicines <ChevronRight size={12} />
            </button>
          </div>

          {/* Medicine info bar */}
          <div style={{ padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <p style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: 14 }}>Clavm 625 Tablet</p>
              <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>(Amoxicillin 500mg + Clavulanic Acid 125mg) · Strip of 10 Tablets</p>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {[
                { label: 'MRP', value: '₹210.00', color: '#374151' },
                { label: 'Last Purchase Rate', value: '₹65.00', sub: '(18 May 2025)', color: '#374151' },
                { label: 'Today Best Rate', value: '₹63.00', sub: '↓ ₹2.00 (3.08%)', color: '#16a34a' },
                { label: 'Available Wholesalers', value: '5', color: '#0c3b73' },
              ].map((m) => (
                <div key={m.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>{m.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: m.color, margin: '2px 0 0' }}>{m.value}</p>
                  {m.sub && <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>{m.sub}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['#', 'Wholesaler Name', 'Basic Rate (₹)', 'Scheme', 'GST (₹)', 'Other Charges (₹)', 'Effective Rate (₹)', 'Stock', 'Delivery', 'Action'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WHOLESALE.map((w) => (
                  <tr key={w.rank} style={{ background: w.best ? '#f0fdf4' : '#fff', borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '9px 10px', fontSize: 12, color: '#6b7280' }}>{w.rank}</td>
                    <td style={{ padding: '9px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontWeight: 600, color: '#111827', fontSize: 12 }}>{w.name}</span>
                        {w.verified && <span style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 5px', borderRadius: 10 }}>Verified</span>}
                        <span style={{ fontSize: 10, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Star size={9} fill="#f59e0b" /> {w.rating}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>{w.basic.toFixed(2)}</td>
                    <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>{w.scheme}</td>
                    <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>{w.gst.toFixed(2)}</td>
                    <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>{w.other.toFixed(2)}</td>
                    <td style={{ padding: '9px 10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: w.best ? '#16a34a' : '#111827' }}>₹{w.effective.toFixed(2)}</span>
                        {w.best && <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>Best Price</span>}
                      </div>
                    </td>
                    <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>{w.stock}</td>
                    <td style={{ padding: '9px 10px', fontSize: 12, color: '#374151' }}>{w.delivery}</td>
                    <td style={{ padding: '9px 10px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ fontSize: 11, fontWeight: 600, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer' }}>Buy Now</button>
                        <button style={{ background: '#f3f4f6', border: 'none', borderRadius: 5, padding: '4px 6px', cursor: 'pointer', color: '#374151' }}><Phone size={11} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '8px 16px', background: '#f0fdf4', borderTop: '1px solid #dcfce7' }}>
            <p style={{ fontSize: 11, color: '#166534', margin: 0, fontWeight: 500 }}>
              You can save ₹2.00 per strip by buying from Gupta Pharma
            </p>
          </div>
          <div style={{ padding: '10px 16px', display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, padding: '8px 0', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}>Compare Scheme</button>
            <button style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#fff', background: '#0c3b73', cursor: 'pointer' }}>Add to Purchase Cart</button>
          </div>
        </Card>

        {/* Price Trend */}
        <Card>
          <CardHeader title="Price Trend" />
          <div style={{ padding: '12px 14px' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px' }}>Clavm 625 Tablet</p>
            {/* Chart area */}
            <div style={{ position: 'relative', height: 120, marginBottom: 8 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', flexDirection: 'column', height: '100%', pointerEvents: 'none' }}>
                {[70, 67, 65, 62, 60].map(v => (
                  <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 9, color: '#9ca3af', width: 18, textAlign: 'right' }}>₹{v}</span>
                    <div style={{ flex: 1, borderTop: '1px dashed #f3f4f6' }} />
                  </div>
                ))}
              </div>
              {/* Trend line */}
              <div style={{ position: 'absolute', bottom: 12, left: 24, right: 0, display: 'flex', alignItems: 'flex-end', gap: 4, height: 90 }}>
                {PRICE_TREND.map((v, i) => {
                  const max = 70, min = 60
                  const h = ((v - min) / (max - min)) * 80 + 8
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <div style={{ width: '100%', background: i === PRICE_TREND.length - 1 ? '#16a34a' : '#0c3b73', borderRadius: '3px 3px 0 0', height: h, opacity: i === PRICE_TREND.length - 1 ? 1 : 0.35 }} />
                      <span style={{ fontSize: 8, color: '#9ca3af' }}>{['14M', '15M', '16M', '17M', '18M', '19M', '20M'][i]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {[
                { label: "Yesterday's Avg Rate", value: '₹65.00', color: '#374151' },
                { label: '7 Days Avg Rate',       value: '₹64.20', color: '#374151' },
                { label: '30 Days Avg Rate',      value: '₹66.10', color: '#374151' },
                { label: "Today's Best Rate",     value: '₹63.00', color: '#16a34a' },
              ].map((r) => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button style={{ flex: 1, padding: '7px 0', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}>Rate History</button>
              <button style={{ flex: 1, padding: '7px 0', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#fff', background: '#0c3b73', cursor: 'pointer' }}>Set Price Alert</button>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── ROW 2: Live Alerts + Top Moving + Expiry + Quick Actions ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>

        {/* Live Rate Alerts */}
        <Card>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bell size={13} color="#0c3b73" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Live Rate Alerts</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {RATE_ALERTS.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: i < RATE_ALERTS.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</p>
                  <p style={{ fontSize: 10, color: '#6b7280', margin: '1px 0 0' }}>{a.note}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0c3b73' }}>{a.rate}</span>
                  <button style={{ fontSize: 10, fontWeight: 600, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer' }}>View</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Moving Items */}
        <Card>
          <CardHeader title="Top Moving Items" badge="This Month" action="View All" onAction={() => navigate('/franchise/products')} />
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 0 }}>
              <div style={{ padding: '6px 10px', fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6' }}>
              </div>
              <div style={{ padding: '6px 10px', fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6' }}>Medicine Name</div>
              <div style={{ padding: '6px 10px', fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>Sales</div>
            </div>
            {TOP_MOVING.map((t, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', borderBottom: i < TOP_MOVING.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                <div style={{ padding: '9px 10px', fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>{t.rank}</div>
                <div style={{ padding: '9px 6px' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: 10, color: '#9ca3af', margin: '1px 0 0' }}>Qty: {t.qty}</p>
                </div>
                <div style={{ padding: '9px 10px', fontSize: 12, fontWeight: 700, color: '#0c3b73', textAlign: 'right' }}>{t.sales}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Expiry Alert */}
        <Card>
          <CardHeader title="Expiry Alert" action="View All" onAction={() => navigate('/franchise/inventory')} />
          <div style={{ padding: '8px 0' }}>
            {EXPIRY.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: i < EXPIRY.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.urgent ? '#dc2626' : '#d97706', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{e.name}</p>
                    <p style={{ fontSize: 10, color: e.urgent ? '#dc2626' : '#6b7280', margin: '1px 0 0' }}>Expires in {e.expiry}</p>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>{e.qty}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" />
          <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'New Sale',       to: '/franchise/billing',    color: '#0c3b73', icon: ShoppingCart },
              { label: 'Purchase Entry', to: '/franchise/orders',     color: '#7c3aed', icon: Store },
              { label: 'Add Medicine',   to: '/franchise/products',   color: '#16a34a', icon: Package },
              { label: 'Stock Search',   to: '/franchise/inventory',  color: '#d97706', icon: Search },
              { label: 'Live Rates',     to: '/franchise/inventory',  color: '#0891b2', icon: TrendingUp },
              { label: 'View Reports',   to: '/franchise/reports/sales', color: '#6366f1', icon: BarChart2 },
              { label: 'Customers',      to: '/franchise/customers',  color: '#ec4899', icon: Users },
              { label: 'More',           to: '/franchise/settings',   color: '#6b7280', icon: ChevronRight },
            ].map((a) => (
              <button key={a.label} onClick={() => navigate(a.to)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '10px 4px', borderRadius: 8, border: '1px solid #f3f4f6', background: '#fff', cursor: 'pointer', transition: 'all 0.12s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = a.color + '08' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.background = '#fff' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: a.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <a.icon size={14} color={a.color} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#374151', textAlign: 'center', lineHeight: 1.2 }}>{a.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* ─── ROW 3: Recent Sales + Recent Purchases + Low Stock ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* Recent Sales */}
        <Card>
          <CardHeader title="Recent Sales" action="View All" onAction={() => navigate('/franchise/orders')} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Invoice', 'Customer', 'Amount', 'Mode', 'Time'].map(h => (
                    <th key={h} style={{ padding: '7px 10px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_SALES.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '8px 10px', fontSize: 11, color: '#0c3b73', fontWeight: 600, fontFamily: 'monospace' }}>{s.inv.split('-').slice(-1)[0]}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: '#374151', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.customer}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#111827' }}>{s.amount}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: (modeColor[s.mode] || '#6b7280') + '18', color: modeColor[s.mode] || '#6b7280' }}>{s.mode}</span>
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 11, color: '#9ca3af' }}>{s.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader title="Recent Purchases" action="View All" onAction={() => navigate('/franchise/orders')} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Bill No', 'Supplier', 'Amount', 'Date', 'Status'].map(h => (
                    <th key={h} style={{ padding: '7px 10px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_PURCHASES.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '8px 10px', fontSize: 11, color: '#0c3b73', fontWeight: 600, fontFamily: 'monospace' }}>{p.billNo.split('-').slice(-1)[0]}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: '#374151', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.supplier}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#111827' }}>{p.amount}</td>
                    <td style={{ padding: '8px 10px', fontSize: 11, color: '#9ca3af' }}>{p.date}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: p.status === 'Paid' ? '#f0fdf4' : '#fffbeb', color: p.status === 'Paid' ? '#16a34a' : '#d97706', border: `1px solid ${p.status === 'Paid' ? '#bbf7d0' : '#fde68a'}` }}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={13} color="#dc2626" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Stock Alerts</span>
            </div>
            <button onClick={() => navigate('/franchise/inventory')} style={{ fontSize: 12, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ padding: '6px 0' }}>
            {LOW_STOCK.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 14px', borderBottom: i < LOW_STOCK.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0, marginTop: 4 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{s.name}</p>
                  <p style={{ fontSize: 10, color: s.color, margin: '1px 0 0', fontWeight: 500 }}>{s.left}</p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#dc2626', background: '#fff1f2', border: '1px solid #fecdd3', padding: '2px 6px', borderRadius: 20, flexShrink: 0 }}>Low Stock</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ─── Bottom bar ─── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        {[
          { label: 'Pharmacy Name',   value: franchiseInfo?.franchiseName || 'Franchise Portal' },
          { label: 'Pharmacy ID',     value: franchiseInfo?.franchiseCode || 'FRN-001' },
          { label: 'Plan',            value: 'Premium', color: '#d97706' },
          { label: 'Valid Till',      value: '31 Dec 2025' },
        ].map((b) => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{b.label}:</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: b.color || '#111827' }}>{b.value}</span>
          </div>
        ))}
        <span style={{ fontSize: 11, color: '#9ca3af' }}>Made with care for Indian Pharmacies</span>
      </div>

    </div>
  )
}
