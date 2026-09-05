/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { HelpCircle, Plus, Eye, MessageSquare, CheckCircle2, Clock, AlertCircle, Phone, Mail, X, Save } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const STATUS_CFG = {
  Open:        { bg: '#dcfce7', color: '#16a34a', icon: Clock },
  'In Progress':{ bg: '#e0e7ff', color: '#0c3b73', icon: AlertCircle },
  Resolved:    { bg: '#f0fdf4', color: '#16a34a', icon: CheckCircle2 },
  Closed:      { bg: '#f3f4f6', color: '#6b7280', icon: CheckCircle2 },
}
const PRIORITY_C = { Low: '#6b7280', Medium: '#d97706', High: '#dc2626', Urgent: '#e11d48' }

const TABS = ['Support', 'Tickets', 'FAQs', 'User Guide', 'About']

export default function HelpSupport() {
  const [activeTab, setActiveTab] = useState('Tickets')
  const [tickets, setTickets]     = useState([])
  const [faqs, setFaqs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [form, setForm]             = useState({ subject: '', category: 'Technical', priority: 'Medium', description: '' })
  const [expandedFaq, setExpandedFaq] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [tRes, fRes] = await Promise.allSettled([
          getRequest('/franchise/support/tickets'),
          getRequest('/franchise/support/faqs'),
        ])
        if (tRes.status === 'fulfilled') setTickets(tRes.value.data?.data?.tickets || [])
        if (fRes.status === 'fulfilled') setFaqs(fRes.value.data?.data || [])
      } catch { toast.error('Failed to load support data') }
      finally   { setLoading(false) }
    }
    load()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.subject || !form.description) { toast.error('Fill required fields'); return }
    setSaving(true)
    try {
      await postRequest({ url: '/franchise/support/tickets', cred: form })
      toast.success('Ticket created! Our team will respond shortly.')
      setCreateOpen(false)
      setForm({ subject: '', category: 'Technical', priority: 'Medium', description: '' })
      const res = await getRequest('/franchise/support/tickets')
      setTickets(res.data?.data?.tickets || [])
    } catch { toast.error('Failed to create ticket') }
    finally   { setSaving(false) }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={HelpCircle} title="Help & Support" subtitle="Get help, track tickets and find answers" color="#0c3b73">
        <button onClick={() => setCreateOpen(true)}
          style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Plus size={13} /> New Ticket
        </button>
      </PageHeader>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: '6px 16px', borderRadius: 7, border: `1px solid ${activeTab === t ? '#0c3b73' : '#e5e7eb'}`, background: activeTab === t ? '#0c3b73' : '#fff', color: activeTab === t ? '#fff' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Support Tab */}
      {activeTab === 'Support' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>Contact Us</h3>
            {[
              { label: 'Phone Support',  value: '+91 1800-XXX-XXXX', icon: Phone, note: 'Mon-Sat 9AM-7PM' },
              { label: 'Email Support',  value: 'support@pharmanexus.com', icon: Mail, note: 'Response in 24 hrs' },
              { label: 'Live Chat',      value: 'Chat with us below', icon: MessageSquare, note: 'Available 24x7' },
            ].map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <c.icon size={16} color="#0c3b73" />
                </div>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#111827' }}>{c.label}</p>
                  <p style={{ margin: '0 0 2px', fontSize: 13, color: '#0c3b73', fontWeight: 600 }}>{c.value}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{c.note}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>Recent Tickets</h3>
            {loading ? <p style={{ color: '#9ca3af' }}>Loading...</p> : tickets.slice(0, 3).map((t, i) => {
              const cfg = STATUS_CFG[t.status] || STATUS_CFG.Open
              return (
                <div key={t._id || i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 600, color: '#111827' }}>{t.subject}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{t.ticketId} · Updated {t.updatedAt}</p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>{t.status}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'Tickets' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Ticket ID', 'Subject', 'Category', 'Priority', 'Status', 'Last Updated'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading
                ? Array(4).fill(0).map((_, i) => <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j} style={{ padding: '10px 14px' }}><div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} /></td>)}</tr>)
                : tickets.length === 0
                  ? <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>No tickets yet. Create your first support ticket above.</td></tr>
                  : tickets.map((t, i) => {
                    const cfg  = STATUS_CFG[t.status] || STATUS_CFG.Open
                    const pColor = PRIORITY_C[t.priority] || '#6b7280'
                    return (
                      <tr key={t._id || i}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '10px 14px', fontSize: 13, fontFamily: 'monospace', color: '#0c3b73', fontWeight: 700, borderBottom: '1px solid #f3f4f6' }}>{t.ticketId}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #f3f4f6' }}>{t.subject}</td>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{t.category}</td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: pColor + '18', color: pColor }}>{t.priority}</span>
                        </td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{t.status}</span>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{t.updatedAt}</td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      )}

      {/* FAQs Tab */}
      {activeTab === 'FAQs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? <p style={{ color: '#9ca3af' }}>Loading FAQs...</p> : faqs.map((faq, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
              <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                style={{ width: '100%', padding: '14px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 600, color: '#111827' }}>
                {faq.q}
                <span style={{ fontSize: 18, color: '#6b7280', flexShrink: 0, marginLeft: 12 }}>{expandedFaq === i ? '−' : '+'}</span>
              </button>
              {expandedFaq === i && (
                <div style={{ padding: '0 16px 14px', fontSize: 13, color: '#6b7280', lineHeight: 1.6, borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ paddingTop: 12 }}>{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* User Guide Tab */}
      {activeTab === 'User Guide' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>User Guides & Documentation</h3>
          {[
            { title: 'Getting Started Guide',    desc: 'Quick setup and initial configuration' },
            { title: 'POS Billing Manual',       desc: 'Complete guide for billing operations' },
            { title: 'Inventory Management',     desc: 'Stock management best practices' },
            { title: 'Purchase & GRN Guide',     desc: 'How to manage purchases and inward goods' },
            { title: 'Accounts & Finance',       desc: 'Accounting module walkthrough' },
            { title: 'Reports & Analytics',      desc: 'Understanding and using reports' },
          ].map((g, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#111827' }}>{g.title}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{g.desc}</p>
              </div>
              <button style={{ padding: '5px 14px', border: '1px solid #0c3b73', borderRadius: 7, background: '#fff', color: '#0c3b73', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                View PDF
              </button>
            </div>
          ))}
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'About' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, maxWidth: 480 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>System Information</h3>
          {[
            { label: 'Product',       value: 'PharmaNexus v2.1.0' },
            { label: 'Build Date',    value: 'Sep 2026' },
            { label: 'License',       value: 'Enterprise' },
            { label: 'Support Email', value: 'support@pharmanexus.com' },
            { label: 'Company',       value: 'PharmaNexus Technologies Pvt. Ltd.' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
              <span style={{ color: '#6b7280' }}>{label}</span>
              <span style={{ fontWeight: 600, color: '#111827' }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      {createOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 500, maxWidth: '95vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Create Support Ticket</h3>
              <button onClick={() => setCreateOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Subject *</label>
                <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Brief description of issue"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }}>
                    {['Technical', 'Billing', 'Inventory', 'POS', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }}>
                    {['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Description *</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe your issue in detail..." rows={4}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setCreateOpen(false)} style={{ padding: '9px 20px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', border: 'none', borderRadius: 8, background: saving ? '#9ca3af' : '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  <Save size={14} /> {saving ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
