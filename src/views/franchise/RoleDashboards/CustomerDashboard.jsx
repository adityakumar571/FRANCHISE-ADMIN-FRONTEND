/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag, Wallet, Star, Bell, Pill, FileText,
  Gift, ChevronRight, Heart, Sparkles, TrendingUp, Award,
} from 'lucide-react'
import './dashboard.animations.css'

const getUser     = () => { try { return JSON.parse(localStorage.getItem('franchise_user')    || '{}') } catch { return {} } }
const getFranchise= () => { try { return JSON.parse(localStorage.getItem('franchise_context') || '{}') } catch { return {} } }

/* ── Data ── */
const STATS = [
  { label:'Total Purchases', value:'₹12,450', color:'#0c3b73', grad:'linear-gradient(135deg,#0c3b73,#1e40af)', icon:ShoppingBag, sub:'Lifetime' },
  { label:'Wallet Balance',  value:'₹850',    color:'#16a34a', grad:'linear-gradient(135deg,#16a34a,#15803d)', icon:Wallet,      sub:'Available' },
  { label:'Loyalty Points',  value:'1,240',   color:'#d97706', grad:'linear-gradient(135deg,#d97706,#b45309)', icon:Star,        sub:'pts earned' },
  { label:'Reminders',       value:'3',       color:'#7c3aed', grad:'linear-gradient(135deg,#7c3aed,#6d28d9)', icon:Bell,        sub:'Active' },
]

const PURCHASES = [
  { inv:'INV-1501', date:'22 Aug 2026', items:4, amount:1850, mode:'UPI',  status:'Completed' },
  { inv:'INV-1488', date:'18 Aug 2026', items:2, amount:640,  mode:'Cash', status:'Completed' },
  { inv:'INV-1471', date:'14 Aug 2026', items:6, amount:2400, mode:'Card', status:'Completed' },
  { inv:'INV-1450', date:'10 Aug 2026', items:3, amount:950,  mode:'UPI',  status:'Completed' },
  { inv:'INV-1432', date:'05 Aug 2026', items:8, amount:3200, mode:'UPI',  status:'Completed' },
  { inv:'INV-1410', date:'01 Aug 2026', items:1, amount:420,  mode:'Cash', status:'Completed' },
]

const REMINDERS = [
  { medicine:'Amlodipine 5mg',   freq:'Once daily',  next:'Today 8:00 PM',    urgent:true  },
  { medicine:'Metformin 500mg',  freq:'Twice daily', next:'Today 2:00 PM',    urgent:true  },
  { medicine:'Aspirin 75mg',     freq:'Once daily',  next:'Tomorrow 9:00 AM', urgent:false },
]

const PRESCRIPTIONS = [
  { id:'RX-001', doctor:'Dr. Rajesh Kumar', date:'20 Aug 2026', meds:3, status:'Active'  },
  { id:'RX-002', doctor:'Dr. Priya Sharma', date:'10 Aug 2026', meds:2, status:'Active'  },
  { id:'RX-003', doctor:'Dr. Anil Gupta',   date:'01 Jul 2026', meds:4, status:'Expired' },
]

const OFFERS = [
  { title:'10% off on Vitamins',   code:'VIT10',   expires:'30 Sep 2026', color:'#0c3b73' },
  { title:'Free delivery today',   code:'FREESHIP', expires:'Today only',  color:'#16a34a' },
  { title:'Buy 2 get 1 on Antacids',code:'B2G1ANT', expires:'31 Aug 2026', color:'#7c3aed' },
]

