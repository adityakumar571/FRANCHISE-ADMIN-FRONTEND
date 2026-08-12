/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { Modal, Tabs, Tag, Tooltip } from 'antd'
import toast from 'react-hot-toast'
import {
  Bus, CalendarOff, StopCircle, PlayCircle,
  CheckCircle2, XCircle, Info, Clock, IndianRupee,
} from 'lucide-react'
import { getRequest, patchRequest, postRequest } from '../../../Helpers'

const MONTHS = [
  'APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER',
  'OCTOBER','NOVEMBER','DECEMBER','JANUARY','FEBRUARY','MARCH',
]
const MONTH_LABELS = {
  APRIL:'Apr', MAY:'May', JUNE:'Jun', JULY:'Jul', AUGUST:'Aug', SEPTEMBER:'Sep',
  OCTOBER:'Oct', NOVEMBER:'Nov', DECEMBER:'Dec', JANUARY:'Jan', FEBRUARY:'Feb', MARCH:'Mar',
}

/* ── Month Badge: inline styles so colors exactly match the screenshot ── */
const MonthBadge = ({ month, data }) => {
  const info = data?.find((d) => d.month === month)

  let bg     = '#f3f4f6'; let color  = '#6b7280'; let border = '#d1d5db'
  let label  = 'Inactive'; let Icon  = XCircle

  if (info?.isPaid) {
    bg = '#dbeafe'; color = '#1d4ed8'; border = '#93c5fd'
    label = `Paid ₹${info.amount}`; Icon = IndianRupee
  } else if (info?.isExempt) {
    bg = '#ffedd5'; color = '#c2410c'; border = '#fdba74'
    label = 'Exempt'; Icon = CalendarOff
  } else if (info?.isActive) {
    bg = '#d1fae5'; color = '#065f46'; border = '#6ee7b7'
    label = `₹${info.amount}`; Icon = CheckCircle2
  }

  return (
    <Tooltip title={`${month} — ${label}`}>
      <div style={{ backgroundColor: bg, color, border: `1px solid ${border}`, borderRadius: 10,
        padding: '8px 4px', minHeight: 68, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', cursor: 'default' }}>
        <Icon size={15} style={{ marginBottom: 3 }} />
        <span style={{ fontSize: 12, fontWeight: 700 }}>{MONTH_LABELS[month]}</span>
        <span style={{ fontSize: 10, marginTop: 2, maxWidth: 56, textAlign: 'center',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
          {label}
        </span>
      </div>
    </Tooltip>
  )
}

/* ── Main Modal ── */
const TransportManageModal = ({ isOpen, onClose, studentId, studentName, sessionId, onSuccess }) => {
  const [status,        setStatus]        = useState(null)
  const [loading,       setLoading]       = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [exemptMonths,  setExemptMonths]  = useState([])
  const [exemptReason,  setExemptReason]  = useState('')
  const [stopMonth,     setStopMonth]     = useState('')
  const [stopReason,    setStopReason]    = useState('')
  const [restartMonth,  setRestartMonth]  = useState('')
  const [restartReason, setRestartReason] = useState('')
  const [pendingFees,   setPendingFees]   = useState([])
  const [waiverLoading, setWaiverLoading] = useState(false)
  const [waiverAmounts, setWaiverAmounts] = useState({})
  const [waiverReasons, setWaiverReasons] = useState({})
  const [waiverSaving,  setWaiverSaving]  = useState({})

  const fetchStatus = () => {
    if (!studentId || !sessionId) return
    setLoading(true)
    getRequest(`transport-manage/${studentId}?sessionId=${sessionId}`)
      .then((res) => { const d = res?.data?.data; setStatus(d); setExemptMonths(d?.transportExemptMonths || []) })
      .catch(() => toast.error('Failed to load transport status'))
      .finally(() => setLoading(false))
  }

  const fetchPendingFees = () => {
    if (!studentId || !sessionId) return
    setWaiverLoading(true)
    getRequest(`transport-fees/pending-for-student?studentId=${studentId}&sessionId=${sessionId}`)
      .then((res) => {
        const list = res?.data?.data?.list || []
        setPendingFees(list)
        const amounts = {}; list.forEach((f) => { amounts[f._id] = '' }); setWaiverAmounts(amounts)
      })
      .catch(() => toast.error('Failed to load transport fees'))
      .finally(() => setWaiverLoading(false))
  }

  useEffect(() => { if (isOpen) { fetchStatus(); fetchPendingFees() } }, [isOpen, studentId, sessionId])

  const toggleExemptMonth = (month) => {
    const alreadyPaid = status?.monthSummary?.find((m) => m.month === month)?.isPaid
    if (alreadyPaid) { toast.error(`${month} is already paid — cannot exempt`); return }
    setExemptMonths((prev) => prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month])
  }

  const saveExemptMonths = () => {
    setActionLoading(true)
    patchRequest({ url: `transport-manage/${studentId}/exempt-months`,
      cred: { sessionId, exemptMonths, reason: exemptReason || 'Exempt months updated' } })
      .then((res) => { toast.success(res?.data?.message || 'Exempt months saved'); fetchStatus(); onSuccess?.(); setExemptReason('') })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to save'))
      .finally(() => setActionLoading(false))
  }

  const handleStop = () => {
    if (!stopMonth) { toast.error('Please select a month'); return }
    setActionLoading(true)
    patchRequest({ url: `transport-manage/${studentId}/stop`,
      cred: { sessionId, fromMonth: stopMonth, reason: stopReason || `Transport stopped from ${stopMonth}` } })
      .then((res) => { toast.success(res?.data?.message || `Transport stopped from ${stopMonth}`); fetchStatus(); onSuccess?.(); setStopMonth(''); setStopReason('') })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed'))
      .finally(() => setActionLoading(false))
  }

  const handleRestart = () => {
    if (!restartMonth) { toast.error('Please select a month'); return }
    setActionLoading(true)
    patchRequest({ url: `transport-manage/${studentId}/restart`,
      cred: { sessionId, fromMonth: restartMonth, reason: restartReason || `Transport restarted from ${restartMonth}` } })
      .then((res) => { toast.success(res?.data?.message || `Transport restarted from ${restartMonth}`); fetchStatus(); onSuccess?.(); setRestartMonth(''); setRestartReason('') })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed'))
      .finally(() => setActionLoading(false))
  }

  const handleWaive = (fee) => {
    const amt = waiverAmounts[fee._id]; const reason = waiverReasons[fee._id] || ''
    setWaiverSaving((p) => ({ ...p, [fee._id]: true }))
    postRequest({ url: 'transport-fees/waiver',
      cred: { sessionId, studentId, transportFeeId: fee._id,
        waivedAmount: amt !== '' ? Number(amt) : undefined, waiverReason: reason || undefined } })
      .then((res) => { toast.success(res?.data?.message || 'Waiver applied'); fetchPendingFees(); onSuccess?.() })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to apply waiver'))
      .finally(() => setWaiverSaving((p) => ({ ...p, [fee._id]: false })))
  }

  const summary       = status?.monthSummary || []
  const paidCount     = summary.filter((m) => m.isPaid).length
  const activeCount   = summary.filter((m) => m.isActive && !m.isPaid).length
  const exemptCount   = summary.filter((m) => m.isExempt).length
  const inactiveCount = summary.filter((m) => !m.isActive && !m.isExempt).length

  /* ── shared inline style helpers ── */
  const infoBox = (type) => {
    const map = {
      orange: { bg: '#fff7ed', border: '#fed7aa', color: '#c2410c' },
      red:    { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
      green:  { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
      blue:   { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
    }
    const s = map[type] || map.blue
    return { backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color,
      borderRadius: 8, padding: '10px 12px', fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 16 }
  }

  const actionBadgeStyle = (action) => {
    if (action === 'START')         return { backgroundColor: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 11 }
    if (action === 'STOP')          return { backgroundColor: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 11 }
    return                                 { backgroundColor: '#ffedd5', color: '#ea580c', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 11 }
  }

  const tabItems = [
    /* ══ TAB 1: Month Status ══ */
    {
      key: '1',
      label: <span style={{ display:'flex', alignItems:'center', gap:5 }}><Bus size={13} /> Month Status</span>,
      children: (
        <div>
          {/* Summary pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
            <span style={{ padding:'3px 12px', backgroundColor:'#dbeafe', color:'#1d4ed8', borderRadius:999, fontSize:12, fontWeight:600 }}>Paid: {paidCount}</span>
            <span style={{ padding:'3px 12px', backgroundColor:'#d1fae5', color:'#065f46', borderRadius:999, fontSize:12, fontWeight:600 }}>Active: {activeCount}</span>
            <span style={{ padding:'3px 12px', backgroundColor:'#ffedd5', color:'#c2410c', borderRadius:999, fontSize:12, fontWeight:600 }}>Exempt: {exemptCount}</span>
            <span style={{ padding:'3px 12px', backgroundColor:'#f3f4f6', color:'#6b7280', borderRadius:999, fontSize:12, fontWeight:600 }}>Inactive: {inactiveCount}</span>
          </div>

          {/* Month grid */}
          {loading ? (
            <p style={{ textAlign:'center', color:'#9ca3af', padding:'24px 0', fontSize:13 }}>Loading...</p>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:8 }}>
              {MONTHS.map((month) => <MonthBadge key={month} month={month} data={summary} />)}
            </div>
          )}

          {/* Current route */}
          {status?.route && (
            <div style={{ marginTop:16, padding:12, backgroundColor:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13 }}>
              <p style={{ fontWeight:600, color:'#374151', marginBottom:6 }}>Current Route</p>
              <p style={{ marginBottom:4, color:'#6b7280' }}>Route: <strong style={{ color:'#111827' }}>{status.route.routeName}</strong> <span style={{ color:'#9ca3af' }}>({status.route.routeCode})</span></p>
              {status.stop && <p style={{ marginBottom:4, color:'#6b7280' }}>Stop: <strong style={{ color:'#111827' }}>{status.stop.stopName}</strong></p>}
              <p style={{ marginBottom:0, color:'#6b7280' }}>Type: <Tag color="blue" style={{ marginLeft:4 }}>{status.transportType || '-'}</Tag></p>
            </div>
          )}

          {/* Action history */}
          {status?.transportHistory?.length > 0 && (
            <div style={{ marginTop:16 }}>
              <p style={{ fontWeight:600, color:'#374151', fontSize:13, display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
                <Clock size={13} /> Action History
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:176, overflowY:'auto' }}>
                {[...status.transportHistory].reverse().map((h, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, backgroundColor:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:6, padding:'7px 12px', fontSize:12 }}>
                    <span style={actionBadgeStyle(h.action)}>{h.action}</span>
                    <span style={{ fontWeight:600, color:'#1f2937' }}>{h.month}</span>
                    <span style={{ color:'#9ca3af', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.reason}</span>
                    <span style={{ color:'#9ca3af', whiteSpace:'nowrap' }}>{new Date(h.date).toLocaleDateString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },

    /* ══ TAB 2: Exempt Months ══ */
    {
      key: '2',
      label: <span style={{ display:'flex', alignItems:'center', gap:5 }}><CalendarOff size={13} /> Exempt Months</span>,
      children: (
        <div>
          <div style={infoBox('orange')}>
            <Info size={14} style={{ marginTop:1, flexShrink:0 }} />
            <p style={{ margin:0, fontSize:13 }}>Select months to exempt from transport fee (e.g. summer vacation). Already paid months cannot be exempted.</p>
          </div>

          <p style={{ fontWeight:600, color:'#374151', fontSize:13, marginBottom:8 }}>Click months to toggle:</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:8, marginBottom:16 }}>
            {MONTHS.map((month) => {
              const isPaid     = summary.find((m) => m.month === month)?.isPaid
              const isSelected = exemptMonths.includes(month)
              return (
                <button key={month} onClick={() => toggleExemptMonth(month)} disabled={isPaid}
                  title={isPaid ? 'Already paid — cannot exempt' : ''}
                  style={{ padding:'6px 4px', borderRadius:6, fontSize:11, fontWeight:600, cursor: isPaid ? 'not-allowed' : 'pointer', border:'1px solid',
                    backgroundColor: isPaid ? '#eff6ff' : isSelected ? '#0c3b73' : '#ffffff',
                    color:           isPaid ? '#93c5fd'  : isSelected ? '#ffffff'  : '#374151',
                    borderColor:     isPaid ? '#bfdbfe'  : isSelected ? '#0c3b73'  : '#d1d5db',
                  }}>
                  {isPaid ? '💳 ' : isSelected ? '✓ ' : ''}{MONTH_LABELS[month]}
                </button>
              )
            })}
          </div>

          {exemptMonths.length > 0 && (
            <div style={{ marginBottom:12, padding:8, backgroundColor:'#fff7ed', border:'1px solid #fed7aa', borderRadius:6, fontSize:12 }}>
              <span style={{ fontWeight:600, color:'#c2410c', marginRight:4 }}>Exempt months:</span>
              {exemptMonths.map((m) => <Tag key={m} color="orange" style={{ marginBottom:4 }}>{m}</Tag>)}
            </div>
          )}

          <div style={{ marginBottom:16 }}>
            <label className="form-label fw-bold">Reason <span className="text-muted fw-normal">(optional)</span></label>
            <input type="text" className="form-control" placeholder="e.g. Summer vacation 2025"
              value={exemptReason} onChange={(e) => setExemptReason(e.target.value)} />
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button onClick={saveExemptMonths} disabled={actionLoading}
              style={{ backgroundColor:'#0c3b73', color:'#fff', border:'none', borderRadius:6,
                padding:'8px 20px', fontSize:13, fontWeight:600, opacity: actionLoading ? 0.7 : 1, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
              {actionLoading ? 'Saving...' : 'Save Exempt Months'}
            </button>
          </div>
        </div>
      ),
    },

    /* ══ TAB 3: Stop / Restart ══ */
    {
      key: '3',
      label: <span style={{ display:'flex', alignItems:'center', gap:5 }}><StopCircle size={13} /> Stop / Restart</span>,
      children: (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

          {/* STOP */}
          <div style={{ border:'1px solid #e5e7eb', borderRadius:8, padding:16 }}>
            <h6 style={{ color:'#dc2626', fontWeight:700, display:'flex', alignItems:'center', gap:6, marginBottom:12, fontSize:14 }}>
              <StopCircle size={15} /> Stop Transport
            </h6>
            <div style={infoBox('red')}>
              <Info size={13} style={{ marginTop:1, flexShrink:0 }} />
              <p style={{ margin:0, fontSize:12 }}>All unpaid months from the selected month onwards will be deactivated. Paid months will not be affected.</p>
            </div>
            <div style={{ marginBottom:12 }}>
              <label className="form-label fw-bold">Stop from which month? <span className="text-danger">*</span></label>
              <select className="form-select" value={stopMonth} onChange={(e) => setStopMonth(e.target.value)}>
                <option value="">-- Select Month --</option>
                {MONTHS.map((m) => { const isPaid = summary.find((s) => s.month === m)?.isPaid
                  return <option key={m} value={m} disabled={isPaid}>{m}{isPaid ? ' (Paid)' : ''}</option> })}
              </select>
            </div>
            <div style={{ marginBottom:16 }}>
              <label className="form-label fw-bold">Reason <span className="text-muted fw-normal">(optional)</span></label>
              <input type="text" className="form-control" placeholder="e.g. Student leaving school"
                value={stopReason} onChange={(e) => setStopReason(e.target.value)} />
            </div>
            <button onClick={handleStop} disabled={actionLoading || !stopMonth}
              style={{ width:'100%', backgroundColor:'#dc2626', color:'#fff', border:'none', borderRadius:6,
                padding:'8px 0', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                opacity: (actionLoading || !stopMonth) ? 0.5 : 1, cursor: (actionLoading || !stopMonth) ? 'not-allowed' : 'pointer' }}>
              <StopCircle size={14} /> {actionLoading ? 'Processing...' : 'Stop Transport'}
            </button>
          </div>

          {/* RESTART */}
          <div style={{ border:'1px solid #e5e7eb', borderRadius:8, padding:16 }}>
            <h6 style={{ color:'#16a34a', fontWeight:700, display:'flex', alignItems:'center', gap:6, marginBottom:12, fontSize:14 }}>
              <PlayCircle size={15} /> Restart Transport
            </h6>
            <div style={infoBox('green')}>
              <Info size={13} style={{ marginTop:1, flexShrink:0 }} />
              <p style={{ margin:0, fontSize:12 }}>Fees from the selected month onwards will be re-activated. Exempt months will be skipped automatically.</p>
            </div>
            <div style={{ marginBottom:12 }}>
              <label className="form-label fw-bold">Restart from which month? <span className="text-danger">*</span></label>
              <select className="form-select" value={restartMonth} onChange={(e) => setRestartMonth(e.target.value)}>
                <option value="">-- Select Month --</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:16 }}>
              <label className="form-label fw-bold">Reason <span className="text-muted fw-normal">(optional)</span></label>
              <input type="text" className="form-control" placeholder="e.g. Student rejoining bus service"
                value={restartReason} onChange={(e) => setRestartReason(e.target.value)} />
            </div>
            <button onClick={handleRestart} disabled={actionLoading || !restartMonth}
              style={{ width:'100%', backgroundColor:'#16a34a', color:'#fff', border:'none', borderRadius:6,
                padding:'8px 0', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                opacity: (actionLoading || !restartMonth) ? 0.5 : 1, cursor: (actionLoading || !restartMonth) ? 'not-allowed' : 'pointer' }}>
              <PlayCircle size={14} /> {actionLoading ? 'Processing...' : 'Restart Transport'}
            </button>
          </div>

        </div>
      ),
    },

    /* ══ TAB 4: Fee Waiver ══ */
    {
      key: '4',
      label: <span style={{ display:'flex', alignItems:'center', gap:5 }}><IndianRupee size={13} /> Fee Waiver</span>,
      children: (
        <div>
          <div style={infoBox('blue')}>
            <Info size={14} style={{ marginTop:1, flexShrink:0 }} />
            <p style={{ margin:0, fontSize:13 }}>Waive transport fees for specific months. Enter a partial amount for partial waiver, or leave blank to waive the full remaining amount.</p>
          </div>

          {waiverLoading ? (
            <p style={{ textAlign:'center', color:'#9ca3af', padding:'24px 0', fontSize:13 }}>Loading fees...</p>
          ) : pendingFees.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#9ca3af' }}>
              <IndianRupee size={30} style={{ margin:'0 auto 8px', opacity:0.3, display:'block' }} />
              <p style={{ fontSize:13 }}>No pending transport fees to waive</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {pendingFees.map((fee) => (
                <div key={fee._id} style={{ border:'1px solid #e5e7eb', borderRadius:8, backgroundColor:'#f9fafb', overflow:'hidden' }}>

                  {/* ── Fee header bar ── */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'8px 12px', backgroundColor:'#fff', borderBottom:'1px solid #e5e7eb' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ backgroundColor:'#dbeafe', color:'#1d4ed8', borderRadius:4,
                        padding:'2px 10px', fontSize:12, fontWeight:700 }}>{fee.period}</span>
                      {fee.waivedAmount > 0 && (
                        <span style={{ backgroundColor:'#ffedd5', color:'#ea580c', borderRadius:4,
                          padding:'2px 8px', fontSize:11 }}>&#8377;{fee.waivedAmount} already waived</span>
                      )}
                    </div>
                    <div style={{ fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ color:'#6b7280' }}>Total:</span>
                      <span style={{ fontWeight:600, color:'#111827' }}>&#8377;{fee.amount}</span>
                      <span style={{ color:'#d1d5db' }}>|</span>
                      <span style={{ color:'#dc2626', fontWeight:600 }}>Due: &#8377;{fee.remaining}</span>
                    </div>
                  </div>

                  {/* ── Waiver inputs ── */}
                  <div style={{ padding:'10px 12px', display:'flex', flexDirection:'column', gap:8 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <div>
                        <label style={{ fontSize:11, color:'#6b7280', marginBottom:3, display:'block', fontWeight:500 }}>
                          Waive Amount
                          <span style={{ color:'#9ca3af', fontWeight:400 }}> (blank = full &#8377;{fee.remaining})</span>
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text" style={{ fontSize:12 }}>&#8377;</span>
                          <input type="number" className="form-control" style={{ fontSize:13 }}
                            min={0} max={fee.remaining} placeholder={`Max ${fee.remaining}`}
                            value={waiverAmounts[fee._id] || ''}
                            onChange={(e) => setWaiverAmounts((p) => ({ ...p, [fee._id]: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize:11, color:'#6b7280', marginBottom:3, display:'block', fontWeight:500 }}>
                          Reason <span style={{ color:'#9ca3af', fontWeight:400 }}>(optional)</span>
                        </label>
                        <input type="text" className="form-control form-control-sm" style={{ fontSize:13 }}
                          placeholder="e.g. Financial hardship"
                          value={waiverReasons[fee._id] || ''}
                          onChange={(e) => setWaiverReasons((p) => ({ ...p, [fee._id]: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display:'flex', justifyContent:'flex-end' }}>
                      <button onClick={() => handleWaive(fee)} disabled={waiverSaving[fee._id]}
                        style={{ backgroundColor:'#0c3b73', color:'#fff', border:'none', borderRadius:6,
                          padding:'6px 18px', fontSize:12, fontWeight:600,
                          opacity: waiverSaving[fee._id] ? 0.7 : 1,
                          cursor: waiverSaving[fee._id] ? 'not-allowed' : 'pointer' }}>
                        {waiverSaving[fee._id] ? 'Saving...' : 'Apply Waiver'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <Modal
      title={
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Bus size={17} style={{ color:'#1d4ed8' }} />
          <span style={{ fontSize:15, fontWeight:600, color:'#111827' }}>
            Transport Fee — <strong>{studentName}</strong>
          </span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={720}
      destroyOnClose
      styles={{
        body: {
          maxHeight: 'calc(100vh - 160px)',
          overflowY: 'auto',
          padding: '12px 20px 16px',
        },
      }}
    >
      <Tabs items={tabItems} defaultActiveKey="1" size="small" />
    </Modal>
  )
}

export default TransportManageModal
