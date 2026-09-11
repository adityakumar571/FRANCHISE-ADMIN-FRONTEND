/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Truck, Package, IndianRupee, Clock, CheckCircle2, AlertCircle,
  FileText, ArrowRight, Download, Eye, ShoppingCart, RefreshCw,
} from 'lucide-react'
import { getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const getUser     = () => { try { return JSON.parse(localStorage.getItem('franchise_user')    || '{}') } catch { return {} } }
const getFranchise= () => { try { return JSON.parse(localStorage.getItem('franchise_context') || '{}') } catch { return {} } }

const STATUS_CFG = {
  Pending:    { color:'#d97706', bg:'#fef3c7', border:'#fde68a' },
  Accepted:   { color:'#16a34a', bg:'#dcfce7', border:'#bbf7d0' },
  Dispatched: { color:'#2563eb', bg:'#dbeafe', border:'#bfdbfe' },
  Delivered:  { color:'#16a34a', bg:'#dcfce7', border:'#bbf7d0' },
  Cancelled:  { color:'#dc2626', bg:'#fee2e2', border:'#fecaca' },
  Confirmed:  { color:'#16a34a', bg:'#dcfce7', border:'#bbf7d0' },
  Overdue:    { color:'#dc2626', bg:'#fee2e2', border:'#fecaca' },
  Due:        { color:'#d97706', bg:'#fef3c7', border:'#fde68a' },
  Paid:       { color:'#16a34a', bg:'#dcfce7', border:'#bbf7d0' },
}
const Badge = ({ status }) => {
  const c = STATUS_CFG[status] || { color:'#6b7280', bg:'#f3f4f6', border:'#e5e7eb' }
  return <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>{status}</span>
}
const Th  = ({ c }) => <th style={{ padding:'9px 14px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', textAlign:'left', whiteSpace:'nowrap' }}>{c}</th>
const Td  = ({ children, style={} }) => <td style={{ padding:'11px 14px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', verticalAlign:'middle', ...style }}>{children}</td>
const Skel = ({ h=14, w='100%' }) => <div style={{ height:h, width:w, background:'#f3f4f6', borderRadius:4 }} />

export default function VendorDashboard() {
  const navigate  = useNavigate()
  const user      = getUser()
  const franchise = getFranchise()

  const [loading, setLoading]   = useState(true)
  const [refreshKey, setRefresh] = useState(0)
  const [activeTab, setTab]     = useState('orders')
  const [selected, setSelected] = useState(null)

  const [kpis, setKpis]           = useState([])
  const [orders, setOrders]       = useState([])
  const [invoices, setInvoices]   = useState([])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest('/franchise/b2b-orders?limit=20')
      const d   = res.data?.data

      const list = d?.orders || []
      setOrders(list)

      // Build KPIs from order list
      const total     = d?.total || list.length
      const delivered = list.filter(o => o.orderStatus === 'Delivered').length
      const inTransit = list.filter(o => o.orderStatus === 'Dispatched' || o.orderStatus === 'Shipped').length
      const pending   = list.filter(o => o.orderStatus === 'Pending').length
      const revenue   = list.filter(o => o.paymentStatus === 'Paid').reduce((s,o) => s+(o.amount||0), 0)
      const outstanding = list.filter(o => o.paymentStatus !== 'Paid').reduce((s,o) => s+(o.amount||0), 0)

      setKpis([
        { label:'Total Orders',     value: String(total),                                              color:'#0c3b73', icon:ShoppingCart },
        { label:'Pending Dispatch', value: String(pending + inTransit),                               color:'#d97706', icon:Clock        },
        { label:'Revenue (Paid)',   value:`₹${revenue.toLocaleString('en-IN')}`,                      color:'#16a34a', icon:IndianRupee  },
        { label:'Outstanding Due',  value:`₹${outstanding.toLocaleString('en-IN')}`,                  color:'#dc2626', icon:AlertCircle  },
      ])

      // Due invoices = unpaid orders
      const dueList = list
        .filter(o => o.paymentStatus && o.paymentStatus !== 'Paid')
        .map((o,idx) => ({
          _id:        o._id,
          id:         o.orderId,
          franchise:  o.supplier || franchise.franchiseName || '—',
          amount:     o.amount   || 0,
          due:        o.expectedDelivery || o.date || '—',
          status:     o.paymentStatus || 'Due',
          daysLeft:   idx % 3 === 0 ? -2 : idx * 3 + 1,  // placeholder until backend provides due date
        }))
      setInvoices(dueList)

    } catch {
      toast.error('Failed to load vendor dashboard')
    } finally {
      setLoading(false)
    }
  }, [refreshKey])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await putRequest({ url:`/franchise/b2b-orders/${id}/status`, cred:{ orderStatus: newStatus } })
      toast.success('Status updated')
      setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: newStatus } : o))
      if (selected?._id === id) setSelected(p => ({ ...p, orderStatus: newStatus }))
    } catch {
      toast.error('Failed to update status')
    }
  }

  const TABS = [
    { key:'orders',   label:'Orders',       icon:ShoppingCart },
    { key:'invoices', label:'Due Invoices',  icon:FileText },
  ]

  return (
    <div style={{ fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column', gap:18 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#111827', margin:0 }}>Vendor / Supplier Portal</h1>
          <p style={{ fontSize:13, color:'#9ca3af', margin:'3px 0 0' }}>
            {user.name||'Vendor'} · {franchise.franchiseName||'MediKart'} · {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setRefresh(k=>k+1)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', fontSize:12, fontWeight:600, color:'#374151', cursor:'pointer' }}>
            <RefreshCw size={13}/> Refresh
          </button>
          <button onClick={() => navigate('/franchise/b2b-orders')}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', fontSize:13, fontWeight:600, color:'#374151', cursor:'pointer' }}>
            <ShoppingCart size={14}/> All Orders
          </button>
          <button style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:8, border:'none', background:'#0c3b73', fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer' }}>
            <Download size={14}/> Export
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
        {loading
          ? Array(4).fill(0).map((_,i) => <div key={i} style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', padding:'16px 18px', height:90 }}><Skel h={12} w="60%" /></div>)
          : kpis.map(k => (
            <div key={k.label} style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', padding:'16px 18px' }}>
              <div style={{ width:38, height:38, borderRadius:9, background:k.color+'18', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                <k.icon size={17} color={k.color}/>
              </div>
              <p style={{ margin:0, fontSize:11, color:'#6b7280', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>{k.label}</p>
              <p style={{ margin:'4px 0 0', fontSize:22, fontWeight:800, color:k.color }}>{k.value}</p>
            </div>
          ))
        }
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:5, alignSelf:'flex-start' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setTab(tab.key)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:7, border:'none', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .15s',
              background: activeTab===tab.key ? '#0c3b73' : 'transparent',
              color:      activeTab===tab.key ? '#fff'    : '#6b7280',
            }}>
            <tab.icon size={14}/> {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab==='orders' && (
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#111827' }}>Recent B2B Orders</p>
            <button onClick={() => navigate('/franchise/b2b-orders')} style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, fontWeight:600, color:'#0c3b73', background:'none', border:'none', cursor:'pointer' }}>
              View All <ArrowRight size={12}/>
            </button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr><Th c="Order ID"/><Th c="Supplier"/><Th c="Items"/><Th c="Amount"/><Th c="Status"/><Th c="Date"/><Th c="Payment"/><Th c="Action"/></tr></thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_,i) => <tr key={i}>{Array(8).fill(0).map((_,j) => <td key={j} style={{ padding:'11px 14px' }}><Skel h={12} /></td>)}</tr>)
                  : orders.length === 0
                    ? <tr><td colSpan={8} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No orders found</td></tr>
                    : orders.map(o => (
                      <tr key={o._id} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <Td style={{fontFamily:'monospace',fontSize:11,color:'#0c3b73',fontWeight:600}}>{o.orderId}</Td>
                        <Td style={{fontWeight:600}}>{o.supplier||'—'}</Td>
                        <Td style={{textAlign:'center'}}>{o.items||o.itemCount||'—'}</Td>
                        <Td style={{fontWeight:700,color:'#0c3b73'}}>₹{Number(o.amount||0).toLocaleString('en-IN')}</Td>
                        <Td><Badge status={o.orderStatus||'Pending'}/></Td>
                        <Td style={{fontSize:12,color:'#6b7280'}}>{o.date||o.createdAt?.split('T')[0]}</Td>
                        <Td><Badge status={o.paymentStatus||'—'}/></Td>
                        <Td>
                          <button onClick={() => setSelected(o)}
                            style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 10px', border:'1px solid #e5e7eb', borderRadius:6, background:'#f9fafb', cursor:'pointer', fontSize:11, fontWeight:600, color:'#374151' }}>
                            <Eye size={11}/> View
                          </button>
                        </Td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab==='invoices' && (
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#111827' }}>Due Invoices</p>
              {!loading && <p style={{ margin:'2px 0 0', fontSize:12, color:'#dc2626', fontWeight:600 }}>
                Total Outstanding: ₹{invoices.reduce((s,i)=>s+i.amount,0).toLocaleString('en-IN')}
              </p>}
            </div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr><Th c="Invoice ID"/><Th c="Franchise"/><Th c="Amount"/><Th c="Due Date"/><Th c="Days"/><Th c="Status"/><Th c="Action"/></tr></thead>
              <tbody>
                {loading
                  ? Array(3).fill(0).map((_,i) => <tr key={i}>{Array(7).fill(0).map((_,j) => <td key={j} style={{ padding:'11px 14px' }}><Skel h={12} /></td>)}</tr>)
                  : invoices.length === 0
                    ? <tr><td colSpan={7} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No due invoices</td></tr>
                    : invoices.map(inv => (
                      <tr key={inv._id} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <Td style={{fontFamily:'monospace',fontSize:11,color:'#0c3b73',fontWeight:600}}>{inv.id}</Td>
                        <Td style={{fontWeight:600}}>{inv.franchise}</Td>
                        <Td style={{fontWeight:700,color:'#dc2626'}}>₹{Number(inv.amount).toLocaleString('en-IN')}</Td>
                        <Td style={{fontSize:12,color:'#6b7280'}}>{inv.due}</Td>
                        <Td>
                          <span style={{ fontSize:12, fontWeight:700, color: inv.daysLeft < 0 ? '#dc2626' : inv.daysLeft <= 7 ? '#d97706' : '#16a34a' }}>
                            {inv.daysLeft < 0 ? `${Math.abs(inv.daysLeft)}d overdue` : `${inv.daysLeft}d left`}
                          </span>
                        </Td>
                        <Td><Badge status={inv.status}/></Td>
                        <Td>
                          <button style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 10px', border:'none', borderRadius:6, background:'#0c3b73', cursor:'pointer', fontSize:11, fontWeight:600, color:'#fff' }}>
                            Remind
                          </button>
                        </Td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:14, padding:24, width:520, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>Order: {selected.orderId}</h3>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', fontSize:18 }}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              {[
                ['Supplier',        selected.supplier||'—'],
                ['Date',            selected.date||selected.createdAt?.split('T')[0]||'—'],
                ['Order Status',    selected.orderStatus||'—'],
                ['Payment Status',  selected.paymentStatus||'—'],
                ['Total Items',     selected.items||selected.itemCount||'—'],
                ['Amount',         `₹${Number(selected.amount||0).toLocaleString('en-IN')}`],
              ].map(([l,v]) => (
                <div key={l} style={{ background:'#f9fafb', borderRadius:8, padding:'10px 12px' }}>
                  <p style={{ margin:'0 0 2px', fontSize:10, color:'#9ca3af', textTransform:'uppercase', fontWeight:600 }}>{l}</p>
                  <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#111827' }}>{v}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:14 }}>
              <p style={{ margin:'0 0 10px', fontSize:13, fontWeight:600, color:'#374151' }}>Update Status:</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {['Confirmed','Dispatched','Delivered','Cancelled'].map(st => (
                  <button key={st} onClick={() => handleStatusUpdate(selected._id, st)}
                    style={{ padding:'6px 14px', borderRadius:7, border:`1px solid ${STATUS_CFG[st]?.color||'#e5e7eb'}`, background: selected.orderStatus===st ? STATUS_CFG[st]?.bg : '#fff', color: STATUS_CFG[st]?.color||'#374151', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
