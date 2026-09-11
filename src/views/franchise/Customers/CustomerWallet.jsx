/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Wallet, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c }) => <th style={{ padding:'10px 12px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', textAlign:'left', whiteSpace:'nowrap' }}>{c}</th>
const Td = ({ children, style={} }) => <td style={{ padding:'11px 12px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', ...style }}>{children}</td>
const Skel = ({ h=14, w='100%' }) => <div style={{ height:h, width:w, background:'#f3f4f6', borderRadius:4 }} />

export default function CustomerWallet() {
  const navigate    = useNavigate()
  const { id }      = useParams()
  const [loading, setLoading]   = useState(true)
  const [wallet, setWallet]     = useState({ balance:0, totalAdded:0, totalUsed:0, cashback:0, transactions:[] })
  const [customerName, setName] = useState('')
  const [showAdd, setShowAdd]   = useState(false)
  const [amount, setAmount]     = useState('')
  const [note, setNote]         = useState('')
  const [saving, setSaving]     = useState(false)

  const fetchWallet = useCallback(async () => {
    setLoading(true)
    try {
      const [walRes, custRes] = await Promise.allSettled([
        getRequest(`/franchise/customers/${id}/wallet`),
        getRequest(`/franchise/customers/${id}`),
      ])
      if (walRes.status === 'fulfilled') {
        const d = walRes.value.data?.data
        setWallet({
          balance:      d?.balance || d?.walletBalance || 0,
          totalAdded:   d?.totalAdded   || 0,
          totalUsed:    d?.totalUsed    || 0,
          cashback:     d?.cashback     || 0,
          transactions: d?.transactions || [],
        })
      }
      if (custRes.status === 'fulfilled') {
        const d = custRes.value.data?.data
        setName(d?.name || d?.customer?.name || '')
      }
    } catch { toast.error('Failed to load wallet') }
    finally   { setLoading(false) }
  }, [id])

  useEffect(() => { fetchWallet() }, [fetchWallet])

  const handleTopup = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) { toast.error('Enter valid amount'); return }
    setSaving(true)
    try {
      await postRequest({ url:`/franchise/customers/${id}/wallet/topup`, cred:{ amount: Number(amount), note } })
      toast.success('Wallet topped up successfully')
      setShowAdd(false); setAmount(''); setNote('')
      fetchWallet()
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to top up') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column', gap:18 }}>
      <PageHeader icon={Wallet} title="Customer Wallet" subtitle="Wallet balance and transaction history" color="#7c3aed">
        <button onClick={() => navigate(`/franchise/customers/${id}`)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', background:'#fff', color:'#374151' }}>
          <ArrowLeft size={14}/> Back
        </button>
        <button onClick={() => setShowAdd(true)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#7c3aed', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', color:'#fff' }}>
          <Plus size={14}/> Add Money
        </button>
      </PageHeader>

      {/* Customer strip */}
      {customerName && (
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#0c3b73,#1a6fd4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:800, color:'#fff', flexShrink:0 }}>
            {customerName[0]?.toUpperCase()}
          </div>
          <p style={{ fontSize:14, fontWeight:700, color:'#111827', margin:0 }}>{customerName}</p>
        </div>
      )}

      {/* Wallet card */}
      <div style={{ background:'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius:16, padding:'24px 28px', color:'#fff' }}>
        <p style={{ fontSize:12, margin:'0 0 4px', opacity:0.85, letterSpacing:1, textTransform:'uppercase' }}>Wallet Balance</p>
        {loading ? <Skel h={40} w="50%" /> : <p style={{ fontSize:36, fontWeight:900, margin:'4px 0 20px', letterSpacing:-1 }}>₹{Number(wallet.balance).toLocaleString('en-IN', {minimumFractionDigits:2})}</p>}
        <div style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
          {[
            { l:'Total Added',      v:`₹${Number(wallet.totalAdded).toLocaleString('en-IN', {minimumFractionDigits:2})}` },
            { l:'Total Used',       v:`₹${Number(wallet.totalUsed).toLocaleString('en-IN', {minimumFractionDigits:2})}` },
            { l:'Cashback Earned',  v:`₹${Number(wallet.cashback).toLocaleString('en-IN', {minimumFractionDigits:2})}` },
          ].map(s => (
            <div key={s.l}>
              <p style={{ fontSize:10, opacity:0.75, margin:'0 0 3px', textTransform:'uppercase' }}>{s.l}</p>
              <p style={{ fontSize:15, fontWeight:700, margin:0 }}>{loading ? '...' : s.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add money modal */}
      {showAdd && (
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'20px 22px' }}>
          <p style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 14px' }}>Add Money to Wallet</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Amount (₹) *</label>
              <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="e.g. 500"
                style={{ width:'100%', padding:'9px 12px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Note / Reason</label>
              <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Cashback credit"
                style={{ width:'100%', padding:'9px 12px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box' }} />
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setShowAdd(false)} style={{ padding:'9px 18px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', background:'#fff' }}>Cancel</button>
            <button onClick={handleTopup} disabled={saving}
              style={{ padding:'9px 22px', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', background:saving?'#9ca3af':'#7c3aed', color:'#fff' }}>
              {saving ? 'Processing...' : 'Confirm Top-up'}
            </button>
          </div>
        </div>
      )}

      {/* Transactions table */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #f3f4f6' }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:0 }}>Transaction History</h3>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr><Th c="Date"/><Th c="Description"/><Th c="Type"/><Th c="Amount (₹)"/><Th c="Balance (₹)"/></tr></thead>
            <tbody>
              {loading
                ? Array(4).fill(0).map((_,i) => <tr key={i}><td colSpan={5} style={{ padding:'11px 12px' }}><Skel h={12}/></td></tr>)
                : wallet.transactions.length === 0
                  ? <tr><td colSpan={5} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No transactions found</td></tr>
                  : wallet.transactions.map((t,i) => (
                    <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <Td style={{fontSize:12,color:'#6b7280'}}>{t.date||t.createdAt?.split('T')[0]}</Td>
                      <Td>{t.desc||t.description||t.note||'—'}</Td>
                      <Td>
                        <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:20, background:t.type==='Credit'?'#f0fdf4':'#fff1f2', color:t.type==='Credit'?'#16a34a':'#dc2626', border:`1px solid ${t.type==='Credit'?'#bbf7d0':'#fecdd3'}`, width:'fit-content' }}>
                          {t.type==='Credit' ? <TrendingUp size={10}/> : <TrendingDown size={10}/>} {t.type}
                        </span>
                      </Td>
                      <Td style={{fontWeight:700,color:t.type==='Credit'?'#16a34a':'#dc2626'}}>
                        {t.type==='Credit'?'+':'-'}₹{Math.abs(t.amount||0).toLocaleString('en-IN',{minimumFractionDigits:2})}
                      </Td>
                      <Td style={{fontWeight:700,color:'#0c3b73'}}>₹{Number(t.balance||0).toLocaleString('en-IN',{minimumFractionDigits:2})}</Td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
