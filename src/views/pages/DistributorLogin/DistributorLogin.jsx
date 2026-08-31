/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { Truck, Package, TrendingUp, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function DistributorLogin() {
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm]       = useState({ email: '', password: '' })

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password.trim()) { toast.error('Please enter email and password'); return }
    setLoading(true)
    try {
      // Mock login — replace with real API when backend ready
      // const res = await axios.post(`${BASE_URL}distributor/login`, form)
      // const { token, distributor } = res.data.data
      // Cookies.set('DIST_TOKEN', token, { expires: 30, path: '/' })
      // localStorage.setItem('distributor_context', JSON.stringify(distributor))
      await new Promise(r => setTimeout(r, 700))
      Cookies.set('DIST_TOKEN', 'demo_dist_token', { expires: 30, path: '/' })
      localStorage.setItem('distributor_context', JSON.stringify({
        id: 'DIST-001', name: 'Medico Agencies Pvt Ltd',
        contactPerson: 'Rajesh Gupta', email: form.email,
        phone: '9876543210', city: 'Lucknow', state: 'Uttar Pradesh',
        drugLicence: 'UP-DL-2024-00123', gstNo: '09AABCM1234A1Z5',
        type: 'Distributor', coverage: 'Lucknow, Kanpur, Varanasi',
        totalSkus: 4820, activeFranchises: 24, rating: 4.7,
      }))
      toast.success('Welcome back, Medico Agencies!')
      navigate('/distributor/dashboard', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* ── LEFT BRAND PANEL ── */}
      <div style={{
        flex: '0 0 500px', minWidth: 320,
        background: 'linear-gradient(160deg, #0a1f3c 0%, #0c3b73 50%, #1155aa 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 52px', position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative circles */}
        {[['-80px','-80px',320],['auto','-60px',220,'0','auto'],['auto','auto',180,'0','0']].map(([t,r,s,b,l],i)=>(
          <div key={i} style={{ position:'absolute', top:t, right:r, bottom:b, left:l, width:s, height:s, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
        ))}

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:52 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'rgba(255,255,255,0.14)', display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px solid rgba(255,255,255,0.2)' }}>
            <Truck size={26} color="#fabf22" />
          </div>
          <div>
            <p style={{ margin:0, fontSize:18, fontWeight:800, color:'#fff' }}>PharmaNexus</p>
            <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:500 }}>B2B Supplier Portal</p>
          </div>
        </div>

        <h1 style={{ color:'#fff', fontSize:34, fontWeight:800, margin:'0 0 16px', lineHeight:1.18, letterSpacing:'-0.5px' }}>
          Distributor &<br />Wholesaler Portal
        </h1>
        <p style={{ color:'rgba(255,255,255,0.68)', fontSize:15, lineHeight:1.75, margin:'0 0 44px', maxWidth:360 }}>
          Manage your medicine catalogue, live pricing, B2B orders and fulfilment from one centralised platform.
        </p>

        {/* Features */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {[
            [Package,     'Manage medicine catalogue & live stock'],
            [TrendingUp,  'Set live pricing, schemes & bulk discounts'],
            [Truck,       'Receive & fulfil B2B orders from franchises'],
            [ShieldCheck, 'Track payments, dues & order history'],
          ].map(([Icon, text]) => (
            <div key={text} style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:36, height:36, borderRadius:9, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={17} color="#fabf22" />
              </div>
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.82)', fontWeight:500 }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop:52, display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e' }} />
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>Secure · Verified · Real-time B2B Network</span>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{ flex:1, background:'#f7f8fb', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
        <div style={{ width:'100%', maxWidth:440 }}>

          <div style={{ background:'#fff', borderRadius:16, padding:'44px 40px', boxShadow:'0 8px 40px rgba(0,0,0,0.09)', border:'1px solid #e5e7eb' }}>
            <h2 style={{ fontSize:24, fontWeight:800, color:'#111827', margin:'0 0 8px' }}>Welcome back</h2>
            <p style={{ fontSize:14, color:'#6b7280', margin:'0 0 32px' }}>Sign in to your distributor / wholesaler account</p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:20 }}>
                <label style={LBL}>Email Address <span style={{ color:'#ef4444' }}>*</span></label>
                <input name="email" type="email" value={form.email} onChange={set}
                  placeholder="you@company.com" required autoComplete="email" style={INP}
                  onFocus={e=>e.target.style.borderColor='#0c3b73'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
              </div>

              <div style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                  <label style={LBL}>Password <span style={{ color:'#ef4444' }}>*</span></label>
                  <button type="button" style={{ background:'none', border:'none', fontSize:12, color:'#0c3b73', cursor:'pointer', fontWeight:600 }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position:'relative' }}>
                  <input name="password" type={showPwd?'text':'password'} value={form.password} onChange={set}
                    placeholder="Enter your password" required style={{ ...INP, paddingRight:44 }}
                    onFocus={e=>e.target.style.borderColor='#0c3b73'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
                  <span onClick={()=>setShowPwd(!showPwd)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', cursor:'pointer', color:'#9ca3af' }}>
                    {showPwd ? <FaEyeSlash size={15}/> : <FaEye size={15}/>}
                  </span>
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:28 }}>
                <input type="checkbox" id="rem" style={{ accentColor:'#0c3b73', width:15, height:15, cursor:'pointer' }} />
                <label htmlFor="rem" style={{ fontSize:13, color:'#6b7280', cursor:'pointer' }}>Remember me for 30 days</label>
              </div>

              <button type="submit" disabled={loading}
                style={{ width:'100%', height:48, border:'none', borderRadius:10,
                  background: loading ? '#6fa3d0' : 'linear-gradient(135deg,#0c3b73,#1a6fd4)',
                  color:'#fff', fontWeight:700, fontSize:15, cursor: loading?'not-allowed':'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(12,59,115,0.32)', transition:'all 0.2s' }}>
                {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16}/></>}
              </button>
            </form>

            <div style={{ margin:'24px 0', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flex:1, height:1, background:'#f3f4f6' }} />
              <span style={{ fontSize:12, color:'#d1d5db' }}>New distributor?</span>
              <div style={{ flex:1, height:1, background:'#f3f4f6' }} />
            </div>

            <div style={{ background:'#f8faff', borderRadius:10, padding:'16px', border:'1px solid #e0e7ff' }}>
              <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:700, color:'#374151' }}>Registration Requirements</p>
              {['Drug Licence copy','GST Registration','Business Proof','Bank Details'].map(r => (
                <div key={r} style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#6b7280', marginBottom:4 }}>
                  <CheckCircle2 size={12} color="#22c55e" /> {r}
                </div>
              ))}
              <button style={{ marginTop:10, width:'100%', padding:'9px', border:'1px solid #c7d2fe', borderRadius:8, background:'#fff', fontSize:13, fontWeight:600, color:'#0c3b73', cursor:'pointer' }}>
                Apply for Distributor Account →
              </button>
            </div>
          </div>

          <p style={{ textAlign:'center', marginTop:18, fontSize:12, color:'#9ca3af' }}>
            <button onClick={()=>navigate('/franchise-login')} style={{ background:'none', border:'none', color:'#9ca3af', cursor:'pointer', fontSize:12 }}>
              ← Back to Franchise Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

const LBL = { display:'block', marginBottom:6, fontWeight:600, fontSize:13, color:'#374151' }
const INP = { width:'100%', height:46, border:'1.5px solid #e5e7eb', borderRadius:9, padding:'0 14px', outline:'none', fontSize:13, background:'#fafafa', boxSizing:'border-box', color:'#111827', transition:'border-color 0.15s' }
