/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IndianRupee, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Wallet, BookOpen, CreditCard, Receipt, Download, Plus,
  FileText, AlertCircle, Sparkles, Activity, RefreshCw,
} from 'lucide-react'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import './dashboard.animations.css'

const franchise = (() => { try { return JSON.parse(localStorage.getItem('franchise_context') || '{}') } catch { return {} } })()
const user      = (() => { try { return JSON.parse(localStorage.getItem('franchise_user')    || '{}') } catch { return {} } })()

const STATUS_CFG = {
  Verified: { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
  Pending:  { color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  Paid:     { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
  Unpaid:   { color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
}
const CAT_COLOR = { Salary:'#7c3aed', Utilities:'#0891b2', Rent:'#0c3b73', Maintenance:'#d97706', Stationery:'#16a34a', Transport:'#e11d48' }

const Badge = ({ status }) => {
  const c = STATUS_CFG[status] || { color:'#6b7280', bg:'#f3f4f6', border:'#e5e7eb' }
  return <span style={{ fontSize:11, fontWeight:700, padding:'3px 11px', borderRadius:20, background:c.bg, color:c.color, border:`1px solid ${c.border}`, whiteSpace:'nowrap' }}>{status}</span>
}
const Th = ({ c }) => <th style={{ padding:'10px 14px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', background:'#f8fafc', borderBottom:'1px solid #e5e7eb', textAlign:'left', whiteSpace:'nowrap' }}>{c}</th>
const Td = ({ children, s={} }) => <td style={{ padding:'12px 14px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', verticalAlign:'middle', ...s }}>{children}</td>

const Skel = ({ h=14, w='100%' }) => <div style={{ height:h, width:w, background:'#f3f4f6', borderRadius:4 }} />

const Sparkline = ({ data=[], color }) => {
  const max = Math.max(...data, 1)
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
  const [tab, setTab]       = useState('cash')
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // API data
  const [kpis, setKpis]       = useState([])
  const [cashBook, setCashBook] = useState({ entries:[], totalReceipt:0, totalPayment:0, netFlow:0 })
  const [bankBook, setBankBook] = useState({ transactions:[], currentBalance:0 })
  const [expenses, setExpenses] = useState({ list:[], total:0 })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [cbRes, bbRes, expRes] = await Promise.allSettled([
        getRequest('/franchise/accounts/cash-book'),
        getRequest('/franchise/accounts/bank-book'),
        getRequest('/franchise/accounts/expenses'),
      ])

      if (cbRes.status === 'fulfilled') {
        const d = cbRes.value.data?.data
        const entries      = d?.entries || []
        const totalReceipt = entries.filter(e=>e.type==='Receipt').reduce((s,e)=>s+(e.cashIn||0),0)
        const totalPayment = entries.filter(e=>e.type==='Payment').reduce((s,e)=>s+(e.cashOut||0),0)
        setCashBook({ entries, totalReceipt, totalPayment, netFlow: totalReceipt - totalPayment, currentBalance: d?.currentBalance||0, openingBalance: d?.openingBalance||0 })
        setKpis([
          { label:"Today's Receipt",  value:`₹${totalReceipt.toLocaleString('en-IN')}`,                        color:'#16a34a', grad:'linear-gradient(135deg,#16a34a,#15803d)', icon:TrendingUp   },
          { label:"Today's Payment",  value:`₹${totalPayment.toLocaleString('en-IN')}`,                        color:'#dc2626', grad:'linear-gradient(135deg,#dc2626,#b91c1c)', icon:TrendingDown },
          { label:'Cash in Hand',     value:`₹${(d?.currentBalance||0).toLocaleString('en-IN')}`,              color:'#0c3b73', grad:'linear-gradient(135deg,#0c3b73,#1e40af)', icon:Wallet       },
          { label:"Today's Expense",  value:'—',                                                                color:'#d97706', grad:'linear-gradient(135deg,#d97706,#b45309)', icon:Receipt      },
          { label:'Bank Balance',     value:'—',                                                                color:'#7c3aed', grad:'linear-gradient(135deg,#7c3aed,#6d28d9)', icon:CreditCard   },
          { label:'Outstanding',      value:'—',                                                                color:'#e11d48', grad:'linear-gradient(135deg,#e11d48,#be123c)', icon:AlertCircle  },
        ])
      }

      if (bbRes.status === 'fulfilled') {
        const d = bbRes.value.data?.data
        setBankBook({ transactions: d?.entries||[], currentBalance: d?.currentBalance||0 })
        setKpis(prev => prev.map(k => k.label === 'Bank Balance' ? { ...k, value:`₹${(d?.currentBalance||0).toLocaleString('en-IN')}` } : k))
      }

      if (expRes.status === 'fulfilled') {
        const d = expRes.value.data?.data
        const list  = d?.entries || []
        const total = list.reduce((s,e)=>s+(e.amount||0),0)
        setExpenses({ list, total })
        setKpis(prev => prev.map(k => k.label === "Today's Expense" ? { ...k, value:`₹${total.toLocaleString('en-IN')}` } : k))
      }
    } catch {
      toast.error('Failed to load accounts data')
    } finally {
      setLoading(false)
      setTimeout(() => setLoaded(true), 80)
    }
  }, [refreshKey])

  useEffect(() => { fetchAll() }, [fetchAll])

  const netFlow = cashBook.netFlow

  return (
    <div className="dash-page" style={{ fontFamily:'Inter,sans-serif', display:'flex', flexDirection:'column', gap:20 }}>

      {/* HERO */}
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
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ textAlign:'center', background:'rgba(255,255,255,0.12)', backdropFilter:'blur(6px)', borderRadius:14, padding:'12px 22px', border:'1px solid rgba(255,255,255,0.18)' }}>
            {loading ? <div style={{ height:20, width:80, background:'rgba(255,255,255,0.2)', borderRadius:4 }} /> : <p style={{ margin:0, fontSize:20, fontWeight:800, color:'#86efac' }}>₹{netFlow.toLocaleString('en-IN')}</p>}
            <p style={{ margin:'2px 0 0', fontSize:11, opacity:0.7 }}>Net Cash Flow</p>
          </div>
          <button onClick={() => setRefreshKey(k=>k+1)}
            style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:10, padding:'10px 14px', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="dash-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
        {loading
          ? Array(6).fill(0).map((_,i) => <div key={i} style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:'18px', height:110 }}><Skel h={12} w="60%" /></div>)
          : kpis.map((k,i) => (
            <div key={k.label} className="kpi-card dash-card"
              style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:'18px 18px 14px', overflow:'hidden', position:'relative' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:k.grad, borderRadius:'14px 14px 0 0' }} />
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ width:40, height:40, borderRadius:11, background:k.grad, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${k.color}44` }}>
                  <k.icon size={18} color="#fff" />
                </div>
              </div>
              <p style={{ margin:0, fontSize:11, color:'#6b7280', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.6px' }}>{k.label}</p>
              <p style={{ margin:'5px 0 0', fontSize:20, fontWeight:800, color:k.color, lineHeight:1 }}>{k.value}</p>
              <Sparkline data={[40,55,70,60,80,65,90]} color={k.color} />
            </div>
          ))
        }
      </div>

      {/* TABS */}
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

      {/* CASH BOOK */}
      {tab==='cash' && (
        <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(90deg,#f8faff,#fff)' }}>
            <div>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#111827' }}>Today's Cash Book</p>
              <p style={{ margin:'3px 0 0', fontSize:12, color:'#6b7280' }}>
                <span style={{ color:'#16a34a', fontWeight:700 }}>↑ ₹{cashBook.totalReceipt.toLocaleString('en-IN')}</span>
                {' receipt · '}
                <span style={{ color:'#dc2626', fontWeight:700 }}>↓ ₹{cashBook.totalPayment.toLocaleString('en-IN')}</span>
                {' payment'}
              </p>
            </div>
            <button className="action-btn" style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 16px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#0c3b73,#1e40af)', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:'0 4px 12px rgba(12,59,115,0.3)' }}
              onClick={() => navigate('/franchise/accounts/cash-book')}>
              <BookOpen size={13}/> View Full
            </button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="dash-table" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr><Th c="Voucher"/><Th c="Type"/><Th c="Particulars"/><Th c="Cash In"/><Th c="Cash Out"/><Th c="Balance"/></tr>
              </thead>
              <tbody>
                {loading
                  ? Array(4).fill(0).map((_,i) => <tr key={i}>{Array(6).fill(0).map((_,j) => <td key={j} style={{ padding:'12px 14px' }}><Skel h={12} /></td>)}</tr>)
                  : cashBook.entries.length === 0
                    ? <tr><td colSpan={6} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No entries today</td></tr>
                    : cashBook.entries.map((e,i) => (
                      <tr key={i}
                        onMouseEnter={ev=>ev.currentTarget.style.background='#f8faff'}
                        onMouseLeave={ev=>ev.currentTarget.style.background=''}>
                        <Td s={{fontFamily:'monospace',fontSize:11,color:'#6b7280'}}>{e.voucher}</Td>
                        <Td>
                          <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20, display:'inline-flex', alignItems:'center', gap:4, background:e.type==='Receipt'?'#dcfce7':'#fee2e2', color:e.type==='Receipt'?'#16a34a':'#dc2626', border:`1px solid ${e.type==='Receipt'?'#bbf7d0':'#fecaca'}` }}>
                            {e.type==='Receipt'?'▲':'▼'} {e.type}
                          </span>
                        </Td>
                        <Td s={{fontWeight:600,color:'#111827'}}>{e.particulars}</Td>
                        <Td s={{fontWeight:700,color:'#16a34a'}}>{e.cashIn ? `₹${Number(e.cashIn).toLocaleString('en-IN')}` : '—'}</Td>
                        <Td s={{fontWeight:700,color:'#dc2626'}}>{e.cashOut ? `₹${Number(e.cashOut).toLocaleString('en-IN')}` : '—'}</Td>
                        <Td s={{fontWeight:700,color:'#0c3b73'}}>₹{Number(e.balance||0).toLocaleString('en-IN')}</Td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BANK LEDGER */}
      {tab==='bank' && (
        <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(90deg,#f8faff,#fff)' }}>
            <div>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#111827' }}>Bank Transactions</p>
              <p style={{ margin:'3px 0 0', fontSize:12, color:'#6b7280' }}>Current Balance: <strong style={{color:'#7c3aed'}}>₹{Number(bankBook.currentBalance).toLocaleString('en-IN')}</strong></p>
            </div>
            <button className="action-btn" style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 14px', borderRadius:8, border:'1px solid #e5e7eb', background:'#f9fafb', fontSize:12, fontWeight:600, color:'#374151', cursor:'pointer' }}
              onClick={() => navigate('/franchise/accounts/bank-book')}>
              <Download size={13}/> Full Ledger
            </button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="dash-table" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr><Th c="Ref No"/><Th c="Description"/><Th c="Credit"/><Th c="Debit"/><Th c="Balance"/><Th c="Date"/></tr>
              </thead>
              <tbody>
                {loading
                  ? Array(4).fill(0).map((_,i) => <tr key={i}>{Array(6).fill(0).map((_,j) => <td key={j} style={{ padding:'12px 14px' }}><Skel h={12} /></td>)}</tr>)
                  : bankBook.transactions.length === 0
                    ? <tr><td colSpan={6} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No transactions found</td></tr>
                    : bankBook.transactions.map((t,i) => (
                      <tr key={i}
                        onMouseEnter={ev=>ev.currentTarget.style.background='#f8faff'}
                        onMouseLeave={ev=>ev.currentTarget.style.background=''}>
                        <Td s={{fontFamily:'monospace',fontSize:11,color:'#6b7280'}}>{t.voucher||t.ref}</Td>
                        <Td s={{fontWeight:600,color:'#111827'}}>{t.particulars||t.desc}</Td>
                        <Td s={{fontWeight:700,color:t.cashIn>0?'#16a34a':'#d1d5db'}}>{t.cashIn>0?`₹${Number(t.cashIn).toLocaleString('en-IN')}`:'—'}</Td>
                        <Td s={{fontWeight:700,color:t.cashOut>0?'#dc2626':'#d1d5db'}}>{t.cashOut>0?`₹${Number(t.cashOut).toLocaleString('en-IN')}`:'—'}</Td>
                        <Td><span style={{ fontWeight:800, fontSize:14, color:'#7c3aed' }}>₹{Number(t.balance||0).toLocaleString('en-IN')}</span></Td>
                        <Td s={{fontSize:12,color:'#9ca3af'}}>{t.date}</Td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXPENSES */}
      {tab==='exp' && (
        <div className="dash-card" style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(90deg,#f8faff,#fff)' }}>
            <div>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#111827' }}>Expense Listing</p>
              <p style={{ margin:'3px 0 0', fontSize:12, color:'#6b7280' }}>
                Total: <strong style={{color:'#dc2626'}}>₹{expenses.total.toLocaleString('en-IN')}</strong> this period
              </p>
            </div>
            <button className="action-btn" style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 16px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#0c3b73,#1e40af)', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:'0 4px 12px rgba(12,59,115,0.3)' }}
              onClick={() => navigate('/franchise/accounts/expenses')}>
              <Plus size={13}/> Manage Expenses
            </button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="dash-table" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr><Th c="Voucher"/><Th c="Particulars"/><Th c="Amount"/><Th c="Date"/><Th c="Status"/></tr>
              </thead>
              <tbody>
                {loading
                  ? Array(4).fill(0).map((_,i) => <tr key={i}>{Array(5).fill(0).map((_,j) => <td key={j} style={{ padding:'12px 14px' }}><Skel h={12} /></td>)}</tr>)
                  : expenses.list.length === 0
                    ? <tr><td colSpan={5} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No expenses found</td></tr>
                    : expenses.list.map((e,i) => (
                      <tr key={i}
                        onMouseEnter={ev=>ev.currentTarget.style.background='#f8faff'}
                        onMouseLeave={ev=>ev.currentTarget.style.background=''}>
                        <Td s={{fontFamily:'monospace',fontSize:11,color:'#6b7280'}}>{e.voucher}</Td>
                        <Td s={{fontWeight:600,color:'#111827'}}>{e.particulars}</Td>
                        <Td s={{fontWeight:700,fontSize:14,color:'#dc2626'}}>₹{Number(e.cashOut||e.amount||0).toLocaleString('en-IN')}</Td>
                        <Td s={{fontSize:12,color:'#9ca3af'}}>{e.date}</Td>
                        <Td><Badge status={e.status||'Verified'}/></Td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK LINKS */}
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
