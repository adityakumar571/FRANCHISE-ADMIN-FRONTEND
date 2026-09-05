/* eslint-disable prettier/prettier */
/**
 * VendorDashboard — for users with role: "Vendor" (Supplier representative)
 * Shows: Orders received, payment status, dispatch listing, due invoices
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Truck, Package, IndianRupee, Clock, CheckCircle2, AlertCircle,
  FileText, ArrowRight, TrendingUp, BarChart2, Download, Eye,
  ShoppingCart, XCircle,
} from 'lucide-react'

const user = (() => { try { return JSON.parse(localStorage.getItem('franchise_user') || '{}') } catch { return {} } })()
const franchise = (() => { try { return JSON.parse(localStorage.getItem('franchise_context') || '{}') } catch { return {} } })()

/* ── Mock Data ── */
const KPIS = [
  { label: 'Total Orders',      value: '48',       color: '#0c3b73', icon: ShoppingCart },
  { label: 'Pending Dispatch',  value: '12',       color: '#d97706', icon: Clock },
  { label: 'Revenue (Month)',   value: '₹3,84,500', color: '#16a34a', icon: IndianRupee },
  { label: 'Outstanding Due',   value: '₹42,000',  color: '#dc2626', icon: AlertCircle },
]

const ORDERS = [
  { id: 'ORD-4521', franchise: 'MediKart — Counter B', items: 18, amount: 24500, status: 'Pending',    date: '22 Aug', payment: 'Due' },
  { id: 'ORD-4520', franchise: 'MediKart — Counter A', items: 12, amount: 18200, status: 'Accepted',   date: '22 Aug', payment: 'Paid' },
  { id: 'ORD-4519', franchise: 'City Pharma',          items: 30, amount: 48600, status: 'Dispatched', date: '21 Aug', payment: 'Paid' },
  { id: 'ORD-4518', franchise: 'Apollo Medical',       items: 8,  amount: 12400, status: 'Delivered',  date: '20 Aug', payment: 'Paid' },
  { id: 'ORD-4517', franchise: 'MedPlus Store',        items: 24, amount: 38000, status: 'Delivered',  date: '19 Aug', payment: 'Due' },
  { id: 'ORD-4516', franchise: 'HealthZone',           items: 15, amount: 21500, status: 'Cancelled',  date: '18 Aug', payment: '—' },
  { id: 'ORD-4515', franchise: 'CureMed Pharmacy',     items: 20, amount: 31200, status: 'Delivered',  date: '17 Aug', payment: 'Paid' },
]

const INVOICES = [
  { id: 'INV-VD-001', franchise: 'MediKart',      amount: 24500, due: '25 Aug 2026', status: 'Overdue',  daysLeft: -2 },
  { id: 'INV-VD-002', franchise: 'City Pharma',   amount: 17500, due: '28 Aug 2026', status: 'Due',      daysLeft: 6  },
  { id: 'INV-VD-003', franchise: 'Apollo Medical', amount: 12400, due: '30 Aug 2026', status: 'Due',      daysLeft: 8  },
  { id: 'INV-VD-004', franchise: 'MedPlus Store',  amount: 38000, due: '01 Sep 2026', status: 'Due',      daysLeft: 10 },
]

const STATUS_CFG = {
  Pending:    { color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  Accepted:   { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
  Dispatched: { color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe' },
  Delivered:  { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
  Cancelled:  { color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
  Overdue:    { color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
  Due:        { color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  Paid:       { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
}
const Badge = ({ status }) => {
  const c = STATUS_CFG[status] || { color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' }
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{status}</span>
}
const Th = ({ c }) => <th style={{ padding: '9px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '11px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>

export default function VendorDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('orders')

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>
            Vendor / Supplier Portal
          </h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '3px 0 0' }}>
            {user.name || 'Vendor'} · {franchise.franchiseName || 'MediKart'} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/franchise/b2b-orders')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <ShoppingCart size={14} /> All Orders
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {KPIS.map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 18px' }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: k.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <k.icon size={17} color={k.color} />
            </div>
            <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 5, alignSelf: 'flex-start' }}>
        {[
          { key: 'orders',   label: 'Orders',         icon: ShoppingCart },
          { key: 'invoices', label: 'Due Invoices',   icon: FileText },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
              background: activeTab === tab.key ? '#0c3b73' : 'transparent',
              color:      activeTab === tab.key ? '#fff'    : '#6b7280',
            }}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Recent B2B Orders</p>
            <button onClick={() => navigate('/franchise/b2b-orders')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#0c3b73', background: 'none', border: 'none', cursor: 'pointer' }}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><Th c="Order ID" /><Th c="Franchise" /><Th c="Items" /><Th c="Amount" /><Th c="Status" /><Th c="Date" /><Th c="Payment" /><Th c="Action" /></tr></thead>
              <tbody>
                {ORDERS.map(o => (
                  <tr key={o.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td style={{ fontFamily: 'monospace', fontSize: 11, color: '#0c3b73', fontWeight: 600 }}>{o.id}</Td>
                    <Td style={{ fontWeight: 600 }}>{o.franchise}</Td>
                    <Td style={{ textAlign: 'center' }}>{o.items}</Td>
                    <Td style={{ fontWeight: 700, color: '#0c3b73' }}>₹{o.amount.toLocaleString('en-IN')}</Td>
                    <Td><Badge status={o.status} /></Td>
                    <Td style={{ fontSize: 12, color: '#6b7280' }}>{o.date}</Td>
                    <Td>
                      {o.payment !== '—' && <Badge status={o.payment} />}
                      {o.payment === '—' && <span style={{ fontSize: 11, color: '#9ca3af' }}>—</span>}
                    </Td>
                    <Td>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#374151' }}>
                        <Eye size={11} /> View
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Due Invoices</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
                Total Outstanding: ₹{INVOICES.reduce((s, i) => s + i.amount, 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><Th c="Invoice ID" /><Th c="Franchise" /><Th c="Amount" /><Th c="Due Date" /><Th c="Days Left" /><Th c="Status" /><Th c="Action" /></tr></thead>
              <tbody>
                {INVOICES.map(inv => (
                  <tr key={inv.id} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td style={{ fontFamily: 'monospace', fontSize: 11, color: '#0c3b73', fontWeight: 600 }}>{inv.id}</Td>
                    <Td style={{ fontWeight: 600 }}>{inv.franchise}</Td>
                    <Td style={{ fontWeight: 700, color: '#dc2626' }}>₹{inv.amount.toLocaleString('en-IN')}</Td>
                    <Td style={{ fontSize: 12, color: '#6b7280' }}>{inv.due}</Td>
                    <Td>
                      <span style={{ fontSize: 12, fontWeight: 700, color: inv.daysLeft < 0 ? '#dc2626' : inv.daysLeft <= 7 ? '#d97706' : '#16a34a' }}>
                        {inv.daysLeft < 0 ? `${Math.abs(inv.daysLeft)}d overdue` : `${inv.daysLeft}d left`}
                      </span>
                    </Td>
                    <Td><Badge status={inv.status} /></Td>
                    <Td>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: 'none', borderRadius: 6, background: '#0c3b73', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#fff' }}>
                        Remind
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
