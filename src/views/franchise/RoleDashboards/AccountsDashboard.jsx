/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IndianRupee, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Wallet, BookOpen, CreditCard, Receipt, Download, Plus,
  FileText, AlertCircle, Sparkles, Activity,
} from 'lucide-react'
import './dashboard.animations.css'

const user     = (() => { try { return JSON.parse(localStorage.getItem('franchise_user')    || '{}') } catch { return {} } })()
const franchise= (() => { try { return JSON.parse(localStorage.getItem('franchise_context') || '{}') } catch { return {} } })()

/* ─── Data ─── */
const KPIS = [
  { label:"Today's Receipt",  value:'₹58,400', raw:58400, change:'+12.4%', up:true,  color:'#16a34a', grad:'linear-gradient(135deg,#16a34a,#15803d)', icon:TrendingUp  },
  { label:"Today's Payment",  value:'₹32,600', raw:32600, change:'+5.2%',  up:false, color:'#dc2626', grad:'linear-gradient(135deg,#dc2626,#b91c1c)', icon:TrendingDown },
  { label:'Cash in Hand',     value:'₹24,850', raw:24850, change:null,     up:null,  color:'#0c3b73', grad:'linear-gradient(135deg,#0c3b73,#1e40af)', icon:Wallet       },
  { label:'Bank Balance',     value:'₹1,84,200',raw:184200,change:null,    up:null,  color:'#7c3aed', grad:'linear-gradient(135deg,#7c3aed,#6d28d9)', icon:CreditCard   },
  { label:"Today's Expense",  value:'₹3,200',  raw:3200,  change:'-8.1%',  up:true,  color:'#d97706', grad:'linear-gradient(135deg,#d97706,#b45309)', icon:Receipt      },
  { label:'Outstanding',      value:'₹14,500', raw:14500, change:null,     up:null,  color:'#e11d48', grad:'linear-gradient(135deg,#e11d48,#be123c)', icon:AlertCircle  },
]

const CASH_ENTRIES = [
  { id:'CB-001', type:'Receipt', desc:'Sales Collection',          amount:24500, mode:'Cash',          time:'09:15 AM', status:'Verified' },
  { id:'CB-002', type:'Payment', desc:'Supplier — MedPlus',        amount:18000, mode:'Cash',          time:'10:30 AM', status:'Verified' },
  { id:'CB-003', type:'Receipt', desc:'Customer — Rahul Sharma',   amount:2450,  mode:'UPI',           time:'11:00 AM', status:'Verified' },
  { id:'CB-004', type:'Payment', desc:'Office Expense',            amount:1200,  mode:'Cash',          time:'11:45 AM', status:'Pending'  },
  { id:'CB-005', type:'Receipt', desc:'B2B Order Payment',         amount:31500, mode:'Bank Transfer', time:'12:10 PM', status:'Verified' },
  { id:'CB-006', type:'Payment', desc:'Salary — Staff',            amount:12000, mode:'Bank Transfer', time:'01:00 PM', status:'Verified' },
  { id:'CB-007', type:'Receipt', desc:'Walk-in Sales',             amount:3850,  mode:'Cash',          time:'02:30 PM', status:'Verified' },
  { id:'CB-008', type:'Payment', desc:'Electricity Bill',          amount:2800,  mode:'Online',        time:'03:00 PM', status:'Pending'  },
]

const BANK_TXN = [
  { id:'BT-001', desc:'NEFT — Sharma Medical',  credit:45000, debit:0,     balance:184200, date:'22 Aug', ref:'NEFT2026001' },
  { id:'BT-002', desc:'UPI — Sales Collection', credit:12600, debit:0,     balance:139200, date:'22 Aug', ref:'UPI2026012'  },
  { id:'BT-003', desc:'RTGS — Supplier',        credit:0,     debit:38000, balance:126600, date:'21 Aug', ref:'RTGS2026003' },
  { id:'BT-004', desc:'NEFT — B2B Customer',    credit:28000, debit:0,     balance:164600, date:'21 Aug', ref:'NEFT2026004' },
  { id:'BT-005', desc:'Cheque — HealthZone',    credit:0,     debit:15000, balance:136600, date:'20 Aug', ref:'CHQ2026005'  },
]

