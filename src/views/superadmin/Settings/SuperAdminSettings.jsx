/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import {
  Monitor, Shield, Bell, Users, Archive, HeadphonesIcon, Save, ToggleLeft, ToggleRight,
  Upload, Globe, Lock, Mail, Phone as PhoneIcon, MessageSquare,
} from 'lucide-react'

const C = {
  primary: '#0c3b73',
  accent: '#fabf22',
  success: '#16a34a',
  danger: '#dc2626',
  border: '#e5e7eb',
  bg: '#f8f9fb',
  white: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
}
const font = { fontFamily: "'Inter', sans-serif" }

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
    <span style={{ fontSize: 13, color: C.text }}>{label}</span>
    <div onClick={onChange} style={{ cursor: 'pointer' }}>
      {checked
        ? <ToggleRight size={28} color={C.success} />
        : <ToggleLeft size={28} color={C.muted} />}
    </div>
  </div>
)

const FieldInput = ({ label, hint, ...props }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 5 }}>{label}</label>
    {hint && <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{hint}</div>}
    <input {...props} style={{ width: '100%', padding: '9px 12px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', background: C.white, boxSizing: 'border-box', ...props.style }} />
  </div>
)

const FieldSelect = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 5 }}>{label}</label>
    <select {...props} style={{ width: '100%', padding: '9px 12px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', background: C.white, boxSizing: 'border-box' }}>
      {children}
    </select>
  </div>
)

const FieldTextarea = ({ label, ...props }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 5 }}>{label}</label>
    <textarea {...props} style={{ width: '100%', padding: '9px 12px', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, outline: 'none', background: C.white, resize: 'vertical', boxSizing: 'border-box', ...props.style }} />
  </div>
)

const SaveBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary, color: C.white, border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
    <Save size={15} /> Save Changes
  </button>
)

const SectionTitle = ({ children }) => (
  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.primary, margin: '0 0 18px', paddingBottom: 10, borderBottom: `2px solid ${C.border}` }}>{children}</h3>
)

const Grid2 = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>{children}</div>
)

// ─── Tab Contents ─────────────────────────────────────────────────────────────

// Platform
const PlatformTab = () => {
  const [state, setState] = useState({
    name: 'PharmaNexus', timezone: 'Asia/Kolkata', language: 'en', maintenance: false, platformStatus: true,
  })
  return (
    <div>
      <SectionTitle>Platform Configuration</SectionTitle>
      <Grid2>
        <FieldInput label="Platform Name" value={state.name} onChange={e => setState(s => ({ ...s, name: e.target.value }))} />
        <FieldSelect label="Default Timezone" value={state.timezone} onChange={e => setState(s => ({ ...s, timezone: e.target.value }))}>
          <option value="Asia/Kolkata">IST — Asia/Kolkata (UTC+5:30)</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time (UTC-5)</option>
        </FieldSelect>
        <FieldSelect label="Default Language" value={state.language} onChange={e => setState(s => ({ ...s, language: e.target.value }))}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
        </FieldSelect>
      </Grid2>

      {/* Logo Upload */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 5 }}>Platform Logo</label>
        <div style={{ border: `2px dashed ${C.border}`, borderRadius: 8, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', background: C.bg }}>
          <Upload size={24} color={C.muted} style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 13, color: C.muted }}>Click to upload or drag and drop</div>
          <div style={{ fontSize: 11, color: C.border, marginTop: 4 }}>PNG, JPG up to 2MB</div>
        </div>
      </div>

      <Toggle label="Maintenance Mode" checked={state.maintenance} onChange={() => setState(s => ({ ...s, maintenance: !s.maintenance }))} />
      <Toggle label="Platform Active" checked={state.platformStatus} onChange={() => setState(s => ({ ...s, platformStatus: !s.platformStatus }))} />
      <div style={{ marginTop: 20 }}><SaveBtn /></div>
    </div>
  )
}

