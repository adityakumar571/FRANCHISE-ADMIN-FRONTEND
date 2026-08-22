/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { BarChart2, TrendingUp, TrendingDown, IndianRupee, ShoppingCart, Users, Download } from 'lucide-react'

const DAILY = [
  { date: '14 May', sales: 38500, orders: 18, profit: 6900 },
  { date: '15 May', sales: 42300, orders: 22, profit: 7600 },
  { date: '16 May', sales: 35800, orders: 17, profit: 6440 },
  { date: '17 May', sales: 51200, orders: 28, profit: 9200 },
  { date: '18 May', sales: 47600, orders: 24, profit: 8560 },
  { date: '19 May', sales: 41050, orders: 21, profit: 7389 },
  { date: '20 May', sales: 48650, orders: 24, profit: 8757 },
]

const TOP_ITEMS = [
  { name: 'Paracetamol 650mg', qty: 520, sales: '₹45,250', percent: 18.5 },
  { name: 'Amoxicillin 500mg', qty: 980, sales: '₹35,280', percent: 14.4 },
  { name: 'Pantoprazole 40mg', qty: 866, sales: '₹28,975', percent: 11.8 },
  { name: 'Azithromycin 500mg', qty: 720, sales: '₹24,120', percent: 9.9 },
  { name: 'Vitamin D3 60K',    qty: 610, sales: '₹18,900', percent: 7.7 },
]

const maxSales = Math.max(...DAILY.map(d => d.sales))

const Stat = ({ label, value, sub, icon: Icon, color, trend }) => (
  <div style={{ background: '#fff', borderRadius: 10, padding: '16px 18px', border: '1px solid #e5e7eb', flex: '1 1 160px', minWidth: 150 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{label}</span>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={color} />
      </div>
    </div>
    <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{value}</p>
    {sub && (
      <p style={{ fontSize: 11, color: trend === 'up' ? '#16a34a' : '#dc2626', margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
        {trend === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {sub}
      </p>
    )}
  </div>
)

export default function SalesReport() {
  const [range, setRange] = useState('This Week')

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Sales Report</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Detailed sales performance and trends</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={range} onChange={e => setRange(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
            {['Today', 'This Week', 'This Month', 'Last Month', 'Custom'].map(r => <option key={r}>{r}</option>)}
          </select>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Stat label="Total Sales"   value="₹3,05,100" sub="18.45% vs last week" icon={IndianRupee}  color="#0c3b73" trend="up" />
        <Stat label="Total Orders"  value="154"        sub="15.32% vs last week" icon={ShoppingCart} color="#7c3aed" trend="up" />
        <Stat label="Avg Bill Value" value="₹1,981"   sub="2.41% vs last week"  icon={BarChart2}   color="#d97706" trend="up" />
        <Stat label="Total Customers" value="98"      sub="+12 new this week"   icon={Users}       color="#16a34a" trend="up" />
      </div>

      {/* Bar Chart */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '18px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Daily Sales Overview</h3>
          <span style={{ fontSize: 12, color: '#6b7280' }}>14 May — 20 May 2025</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160, padding: '0 8px' }}>
          {DAILY.map((d) => {
            const h = Math.round((d.sales / maxSales) * 130) + 20
            return (
              <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#374151', fontWeight: 600 }}>₹{(d.sales / 1000).toFixed(0)}K</span>
                <div style={{ width: '100%', background: '#0c3b73', borderRadius: '4px 4px 0 0', height: h, transition: 'height 0.3s ease', cursor: 'pointer', minHeight: 4 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1a6fd4'}
                  onMouseLeave={e => e.currentTarget.style.background = '#0c3b73'} />
                <span style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap' }}>{d.date}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top selling + Payment breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

        {/* Top Selling */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '18px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Top Selling Products</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TOP_ITEMS.map((p, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{p.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0c3b73' }}>{p.sales}</span>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#0c3b73', borderRadius: 4, width: `${p.percent * 5}%`, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>Qty: {p.qty}</span>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>{p.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Breakdown */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '18px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Payment Mode Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { mode: 'Cash',   amount: '₹1,18,750', pct: 38.9, color: '#16a34a' },
              { mode: 'UPI',    amount: '₹93,450',   pct: 30.6, color: '#7c3aed' },
              { mode: 'Card',   amount: '₹61,350',   pct: 20.1, color: '#2563eb' },
              { mode: 'Credit', amount: '₹31,550',   pct: 10.4, color: '#d97706' },
            ].map((p) => (
              <div key={p.mode}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{p.mode}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{p.amount}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af', width: 36, textAlign: 'right' }}>{p.pct}%</span>
                  </div>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: p.color, borderRadius: 4, width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