const EXPENSES = [
  { id:'EXP-001', cat:'Salary',      desc:'Staff Salary Aug',     amount:45000, date:'01 Aug', status:'Paid'    },
  { id:'EXP-002', cat:'Utilities',   desc:'Electricity Bill',     amount:2800,  date:'05 Aug', status:'Pending' },
  { id:'EXP-003', cat:'Rent',        desc:'Shop Rent Aug',        amount:18000, date:'01 Aug', status:'Paid'    },
  { id:'EXP-004', cat:'Maintenance', desc:'Fridge Service',       amount:1500,  date:'10 Aug', status:'Paid'    },
  { id:'EXP-005', cat:'Stationery',  desc:'Office Supplies',      amount:800,   date:'12 Aug', status:'Paid'    },
  { id:'EXP-006', cat:'Transport',   desc:'Delivery Vehicle Fuel',amount:2200,  date:'15 Aug', status:'Paid'    },
]

const CAT_COLOR = { Salary:'#7c3aed', Utilities:'#0891b2', Rent:'#0c3b73', Maintenance:'#d97706', Stationery:'#16a34a', Transport:'#e11d48' }

const STATUS_CFG = {
  Verified:{ color:'#16a34a', bg:'#dcfce7', border:'#bbf7d0' },
  Pending: { color:'#d97706', bg:'#fef3c7', border:'#fde68a' },
  Paid:    { color:'#16a34a', bg:'#dcfce7', border:'#bbf7d0' },
  Unpaid:  { color:'#dc2626', bg:'#fee2e2', border:'#fecaca' },
}

/* ─── Micro-components ─── */
const Badge = ({ status }) => {
  const c = STATUS_CFG[status] || { color:'#6b7280', bg:'#f3f4f6', border:'#e5e7eb' }
  return <span style={{ fontSize:11, fontWeight:700, padding:'3px 11px', borderRadius:20, background:c.bg, color:c.color, border:`1px solid ${c.border}`, whiteSpace:'nowrap' }}>{status}</span>
}
const Th = ({ c }) => <th style={{ padding:'10px 14px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', background:'#f8fafc', borderBottom:'1px solid #e5e7eb', textAlign:'left', whiteSpace:'nowrap' }}>{c}</th>
const Td = ({ children, s={} }) => <td style={{ padding:'12px 14px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', verticalAlign:'middle', ...s }}>{children}</td>

/* ─── Animated counter ─── */
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState('0')
  useEffect(() => {
    const num = parseInt(String(value).replace(/[^0-9]/g,''),10) || 0
    const prefix = value.startsWith('₹') ? '₹' : ''
    let start = 0
    const step = Math.ceil(num / 40)
    const timer = setInterval(() => {
      start += step
      if (start >= num) { setDisplay(value); clearInterval(timer) }
      else setDisplay(prefix + start.toLocaleString('en-IN'))
    }, 25)
    return () => clearInterval(timer)
  }, [value])
  return <span className="stat-value">{display}</span>
}

/* ─── Mini bar sparkline ─── */
const Sparkline = ({ data, color }) => {
  const max = Math.max(...data)
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:28 }}>
      {data.map((v,i) => (
        <div key={i} style={{ flex:1, background:color, opacity: i===data.length-1?1:0.35, borderRadius:'2px 2px 0 0', height:`${Math.max(20,(v/max)*100)}%`, transition:'height 0.3s' }} />
      ))}
    </div>
  )
}

