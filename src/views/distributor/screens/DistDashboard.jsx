/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, ShoppingCart, IndianRupee, TrendingUp, Truck,
  AlertTriangle, CheckCircle2, Clock, Star, ArrowRight, Eye,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const dist = (() => { try { return JSON.parse(localStorage.getItem('distributor_context')||'{}') } catch { return {} } })()

const TREND = [
  { d:'Mon', orders:14, revenue:28400 },{ d:'Tue', orders:22, revenue:44800 },
  { d:'Wed', orders:18, revenue:36500 },{ d:'Thu', orders:31, revenue:62000 },
  { d:'Fri', orders:27, revenue:54200 },{ d:'Sat', orders:19, revenue:38100 },
  { d:'Sun', orders:11, revenue:22300 },
]

const RECENT_ORDERS = [
  { id:'ORD-4521', franchise:'Sharma Medical', items:18, amount:24500, status:'pending',   time:'2h ago'  },
  { id:'ORD-4520', franchise:'City Pharma',    items:12, amount:18200, status:'accepted',  time:'4h ago'  },
  { id:'ORD-4519', franchise:'HealthZone',     items:30, amount:48600, status:'dispatched',time:'6h ago'  },
  { id:'ORD-4518', franchise:'MedPlus Store',  items:8,  amount:12400, status:'completed', time:'1d ago'  },
  { id:'ORD-4517', franchise:'Apollo Pharma',  items:24, amount:38000, status:'completed', time:'1d ago'  },
]

const LOW_STOCK = [
  { name:'Azithromycin 500mg', available:42,  threshold:100 },
  { name:'Pantop DSR 40mg',    available:18,  threshold:80  },
  { name:'Ceftriaxone 1g Inj', available:8,   threshold:50  },
]

const STATUS = {
  pending:   { bg:'#fffbeb', color:'#d97706', label:'Pending'    },
  accepted:  { bg:'#f0fdf4', color:'#16a34a', label:'Accepted'   },
  dispatched:{ bg:'#eff6ff', color:'#2563eb', label:'Dispatched' },
  completed: { bg:'#f0fdf4', color:'#16a34a', label:'Completed'  },
  cancelled: { bg:'#fff1f2', color:'#dc2626', label:'Cancelled'  },
}

const KPI = [
  { label:'Total SKUs',        value:dist.totalSkus||'4,820',    icon:Package,     color:'#0c3b73', bg:'#e0e7ff' },
  { label:"Today's Orders",    value:'31',                        icon:ShoppingCart,color:'#7c3aed', bg:'#f5f3ff', badge:'5 pending' },
  { label:'Revenue (This Month)',value:'₹8.4L',                  icon:IndianRupee, color:'#16a34a', bg:'#dcfce7' },
  { label:'Active Franchises', value:dist.activeFranchises||'24',icon:Truck,       color:'#d97706', bg:'#fef3c7' },
  { label:'Avg Rating',        value:dist.rating||'4.7',         icon:Star,        color:'#f59e0b', bg:'#fffbeb' },
]

const Th = ({c,a='left'}) => <th style={{ padding:'9px 14px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', textAlign:a, whiteSpace:'nowrap' }}>{c}</th>
const Td = ({children,style={}}) => <td style={{ padding:'10px 14px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', verticalAlign:'middle', ...style }}>{children}</td>

