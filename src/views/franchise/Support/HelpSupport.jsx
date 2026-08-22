/* eslint-disable prettier/prettier */
/**
 * HelpSupport — Franchise Help & Support
 * Ticket creation, ticket list, FAQs and contact info
 */
import { useState } from 'react'
import { HelpCircle, Plus, Eye, MessageSquare, CheckCircle2, Clock, AlertCircle, Phone, Mail, BookOpen } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const MOCK_TICKETS = [
  { id: 'TKT-0012', subject: 'Unable to print invoice', category: 'Technical', priority: 'High', status: 'Open', created: '22 Aug 2026', updated: '22 Aug 2026, 10:30 AM', messages: 2 },
  { id: 'TKT-0011', subject: 'Subscription renewal not reflecting', category: 'Billing', priority: 'High', status: 'In Progress', created: '20 Aug 2026', updated: '21 Aug 2026, 3:15 PM', messages: 4 },
  { id: 'TKT-0010', subject: 'How to add a new rack?', category: 'How To', priority: 'Low', status: 'Resolved', created: '18 Aug 2026', updated: '19 Aug 2026, 11:00 AM', messages: 3 },
  { id: 'TKT-0009', subject: 'GST calculation seems incorrect on invoice', category: 'Billing', priority: 'Medium', status: 'Resolved', created: '15 Aug 2026', updated: '16 Aug 2026, 9:00 AM', messages: 5 },
]

const FAQS = [
  { q: 'How do I add a new medicine to the catalogue?', a: 'Go to Medicines → click "Add Medicine" → fill in the name, brand, composition, pack size and GST details → Save.' },
  { q: 'How do I process a sales return?', a: 'Go to Sales/POS → Sales Returns → click "New Return" → search for the original invoice → select items to return → confirm.' },
  { q: 'How do I create a Purchase Order?', a: 'Go to Purchase → Purchase Orders → "Create PO" → select supplier → add items with quantities → Submit.' },
  { q: 'How do I update supplier stock and pricing?', a: 'Supplier stock and pricing is managed by the distributor/wholesaler on their portal. You can view live rates in Purchase → Live Rate Compare.' },
  { q: 'How do I close the day?', a: 'Go to Sales/POS → Day Closing → verify the transaction summary → enter physical cash count → click "Close Day".' },
  { q: 'Why is my subscription showing as expiring?', a: 'Your franchise subscription is managed by your Admin. Please contact your Admin to renew. You can also raise a support ticket.' },
]

const statusConfig = {
  Open: { color: '#0891b2', bg: '#f0f9ff', icon: AlertCircle },
  'In Progress': { color: '#d97706', bg: '#fffbeb', icon: Clock },
  Resolved: { color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle2 },
}

const priorityColor = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' }