// Security
const SecurityTab = () => {
  const [state, setState] = useState({
    sessionTimeout: 30, maxAttempts: 5, minPassword: 8, force2fa: false, ipWhitelist: '', auditRetention: 90,
  })
  return (
    <div>
      <SectionTitle>Security Settings</SectionTitle>
      <Grid2>
        <FieldInput label="Session Timeout (minutes)" type="number" value={state.sessionTimeout} onChange={e => setState(s => ({ ...s, sessionTimeout: e.target.value }))} />
        <FieldInput label="Max Login Attempts" type="number" value={state.maxAttempts} onChange={e => setState(s => ({ ...s, maxAttempts: e.target.value }))} />
        <FieldInput label="Password Minimum Length" type="number" value={state.minPassword} onChange={e => setState(s => ({ ...s, minPassword: e.target.value }))} />
        <FieldInput label="Audit Log Retention (days)" type="number" value={state.auditRetention} onChange={e => setState(s => ({ ...s, auditRetention: e.target.value }))} />
      </Grid2>
      <Toggle label="Force Two-Factor Authentication (2FA) for all users" checked={state.force2fa} onChange={() => setState(s => ({ ...s, force2fa: !s.force2fa }))} />
      <div style={{ marginTop: 16 }}>
        <FieldTextarea label="IP Whitelist (one IP per line)" value={state.ipWhitelist} onChange={e => setState(s => ({ ...s, ipWhitelist: e.target.value }))} placeholder={'192.168.1.1\n10.0.0.0/24'} rows={4} />
      </div>
      <SaveBtn />
    </div>
  )
}

// Notifications
const NotificationsTab = () => {
  const [toggles, setToggles] = useState({
    expiryEmail: true, expirySms: true, newFranchise: true, supplierOnboard: false, lowStock: true, auditAlert: false,
  })
  const [email, setEmail] = useState('admin@pharmanexus.in')
  const [daysAlert, setDaysAlert] = useState(7)

  const items = [
    { key: 'expiryEmail', label: 'Subscription Expiry Email' },
    { key: 'expirySms', label: 'Subscription Expiry SMS' },
    { key: 'newFranchise', label: 'New Franchise Registered Alert' },
    { key: 'supplierOnboard', label: 'Supplier Onboarding Alert' },
    { key: 'lowStock', label: 'Low Stock Alert' },
    { key: 'auditAlert', label: 'Audit Activity Alert' },
  ]

  return (
    <div>
      <SectionTitle>Notification Preferences</SectionTitle>
      <Grid2>
        <FieldInput label="Notification Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <FieldInput label="Alert Days Before Expiry" type="number" value={daysAlert} onChange={e => setDaysAlert(e.target.value)} />
      </Grid2>
      <div style={{ background: C.bg, borderRadius: 10, padding: '4px 16px', marginBottom: 20 }}>
        {items.map(item => (
          <Toggle key={item.key} label={item.label} checked={toggles[item.key]} onChange={() => setToggles(t => ({ ...t, [item.key]: !t[item.key] }))} />
        ))}
      </div>
      <SaveBtn />
    </div>
  )
}