export default function AccountsDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('cash')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t) }, [])

  const totalReceipt = CASH_ENTRIES.filter(e=>e.type==='Receipt').reduce((s,e)=>s+e.amount,0)
  const totalPayment = CASH_ENTRIES.filter(e=>e.type==='Payment').reduce((s,e)=>s+e.amount,0)
  const netFlow = totalReceipt - totalPayment

  return (
    <div className="dash-page" style={{ fontFamily:'Inter,sans-serif', display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── HERO HEADER ── */}
      <div className="hero-banner" style={{ background:'linear-gradient(135deg,#0c3b73 0%,#1e40af 50%,#1e3a8a 100%)', borderRadius:18, padding:'26px 32px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div className="avatar-float" style={{ width:56, height:56, borderRadius:16, background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, border:'2px solid rgba(255,255,255,0.25)', flexShrink:0 }}>
            {(user.name||'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <Sparkles size={14} color="#fabf22" />
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.65)', fontWeight:600, letterSpacing:1 }}>ACCOUNTS PORTAL</span>
            </div>
            <h1 style={{ fontSize:22, fontWeight:800, margin:0, letterSpacing:'-0.3px' }}>
              Good {new Date().getHours()<12?'Morning':'Afternoon'}, {user.name?.split(' ')[0]||'Ramesh'} 👋
            </h1>
            <p style={{ margin:'4px 0 0', fontSize:13, opacity:0.7 }}>
              {franchise.franchiseName||'MediKart'} · {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
            </p>
          </div>
        </div>

        {/* Net flow pill */}
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ textAlign:'center', background:'rgba(255,255,255,0.12)', backdropFilter:'blur(6px)', borderRadius:14, padding:'12px 22px', border:'1px solid rgba(255,255,255,0.18)' }}>
            <p style={{ margin:0, fontSize:20, fontWeight:800, color:'#86efac' }}>₹{netFlow.toLocaleString('en-IN')}</p>
            <p style={{ margin:'2px 0 0', fontSize:11, opacity:0.7 }}>Net Cash Flow</p>
          </div>
          <div style={{ textAlign:'center', background:'rgba(255,255,255,0.12)', backdropFilter:'blur(6px)', borderRadius:14, padding:'12px 22px', border:'1px solid rgba(255,255,255,0.18)' }}>
            <div className="pulse-dot" style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', margin:'0 auto 6px' }} />
            <p style={{ margin:0, fontSize:11, opacity:0.7 }}>Live · Today</p>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="dash-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
        {KPIS.map((k,i) => (
          <div key={k.label} className="kpi-card dash-card"
            style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:'18px 18px 14px', overflow:'hidden', position:'relative' }}>
            {/* Color strip top */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:k.grad, borderRadius:'14px 14px 0 0' }} />
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ width:40, height:40, borderRadius:11, background:k.grad, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${k.color}44` }}>
                <k.icon size={18} color="#fff" />
              </div>
              {k.change && (
                <div style={{ display:'flex', alignItems:'center', gap:2, padding:'3px 8px', borderRadius:20, background:k.up?'#dcfce7':'#fee2e2' }}>
                  {k.up ? <ArrowUpRight size={11} color="#16a34a"/> : <ArrowDownRight size={11} color="#dc2626"/>}
                  <span style={{ fontSize:11, fontWeight:700, color:k.up?'#16a34a':'#dc2626' }}>{k.change}</span>
                </div>
              )}
            </div>
            <p style={{ margin:0, fontSize:11, color:'#6b7280', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.6px' }}>{k.label}</p>
            <p style={{ margin:'5px 0 0', fontSize:22, fontWeight:800, color:k.color, lineHeight:1 }}>
              {loaded ? <AnimatedNumber value={k.value} /> : '—'}
            </p>
            <Sparkline data={[40,55,70,60,80,65,90]} color={k.color} />
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div style={{ display:'flex', gap:6, background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:6, alignSelf:'flex-start', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
        {[{key:'cash',icon:Wallet,label:'Cash Book'},{key:'bank',icon:CreditCard,label:'Bank Ledger'},{key:'exp',icon:Receipt,label:'Expenses'}].map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)} className="tab-btn"
            style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:8, border:'none', fontSize:13, fontWeight:600, cursor:'pointer',
              background:tab===t.key?'linear-gradient(135deg,#0c3b73,#1e40af)':'transparent',
              color:tab===t.key?'#fff':'#6b7280',
              boxShadow:tab===t.key?'0 4px 14px rgba(12,59,115,0.28)':'none',
            }}>
            <t.icon size={14}/> {t.label}
          </button>
        ))}
      </div>

      {/* ── CASH BOOK ── */}
      {tab==='cash' && (
        <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(90deg,#f8faff,#fff)' }}>
            <div>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#111827' }}>Today's Cash Book</p>
              <p style={{ margin:'3px 0 0', fontSize:12, color:'#6b7280' }}>
                <span style={{ color:'#16a34a', fontWeight:700 }}>↑ ₹{totalReceipt.toLocaleString('en-IN')}</span>
                {' receipt · '}
                <span style={{ color:'#dc2626', fontWeight:700 }}>↓ ₹{totalPayment.toLocaleString('en-IN')}</span>
                {' payment'}
              </p>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="action-btn" style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 14px', borderRadius:8, border:'1px solid #e5e7eb', background:'#f9fafb', fontSize:12, fontWeight:600, color:'#374151', cursor:'pointer' }}>
                <Download size={13}/> Export
              </button>
              <button className="action-btn" style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 16px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#0c3b73,#1e40af)', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:'0 4px 12px rgba(12,59,115,0.3)' }}>
                <Plus size={13}/> Add Entry
              </button>
            </div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="dash-table" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr><Th c="ID"/><Th c="Type"/><Th c="Description"/><Th c="Amount"/><Th c="Mode"/><Th c="Time"/><Th c="Status"/></tr>
              </thead>
              <tbody>
                {CASH_ENTRIES.map((e,i) => (
                  <tr key={e.id} style={{ animationDelay:`${i*40}ms` }}
                    onMouseEnter={ev=>ev.currentTarget.style.background='#f8faff'}
                    onMouseLeave={ev=>ev.currentTarget.style.background=''}>
                    <Td s={{fontFamily:'monospace',fontSize:11,color:'#6b7280'}}>{e.id}</Td>
                    <Td>
                      <span style={{ fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:20, display:'inline-flex', alignItems:'center', gap:4, background:e.type==='Receipt'?'#dcfce7':'#fee2e2', color:e.type==='Receipt'?'#16a34a':'#dc2626', border:`1px solid ${e.type==='Receipt'?'#bbf7d0':'#fecaca'}` }}>
                        {e.type==='Receipt'?'▲':'▼'} {e.type}
                      </span>
                    </Td>
                    <Td s={{fontWeight:600,color:'#111827'}}>{e.desc}</Td>
                    <Td s={{fontWeight:800,fontSize:14,color:e.type==='Receipt'?'#16a34a':'#dc2626'}}>
                      {e.type==='Receipt'?'+':'-'}₹{e.amount.toLocaleString('en-IN')}
                    </Td>
                    <Td><span style={{ fontSize:11, padding:'3px 9px', borderRadius:7, background:'#f1f5f9', color:'#475569', fontWeight:600 }}>{e.mode}</span></Td>
                    <Td s={{fontSize:12,color:'#9ca3af'}}>{e.time}</Td>
                    <Td><Badge status={e.status}/></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BANK LEDGER ── */}
      {tab==='bank' && (
        <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(90deg,#f8faff,#fff)' }}>
            <div>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#111827' }}>Bank Transactions</p>
              <p style={{ margin:'3px 0 0', fontSize:12, color:'#6b7280' }}>Current Balance: <strong style={{color:'#7c3aed'}}>₹1,84,200</strong></p>
            </div>
            <button className="action-btn" style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 14px', borderRadius:8, border:'1px solid #e5e7eb', background:'#f9fafb', fontSize:12, fontWeight:600, color:'#374151', cursor:'pointer' }}>
              <Download size={13}/> Export
            </button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="dash-table" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr><Th c="Ref No"/><Th c="Description"/><Th c="Credit"/><Th c="Debit"/><Th c="Balance"/><Th c="Date"/></tr>
              </thead>
              <tbody>
                {BANK_TXN.map((t,i) => (
                  <tr key={t.id} style={{ animationDelay:`${i*40}ms` }}
                    onMouseEnter={ev=>ev.currentTarget.style.background='#f8faff'}
                    onMouseLeave={ev=>ev.currentTarget.style.background=''}>
                    <Td s={{fontFamily:'monospace',fontSize:11,color:'#6b7280'}}>{t.ref}</Td>
                    <Td s={{fontWeight:600,color:'#111827'}}>{t.desc}</Td>
                    <Td s={{fontWeight:800,color:t.credit>0?'#16a34a':'#d1d5db'}}>{t.credit>0?`₹${t.credit.toLocaleString('en-IN')}`:'—'}</Td>
                    <Td s={{fontWeight:800,color:t.debit>0?'#dc2626':'#d1d5db'}}>{t.debit>0?`₹${t.debit.toLocaleString('en-IN')}`:'—'}</Td>
                    <Td>
                      <span style={{ fontWeight:800, fontSize:14, color:'#7c3aed' }}>₹{t.balance.toLocaleString('en-IN')}</span>
                    </Td>
                    <Td s={{fontSize:12,color:'#9ca3af'}}>{t.date}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── EXPENSES ── */}
      {tab==='exp' && (
        <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(90deg,#f8faff,#fff)' }}>
            <div>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#111827' }}>Expense Listing</p>
              <p style={{ margin:'3px 0 0', fontSize:12, color:'#6b7280' }}>
                Total: <strong style={{color:'#dc2626'}}>₹{EXPENSES.reduce((s,e)=>s+e.amount,0).toLocaleString('en-IN')}</strong> this month
              </p>
            </div>
            <button className="action-btn" style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 16px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#0c3b73,#1e40af)', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:'0 4px 12px rgba(12,59,115,0.3)' }}>
              <Plus size={13}/> Add Expense
            </button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="dash-table" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr><Th c="ID"/><Th c="Category"/><Th c="Description"/><Th c="Amount"/><Th c="Date"/><Th c="Status"/></tr>
              </thead>
              <tbody>
                {EXPENSES.map((e,i) => (
                  <tr key={e.id} style={{ animationDelay:`${i*40}ms` }}
                    onMouseEnter={ev=>ev.currentTarget.style.background='#f8faff'}
                    onMouseLeave={ev=>ev.currentTarget.style.background=''}>
                    <Td s={{fontFamily:'monospace',fontSize:11,color:'#6b7280'}}>{e.id}</Td>
                    <Td>
                      <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20, background:(CAT_COLOR[e.cat]||'#6b7280')+'18', color:CAT_COLOR[e.cat]||'#6b7280' }}>{e.cat}</span>
                    </Td>
                    <Td s={{fontWeight:600,color:'#111827'}}>{e.desc}</Td>
                    <Td s={{fontWeight:800,fontSize:14,color:'#dc2626'}}>₹{e.amount.toLocaleString('en-IN')}</Td>
                    <Td s={{fontSize:12,color:'#9ca3af'}}>{e.date}</Td>
                    <Td><Badge status={e.status}/></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── QUICK LINKS ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10 }}>
        {[
          { label:'Cash Book',   to:'/franchise/accounts/cash-book',   color:'#0c3b73', icon:BookOpen   },
          { label:'Bank Book',   to:'/franchise/accounts/bank-book',   color:'#7c3aed', icon:CreditCard },
          { label:'Day Book',    to:'/franchise/accounts/day-book',    color:'#16a34a', icon:FileText   },
          { label:'Receipts',    to:'/franchise/accounts/receipts',    color:'#d97706', icon:IndianRupee},
          { label:'Payments',    to:'/franchise/accounts/payments',    color:'#0891b2', icon:Activity   },
          { label:'P&L Report',  to:'/franchise/accounts/profit-loss', color:'#e11d48', icon:TrendingUp  },
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
  )
}