const MODE_COLOR = { Cash:'#16a34a', UPI:'#7c3aed', Card:'#2563eb' }
const STATUS_CFG = {
  Completed:{ color:'#16a34a', bg:'#dcfce7', border:'#bbf7d0' },
  Active:   { color:'#0c3b73', bg:'#e0e7ff', border:'#c7d2fe' },
  Expired:  { color:'#6b7280', bg:'#f3f4f6', border:'#e5e7eb' },
}
const Badge = ({ s }) => {
  const c = STATUS_CFG[s] || STATUS_CFG.Expired
  return <span style={{ fontSize:11, fontWeight:700, padding:'3px 11px', borderRadius:20, background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>{s}</span>
}
const Th = ({ c }) => <th style={{ padding:'10px 14px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', background:'#f8fafc', borderBottom:'1px solid #e5e7eb', textAlign:'left', whiteSpace:'nowrap' }}>{c}</th>
const Td = ({ children, style={} }) => <td style={{ padding:'12px 14px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', verticalAlign:'middle', ...style }}>{children}</td>

function AnimatedNumber({ value }) {
  const [d, setD] = useState('0')
  useEffect(() => {
    const isR = value.startsWith('₹')
    const n = parseInt(value.replace(/[^0-9]/g,''), 10) || 0
    let s = 0; const step = Math.ceil(n/35)
    const t = setInterval(() => {
      s += step
      if (s >= n) { setD(value); clearInterval(t) }
      else setD((isR?'₹':'') + s.toLocaleString('en-IN'))
    }, 28)
    return () => clearInterval(t)
  }, [value])
  return <span className="stat-value">{d}</span>
}

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const user      = getUser()
  const franchise = getFranchise()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t) }, [])

  const loyaltyPct = Math.round((1240 / 2000) * 100)

  return (
    <div className="dash-page" style={{ fontFamily:'Inter,sans-serif', display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── HERO BANNER ── */}
      <div className="hero-banner" style={{ background:'linear-gradient(135deg,#0c3b73 0%,#7c3aed 60%,#1e40af 100%)', borderRadius:18, padding:'26px 30px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <div className="avatar-float" style={{ width:62, height:62, borderRadius:'50%', background:'rgba(255,255,255,0.2)', backdropFilter:'blur(8px)', border:'3px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:800, flexShrink:0, boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}>
            {(user.name||'C').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
              <Sparkles size={13} color="#fabf22" />
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.6)', fontWeight:600, letterSpacing:1 }}>CUSTOMER PORTAL</span>
            </div>
            <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>Hello, {user.name?.split(' ')[0] || 'Anil'} 👋</h1>
            <p style={{ margin:'4px 0 0', fontSize:13, opacity:0.7 }}>
              Member since Jan 2025 · {franchise.franchiseName || 'MediKart'} Pharmacy
            </p>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ textAlign:'center', background:'rgba(255,255,255,0.12)', backdropFilter:'blur(6px)', borderRadius:14, padding:'14px 22px', border:'1px solid rgba(255,255,255,0.2)' }}>
            <p style={{ margin:0, fontSize:22, fontWeight:800, color:'#fabf22' }}>1,240</p>
            <p style={{ margin:'2px 0 0', fontSize:11, opacity:0.7 }}>Loyalty Points</p>
          </div>
          <div style={{ textAlign:'center', background:'rgba(255,255,255,0.12)', backdropFilter:'blur(6px)', borderRadius:14, padding:'14px 22px', border:'1px solid rgba(255,255,255,0.2)' }}>
            <p style={{ margin:0, fontSize:22, fontWeight:800, color:'#86efac' }}>₹850</p>
            <p style={{ margin:'2px 0 0', fontSize:11, opacity:0.7 }}>Wallet</p>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="dash-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
        {STATS.map(s => (
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
            <p style={{ margin:'5px 0 0', fontSize:23, fontWeight:800, color:s.color, lineHeight:1 }}>
              {loaded ? <AnimatedNumber value={s.value}/> : '—'}
            </p>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16, alignItems:'start' }}>

        {/* Purchase History */}
        <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(90deg,#f8faff,#fff)' }}>
            <div>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#111827' }}>Purchase History</p>
              <p style={{ margin:'2px 0 0', fontSize:12, color:'#6b7280' }}>Total: <strong style={{color:'#0c3b73'}}>₹{PURCHASES.reduce((s,p)=>s+p.amount,0).toLocaleString('en-IN')}</strong> this month</p>
            </div>
            <span style={{ fontSize:12, color:'#9ca3af', background:'#f3f4f6', padding:'4px 12px', borderRadius:8 }}>Last 30 days</span>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="dash-table" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr><Th c="Invoice"/><Th c="Date"/><Th c="Items"/><Th c="Amount"/><Th c="Mode"/><Th c="Status"/></tr></thead>
              <tbody>
                {PURCHASES.map((p,i) => (
                  <tr key={p.inv} style={{ animationDelay:`${i*35}ms` }}
                    onMouseEnter={e=>e.currentTarget.style.background='#f8faff'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td style={{fontFamily:'monospace',fontSize:11,color:'#0c3b73',fontWeight:700}}>{p.inv}</Td>
                    <Td style={{fontSize:12,color:'#6b7280'}}>{p.date}</Td>
                    <Td style={{textAlign:'center'}}>{p.items}</Td>
                    <Td style={{fontWeight:800,color:'#111827'}}>₹{p.amount.toLocaleString('en-IN')}</Td>
                    <Td><span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:(MODE_COLOR[p.mode]||'#6b7280')+'18', color:MODE_COLOR[p.mode]||'#6b7280' }}>{p.mode}</span></Td>
                    <Td><Badge s={p.status}/></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Medicine Reminders */}
          <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'13px 16px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:8, background:'linear-gradient(90deg,#faf5ff,#fff)' }}>
              <Bell size={15} color="#7c3aed"/>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#111827' }}>Medicine Reminders</p>
              <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, background:'#fee2e2', color:'#dc2626', padding:'2px 8px', borderRadius:8 }}>2 urgent</span>
            </div>
            {REMINDERS.map((r, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:i<REMINDERS.length-1?'1px solid #f9fafb':'none', background:r.urgent?'#fff7ed':'transparent', transition:'background .15s' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:r.urgent?'#fee2e2':'#f3e8ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Pill size={16} color={r.urgent?'#dc2626':'#7c3aed'}/>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#111827' }}>{r.medicine}</p>
                  <p style={{ margin:'2px 0 0', fontSize:11, color:'#6b7280' }}>{r.freq}</p>
                </div>
                <span style={{ fontSize:10, fontWeight:700, color:r.urgent?'#dc2626':'#9ca3af', textAlign:'right', maxWidth:80 }}>{r.next}</span>
              </div>
            ))}
          </div>

          {/* Prescriptions */}
          <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'13px 16px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:8, background:'linear-gradient(90deg,#f0f9ff,#fff)' }}>
              <FileText size={15} color="#0c3b73"/>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#111827' }}>Prescriptions</p>
            </div>
            {PRESCRIPTIONS.map((rx, i) => (
              <div key={i} style={{ padding:'11px 16px', borderBottom:i<PRESCRIPTIONS.length-1?'1px solid #f9fafb':'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#111827' }}>{rx.doctor}</p>
                  <p style={{ margin:'2px 0 0', fontSize:11, color:'#9ca3af' }}>{rx.date} · {rx.meds} medicines</p>
                </div>
                <Badge s={rx.status}/>
              </div>
            ))}
          </div>

          {/* Loyalty Card */}
          <div className="dash-card" style={{ background:'linear-gradient(135deg,#d97706 0%,#f59e0b 60%,#fbbf24 100%)', borderRadius:14, padding:'18px', color:'#1c0a00', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.12)' }}/>
            <div style={{ position:'absolute', bottom:-30, left:-15, width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.08)' }}/>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <Award size={20} color="#78350f"/>
              <span style={{ fontSize:14, fontWeight:800 }}>Loyalty Rewards</span>
            </div>
            <p style={{ margin:0, fontSize:26, fontWeight:800 }}>1,240 pts</p>
            <p style={{ margin:'3px 0 10px', fontSize:12, opacity:0.8 }}>= ₹124 off on next purchase</p>
            <div style={{ height:7, background:'rgba(0,0,0,0.15)', borderRadius:4, overflow:'hidden' }}>
              <div style={{ height:'100%', background:'#92400e', borderRadius:4, width:`${loyaltyPct}%`, transition:'width 0.8s ease' }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
              <span style={{ fontSize:10, opacity:0.7 }}>Silver</span>
              <span style={{ fontSize:10, opacity:0.7 }}>760 pts to Gold</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── OFFERS ── */}
      <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'18px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <Gift size={16} color="#d97706"/>
          <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#111827' }}>Active Offers for You</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:10 }}>
          {OFFERS.map(o => (
            <div key={o.code} className="action-btn"
              style={{ padding:'14px 16px', border:`1.5px solid ${o.color}22`, borderRadius:12, background:`${o.color}06`, cursor:'pointer', transition:'all .18s' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=o.color+'55'; e.currentTarget.style.background=o.color+'10' }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=o.color+'22'; e.currentTarget.style.background=o.color+'06' }}>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:o.color }}>{o.title}</p>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                <span style={{ fontSize:11, fontFamily:'monospace', fontWeight:700, background:o.color+'18', color:o.color, padding:'2px 8px', borderRadius:6 }}>{o.code}</span>
                <span style={{ fontSize:11, color:'#9ca3af' }}>Expires: {o.expires}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
