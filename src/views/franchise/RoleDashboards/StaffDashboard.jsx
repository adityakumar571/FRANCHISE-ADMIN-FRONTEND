/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Package, AlertTriangle, ClipboardList,
  IndianRupee, Pill, Search, ArrowRight, Activity,
  CheckCircle2, Zap, Target, TrendingUp, Bell, RefreshCw,
} from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import './dashboard.animations.css'

const getUser     = () => { try { return JSON.parse(localStorage.getItem('franchise_user')    || '{}') } catch { return {} } }
const getFranchise= () => { try { return JSON.parse(localStorage.getItem('franchise_context') || '{}') } catch { return {} } }

const QUICK_ACTIONS = [
  { label:'New Billing',     to:'/franchise/pos/billing',       color:'#0c3b73', icon:ShoppingCart },
  { label:'Barcode Scan',    to:'/franchise/pos/barcode-scan',  color:'#7c3aed', icon:Activity     },
  { label:'Return Bill',     to:'/franchise/pos/return-bill',   color:'#dc2626', icon:ClipboardList},
  { label:'Medicine Search', to:'/franchise/medicines',         color:'#16a34a', icon:Search       },
  { label:'Stock Check',     to:'/franchise/inventory/stock',   color:'#d97706', icon:Package      },
  { label:'Day Closing',     to:'/franchise/pos/day-closing',   color:'#0891b2', icon:CheckCircle2 },
]

const MODE_COLOR = { Cash:'#16a34a', UPI:'#7c3aed', Card:'#2563eb' }
const PRIORITY   = { high:{ color:'#dc2626', bg:'#fee2e2' }, medium:{ color:'#d97706', bg:'#fef3c7' }, low:{ color:'#6b7280', bg:'#f3f4f6' } }

const Th = ({ c }) => <th style={{ padding:'10px 14px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', background:'#f8fafc', borderBottom:'1px solid #e5e7eb', textAlign:'left', whiteSpace:'nowrap' }}>{c}</th>
const Td = ({ children, s={} }) => <td style={{ padding:'12px 14px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', verticalAlign:'middle', ...s }}>{children}</td>
const Skel = ({ h=14, w='100%' }) => <div style={{ height:h, width:w, background:'#f3f4f6', borderRadius:4 }} />

