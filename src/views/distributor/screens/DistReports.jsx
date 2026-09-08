/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { BarChart2, TrendingUp, Package, ShoppingCart, IndianRupee, Download } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const MONTHLY = [
  { month: 'Mar', orders: 42, revenue: 84000, franchises: 18 },
  { month: 'Apr', orders: 58, revenue: 116000, franchises: 20 },
  { month: 'May', orders: 71, revenue: 142000, franchises: 22 },
  { month: 'Jun', orders: 65, revenue: 130000, franchises: 21 },
  { month: 'Jul', orders: 88, revenue: 176000, franchises: 24 },
  { month: 'Aug', orders: 94, revenue: 188000, franchises: 24 },
]

const TOP_MEDICINES = [
  { name: 'Paracetamol 650mg', qty: 8400, revenue: 169680 },
  { name: 'Azithromycin 500mg', qty: 3200, revenue: 230400 },
  { name: 'Metformin 500mg', qty: 6100, revenue: 183000 },
  { name: 'Atorvastatin 10mg', qty: 2800, revenue: 179200 },
  { name: 'Pantoprazole 40mg', qty: 4100, revenue: 373100 },
]

const TOP_FRANCHISES = [
  { name: 'Sharma Medical Store',    orders: 24, revenue: 384000 },
  { name: 'HealthZone Pharmacy',     orders: 18, revenue: 291600 },
  { name: 'City Pharma - Andheri',   orders: 16, revenue: 259200 },
  { name: 'Ganesh Drug House',       orders: 14, revenue: 226800 },
  { name: 'Apollo Pharma - Kothrud', orders: 12, revenue: 194400 },
]

const TABS = ['Overview', 'Top Medicines', 'Top Franchises']
const Th = ({ c, a = 'left' }) => <th style={{ padding: '9px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: a, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function DistReports() {
  const [tab, setTab] = useState('Overview')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={20} color="#fabf22" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Reports & Analytics</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Business performance insights</p>
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total Orders (YTD)',  value: '418',      color: '#0c3b73', icon: ShoppingCart },
          { label: 'Revenue (This Month)',value: '₹8.4L',    color: '#16a34a', icon: IndianRupee  },
          { label: 'Active SKUs',         value: '4,820',    color: '#7c3aed', icon: Package      },
          { label: 'Active Franchises',   value: '24',       color: '#d97706', icon: TrendingUp   },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: k.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={20} color={k.color} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 2px' }}>{k.label}</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '6px 8px', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '7px 16px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === t ? '#0c3b73' : 'transparent', color: tab === t ? '#fff' : '#6b7280' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px' }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Monthly Revenue</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c3b73" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0c3b73" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} width={44} />
                <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: 'none', fontSize: 11 }} />
                <Area type="monotone" dataKey="revenue" stroke="#0c3b73" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px' }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Monthly Orders</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTHLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip formatter={v => [v, 'Orders']} contentStyle={{ borderRadius: 8, border: 'none', fontSize: 11 }} />
                <Bar dataKey="orders" fill="#0c3b73" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Medicines */}
      {tab === 'Top Medicines' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Top 5 Medicines by Revenue</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="#" /><Th c="Medicine Name" /><Th c="Units Sold" a="right" /><Th c="Revenue" a="right" />
            </tr></thead>
            <tbody>
              {TOP_MEDICINES.map((m, i) => (
                <tr key={m.name} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td><span style={{ fontWeight: 700, color: '#9ca3af' }}>{i + 1}</span></Td>
                  <Td style={{ fontWeight: 600 }}>{m.name}</Td>
                  <Td style={{ textAlign: 'right' }}>{m.qty.toLocaleString('en-IN')}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹{m.revenue.toLocaleString('en-IN')}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Top Franchises */}
      {tab === 'Top Franchises' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Top 5 Franchises by Revenue</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="#" /><Th c="Franchise" /><Th c="Orders" a="right" /><Th c="Revenue" a="right" />
            </tr></thead>
            <tbody>
              {TOP_FRANCHISES.map((f, i) => (
                <tr key={f.name} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <Td><span style={{ fontWeight: 700, color: '#9ca3af' }}>{i + 1}</span></Td>
                  <Td style={{ fontWeight: 600 }}>{f.name}</Td>
                  <Td style={{ textAlign: 'right' }}>{f.orders}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>₹{f.revenue.toLocaleString('en-IN')}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
