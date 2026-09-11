/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star, Gift, TrendingUp } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Skel = ({ h=14, w='100%' }) => <div style={{ height:h, width:w, background:'#f3f4f6', borderRadius:4 }} />

const REDEEM_OPTIONS = [
  { label:'₹50 Discount Coupon',  points:500,  color:'#0c3b73' },
  { label:'Free Delivery',        points:250,  color:'#16a34a' },
  { label:'₹100 Gift Voucher',    points:1000, color:'#7c3aed' },
  { label:'Health Checkup',       points:2000, color:'#d97706' },
]

export default function Loyalty() {
  const navigate = useNavigate()
  const { id }   = useParams()

  const [loading, setLoading]     = useState(true)
  const [loyalty, setLoyalty]     = useState({ points:0, tier:'Regular', nextTier:'Silver', pointsToNext:500, history:[] })
  const [customerName, setName]   = useState('')
  const [redeeming, setRedeeming] = useState(null)

  const fetchLoyalty = useCallback(async () => {
    setLoading(true)
    try {
      const [loyRes, custRes] = await Promise.allSettled([
        getRequest(`/franchise/customers/${id}/loyalty`),
        getRequest(`/franchise/customers/${id}`),
      ])
      if (loyRes.status === 'fulfilled') {
        const d = loyRes.value.data?.data
        setLoyalty({
          points:       d?.points       || d?.loyaltyPoints    || 0,
          tier:         d?.tier         || 'Regular',
          nextTier:     d?.nextTier     || 'Silver',
          pointsToNext: d?.pointsToNextTier || 500,
          history:      d?.history      || [],
        })
      }
      if (custRes.status === 'fulfilled') {
        const d = custRes.value.data?.data
        setName(d?.name || '')
      }
    } catch { toast.error('Failed to load loyalty data') }
    finally   { setLoading(false) }
  }, [id])

  useEffect(() => { fetchLoyalty() }, [fetchLoyalty])

  const handleRedeem = async (opt) => {
    if (loyalty.points < opt.points) { toast.error(`Need ${opt.points} points, you have ${loyalty.points}`); return }
    setRedeeming(opt.label)
    try {
      await postRequest({ url:`/franchise/customers/${id}/loyalty/redeem`, cred:{ points: opt.points, reward: opt.label } })
      toast.success(`Redeemed: ${opt.label}`)
      fetchLoyalty()
    } catch (err) { toast.error(err?.response?.data?.message || 'Redemption failed') }
    finally { setRedeeming(null) }
  }

  return (
    <div style={{ fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column', gap:18 }}>
      <PageHeader icon={Star} title="Loyalty Program" subtitle="Customer loyalty points and rewards" color="#d97706">
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
          <p style={{ fontSize:14, fontWeight:700, color:'#111827', margin:0 }}>{customerName}</p>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:18, alignItems:'start' }}>

        {/* Left */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Points card */}
          <div style={{ background:'linear-gradient(135deg,#f59e0b,#fbbf24)', borderRadius:14, padding:'22px', color:'#1c1917' }}>
            <p style={{ fontSize:11, fontWeight:700, margin:'0 0 4px', textTransform:'uppercase', opacity:0.8 }}>Total Loyalty Points</p>
            {loading ? <Skel h={40} w="60%" /> : <p style={{ fontSize:38, fontWeight:900, margin:'4px 0 18px', letterSpacing:-1 }}>{loyalty.points.toLocaleString('en-IN')}</p>}
            <div style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:11, opacity:0.8 }}>{loyalty.tier}</span>
                <span style={{ fontSize:11, opacity:0.8 }}>{loyalty.nextTier}</span>
              </div>
              <div style={{ height:6, background:'rgba(0,0,0,0.2)', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', background:'#92400e', borderRadius:4, width:`${Math.min(100, Math.round((loyalty.points / (loyalty.points + loyalty.pointsToNext))*100))}%` }} />
              </div>
              <p style={{ fontSize:10, opacity:0.7, margin:'5px 0 0' }}>{loyalty.pointsToNext} pts to reach {loyalty.nextTier}</p>
            </div>
          </div>

          {/* Earning rules */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'16px' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:'0 0 12px', display:'flex', alignItems:'center', gap:6 }}>
              <TrendingUp size={14} color="#16a34a"/> Earning Rules
            </p>
            {[
              { label:'₹100 Purchase',   pts:'+1 pt'  },
              { label:'Referral',         pts:'+150 pts'},
              { label:'Birthday Bonus',   pts:'+100 pts'},
              { label:'Medicine Reminder',pts:'+30 pts' },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #f3f4f6', fontSize:12 }}>
                <span style={{ color:'#374151' }}>{r.label}</span>
                <span style={{ fontWeight:700, color:'#16a34a' }}>{r.pts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* History */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'18px' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:'0 0 12px' }}>Points History</p>
            {loading
              ? Array(3).fill(0).map((_,i) => <div key={i} style={{ padding:'8px 0' }}><Skel h={14}/></div>)
              : loyalty.history.length === 0
                ? <p style={{ fontSize:13, color:'#9ca3af', textAlign:'center', padding:'20px 0' }}>No history yet</p>
                : loyalty.history.map((r,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'#f9fafb', borderRadius:8, marginBottom:8 }}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:'#111827', margin:0 }}>{r.desc||r.description}</p>
                      <p style={{ fontSize:11, color:'#9ca3af', margin:'2px 0 0' }}>{r.date||r.createdAt?.split('T')[0]}</p>
                    </div>
                    <span style={{ fontSize:14, fontWeight:700, color:r.type==='earn'?'#16a34a':'#dc2626' }}>
                      {r.type==='earn'?'+':'-'}{Math.abs(r.points||r.amount||0)} pts
                    </span>
                  </div>
                ))
            }
          </div>

          {/* Redeem */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'18px' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:'0 0 14px', display:'flex', alignItems:'center', gap:6 }}>
              <Gift size={14} color="#7c3aed"/> Redeem Points
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
              {REDEEM_OPTIONS.map(o => {
                const canRedeem = loyalty.points >= o.points
                return (
                  <div key={o.label} style={{ padding:'16px', background:'#f9fafb', borderRadius:12, border:`1px solid ${o.color}22`, textAlign:'center', opacity:canRedeem?1:0.6 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 6px' }}>{o.label}</p>
                    <p style={{ fontSize:12, color:o.color, fontWeight:700, margin:'0 0 12px' }}>{o.points.toLocaleString('en-IN')} pts</p>
                    <button onClick={() => handleRedeem(o)} disabled={!canRedeem || redeeming === o.label}
                      style={{ background:canRedeem?o.color:'#9ca3af', color:'#fff', border:'none', borderRadius:7, padding:'7px 0', fontSize:12, fontWeight:600, cursor:canRedeem?'pointer':'not-allowed', width:'100%' }}>
                      {redeeming === o.label ? 'Redeeming...' : 'Redeem'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
