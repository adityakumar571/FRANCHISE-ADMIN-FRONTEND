/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag, Wallet, Star, Bell, Pill, FileText,
  Gift, ChevronRight, Sparkles, Award, RefreshCw,
} from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import './dashboard.animations.css'

const getUser     = () => { try { return JSON.parse(localStorage.getItem('franchise_user')    || '{}') } catch { return {} } }
const getFranchise= () => { try { return JSON.parse(localStorage.getItem('franchise_context') || '{}') } catch { return {} } }

const MODE_COLOR  = { Cash:'#16a34a', UPI:'#7c3aed', Card:'#2563eb' }
const STATUS_CFG  = {
  Completed: { color:'#16a34a', bg:'#dcfce7', border:'#bbf7d0' },
  Active:    { color:'#0c3b73', bg:'#e0e7ff', border:'#c7d2fe' },
  Expired:   { color:'#6b7280', bg:'#f3f4f6', border:'#e5e7eb' },
}
const Badge = ({ s }) => {
  const c = STATUS_CFG[s] || STATUS_CFG.Expired
  return <span style={{ fontSize:11, fontWeight:700, padding:'3px 11px', borderRadius:20, background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>{s}</span>
}
const Th  = ({ c }) => <th style={{ padding:'10px 14px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', background:'#f8fafc', borderBottom:'1px solid #e5e7eb', textAlign:'left', whiteSpace:'nowrap' }}>{c}</th>
const Td  = ({ children, style={} }) => <td style={{ padding:'12px 14px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', verticalAlign:'middle', ...style }}>{children}</td>
const Skel = ({ h=14, w='100%' }) => <div style={{ height:h, width:w, background:'#f3f4f6', borderRadius:4 }} />

export default function CustomerDashboard() {
  const navigate  = useNavigate()
  const user      = getUser()
  const franchise = getFranchise()

  const [loading, setLoading]     = useState(true)
  const [refreshKey, setRefresh]  = useState(0)
  const [stats, setStats]         = useState({ totalPurchase:'₹0', walletBalance:'₹0', loyaltyPoints:'0', reminders:0 })
  const [purchases, setPurchases] = useState([])
  const [reminders, setReminders] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loyalty, setLoyalty]     = useState({ points:0, tier:'Regular', nextTier:'Silver', pointsToNext:500 })
  const [offers, setOffers]       = useState([])

  const customerId = user._id || user.userId

  const fetchAll = useCallback(async () => {
    if (!customerId) return
    setLoading(true)
    try {
      const [purRes, walRes, loyRes, remRes] = await Promise.allSettled([
        getRequest(`/franchise/customers/${customerId}/purchases?limit=6`),
        getRequest(`/franchise/customers/${customerId}/wallet`),
        getRequest(`/franchise/customers/${customerId}/loyalty`),
        getRequest(`/franchise/customers/${customerId}/reminders`),
      ])

      if (purRes.status === 'fulfilled') {
        const d = purRes.value.data?.data
        const list = d?.purchases || d || []
        setPurchases(Array.isArray(list) ? list : [])
        const total = list.reduce((s,p) => s + (p.netAmount||p.net||p.amount||0), 0)
        setStats(prev => ({ ...prev, totalPurchase: `₹${total.toLocaleString('en-IN')}` }))
      }

      if (walRes.status === 'fulfilled') {
        const d = walRes.value.data?.data
        setStats(prev => ({ ...prev, walletBalance: `₹${Number(d?.balance||d?.walletBalance||0).toLocaleString('en-IN')}` }))
      }

      if (loyRes.status === 'fulfilled') {
        const d = loyRes.value.data?.data
        const pts = d?.points || d?.loyaltyPoints || 0
        setLoyalty({
          points:       pts,
          tier:         d?.tier || 'Regular',
          nextTier:     d?.nextTier || 'Silver',
          pointsToNext: d?.pointsToNextTier || 500,
        })
        setStats(prev => ({ ...prev, loyaltyPoints: pts.toLocaleString('en-IN') }))
      }

      if (remRes.status === 'fulfilled') {
        const list = remRes.value.data?.data || []
        setReminders(Array.isArray(list) ? list.slice(0,3) : [])
        setStats(prev => ({ ...prev, reminders: Array.isArray(list) ? list.length : 0 }))
      }
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [refreshKey, customerId])

  useEffect(() => { fetchAll() }, [fetchAll])

  const loyaltyPct = Math.round((loyalty.points / (loyalty.points + loyalty.pointsToNext)) * 100) || 0

  const STAT_CARDS = [
    { label:'Total Purchases', value: stats.totalPurchase, color:'#0c3b73', grad:'linear-gradient(135deg,#0c3b73,#1e40af)', icon:ShoppingBag, sub:'Lifetime' },
    { label:'Wallet Balance',  value: stats.walletBalance, color:'#16a34a', grad:'linear-gradient(135deg,#16a34a,#15803d)', icon:Wallet,      sub:'Available' },
    { label:'Loyalty Points',  value: stats.loyaltyPoints, color:'#d97706', grad:'linear-gradient(135deg,#d97706,#b45309)', icon:Star,        sub:'pts earned' },
    { label:'Reminders',       value: String(stats.reminders), color:'#7c3aed', grad:'linear-gradient(135deg,#7c3aed,#6d28d9)', icon:Bell,   sub:'Active' },
  ]

  return (
    <div className="dash-page" style={{ fontFamily:'Inter,sans-serif', display:'flex', flexDirection:'column', gap:20 }}>

      {/* HERO */}
      <div className="hero-banner" style={{ background:'linear-gradient(135deg,#0c3b73 0%,#7c3aed 60%,#1e40af 100%)', borderRadius:18, padding:'26px 30px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <div className="avatar-float" style={{ width:62, height:62, borderRadius:'50%', background:'rgba(255,255,255,0.2)', backdropFilter:'blur(8px)', border:'3px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:800, flexShrink:0 }}>
            {(user.name||'C').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
              <Sparkles size={13} color="#fabf22" />
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.6)', fontWeight:600, letterSpacing:1 }}>CUSTOMER PORTAL</span>
            </div>
            <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>Hello, {user.name?.split(' ')[0] || 'Customer'} 👋</h1>
            <p style={{ margin:'4px 0 0', fontSize:13, opacity:0.7 }}>
              {franchise.franchiseName || 'MediKart'} Pharmacy
            </p>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ textAlign:'center', background:'rgba(255,255,255,0.12)', backdropFilter:'blur(6px)', borderRadius:14, padding:'14px 22px', border:'1px solid rgba(255,255,255,0.2)' }}>
            {loading ? <Skel h={20} w={60} /> : <p style={{ margin:0, fontSize:22, fontWeight:800, color:'#fabf22' }}>{stats.loyaltyPoints}</p>}
            <p style={{ margin:'2px 0 0', fontSize:11, opacity:0.7 }}>Loyalty Points</p>
          </div>
          <div style={{ textAlign:'center', background:'rgba(255,255,255,0.12)', backdropFilter:'blur(6px)', borderRadius:14, padding:'14px 22px', border:'1px solid rgba(255,255,255,0.2)' }}>
            {loading ? <Skel h={20} w={60} /> : <p style={{ margin:0, fontSize:22, fontWeight:800, color:'#86efac' }}>{stats.walletBalance}</p>}
            <p style={{ margin:'2px 0 0', fontSize:11, opacity:0.7 }}>Wallet</p>
          </div>
          <button onClick={() => setRefresh(k=>k+1)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.25)', background:'rgba(255,255,255,0.12)', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            <RefreshCw size={13}/> Refresh
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="dash-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} className="kpi-card dash-card"
            style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:'18px 18px 14px', overflow:'hidden', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:s.grad }} />
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ width:40, height:40, borderRadius:11, background:s.grad, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${s.color}44` }}>
                <s.icon size={18} color="#fff"/>
              </div>
              <span style={{ fontSize:10, color:s.color, fontWeight:700, background:s.color+'12', padding:'3px 8px', borderRadius:8 }}>{s.sub}</span>
            </div>
            <p style={{ margin:0, fontSize:11, color:'#6b7280', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.6px' }}>{s.label}</p>
            {loading
              ? <Skel h={24} w="50%" />
              : <p style={{ margin:'5px 0 0', fontSize:23, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</p>
            }
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16, alignItems:'start' }}>

        {/* Purchase History */}
        <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(90deg,#f8faff,#fff)' }}>
            <div>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#111827' }}>Purchase History</p>
              <p style={{ margin:'2px 0 0', fontSize:12, color:'#6b7280' }}>Recent transactions</p>
            </div>
            <button onClick={() => navigate(`/franchise/customers/${customerId}/history`)}
              style={{ fontSize:12, color:'#9ca3af', background:'#f3f4f6', padding:'4px 12px', borderRadius:8, border:'none', cursor:'pointer' }}>
              View All
            </button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="dash-table" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr><Th c="Invoice"/><Th c="Date"/><Th c="Items"/><Th c="Amount"/><Th c="Mode"/><Th c="Status"/></tr></thead>
              <tbody>
                {loading
                  ? Array(4).fill(0).map((_,i) => <tr key={i}><td colSpan={6} style={{ padding:'12px 14px' }}><Skel h={12} /></td></tr>)
                  : purchases.length === 0
                    ? <tr><td colSpan={6} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No purchase history found</td></tr>
                    : purchases.map((p,i) => (
                      <tr key={p._id||i}
                        onMouseEnter={e=>e.currentTarget.style.background='#f8faff'}
                        onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <Td style={{fontFamily:'monospace',fontSize:11,color:'#0c3b73',fontWeight:700}}>{p.invoiceNo||p.no||`INV-${i+1}`}</Td>
                        <Td style={{fontSize:12,color:'#6b7280'}}>{p.date||p.createdAt?.split('T')[0]}</Td>
                        <Td style={{textAlign:'center'}}>{p.itemCount||p.items||'—'}</Td>
                        <Td style={{fontWeight:800,color:'#111827'}}>₹{Number(p.netAmount||p.net||p.amount||0).toLocaleString('en-IN')}</Td>
                        <Td>
                          <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:(MODE_COLOR[p.paymentMode||p.mode]||'#6b7280')+'18', color:MODE_COLOR[p.paymentMode||p.mode]||'#6b7280' }}>
                            {p.paymentMode||p.mode||'—'}
                          </span>
                        </Td>
                        <Td><Badge s={p.status||'Completed'}/></Td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Reminders */}
          <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'13px 16px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:8, background:'linear-gradient(90deg,#faf5ff,#fff)' }}>
              <Bell size={15} color="#7c3aed"/>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#111827' }}>Medicine Reminders</p>
              {!loading && reminders.length > 0 && (
                <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, background:'#fee2e2', color:'#dc2626', padding:'2px 8px', borderRadius:8 }}>{reminders.length} active</span>
              )}
            </div>
            {loading
              ? Array(3).fill(0).map((_,i) => <div key={i} style={{ padding:'12px 16px', borderBottom:'1px solid #f9fafb' }}><Skel h={12} /></div>)
              : reminders.length === 0
                ? <div style={{ padding:20, textAlign:'center', color:'#9ca3af', fontSize:12 }}>No active reminders</div>
                : reminders.map((r, i) => (
                  <div key={r._id||i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:i<reminders.length-1?'1px solid #f9fafb':'none' }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'#f3e8ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Pill size={16} color="#7c3aed"/>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#111827' }}>{r.medicineName||r.medicine}</p>
                      <p style={{ margin:'2px 0 0', fontSize:11, color:'#6b7280' }}>{r.frequency||r.freq}</p>
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textAlign:'right', maxWidth:80 }}>{r.nextDose||r.next}</span>
                  </div>
                ))
            }
            <div style={{ padding:'10px 16px' }}>
              <button onClick={() => navigate(`/franchise/customers/${customerId}/reminders`)}
                style={{ width:'100%', padding:'8px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', fontSize:12, fontWeight:600, color:'#7c3aed', cursor:'pointer' }}>
                Manage Reminders →
              </button>
            </div>
          </div>

          {/* Loyalty Card */}
          <div className="dash-card" style={{ background:'linear-gradient(135deg,#d97706 0%,#f59e0b 60%,#fbbf24 100%)', borderRadius:14, padding:'18px', color:'#1c0a00', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.12)' }}/>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <Award size={20} color="#78350f"/>
              <span style={{ fontSize:14, fontWeight:800 }}>Loyalty Rewards</span>
              <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, background:'rgba(0,0,0,0.15)', padding:'2px 10px', borderRadius:20 }}>{loyalty.tier}</span>
            </div>
            {loading
              ? <Skel h={24} w="60%" />
              : <p style={{ margin:0, fontSize:26, fontWeight:800 }}>{loyalty.points.toLocaleString('en-IN')} pts</p>
            }
            <p style={{ margin:'3px 0 10px', fontSize:12, opacity:0.8 }}>= ₹{Math.floor(loyalty.points / 10)} off on next purchase</p>
            <div style={{ height:7, background:'rgba(0,0,0,0.15)', borderRadius:4, overflow:'hidden' }}>
              <div style={{ height:'100%', background:'#92400e', borderRadius:4, width:`${loyaltyPct}%`, transition:'width 0.8s ease' }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
              <span style={{ fontSize:10, opacity:0.7 }}>{loyalty.tier}</span>
              <span style={{ fontSize:10, opacity:0.7 }}>{loyalty.pointsToNext} pts to {loyalty.nextTier}</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK LINKS */}
      <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'18px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <Gift size={16} color="#d97706"/>
          <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#111827' }}>Quick Access</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10 }}>
          {[
            { label:'My Purchases',    to:`/franchise/customers/${customerId}/history`,    color:'#0c3b73', icon:ShoppingBag },
            { label:'My Wallet',       to:`/franchise/customers/${customerId}/wallet`,     color:'#16a34a', icon:Wallet      },
            { label:'Reminders',       to:`/franchise/customers/${customerId}/reminders`,  color:'#7c3aed', icon:Bell        },
            { label:'Prescriptions',   to:'/franchise/medicines',                          color:'#0891b2', icon:FileText    },
            { label:'Loyalty Points',  to:`/franchise/customers/${customerId}/loyalty`,    color:'#d97706', icon:Star        },
            { label:'Membership',      to:`/franchise/customers/${customerId}/membership`, color:'#e11d48', icon:Award       },
          ].map(item => (
            <button key={item.label} className="action-btn" onClick={()=>navigate(item.to)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 14px', border:`1px solid ${item.color}22`, borderRadius:12, background:`${item.color}07`, cursor:'pointer', transition:'all .18s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background=item.color+'18'; e.currentTarget.style.borderColor=item.color+'55' }}
              onMouseLeave={e=>{ e.currentTarget.style.background=item.color+'07'; e.currentTarget.style.borderColor=item.color+'22' }}>
              <div style={{ width:34, height:34, borderRadius:9, background:item.color+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <item.icon size={15} color={item.color}/>
              </div>
              <span style={{ fontSize:12, fontWeight:700, color:item.color }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
