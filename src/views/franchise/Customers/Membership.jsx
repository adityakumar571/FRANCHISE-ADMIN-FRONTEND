/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Crown, CheckCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Skel = ({ h=14, w='100%' }) => <div style={{ height:h, width:w, background:'#f3f4f6', borderRadius:4 }} />

const TIER_COLORS = { Regular:'#6b7280', Silver:'#94a3b8', Gold:'#d97706', Platinum:'#7c3aed', Diamond:'#0891b2' }

const PLANS = [
  { name:'Basic',    fees:199,  duration:'3 Months',  discount:'5%',  color:'#6b7280' },
  { name:'Silver',   fees:499,  duration:'6 Months',  discount:'8%',  color:'#94a3b8' },
  { name:'Gold',     fees:999,  duration:'12 Months', discount:'12%', color:'#d97706' },
  { name:'Platinum', fees:1999, duration:'12 Months', discount:'15%', color:'#7c3aed' },
  { name:'Diamond',  fees:3999, duration:'24 Months', discount:'20%', color:'#0891b2' },
]

const BENEFITS = [
  'Discount on All Medicines',
  'Free Home Delivery',
  'Priority Customer Support',
  'Double Loyalty Points',
  'Exclusive Health Checkups',
]

export default function Membership() {
  const navigate = useNavigate()
  const { id }   = useParams()

  const [loading, setLoading]         = useState(true)
  const [enrolling, setEnrolling]     = useState(null)
  const [membership, setMembership]   = useState(null)
  const [customerName, setName]       = useState('')
  const [customerTier, setTier]       = useState('Regular')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [memRes, custRes] = await Promise.allSettled([
        getRequest(`/franchise/customers/${id}/membership`),
        getRequest(`/franchise/customers/${id}`),
      ])
      if (memRes.status === 'fulfilled') {
        setMembership(memRes.value.data?.data || null)
      }
      if (custRes.status === 'fulfilled') {
        const d = custRes.value.data?.data
        setName(d?.name || '')
        setTier(d?.tier || d?.memberTier || 'Regular')
      }
    } catch { toast.error('Failed to load membership data') }
    finally   { setLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleEnroll = async (plan) => {
    setEnrolling(plan.name)
    try {
      await postRequest({ url:`/franchise/customers/${id}/membership`, cred:{ plan: plan.name, fees: plan.fees, duration: plan.duration } })
      toast.success(`Enrolled in ${plan.name} plan`)
      fetchData()
    } catch (err) { toast.error(err?.response?.data?.message || 'Enrollment failed') }
    finally { setEnrolling(null) }
  }

  const tc = TIER_COLORS[customerTier] || '#6b7280'

  return (
    <div style={{ fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column', gap:18 }}>
      <PageHeader icon={Crown} title="Membership" subtitle="Customer membership and subscription plans" color="#d97706">
        <button onClick={() => navigate(`/franchise/customers/${id}`)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', background:'#fff', color:'#374151' }}>
          <ArrowLeft size={14}/> Back
        </button>
      </PageHeader>

      {customerName && (
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#0c3b73,#1a6fd4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:800, color:'#fff', flexShrink:0 }}>
            {customerName[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:'#111827', margin:0 }}>{customerName}</p>
            <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background:tc+'18', color:tc, border:`1px solid ${tc}44` }}>{customerTier} Member</span>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:18, alignItems:'start' }}>

        {/* Left — Current membership */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {loading ? (
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:'20px' }}><Skel h={100}/></div>
          ) : membership ? (
            <div style={{ background:`linear-gradient(135deg, ${tc}, ${tc}cc)`, borderRadius:14, padding:'22px', color:'#fff' }}>
              <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:14 }}>
                <Crown size={22}/>
                <span style={{ fontSize:18, fontWeight:800 }}>{membership.plan || customerTier} Member</span>
              </div>
              <p style={{ fontSize:11, opacity:0.8, margin:'0 0 3px' }}>Member ID: {membership.memberId || id}</p>
              <p style={{ fontSize:11, opacity:0.8, margin:'0 0 16px' }}>Valid Till: {membership.validTill || membership.expiryDate || '—'}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <p style={{ fontSize:10, opacity:0.7, margin:'0 0 3px' }}>Discount</p>
                  <p style={{ fontSize:14, fontWeight:700, margin:0 }}>{membership.discount || '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize:10, opacity:0.7, margin:'0 0 3px' }}>Status</p>
                  <p style={{ fontSize:14, fontWeight:700, margin:0 }}>{membership.status || 'Active'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background:'#f9fafb', borderRadius:14, padding:'22px', textAlign:'center', border:'1px solid #e5e7eb' }}>
              <Crown size={32} color="#9ca3af" style={{ marginBottom:8 }}/>
              <p style={{ fontSize:13, color:'#9ca3af', margin:0 }}>No active membership</p>
              <p style={{ fontSize:12, color:'#9ca3af', margin:'4px 0 0' }}>Enroll in a plan below</p>
            </div>
          )}

          {/* Benefits */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'16px' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:'0 0 12px' }}>Membership Benefits</p>
            {BENEFITS.map(b => (
              <div key={b} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', fontSize:13, color:'#374151', borderBottom:'1px solid #f9fafb' }}>
                <CheckCircle size={13} color="#16a34a" style={{ flexShrink:0 }}/> {b}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Plans */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'20px' }}>
          <p style={{ fontSize:14, fontWeight:700, color:'#374151', margin:'0 0 16px' }}>Available Plans</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {PLANS.map(p => {
              const isCurrent = membership?.plan === p.name
              return (
                <div key={p.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px', background:isCurrent?'#fffbeb':'#f9fafb', borderRadius:12, border:isCurrent?`2px solid ${p.color}`:'1px solid #e5e7eb' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:42, height:42, borderRadius:10, background:p.color+'20', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Crown size={18} color={p.color}/>
                    </div>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                        <p style={{ fontSize:14, fontWeight:700, color:'#111827', margin:0 }}>{p.name}</p>
                        {isCurrent && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20, background:'#fffbeb', color:p.color, border:`1px solid ${p.color}44` }}>Current</span>}
                      </div>
                      <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{p.duration} · {p.discount} Discount</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <span style={{ fontSize:18, fontWeight:800, color:p.color }}>₹{p.fees}</span>
                    {isCurrent
                      ? <span style={{ fontSize:12, fontWeight:700, padding:'6px 14px', borderRadius:7, background:p.color+'18', color:p.color, border:`1px solid ${p.color}44` }}>Active</span>
                      : <button onClick={() => handleEnroll(p)} disabled={enrolling===p.name}
                          style={{ fontSize:13, fontWeight:600, background:enrolling===p.name?'#9ca3af':p.color, color:'#fff', border:'none', borderRadius:7, padding:'7px 18px', cursor:'pointer' }}>
                          {enrolling===p.name ? '...' : 'Enroll'}
                        </button>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
