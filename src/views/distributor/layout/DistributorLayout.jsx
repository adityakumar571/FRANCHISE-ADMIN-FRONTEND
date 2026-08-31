/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import {
  LayoutDashboard, Package, TrendingUp, ShoppingCart,
  Truck, IndianRupee, BarChart2, Bell, Settings,
  LogOut, ChevronDown, Menu, X, Tag, ChevronRight,
} from 'lucide-react'

const NAV = [
  { label:'Dashboard',            icon:LayoutDashboard, to:'/distributor/dashboard'     },
  { label:'Medicine Catalogue',   icon:Package,         to:'/distributor/catalogue'     },
  { label:'Live Stock & Pricing', icon:TrendingUp,      to:'/distributor/stock-pricing' },
  { label:'Schemes & Offers',     icon:Tag,             to:'/distributor/schemes'       },
  { label:'B2B Orders',           icon:ShoppingCart,    to:'/distributor/orders',    badge:'5' },
  { label:'Dispatch & Fulfilment',icon:Truck,           to:'/distributor/dispatch'      },
  { label:'Payments & Dues',      icon:IndianRupee,     to:'/distributor/payments'      },
  { label:'Reports',              icon:BarChart2,       to:'/distributor/reports'       },
  { label:'Notifications',        icon:Bell,            to:'/distributor/notifications', badge:'3' },
  { label:'Settings',             icon:Settings,        to:'/distributor/settings'      },
]

export default function DistributorLayout() {
  const navigate           = useNavigate()
  const { pathname }       = useLocation()
  const [open, setOpen]    = useState(true)
  const [profOpen, setProf]= useState(false)

  const dist = (() => { try { return JSON.parse(localStorage.getItem('distributor_context')||'{}') } catch { return {} } })()

  const logout = () => {
    Cookies.remove('DIST_TOKEN')
    localStorage.removeItem('distributor_context')
    navigate('/distributor/login', { replace:true })
  }

  const activeLabel = NAV.find(n => pathname.startsWith(n.to))?.label || 'Dashboard'

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'Inter, sans-serif', background:'#f7f8fb' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: open ? 248 : 66, flexShrink:0,
        background:'linear-gradient(180deg,#0c3b73 0%,#071e3d 100%)',
        display:'flex', flexDirection:'column',
        position:'sticky', top:0, height:'100vh',
        overflowY:'auto', overflowX:'hidden',
        transition:'width 0.2s ease',
        boxShadow:'4px 0 20px rgba(0,0,0,0.18)',
      }}>

        {/* Logo */}
        <div style={{ padding:'20px 16px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.14)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Truck size={19} color="#fabf22" />
          </div>
          {open && (
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:800, color:'#fff' }}>PharmaNexus</p>
              <p style={{ margin:0, fontSize:10, color:'rgba(255,255,255,0.5)' }}>B2B Distributor Portal</p>
            </div>
          )}
        </div>

        {/* Distributor info */}
        {open && (
          <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:10, alignItems:'center', flexShrink:0 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#fabf22', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:'#0c3b73', flexShrink:0 }}>
              {(dist.name||'D')[0]}
            </div>
            <div style={{ overflow:'hidden' }}>
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{dist.name||'Distributor'}</p>
              <p style={{ margin:0, fontSize:10, color:'rgba(255,255,255,0.5)' }}>{dist.city||'—'} · {dist.type||'Distributor'}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 8px' }}>
          {NAV.map(item => {
            const active = pathname.startsWith(item.to)
            return (
              <Link key={item.to} to={item.to}
                style={{
                  display:'flex', alignItems:'center', gap:11,
                  padding: open ? '9px 12px' : '10px 14px',
                  borderRadius:9, marginBottom:2, textDecoration:'none',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(255,255,255,0.18)' : 'transparent'}`,
                  justifyContent: open ? 'flex-start' : 'center',
                  transition:'background 0.13s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background='rgba(255,255,255,0.07)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent' }}>
                <item.icon size={17} color={active?'#fabf22':'rgba(255,255,255,0.6)'} style={{ flexShrink:0 }} />
                {open && (
                  <>
                    <span style={{ fontSize:13, fontWeight:active?700:500, color:active?'#fff':'rgba(255,255,255,0.72)', flex:1 }}>{item.label}</span>
                    {item.badge && <span style={{ background:'#ef4444', color:'#fff', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:20 }}>{item.badge}</span>}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding:'10px 8px', borderTop:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
          <button onClick={logout}
            style={{ display:'flex', alignItems:'center', gap:11, padding: open?'9px 12px':'10px 14px', width:'100%', border:'none', borderRadius:9, background:'rgba(239,68,68,0.14)', cursor:'pointer', justifyContent: open?'flex-start':'center' }}>
            <LogOut size={16} color="#f87171" />
            {open && <span style={{ fontSize:13, fontWeight:600, color:'#f87171' }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

        {/* Topbar */}
        <header style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 6px rgba(0,0,0,0.06)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <button onClick={()=>setOpen(!open)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', padding:6, borderRadius:7, display:'flex' }}>
              {open ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <div>
              <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#111827' }}>{activeLabel}</p>
              <p style={{ margin:0, fontSize:11, color:'#9ca3af' }}>Distributor Portal · {activeLabel}</p>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Link to="/distributor/notifications" style={{ position:'relative', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:9, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}>
              <Bell size={16} color="#6b7280"/>
              <span style={{ position:'absolute', top:7, right:8, width:7, height:7, borderRadius:'50%', background:'#ef4444', border:'1.5px solid #fff' }} />
            </Link>

            <div style={{ position:'relative' }}>
              <button onClick={()=>setProf(!profOpen)}
                style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 12px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:9, cursor:'pointer' }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:'#0c3b73', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:'#fff' }}>
                  {(dist.name||'D')[0]}
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:'#111827', maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{dist.name||'Distributor'}</span>
                <ChevronDown size={13} color="#9ca3af"/>
              </button>

              {profOpen && (
                <div style={{ position:'absolute', right:0, top:'110%', background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', padding:'6px', minWidth:180, zIndex:200 }}>
                  {[['My Profile','/distributor/settings'],['Settings','/distributor/settings'],['Support','/distributor/notifications']].map(([l,t])=>(
                    <Link key={l} to={t} onClick={()=>setProf(false)}
                      style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:7, textDecoration:'none', color:'#374151', fontSize:13 }}
                      onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <ChevronRight size={12} color="#9ca3af"/> {l}
                    </Link>
                  ))}
                  <div style={{ borderTop:'1px solid #f3f4f6', margin:'4px 0' }} />
                  <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:7, width:'100%', border:'none', background:'none', cursor:'pointer', color:'#ef4444', fontSize:13, fontWeight:600 }}>
                    <LogOut size={13}/> &nbsp;Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page */}
        <main style={{ flex:1, padding:'22px 24px', overflowY:'auto' }}>
          <Outlet/>
        </main>
      </div>
    </div>
  )
}