export default function StaffDashboard() {
  const navigate  = useNavigate()
  const user      = getUser()
  const franchise = getFranchise()
  const now       = new Date()
  const greeting  = now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening'

  const [loading, setLoading]     = useState(true)
  const [refreshKey, setRefresh]  = useState(0)
  const [kpis, setKpis]           = useState([])
  const [bills, setBills]         = useState([])
  const [lowStock, setLowStock]   = useState([])
  const [tasks, setTasks]         = useState([
    { task:'Morning stock count',           done:false, time:'08:30 AM', priority:'high'   },
    { task:'Near-expiry items segregation', done:false, time:'09:00 AM', priority:'high'   },
    { task:'Receive GRN',                   done:false, time:'11:00 AM', priority:'high'   },
    { task:'Cold chain temperature log',    done:false, time:'12:00 PM', priority:'medium' },
    { task:'Evening cashier handover',      done:false, time:'06:00 PM', priority:'low'    },
  ])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [summaryRes, stockRes, salesRes] = await Promise.allSettled([
        getRequest('/franchise/dashboard/summary'),
        getRequest('/franchise/inventory/low-stock?limit=5'),
        getRequest('/franchise/sales/recent?limit=7'),
      ])

      if (summaryRes.status === 'fulfilled') {
        const d = summaryRes.value.data?.data
        setKpis([
          { label:'Bills Today',     value: String(d?.totalOrders?.count ?? '—'),                       color:'#0c3b73', grad:'linear-gradient(135deg,#0c3b73,#1e40af)', icon:ShoppingCart, sub:'Today' },
          { label:'Sales Amount',    value:`₹${Number(d?.todaySales?.amount||0).toLocaleString('en-IN')}`, color:'#16a34a', grad:'linear-gradient(135deg,#16a34a,#15803d)', icon:IndianRupee,  sub:'Today' },
          { label:'Low Stock Items', value: String(d?.lowStockItems?.count ?? '—'),                     color:'#d97706', grad:'linear-gradient(135deg,#d97706,#b45309)', icon:AlertTriangle, sub:'Need reorder' },
          { label:'Stock Value',     value:`₹${Number(d?.stockValue?.amount||0).toLocaleString('en-IN')}`, color:'#7c3aed', grad:'linear-gradient(135deg,#7c3aed,#6d28d9)', icon:Package,     sub:'Total' },
        ])
      }

      if (stockRes.status === 'fulfilled') {
        const items = stockRes.value.data?.data || []
        setLowStock(Array.isArray(items) ? items : [])
      }

      if (salesRes.status === 'fulfilled') {
        const list = salesRes.value.data?.data || []
        setBills(Array.isArray(list) ? list : [])
      }
    } catch {
      toast.error('Failed to load staff dashboard')
    } finally {
      setLoading(false)
    }
  }, [refreshKey])

  useEffect(() => { fetchAll() }, [fetchAll])

  const toggleTask  = (i) => setTasks(p => p.map((t, idx) => idx === i ? { ...t, done: !t.done } : t))
  const done        = tasks.filter(t => t.done).length
  const pct         = Math.round((done / tasks.length) * 100)

  return (
    <div className="dash-page" style={{ fontFamily:'Inter,sans-serif', display:'flex', flexDirection:'column', gap:20 }}>

      {/* HERO */}
      <div className="hero-banner" style={{ background:'linear-gradient(135deg,#0c3b73 0%,#1e40af 60%,#312e81 100%)', borderRadius:18, padding:'24px 28px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div className="avatar-float" style={{ width:58, height:58, borderRadius:16, background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)', border:'2px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:800, flexShrink:0 }}>
            {(user.name||'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
              <Zap size={13} color="#fabf22" />
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.6)', fontWeight:600, letterSpacing:1 }}>STAFF PORTAL</span>
            </div>
            <h1 style={{ fontSize:21, fontWeight:800, margin:0 }}>
              Good {greeting}, {user.name?.split(' ')[0] || 'Staff'} 👋
            </h1>
            <p style={{ margin:'4px 0 0', fontSize:13, opacity:0.7 }}>
              {franchise.franchiseName || 'MediKart'} · {now.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
            </p>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ background:'rgba(255,255,255,0.12)', backdropFilter:'blur(6px)', borderRadius:14, padding:'12px 20px', border:'1px solid rgba(255,255,255,0.18)', minWidth:120 }}>
            <p style={{ margin:0, fontSize:22, fontWeight:800 }}>{done}/{tasks.length}</p>
            <p style={{ margin:'2px 0 0', fontSize:11, opacity:0.7 }}>Tasks Done</p>
            <div style={{ height:4, background:'rgba(255,255,255,0.2)', borderRadius:4, marginTop:6 }}>
              <div style={{ height:'100%', width:`${pct}%`, background:'#4ade80', borderRadius:4, transition:'width 0.8s ease' }} />
            </div>
          </div>
          <button onClick={() => navigate('/franchise/pos/billing')}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'14px 22px', borderRadius:12, border:'2px solid rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>
            <ShoppingCart size={17}/> New Sale
          </button>
          <button onClick={() => setRefresh(k=>k+1)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.25)', background:'rgba(255,255,255,0.12)', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            <RefreshCw size={13}/> Refresh
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="dash-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12 }}>
        {loading
          ? Array(4).fill(0).map((_,i) => <div key={i} style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:'18px', height:110 }}><Skel h={12} w="60%" /></div>)
          : kpis.map(k => (
            <div key={k.label} className="kpi-card dash-card"
              style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:'18px 18px 14px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:k.grad }} />
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ width:42, height:42, borderRadius:11, background:k.grad, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${k.color}44` }}>
                  <k.icon size={19} color="#fff"/>
                </div>
                <span style={{ fontSize:10, color:k.color, fontWeight:700, background:k.color+'12', padding:'3px 8px', borderRadius:8 }}>{k.sub}</span>
              </div>
              <p style={{ margin:0, fontSize:11, color:'#6b7280', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.6px' }}>{k.label}</p>
              <p style={{ margin:'5px 0 0', fontSize:24, fontWeight:800, color:k.color, lineHeight:1 }}>{k.value}</p>
            </div>
          ))
        }
      </div>

      {/* MAIN GRID */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16, alignItems:'start' }}>

        {/* Bills table */}
        <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(90deg,#f8faff,#fff)' }}>
            <div>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#111827' }}>Recent Bills</p>
              <p style={{ margin:'2px 0 0', fontSize:12, color:'#6b7280' }}>
                {loading ? '...' : `${bills.length} transactions`}
              </p>
            </div>
            <button onClick={()=>navigate('/franchise/pos/billing')} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'#0c3b73', background:'#e0e7ff', border:'none', padding:'7px 14px', borderRadius:8, cursor:'pointer' }}>
              New Sale <ArrowRight size={13}/>
            </button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="dash-table" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr><Th c="Invoice"/><Th c="Customer"/><Th c="Amount"/><Th c="Mode"/><Th c="Date"/></tr></thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_,i) => <tr key={i}><td colSpan={5} style={{ padding:'12px 14px' }}><Skel h={12} /></td></tr>)
                  : bills.length === 0
                    ? <tr><td colSpan={5} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No recent bills</td></tr>
                    : bills.map((b,i) => (
                      <tr key={b._id||i}
                        onMouseEnter={e=>e.currentTarget.style.background='#f8faff'}
                        onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <Td s={{fontFamily:'monospace',fontSize:11,color:'#0c3b73',fontWeight:700}}>{b.invoiceNo||b.no}</Td>
                        <Td s={{fontWeight:600}}>{b.customerName||b.customer||'Walk-in'}</Td>
                        <Td s={{fontWeight:800,color:'#0c3b73'}}>₹{Number(b.netAmount||b.net||b.amount||0).toLocaleString('en-IN')}</Td>
                        <Td>
                          <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:(MODE_COLOR[b.paymentMode||b.mode]||'#6b7280')+'18', color:MODE_COLOR[b.paymentMode||b.mode]||'#6b7280' }}>
                            {b.paymentMode||b.mode||'Cash'}
                          </span>
                        </Td>
                        <Td s={{fontSize:11,color:'#9ca3af'}}>{b.date||b.createdAt?.split('T')[0]}</Td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Tasks */}
          <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'13px 16px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(90deg,#f8faff,#fff)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Target size={15} color="#0c3b73"/>
                <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#111827' }}>Today's Tasks</p>
              </div>
              <span style={{ fontSize:13, fontWeight:800, color:pct===100?'#16a34a':'#0c3b73', background:pct===100?'#dcfce7':'#e0e7ff', padding:'3px 10px', borderRadius:20 }}>{pct}%</span>
            </div>
            <div style={{ height:5, background:'#f3f4f6' }}>
              <div style={{ height:'100%', background:`linear-gradient(90deg,#0c3b73,#16a34a)`, width:`${pct}%`, transition:'width 0.8s ease', borderRadius:4 }} />
            </div>
            <div style={{ padding:'4px 0' }}>
              {tasks.map((t, i) => {
                const pr = PRIORITY[t.priority]
                return (
                  <div key={i} onClick={()=>toggleTask(i)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderBottom:i<tasks.length-1?'1px solid #f9fafb':'none', cursor:'pointer', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#f8faff'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${t.done?'#16a34a':'#d1d5db'}`, background:t.done?'#16a34a':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                      {t.done && <span style={{ color:'#fff', fontSize:12, lineHeight:1 }}>✓</span>}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ margin:0, fontSize:12, fontWeight:t.done?400:600, color:t.done?'#9ca3af':'#111827', textDecoration:t.done?'line-through':'none', transition:'all .2s' }}>{t.task}</p>
                      <p style={{ margin:'1px 0 0', fontSize:10, color:'#9ca3af' }}>{t.time}</p>
                    </div>
                    <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:8, background:pr.bg, color:pr.color, textTransform:'uppercase' }}>{t.priority}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Low Stock */}
          <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'13px 16px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:8, background:'linear-gradient(90deg,#fff7ed,#fff)' }}>
              <AlertTriangle size={15} color="#d97706"/>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#111827' }}>Low Stock Alert</p>
              {!loading && <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, background:'#fee2e2', color:'#dc2626', padding:'2px 8px', borderRadius:8 }}>{lowStock.length} items</span>}
            </div>
            {loading
              ? Array(3).fill(0).map((_,i) => <div key={i} style={{ padding:'11px 16px', borderBottom:'1px solid #f9fafb' }}><Skel h={12} /></div>)
              : lowStock.length === 0
                ? <div style={{ padding:20, textAlign:'center', color:'#9ca3af', fontSize:12 }}>No low stock items 🎉</div>
                : lowStock.map((s, i) => {
                  const pct2 = Math.round(((s.stock||s.qty||0) / (s.reorderLevel||s.max||100)) * 100)
                  const color = pct2 <= 10 ? '#dc2626' : '#d97706'
                  return (
                    <div key={i} style={{ padding:'11px 16px', borderBottom:i<lowStock.length-1?'1px solid #f9fafb':'none' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:'#111827' }}>{s.name||s.medicineName}</span>
                        <span style={{ fontSize:12, fontWeight:800, color }}>{s.stock||s.qty||0} strips</span>
                      </div>
                      <div style={{ height:5, background:'#f3f4f6', borderRadius:4, overflow:'hidden' }}>
                        <div style={{ height:'100%', background:color, borderRadius:4, width:`${Math.min(pct2,100)}%` }} />
                      </div>
                    </div>
                  )
                })
            }
            <div style={{ padding:'11px 16px' }}>
              <button onClick={()=>navigate('/franchise/inventory/stock')} className="action-btn"
                style={{ width:'100%', padding:'9px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', fontSize:12, fontWeight:700, color:'#0c3b73', cursor:'pointer' }}>
                Manage Stock →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'18px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <Zap size={16} color="#0c3b73"/>
          <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#111827' }}>Quick Actions</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10 }}>
          {QUICK_ACTIONS.map(a => (
            <button key={a.label} className="action-btn" onClick={()=>navigate(a.to)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 14px', border:`1px solid ${a.color}18`, borderRadius:12, background:`${a.color}08`, cursor:'pointer', transition:'all .18s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background=a.color+'18'; e.currentTarget.style.borderColor=a.color+'44' }}
              onMouseLeave={e=>{ e.currentTarget.style.background=a.color+'08'; e.currentTarget.style.borderColor=a.color+'18' }}>
              <div style={{ width:36, height:36, borderRadius:9, background:a.color+'20', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <a.icon size={16} color={a.color}/>
              </div>
              <span style={{ fontSize:12, fontWeight:700, color:a.color }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
