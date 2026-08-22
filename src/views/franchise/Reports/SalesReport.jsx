/* eslint-disable prettier/prettier */
/**
 * SalesReport — Franchise Daily/Period Sales Report
 */
import { useState } from 'react'
import { FileText, Download, TrendingUp, IndianRupee, ShoppingCart, RotateCcw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

const MOCK_SALES = [
  { inv: 'SI-0048', date: '22 Aug 2026', time: '10:30 AM', customer: 'Rahul Sharma', items: 4, gross: '₹1,250', disc: '₹50', net: '₹1,200', payment: 'UPI', cashier: 'Neha G.' },
  { inv: 'SI-0047', date: '22 Aug 2026', time: '10:15 AM', customer: 'Walk-in', items: 2, gross: '₹480', disc: '₹0', net: '₹480', payment: 'Cash', cashier: 'Neha G.' },
  { inv: 'SI-0046', date: '22 Aug 2026', time: '09:55 AM', customer: 'Priya Mehta', items: 6, gross: '₹2,100', disc: '₹100', net: '₹2,000', payment: 'Card', cashier: 'Neha G.' },
  { inv: 'SI-0045', date: '22 Aug 2026', time: '09:30 AM', customer: 'Walk-in', items: 1, gross: '₹320', disc: '₹0', net: '₹320', payment: 'Cash', cashier: 'Amit K.' },
  { inv: 'SI-0044', date: '21 Aug 2026', time: '05:45 PM', customer: 'Anita Joshi', items: 3, gross: '₹890', disc: '₹40', net: '₹850', payment: 'UPI', cashier: 'Neha G.' },
  { inv: 'SI-0043', date: '21 Aug 2026', time: '03:20 PM', customer: 'Walk-in', items: 5, gross: '₹1,650', disc: '₹0', net: '₹1,650', payment: 'Cash', cashier: 'Amit K.' },
]

const payColors = { Cash: '#16a34a', UPI: '#7c3aed', Card: '#0891b2' }

const SalesReport = () => {
  const [from, setFrom] = useState('2026-08-22')
  const [to, setTo] = useState('2026-08-22')

  const kpis = [
    { label: 'Total Sales', value: '₹48,650', sub: '24 invoices', icon: IndianRupee, color: '#0c3b73' },
    { label: 'Sales Returns', value: '₹1,250', sub: '3 returns', icon: RotateCcw, color: '#dc2626' },
    { label: 'Net Sales', value: '₹47,400', sub: 'After returns', icon: TrendingUp, color: '#16a34a' },
    { label: 'Avg Invoice', value: '₹1,975', sub: 'Per transaction', icon: ShoppingCart, color: '#7c3aed' },
  ]

  const columns = [
    { title: 'Invoice', key: 'inv', render: v => <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0c3b73', fontWeight: 600 }}>{v}</span> },
    { title: 'Date', key: 'date', render: v => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span> },
    { title: 'Time', key: 'time', render: v => <span style={{ fontSize: 12, color: '#9ca3af' }}>{v}</span> },
    { title: 'Customer', key: 'customer' },
    { title: 'Items', key: 'items', align: 'center' },
    { title: 'Gross', key: 'gross', align: 'right' },
    { title: 'Discount', key: 'disc', align: 'right', render: v => <span style={{ color: '#dc2626' }}>{v}</span> },
    { title: 'Net Amount', key: 'net', align: 'right', render: v => <strong style={{ color: '#111827' }}>{v}</strong> },
    {
      title: 'Payment', key: 'payment', render: v => (
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: (payColors[v] || '#6b7280') + '18', color: payColors[v] || '#6b7280' }}>{v}</span>
      )
    },
    { title: 'Cashier', key: 'cashier', render: v => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span> },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={FileText} title="Sales Report" subtitle="Daily and period-wise sales analysis" color="#0c3b73">
        <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <Download size={14} /> Export
        </button>
      </PageHeader>

      {/* Date Filter */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {[{ label: 'From Date', val: from, set: setFrom }, { label: 'To Date', val: to, set: setTo }].map(({ label, val, set }) => (
          <div key={label}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>
            <input type="date" value={val} onChange={e => set(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }} />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6 }}>
          {['Today', 'Yesterday', 'Last 7 Days', 'This Month'].map(q => (
            <button key={q} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 12, cursor: 'pointer', color: '#374151' }}>{q}</button>
          ))}
        </div>
        <button style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>Apply</button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ flex: '1 1 160px', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: k.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <k.icon size={18} color={k.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{k.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: k.color }}>{k.value}</p>
              <p style={{ margin: '1px 0 0', fontSize: 11, color: '#9ca3af' }}>{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Mode Summary */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '16px 20px' }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>Payment Mode Breakdown</h4>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[{ mode: 'Cash', amt: '₹22,500', pct: 46 }, { mode: 'UPI', amt: '₹18,900', pct: 39 }, { mode: 'Card', amt: '₹7,250', pct: 15 }].map(p => (
            <div key={p.mode} style={{ flex: '1 1 140px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{p.mode}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: payColors[p.mode] }}>{p.amt}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${p.pct}%`, background: payColors[p.mode], borderRadius: 3 }} />
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9ca3af' }}>{p.pct}%</p>
            </div>
          ))}
        </div>
      </div>

      <DataTable columns={columns} data={MOCK_SALES} total={MOCK_SALES.length} page={1} limit={20} />
    </div>
  )
}

export default SalesReport
