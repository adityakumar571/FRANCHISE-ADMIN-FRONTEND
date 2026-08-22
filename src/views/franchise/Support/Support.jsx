/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  HeadphonesIcon, Ticket, HelpCircle, BookOpen, Info,
  Phone, Mail, MessageCircle, Plus, Eye, ChevronRight,
  CheckCircle, Clock, AlertCircle, XCircle, Search,
  ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react'

/* ─── Mock tickets ─── */
const TICKETS = [
  { id: '#TK-2025-1058', subject: 'POS billing issue',              status: 'Open',        priority: 'High',   updated: '20 May 2025, 10:15 AM' },
  { id: '#TK-2025-1057', subject: 'Medicine stock not updating',    status: 'In Progress', priority: 'Medium', updated: '19 May 2025, 04:30 PM' },
  { id: '#TK-2025-1056', subject: 'Printer not working',            status: 'Open',        priority: 'Medium', updated: '19 May 2025, 11:20 AM' },
  { id: '#TK-2025-1055', subject: 'GST report mismatch',            status: 'Resolved',    priority: 'Low',    updated: '18 May 2025, 05:45 PM' },
  { id: '#TK-2025-1054', subject: 'Unable to login',                status: 'Closed',      priority: 'High',   updated: '18 May 2025, 09:30 AM' },
]

const FAQS = [
  { q: 'How do I add a new medicine?',        a: 'Go to Products → Add Product. Fill in medicine name, salt/generic name, company, MRP, stock and save.' },
  { q: 'How to backup my data?',              a: 'Go to Settings → System → Backup. You can configure auto-backup or trigger a manual backup from there.' },
  { q: 'How to generate GST report?',         a: 'Go to Reports → Financial Report. Select the date range and click Export to download the GST-ready report.' },
  { q: 'How to connect barcode scanner?',     a: 'Plug in USB barcode scanner. It works out of the box on billing page. For Bluetooth, go to Settings → Printer Settings.' },
  { q: 'How to manage user roles?',           a: 'Go to Settings → Security tab. From there you can manage roles and assign permissions to each staff member.' },
  { q: 'How to update medicine stock?',       a: 'Go to Inventory and use the Stock Adjustment button to increase or decrease stock for any item.' },
]

const GUIDES = [
  { title: 'Getting Started Guide',           tag: 'PDF' },
  { title: 'POS Billing Guide',               tag: 'PDF' },
  { title: 'Inventory Management Guide',      tag: 'PDF' },
  { title: 'Purchase & Supplier Guide',       tag: 'PDF' },
  { title: 'Reports & Analytics Guide',       tag: 'PDF' },
]

