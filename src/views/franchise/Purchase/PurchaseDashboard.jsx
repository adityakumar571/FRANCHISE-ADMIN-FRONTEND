/* eslint-disable prettier/prettier */
/**
 * PurchaseDashboard — Open POs, pending inward, supplier dues
 * SOW §12: Purchase & Procurement Workflow
 */
import { useState, useEffect } from 'react'
import { ShoppingCart, Clock, Package, AlertTriangle, TrendingUp, Truck, Plus, ArrowRight } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'

const KpiCard = ({ icon: Icon, label, value, sub, color }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'flex-start', gap: 14, flex: '1 1 180px', minWidth: 160 }}>
    <div style={{ width: 44, height: 44, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 4px', fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  </div>
)

const MOCK_POS = [
  { _id: 'PO-2401', supplier: 'Medico Agencies', items: 12, amount: '₹24,500', status: 'pending', date: '22 Aug 2026' },
  { _id: 'PO-2400', supplier: 'PharmaDist Pvt Ltd', items: 8, amount: '₹18,200', status: 'accepted', date: '21 Aug 2026' },
  { _id: 'PO-2399', supplier: 'SunPharma Dist', items: 5, amount: '₹9,000', status: 'dispatched', date: '20 Aug 2026' },
]

const PurchaseDashboard = () => {
  const navigate = useNavigate()
  const [kpis] = useState({
    openPOs: 3, pendingInward: 2, totalDue: '₹42,700', monthlyPurchase: '₹1,24,500',
  })

  return (
    <div>
      <PageHeader icon={ShoppingCart} title="Purchase Dashboard" subtitle="Monitor purchase orders, inward, and supplier dues" color="#7c3aed">
        <button onClick={() => navigate('/franchise/purchase/orders')} style={primaryBtn}>
          <Plus size={14} /> New Purchase Order
        </button>
      </PageHeader>

      {/* KPIs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <KpiCard icon={ShoppingCart}  label="Open POs"         value={kpis.openPOs}         sub="Awaiting acceptance"  color="#7c3aed" />
        <KpiCard icon={Package}       label="Pending Inward"   value={kpis.pendingInward}   sub="GRN to be created"    color="#d97706" />
        <KpiCard icon={AlertTriangle} label="Total Dues"       value={kpis.totalDue}        sub="Supplier outstanding" color="#e11d48" />
        <KpiCard icon={TrendingUp}    label="This Month"       value={kpis.monthlyPurchase} sub="Total purchases"      color="#16a34a" />
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Live Rate Compare', path: '/franchise/purchase/live-rate', icon: TrendingUp, color: '#0c3b73' },
          { label: 'Create PO', path: '/franchise/purchase/orders', icon: ShoppingCart, color: '#7c3aed' },
          { label: 'GRN / Inward', path: '/franchise/purchase/grn', icon: Package, color: '#16a34a' },
          { label: 'Purchase Returns', path: '/franchise/purchase/returns', icon: ArrowRight, color: '#d97706' },
          { label: 'Supplier Ledger', path: '/franchise/purchase/supplier-ledger', icon: Truck, color: '#0891b2' },
        ].map((a) => (
          <button key={a.label} onClick={() => navigate(a.path)} style={{ padding: '14px 10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = a.color + '08' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff' }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: a.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <a.icon size={17} color={a.color} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', textAlign: 'center', lineHeight: 1.3 }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Recent POs */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Recent Purchase Orders</h3>
          <button onClick={() => navigate('/franchise/purchase/orders')} style={{ background: 'none', border: 'none', color: '#0c3b73', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            View All <ArrowRight size={12} />
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['PO Number', 'Supplier', 'Items', 'Amount', 'Date', 'Status'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_POS.map((po) => (
              <tr key={po._id} style={{ borderTop: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0c3b73' }}>{po._id}</td>
                <td style={{ padding: '10px 14px' }}>{po.supplier}</td>
                <td style={{ padding: '10px 14px', textAlign: 'center' }}>{po.items}</td>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{po.amount}</td>
                <td style={{ padding: '10px 14px', color: '#6b7280' }}>{po.date}</td>
                <td style={{ padding: '10px 14px' }}><StatusBadge status={po.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const primaryBtn = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', borderRadius: 8, border: 'none',
  background: '#0c3b73', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
}

export default PurchaseDashboard