const NewTicketModal = ({ onClose }) => {
  const [form, setForm] = useState({ subject: '', category: 'Technical', priority: 'Medium', description: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>New Support Ticket</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Subject *</label>
            <input
              value={form.subject}
              onChange={e => set('subject', e.target.value)}
              placeholder="Brief description of your issue"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}>
                {['Technical', 'Billing', 'How To', 'Feature Request', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}>
                {['Low', 'Medium', 'High'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Description *</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe your issue in detail. Include steps to reproduce if applicable."
              rows={5}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>Submit Ticket</button>
        </div>
      </div>
    </div>
  )
}

const TicketDetailModal = ({ ticket, onClose }) => {
  if (!ticket) return null
  const cfg = statusConfig[ticket.status] || {}
  const StatusIcon = cfg.icon || Clock

  const messages = [
    { from: 'You', time: '22 Aug 2026, 9:00 AM', text: 'I am unable to print invoices. The print button is not working.' },
    { from: 'Support', time: '22 Aug 2026, 10:30 AM', text: 'Hi, we have received your ticket. Could you please let us know which browser you are using?' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{ticket.subject}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>{ticket.id} · {ticket.category} · Created {ticket.created}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', gap: 5 }}>
            <StatusIcon size={11} /> {ticket.status}
          </span>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: priorityColor[ticket.priority] + '18', color: priorityColor[ticket.priority] }}>
            {ticket.priority} Priority
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              padding: '12px 16px', borderRadius: 10,
              background: m.from === 'You' ? '#f0f9ff' : '#f9fafb',
              border: `1px solid ${m.from === 'You' ? '#bae6fd' : '#e5e7eb'}`,
              alignSelf: m.from === 'You' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: m.from === 'You' ? '#0891b2' : '#374151' }}>{m.from}</span>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>{m.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{m.text}</p>
            </div>
          ))}
        </div>

        {ticket.status !== 'Resolved' && (
          <div>
            <textarea
              placeholder="Type your reply…"
              rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Close</button>
              <button style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>Send Reply</button>
            </div>
          </div>
        )}
        {ticket.status === 'Resolved' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

const HelpSupport = () => {
  const [showNew, setShowNew] = useState(false)
  const [viewTicket, setViewTicket] = useState(null)
  const [tab, setTab] = useState('tickets')
  const [faqOpen, setFaqOpen] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={HelpCircle} title="Help & Support" subtitle="Raise tickets, browse FAQs and contact us" color="#0c3b73">
        <button onClick={() => setShowNew(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#0c3b73', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#fff', fontWeight: 600 }}>
          <Plus size={14} /> New Ticket
        </button>
      </PageHeader>

      {/* Contact Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {[
          { icon: Phone, label: 'Phone Support', value: '+91 98765 43210', sub: 'Mon–Sat, 9AM–6PM', color: '#16a34a' },
          { icon: Mail, label: 'Email Support', value: 'support@pharmanexus.com', sub: 'Reply within 24 hours', color: '#0891b2' },
          { icon: MessageSquare, label: 'Live Chat', value: 'Available in-app', sub: 'Mon–Fri, 10AM–5PM', color: '#7c3aed' },
        ].map(c => (
          <div key={c.label} style={{ flex: '1 1 200px', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: c.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <c.icon size={18} color={c.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{c.label}</p>
              <p style={{ margin: '2px 0 1px', fontSize: 13, fontWeight: 700, color: '#111827' }}>{c.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb' }}>
        {[{ id: 'tickets', label: 'My Tickets', icon: MessageSquare }, { id: 'faq', label: 'FAQs', icon: BookOpen }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
            color: tab === t.id ? '#0c3b73' : '#6b7280',
            borderBottom: tab === t.id ? '2px solid #0c3b73' : '2px solid transparent',
            marginBottom: -2, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      {tab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MOCK_TICKETS.map(t => {
            const cfg = statusConfig[t.status] || {}
            const SIcon = cfg.icon || Clock
            return (
              <div key={t.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <SIcon size={18} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#9ca3af' }}>{t.id}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: priorityColor[t.priority] + '18', color: priorityColor[t.priority] }}>{t.priority}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: '#f3f4f6', color: '#6b7280' }}>{t.category}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>{t.subject}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9ca3af' }}>Last updated: {t.updated} · {t.messages} messages</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{t.status}</span>
                  <button onClick={() => setViewTicket(t)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                    <Eye size={13} /> View
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* FAQ */}
      {tab === 'faq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <button
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                style={{
                  width: '100%', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{faq.q}</span>
                <span style={{ fontSize: 16, color: '#9ca3af', transform: faqOpen === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginLeft: 12 }}>+</span>
              </button>
              {faqOpen === i && (
                <div style={{ padding: '0 18px 14px', fontSize: 13, color: '#6b7280', lineHeight: 1.6, borderTop: '1px solid #f3f4f6' }}>
                  <p style={{ margin: '12px 0 0' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showNew && <NewTicketModal onClose={() => setShowNew(false)} />}
      {viewTicket && <TicketDetailModal ticket={viewTicket} onClose={() => setViewTicket(null)} />}
    </div>
  )
}

export default HelpSupport
