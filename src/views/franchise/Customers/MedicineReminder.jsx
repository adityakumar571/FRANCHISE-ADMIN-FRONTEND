/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bell, Plus, Edit2, Clock, CheckCircle, AlertTriangle, AlarmClock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c }) => <th style={{ padding:'10px 12px', fontSize:11, color:'#6b7280', fontWeight:700, textTransform:'uppercase', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', textAlign:'left', whiteSpace:'nowrap' }}>{c}</th>
const Td = ({ children, style={} }) => <td style={{ padding:'11px 12px', fontSize:13, color:'#374151', borderBottom:'1px solid #f3f4f6', ...style }}>{children}</td>
const Skel = () => <div style={{ height:12, background:'#f3f4f6', borderRadius:4 }} />

const STATUS_CFG = {
  Upcoming:  { bg:'#e0e7ff', color:'#0c3b73', icon:Clock },
  Overdue:   { bg:'#fee2e2', color:'#dc2626', icon:AlertTriangle },
  Completed: { bg:'#dcfce7', color:'#16a34a', icon:CheckCircle },
  Snoozed:   { bg:'#fef3c7', color:'#d97706', icon:AlarmClock },
}

const EMPTY_FORM = { medicineName:'', frequency:'', startDate:'', nextDose:'' }

export default function MedicineReminder() {
  const navigate  = useNavigate()
  const { id }    = useParams()

  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [reminders, setReminders]   = useState([])
  const [customerName, setName]     = useState('')
  const [showForm, setShowForm]     = useState(false)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [remRes, custRes] = await Promise.allSettled([
        getRequest(`/franchise/customers/${id}/reminders`),
        getRequest(`/franchise/customers/${id}`),
      ])
      if (remRes.status === 'fulfilled') {
        const list = remRes.value.data?.data || []
        setReminders(Array.isArray(list) ? list : [])
      }
      if (custRes.status === 'fulfilled') {
        const d = custRes.value.data?.data
        setName(d?.name || '')
      }
    } catch { toast.error('Failed to load reminders') }
    finally   { setLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    if (!form.medicineName || !form.frequency) { toast.error('Medicine name and frequency required'); return }
    setSaving(true)
    try {
      if (editId) {
        await putRequest({ url:`/franchise/customers/${id}/reminders/${editId}`, cred:form })
        toast.success('Reminder updated')
      } else {
        await postRequest({ url:`/franchise/customers/${id}/reminders`, cred:form })
        toast.success('Reminder added')
      }
      setShowForm(false); setEditId(null); setForm(EMPTY_FORM)
      fetchData()
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const openEdit = (r) => {
    setEditId(r._id)
    setForm({ medicineName: r.medicineName||r.medicine||'', frequency: r.frequency||r.freq||'', startDate: r.startDate||r.start||'', nextDose: r.nextDose||r.next||'' })
    setShowForm(true)
  }

  const counts = {
    Upcoming:  reminders.filter(r=>r.status==='Upcoming').length,
    Overdue:   reminders.filter(r=>r.status==='Overdue').length,
    Completed: reminders.filter(r=>r.status==='Completed').length,
    Snoozed:   reminders.filter(r=>r.status==='Snoozed').length,
  }

  return (
    <div style={{ fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column', gap:18 }}>
      <PageHeader icon={Bell} title="Medicine Reminders" subtitle="Upcoming medicine and refill reminders" color="#16a34a">
        <button onClick={() => navigate(`/franchise/customers/${id}`)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', background:'#fff', color:'#374151' }}>
          <ArrowLeft size={14}/> Back
        </button>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#16a34a', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', color:'#fff' }}>
          <Plus size={14}/> Add Reminder
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

      {/* Status tiles */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {Object.entries(counts).map(([status, count]) => {
          const cfg = STATUS_CFG[status]; const Icon = cfg.icon
          return (
            <div key={status} style={{ padding:'18px 16px', background:cfg.bg, borderRadius:12, textAlign:'center', border:`1px solid ${cfg.color}22` }}>
              <Icon size={22} color={cfg.color} style={{ marginBottom:8 }}/>
              <p style={{ fontSize:11, color:cfg.color, margin:'0 0 4px', textTransform:'uppercase', fontWeight:700 }}>{status}</p>
              <p style={{ fontSize:28, fontWeight:800, color:cfg.color, margin:0 }}>{loading ? '...' : count}</p>
            </div>
          )
        })}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'20px 22px' }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 16px' }}>{editId ? 'Edit Reminder' : 'Add New Reminder'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:14 }}>
            {[
              { key:'medicineName', label:'Medicine Name *', placeholder:'e.g. Metformin 500mg', type:'text' },
              { key:'frequency',    label:'Frequency *',     placeholder:'e.g. Twice daily',    type:'text' },
              { key:'startDate',    label:'Start Date',      placeholder:'',                    type:'date' },
              { key:'nextDose',     label:'Next Dose',       placeholder:'',                    type:'text' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                  style={{ width:'100%', padding:'9px 12px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box' }} />
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM) }}
              style={{ padding:'9px 18px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', background:'#fff' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding:'9px 22px', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', background:saving?'#9ca3af':'#16a34a', color:'#fff' }}>
              {saving ? 'Saving...' : editId ? 'Update' : 'Save Reminder'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr><Th c="Medicine Name"/><Th c="Frequency"/><Th c="Start Date"/><Th c="Next Dose"/><Th c="Status"/><Th c="Action"/></tr></thead>
            <tbody>
              {loading
                ? Array(3).fill(0).map((_,i) => <tr key={i}>{Array(6).fill(0).map((_,j) => <td key={j} style={{ padding:'11px 12px' }}><Skel/></td>)}</tr>)
                : reminders.length === 0
                  ? <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'#9ca3af' }}>No reminders added yet</td></tr>
                  : reminders.map((r, i) => {
                    const cfg = STATUS_CFG[r.status||'Upcoming'] || STATUS_CFG.Upcoming
                    return (
                      <tr key={r._id||i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <Td style={{fontWeight:600}}>{r.medicineName||r.medicine}</Td>
                        <Td style={{fontSize:12,color:'#6b7280'}}>{r.frequency||r.freq}</Td>
                        <Td style={{fontSize:12,color:'#6b7280'}}>{r.startDate||r.start}</Td>
                        <Td style={{fontWeight:600}}>{r.nextDose||r.next}</Td>
                        <Td>
                          <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:cfg.bg, color:cfg.color }}>{r.status||'Upcoming'}</span>
                        </Td>
                        <Td>
                          <button onClick={() => openEdit(r)}
                            style={{ fontSize:11, fontWeight:600, background:'#e0e7ff', color:'#0c3b73', border:'none', borderRadius:5, padding:'5px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:3 }}>
                            <Edit2 size={10}/> Edit
                          </button>
                        </Td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