const STATUS_CFG = {
  Open:        { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'In Progress': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  Resolved:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Closed:      { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' },
}
const PRIORITY_CFG = {
  High:   { color: '#dc2626' },
  Medium: { color: '#d97706' },
  Low:    { color: '#16a34a' },
}

const StatusBadge = ({ val }) => {
  const c = STATUS_CFG[val] || STATUS_CFG.Closed
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>
      {val}
    </span>
  )
}

const Th = ({ c }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

/* ─── New Ticket Modal ─── */
function NewTicketModal({ onClose }) {
  const [form, setForm] = useState({ subject: '', category: 'Billing', priority: 'Medium', desc: '' })
  const s = (key) => (val) => setForm(p => ({ ...p, [key]: val }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', width: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Create New Ticket</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 20 }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Subject *</label>
            <input value={form.subject} onChange={e => s('subject')(e.target.value)} placeholder="Describe your issue briefly..."
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Category</label>
              <select value={form.category} onChange={e => s('category')(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
                {['Billing', 'Inventory', 'Reports', 'Settings', 'Login / Access', 'Printer', 'Other'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Priority</label>
              <select value={form.priority} onChange={e => s('priority')(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
                {['Low', 'Medium', 'High'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Description *</label>
            <textarea value={form.desc} onChange={e => s('desc')(e.target.value)} placeholder="Please describe your issue in detail..."
              rows={4} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}>Cancel</button>
          <button onClick={onClose} style={{ padding: '9px 18px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', background: '#0c3b73', cursor: 'pointer' }}>Submit Ticket</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main ─── */
export default function Support() {
  const [activeTab, setActiveTab]   = useState('support')
  const [showModal, setShowModal]   = useState(false)
  const [openFaq, setOpenFaq]       = useState(null)
  const [search, setSearch]         = useState('')

  const filteredTickets = TICKETS.filter(t =>
    search === '' || t.subject.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())
  )

  const TABS = [
    { id: 'support', label: '1. Support',    icon: HeadphonesIcon },
    { id: 'tickets', label: '2. Tickets',    icon: Ticket },
    { id: 'faqs',    label: '3. FAQs',       icon: HelpCircle },
    { id: 'guide',   label: '4. User Guide', icon: BookOpen },
    { id: 'about',   label: '5. About',      icon: Info },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {showModal && <NewTicketModal onClose={() => setShowModal(false)} />}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <HeadphonesIcon size={22} color="#0c3b73" /> Help Center
        </h1>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>We are here to help you. Get support and find answers.</p>
      </div>

      {/* Tab nav cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {TABS.map(t => {
          const Icon = t.icon
          const active = activeTab === t.id
          const colors = { support: '#0c3b73', tickets: '#2563eb', faqs: '#7c3aed', guide: '#d97706', about: '#0891b2' }
          const color = colors[t.id]
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '18px 12px', borderRadius: 12, border: active ? `2px solid ${color}` : '1px solid #e5e7eb', background: active ? color + '0c' : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} color={color} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: active ? color : '#374151', textAlign: 'center' }}>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── SUPPORT TAB ── */}
      {activeTab === 'support' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {/* Contact Support */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HeadphonesIcon size={18} color="#0c3b73" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Contact Support</p>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Our team is available to help</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: Mail, label: 'Email Support', value: 'support@pharmanexus.com', badge: '24/7', color: '#0c3b73' },
                { icon: Phone, label: 'Phone Support', value: '+91 9450180033', badge: '9AM–7PM', color: '#16a34a' },
                { icon: MessageCircle, label: 'WhatsApp Support', value: '+91 9450180033', badge: '9AM–7PM', color: '#16a34a' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f9fafb', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <c.icon size={16} color={c.color} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{c.label}</p>
                      <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{c.value}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>{c.badge}</span>
                </div>
              ))}
              <button style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                <MessageCircle size={14} /> Start Live Chat
              </button>
            </div>
          </div>

          {/* Recent Tickets */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Ticket size={16} color="#2563eb" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>My Recent Tickets</span>
              </div>
              <button onClick={() => setActiveTab('tickets')} style={{ fontSize: 12, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                View All <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TICKETS.slice(0, 4).map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f9fafb', borderRadius: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</p>
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0' }}>{t.id}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                    <StatusBadge val={t.status} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: PRIORITY_CFG[t.priority]?.color }}>{t.priority}</span>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowModal(true)} style={{ width: '100%', padding: '9px 0', borderRadius: 8, border: '2px dashed #e5e7eb', background: '#fff', color: '#0c3b73', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Plus size={14} /> Create New Ticket
              </button>
            </div>
          </div>

          {/* Popular FAQs */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HelpCircle size={16} color="#7c3aed" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Popular FAQs</span>
              </div>
              <button onClick={() => setActiveTab('faqs')} style={{ fontSize: 12, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                View All <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {FAQS.slice(0, 5).map((f, i) => (
                <button key={i} onClick={() => setActiveTab('faqs')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 10px', background: '#f9fafb', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{f.q}</span>
                  <ChevronRight size={13} color="#9ca3af" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TICKETS TAB ── */}
      {activeTab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'Total', value: TICKETS.length, color: '#0c3b73' },
                { label: 'Open', value: TICKETS.filter(t => t.status === 'Open').length, color: '#d97706' },
                { label: 'In Progress', value: TICKETS.filter(t => t.status === 'In Progress').length, color: '#2563eb' },
                { label: 'Resolved', value: TICKETS.filter(t => t.status === 'Resolved').length, color: '#16a34a' },
              ].map(c => (
                <div key={c.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 80 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{c.label}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={14} /> Create New Ticket
            </button>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ position: 'relative', maxWidth: 360 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ticket ID or subject..."
                style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Ticket ID', 'Subject', 'Status', 'Priority', 'Last Updated', 'Action'].map(h => <Th key={h} c={h} />)}
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.length === 0
                    ? <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No tickets found</td></tr>
                    : filteredTickets.map((t, i) => (
                      <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <Td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0c3b73', fontWeight: 600 }}>{t.id}</span></Td>
                        <Td style={{ fontWeight: 500 }}>{t.subject}</Td>
                        <Td><StatusBadge val={t.status} /></Td>
                        <Td><span style={{ fontSize: 12, fontWeight: 700, color: PRIORITY_CFG[t.priority]?.color }}>{t.priority}</span></Td>
                        <Td style={{ fontSize: 11, color: '#6b7280' }}>{t.updated}</Td>
                        <Td>
                          <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#e0e7ff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#0c3b73', fontSize: 12, fontWeight: 600 }}>
                            <Eye size={12} /> View
                          </button>
                        </Td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── FAQS TAB ── */}
      {activeTab === 'faqs' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((f, i) => (
              <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: openFaq === i ? '#f0f4ff' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: openFaq === i ? '#0c3b73' : '#111827' }}>{f.q}</span>
                  {openFaq === i ? <ChevronUp size={16} color="#0c3b73" /> : <ChevronDown size={16} color="#9ca3af" />}
                </button>
                {openFaq === i && (
                  <div style={{ padding: '12px 16px 16px', background: '#f8faff', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── USER GUIDE TAB ── */}
      {activeTab === 'guide' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <BookOpen size={18} color="#d97706" />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>User Guide</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GUIDES.map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={14} color="#d97706" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{g.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#fee2e2', color: '#dc2626' }}>{g.tag}</span>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0c3b73', display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600 }}>
                      <ExternalLink size={12} /> Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Info size={18} color="#0891b2" />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>System Information</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Product Name',    value: 'PharmaNexus ERP' },
                { label: 'Version',         value: 'v2.5.1' },
                { label: 'License Type',    value: 'Premium', highlight: true },
                { label: 'License Validity', value: '31 Dec 2026' },
                { label: 'Registered To',   value: 'Aarogya Medical Store' },
                { label: 'System Status',   value: 'All Systems Operational', green: true },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: r.green ? '#16a34a' : r.highlight ? '#0c3b73' : '#111827' }}>
                    {r.green && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#16a34a', marginRight: 5, verticalAlign: 'middle' }} />}
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ABOUT TAB ── */}
      {activeTab === 'about' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Info size={26} color="#0c3b73" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>About PharmaNexus ERP</h2>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>An all-in-one solution for pharmacy, medical store, and healthcare businesses.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: '100+ Features',    icon: CheckCircle, color: '#16a34a' },
              { label: '5000+ Users',      icon: CheckCircle, color: '#0c3b73' },
              { label: '24/7 Support',     icon: CheckCircle, color: '#7c3aed' },
              { label: 'Secure & Cloud',   icon: CheckCircle, color: '#d97706' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px', background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6' }}>
                <c.icon size={18} color={c.color} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{c.label}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.8, margin: 0 }}>
            PharmaNexus ERP helps pharmacy owners manage their entire business — from billing and inventory to staff, suppliers, and analytics. Built for Indian pharmacies with GST compliance, live wholesale rates, and AI-powered insights.
          </p>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16 }}>© 2025 PharmaNexus. All Rights Reserved.</p>
        </div>
      )}

      {/* Bottom — support + guide + about cards (shown on Support tab) */}
      {activeTab === 'support' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <BookOpen size={16} color="#d97706" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>User Guide</span>
              <button onClick={() => setActiveTab('guide')} style={{ fontSize: 12, color: '#0c3b73', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
                View All Guides <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {GUIDES.map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#f9fafb', borderRadius: 8 }}>
                  <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{g.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#fee2e2', color: '#dc2626' }}>{g.tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Info size={16} color="#0891b2" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>About PharmaNexus ERP</span>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: '0 0 16px' }}>
              An all-in-one solution for pharmacy, medical store, and healthcare businesses.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[['100+', 'Features'], ['5000+', 'Happy Users'], ['24/7', 'Support']].map(([v, l]) => (
                <div key={l} style={{ textAlign: 'center', padding: '10px', background: '#f9fafb', borderRadius: 8 }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: '#0c3b73', margin: 0 }}>{v}</p>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{l}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>All Systems Operational</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
