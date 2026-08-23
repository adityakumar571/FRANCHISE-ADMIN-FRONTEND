/* eslint-disable prettier/prettier */
/**
 * Screen 67 — Medicine Reminder
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bell, Plus, Edit2, Clock, CheckCircle, AlertTriangle, AlarmClock } from 'lucide-react'
import { CUSTOMERS, REMINDERS } from './mockData'
import PageHeader from '../components/PageHeader'

const Th = ({ c }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '11px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

const statusCfg = {
  Upcoming:  { bg: '#e0e7ff', color: '#0c3b73', icon: Clock },
  Overdue:   { bg: '#fee2e2', color: '#dc2626', icon: AlertTriangle },
  Completed: { bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  Snoozed:   { bg: '#fef3c7', color: '#d97706', icon: AlarmClock },
}

export default function MedicineReminder() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const cust      = CUSTOMERS.find(c => c.id === id) || CUSTOMERS[0]
  const [reminders, setReminders] = useState(REMINDERS)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ name: '', dose: '', start: '', nextDue: '' })

  const counts = {
    Upcoming:  reminders.filter(r => r.status === 'Upcoming').length,
    Overdue:   reminders.filter(r => r.status === 'Overdue').length,
    Completed: reminders.filter(r => r.status === 'Completed').length,
    Snoozed:   2,
  }

  const addReminder = () => {
    if (!form.name || !form.dose) { alert('Medicine name and dose are required'); return }
    setReminders(p => [...p, { ...form, status: 'Upcoming', overdue: false }])
    setForm({ name: '', dose: '', start: '', nextDue: '' })
    setShowForm(false)
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>

      <PageHeader icon={Bell} title="Medicine Reminder" subtitle="Upcoming medicine and refill reminders" color="#16a34a">
        <button onClick={() => navigate(`/franchise/customers/${cust.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#374151' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>
          <Plus size={14} /> Add Reminder
        </button>
      </PageHeader>

      {/* Customer Strip */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#0c3b73,#1a6fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          {cust.name[0]}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{cust.name}</p>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{cust.id} · {cust.phone}</p>
        </div>
      </div>

      {/* Summary Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {Object.entries(counts).map(([status, count]) => {
          const cfg = statusCfg[status]
          const Icon = cfg.icon
          return (
            <div key={status} style={{ padding: '18px 16px', background: cfg.bg, borderRadius: 12, textAlign: 'center', border: `1px solid ${cfg.color}22` }}>
              <Icon size={22} color={cfg.color} style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 11, color: cfg.color, margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 700 }}>{status}</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: cfg.color, margin: 0 }}>{count}</p>
            </div>
          )
        })}
      </div>

      {/* Add Reminder Form */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Add New Reminder</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
            {[
              { key: 'name',    label: 'Medicine Name *', placeholder: 'e.g. Metformin 500mg Tablet', type: 'text' },
              { key: 'dose',    label: 'Dose / Time *',   placeholder: 'e.g. 1-0-1 After Meal',       type: 'text' },
              { key: 'start',   label: 'Start Date',      placeholder: '',                             type: 'date' },
              { key: 'nextDue', label: 'Next Due Date',   placeholder: '',                             type: 'date' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff' }}>Cancel</button>
            <button onClick={addReminder} style={{ padding: '9px 18px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#16a34a', color: '#fff' }}>Save Reminder</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Medicine Name','Dose / Time','Start Date','Next Due','Status','Action'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {reminders.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No reminders added yet</td></tr>
              ) : reminders.map((r, i) => {
                const cfg = statusCfg[r.status] || statusCfg.Upcoming
                return (
                  <tr key={i} onMouseEnter={e => e.currentTarget.style.background='#fafafa'} onMouseLeave={e => e.currentTarget.style.background=''}>
                    <Td style={{ fontWeight: 600 }}>{r.name}</Td>
                    <Td style={{ fontSize: 12, color: '#6b7280' }}>{r.dose}</Td>
                    <Td style={{ fontSize: 12, color: '#6b7280' }}>{r.start}</Td>
                    <Td style={{ fontWeight: 600, color: r.overdue ? '#dc2626' : '#374151' }}>{r.nextDue}</Td>
                    <Td>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{r.status}</span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ fontSize: 11, fontWeight: 600, background: '#e0e7ff', color: '#0c3b73', border: 'none', borderRadius: 5, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Edit2 size={10} /> Edit
                        </button>
                        <button style={{ fontSize: 11, fontWeight: 600, background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 5, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <AlarmClock size={10} /> Snooze
                        </button>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid #f3f4f6' }}>
          <button style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer' }}>View All Reminders →</button>
        </div>
      </div>
    </div>
  )
}