// Roles & Permissions
const RolesTab = () => {
  const roles = ['Super Admin', 'Admin', 'Franchise Owner', 'Branch Manager', 'Pharmacist', 'Cashier']
  const perms = ['View Dashboard', 'Create Franchise', 'Edit Franchise', 'Suspend Franchise', 'Manage Suppliers', 'View Reports', 'Export Data', 'Manage Users']

  const initPerms = {}
  roles.forEach((r, ri) => {
    initPerms[r] = {}
    perms.forEach((p, pi) => {
      initPerms[r][p] = ri <= 1 || (ri === 2 && pi <= 4) || (ri >= 3 && pi === 0)
    })
  })

  const [matrix, setMatrix] = useState(initPerms)

  const toggle = (role, perm) => {
    if (role === 'Super Admin') return
    setMatrix(m => ({ ...m, [role]: { ...m[role], [perm]: !m[role][perm] } }))
  }

  return (
    <div>
      <SectionTitle>Roles & Permissions</SectionTitle>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: C.muted, background: C.bg, borderBottom: `1px solid ${C.border}`, minWidth: 140 }}>Permission</th>
              {roles.map(r => (
                <th key={r} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: r === 'Super Admin' ? C.primary : C.muted, background: C.bg, borderBottom: `1px solid ${C.border}`, minWidth: 90 }}>
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perms.map((p, pi) => (
              <tr key={p} style={{ background: pi % 2 === 0 ? C.white : C.bg }}>
                <td style={{ padding: '10px 12px', fontSize: 13, color: C.text, borderBottom: `1px solid ${C.border}`, fontWeight: 500 }}>{p}</td>
                {roles.map(r => (
                  <td key={r} style={{ padding: '10px 8px', textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>
                    <div onClick={() => toggle(r, p)} style={{ cursor: r === 'Super Admin' ? 'default' : 'pointer', display: 'inline-flex', justifyContent: 'center' }}>
                      {matrix[r][p]
                        ? <ToggleRight size={22} color={r === 'Super Admin' ? '#9ca3af' : C.success} />
                        : <ToggleLeft size={22} color={C.border} />}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 10, marginBottom: 16 }}>* Super Admin permissions are locked and cannot be modified.</div>
      <SaveBtn />
    </div>
  )
}

// Inventory Policy
const InventoryTab = () => {
  const [state, setState] = useState({
    fefo: true, nearExpiryDays: 30, lowStockPct: 20, batchMandatory: true, expiryMandatory: true,
  })
  return (
    <div>
      <SectionTitle>Inventory Policy</SectionTitle>
      <Grid2>
        <FieldInput label="Near Expiry Alert (days before)" type="number" value={state.nearExpiryDays} onChange={e => setState(s => ({ ...s, nearExpiryDays: e.target.value }))} />
        <FieldInput label="Low Stock Threshold (%)" type="number" value={state.lowStockPct} onChange={e => setState(s => ({ ...s, lowStockPct: e.target.value }))} />
      </Grid2>
      <div style={{ background: C.bg, borderRadius: 10, padding: '4px 16px', marginBottom: 20 }}>
        <Toggle label="Use FEFO (First Expiry First Out) — recommended over FIFO" checked={state.fefo} onChange={() => setState(s => ({ ...s, fefo: !s.fefo }))} />
        <Toggle label="Batch Number Mandatory on Purchase Entry" checked={state.batchMandatory} onChange={() => setState(s => ({ ...s, batchMandatory: !s.batchMandatory }))} />
        <Toggle label="Expiry Date Mandatory on Purchase Entry" checked={state.expiryMandatory} onChange={() => setState(s => ({ ...s, expiryMandatory: !s.expiryMandatory }))} />
      </div>
      <SaveBtn />
    </div>
  )
}

// Support
const SupportTab = () => {
  const [state, setState] = useState({
    email: 'support@pharmanexus.in', phone: '+91 98765 43210', whatsapp: '+91 90000 12345', autoClose: 7, slaHours: 24,
  })
  return (
    <div>
      <SectionTitle>Support Configuration</SectionTitle>
      <Grid2>
        <FieldInput label="Support Email" type="email" value={state.email} onChange={e => setState(s => ({ ...s, email: e.target.value }))} />
        <FieldInput label="Support Phone" value={state.phone} onChange={e => setState(s => ({ ...s, phone: e.target.value }))} />
        <FieldInput label="WhatsApp Number" value={state.whatsapp} onChange={e => setState(s => ({ ...s, whatsapp: e.target.value }))} />
        <FieldInput label="Ticket Auto-close (days)" type="number" value={state.autoClose} onChange={e => setState(s => ({ ...s, autoClose: e.target.value }))} />
        <FieldInput label="SLA Response Time (hours)" type="number" value={state.slaHours} onChange={e => setState(s => ({ ...s, slaHours: e.target.value }))} />
      </Grid2>
      <SaveBtn />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SuperAdminSettings = () => {
  const [activeTab, setActiveTab] = useState('platform')

  const tabs = [
    { key: 'platform', label: 'Platform', icon: <Monitor size={16} /> },
    { key: 'security', label: 'Security', icon: <Shield size={16} /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { key: 'roles', label: 'Roles & Permissions', icon: <Users size={16} /> },
    { key: 'inventory', label: 'Inventory Policy', icon: <Archive size={16} /> },
    { key: 'support', label: 'Support', icon: <HeadphonesIcon size={16} /> },
  ]

  const renderTab = () => {
    switch (activeTab) {
      case 'platform': return <PlatformTab />
      case 'security': return <SecurityTab />
      case 'notifications': return <NotificationsTab />
      case 'roles': return <RolesTab />
      case 'inventory': return <InventoryTab />
      case 'support': return <SupportTab />
      default: return null
    }
  }

  return (
    <div style={{ ...font, background: C.bg, minHeight: '100vh', padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: 0 }}>Platform Settings</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>Configure platform-wide preferences, security, and operational policies</p>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div style={{ width: 220, flexShrink: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, background: C.primary }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>Settings</span>
          </div>
          {tabs.map(t => {
            const isActive = activeTab === t.key
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', border: 'none', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: 'pointer', background: isActive ? '#e8f0fb' : C.white, color: isActive ? C.primary : C.muted, textAlign: 'left', borderLeft: isActive ? `3px solid ${C.primary}` : '3px solid transparent', transition: 'all .15s' }}>
                <span style={{ color: isActive ? C.primary : C.muted }}>{t.icon}</span>
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, minHeight: 400 }}>
          {renderTab()}
        </div>
      </div>
    </div>
  )
}

export default SuperAdminSettings