export default function DistDashboard() {
  const navigate = useNavigate()

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#111827', margin:0 }}>
            Good morning, {dist.contactPerson?.split(' ')[0] || 'Rajesh'} 👋
          </h1>
          <p style={{ fontSize:13, color:'#9ca3af', margin:'3px 0 0' }}>
            {dist.name} · {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
          </p>
        </div>
        <button onClick={()=>navigate('/distributor/orders')}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', background:'#0c3b73', border:'none', borderRadius:9, color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          View All Orders <ArrowRight size={14}/>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
        {KPI.map(k => (
          <div key={k.label} style={{ background:'#fff', borderRadius:12, padding:'16px 18px', border:'1px solid #e5e7eb' }}
            onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 14px rgba(0,0,0,0.07)'}
            onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ width:38, height:38, borderRadius:9, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <k.icon size={18} color={k.color}/>
              </div>
              {k.badge && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20, background:'#fff1f2', color:'#dc2626' }}>{k.badge}</span>}
            </div>
            <p style={{ fontSize:10, color:'#6b7280', margin:'0 0 4px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px' }}>{k.label}</p>
            <p style={{ fontSize:22, fontWeight:800, color:k.color, margin:0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:14 }}>

        {/* Revenue trend */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'18px 20px' }}>
          <p style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:'#111827' }}>Weekly Revenue Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={TREND} margin={{ top:5, right:5, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0c3b73" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#0c3b73" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="d" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`} width={44}/>
              <Tooltip contentStyle={{ borderRadius:8, border:'none', fontSize:11 }} formatter={v=>[`₹${v.toLocaleString('en-IN')}`,'Revenue']}/>
              <Area type="monotone" dataKey="revenue" stroke="#0c3b73" strokeWidth={2.5} fill="url(#distGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by day */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'18px 20px' }}>
          <p style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:'#111827' }}>Orders This Week</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TREND} margin={{ top:5, right:5, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="d" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:'#9ca3af' }} axisLine={false} tickLine={false} width={28}/>
              <Tooltip contentStyle={{ borderRadius:8, border:'none', fontSize:11 }} formatter={v=>[v,'Orders']}/>
              <Bar dataKey="orders" fill="#0c3b73" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders + Low stock */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:14, alignItems:'start' }}>

        {/* Recent Orders */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#111827' }}>Recent B2B Orders</p>
            <button onClick={()=>navigate('/distributor/orders')} style={{ fontSize:12, fontWeight:600, color:'#0c3b73', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
              View All <ArrowRight size={12}/>
            </button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>
                <Th c="Order ID"/><Th c="Franchise"/><Th c="Items" a="center"/><Th c="Amount" a="right"/><Th c="Status"/><Th c="Time"/><Th c="Action" a="center"/>
              </tr></thead>
              <tbody>
                {RECENT_ORDERS.map(o => {
                  const s = STATUS[o.status]
                  return (
                    <tr key={o.id} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <Td><span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#0c3b73' }}>{o.id}</span></Td>
                      <Td style={{ fontWeight:600 }}>{o.franchise}</Td>
                      <Td style={{ textAlign:'center' }}>{o.items}</Td>
                      <Td style={{ textAlign:'right', fontWeight:700, color:'#0c3b73' }}>₹{o.amount.toLocaleString('en-IN')}</Td>
                      <Td><span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20, background:s.bg, color:s.color }}>{s.label}</span></Td>
                      <Td style={{ fontSize:11, color:'#9ca3af' }}>{o.time}</Td>
                      <Td style={{ textAlign:'center' }}>
                        <button onClick={()=>navigate('/distributor/orders')} style={{ background:'#e0e7ff', border:'none', borderRadius:6, padding:'4px 8px', cursor:'pointer', color:'#0c3b73', display:'flex', alignItems:'center', gap:3, margin:'0 auto', fontSize:11, fontWeight:600 }}>
                          <Eye size={11}/> View
                        </button>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock alert */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:8 }}>
            <AlertTriangle size={15} color="#d97706"/>
            <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#111827' }}>Low Stock Alert</p>
          </div>
          <div style={{ padding:'4px 0' }}>
            {LOW_STOCK.map(m => (
              <div key={m.name} style={{ padding:'12px 18px', borderBottom:'1px solid #f9fafb' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:'#111827' }}>{m.name}</span>
                  <span style={{ fontSize:11, fontWeight:700, color: m.available < 20 ? '#dc2626':'#d97706' }}>{m.available} left</span>
                </div>
                <div style={{ height:5, borderRadius:10, background:'#f3f4f6', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(m.available/m.threshold)*100}%`, background: m.available < 20 ? '#ef4444':'#f59e0b', borderRadius:10, transition:'width 0.3s' }}/>
                </div>
                <p style={{ margin:'4px 0 0', fontSize:10, color:'#9ca3af' }}>Threshold: {m.threshold} units</p>
              </div>
            ))}
          </div>
          <div style={{ padding:'12px 18px' }}>
            <button onClick={()=>navigate('/distributor/stock-pricing')} style={{ width:'100%', padding:'9px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', fontSize:12, fontWeight:600, color:'#0c3b73', cursor:'pointer' }}>
              Manage Stock →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'18px 20px' }}>
        <p style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:'#111827' }}>Quick Actions</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:10 }}>
          {[
            { label:'Accept Orders',   icon:CheckCircle2, color:'#16a34a', bg:'#dcfce7', to:'/distributor/orders'      },
            { label:'Update Pricing',  icon:TrendingUp,   color:'#0c3b73', bg:'#e0e7ff', to:'/distributor/stock-pricing'},
            { label:'Add Scheme',      icon:IndianRupee,  color:'#d97706', bg:'#fef3c7', to:'/distributor/schemes'      },
            { label:'Dispatch Orders', icon:Truck,        color:'#7c3aed', bg:'#f5f3ff', to:'/distributor/dispatch'     },
            { label:'View Reports',    icon:TrendingUp,   color:'#0891b2', bg:'#e0f2fe', to:'/distributor/reports'      },
          ].map(a => (
            <button key={a.label} onClick={()=>navigate(a.to)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', border:'1px solid #f3f4f6', borderRadius:10, background:'#fafafa', cursor:'pointer' }}
              onMouseEnter={e=>{ e.currentTarget.style.background=a.bg; e.currentTarget.style.borderColor=a.color+'44' }}
              onMouseLeave={e=>{ e.currentTarget.style.background='#fafafa'; e.currentTarget.style.borderColor='#f3f4f6' }}>
              <div style={{ width:34, height:34, borderRadius:8, background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <a.icon size={16} color={a.color}/>
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
