/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react'
import {
  Monitor, Shield, Bell, Users, Archive, HeadphonesIcon, Save,
  ToggleLeft, ToggleRight, Upload, RefreshCw,
} from 'lucide-react'
import { getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

/* ─── palette ─── */
const C = {
  primary: '#0c3b73', accent: '#fabf22', success: '#16a34a',
  danger: '#dc2626', border: '#e5e7eb', bg: '#f8f9fb',
  white: '#ffffff', text: '#111827', muted: '#6b7280',
}
const font = { fontFamily: "'Inter', sans-serif" }

/* ─── shared UI ─── */
const Toggle = ({ checked, onChange, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
    <span style={{ fontSize: 13, color: C.text }}>{label}</span>
    <div onClick={onChange} style={{ cursor: 'pointer' }}>
      {checked
        ? <ToggleRight size={28} color={C.success} />
        : <ToggleLeft  size={28} color={C.muted} />}
    </div>
  </div>
)

const FieldInput = ({ label, hint, ...props }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 5 }}>{label}</label>
    {hint && <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{hint}</div>}
    <input {...props} style={{ width: '100%', padding: '9px 12px', border: `1px solid ${C.border}`,
      borderRadius: 7, fontSize: 13, outline: 'none', background: C.white,
      boxSizing: 'border-box', ...props.style }} />
  </div>
)

const FieldSelect = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 5 }}>{label}</label>
    <select {...props} style={{ width: '100%', padding: '9px 12px', border: `1px solid ${C.border}`,
      borderRadius: 7, fontSize: 13, outline: 'none', background: C.white, boxSizing: 'border-box' }}>
      {children}
    </select>
  </div>
)

const FieldTextarea = ({ label, ...props }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 5 }}>{label}</label>
    <textarea {...props} style={{ width: '100%', padding: '9px 12px', border: `1px solid ${C.border}`,
      borderRadius: 7, fontSize: 13, outline: 'none', background: C.white,
      resize: 'vertical', boxSizing: 'border-box', ...props.style }} />
  </div>
)

const SectionTitle = ({ children }) => (
  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.primary, margin: '0 0 18px',
    paddingBottom: 10, borderBottom: `2px solid ${C.border}` }}>{children}</h3>
)

const Grid2 = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>{children}</div>
)

/* ─── skeleton ─── */
const Skeleton = ({ rows = 4 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i}>
        <div style={{ height: 10, width: '30%', background: '#f3f4f6', borderRadius: 5, marginBottom: 8 }} />
        <div style={{ height: 36, background: '#f3f4f6', borderRadius: 7 }} />
      </div>
    ))}
  </div>
)

/* ─── save button ─── */
const SaveBtn = ({ onClick, saving }) => (
  <button
    onClick={onClick}
    disabled={saving}
    style={{ display: 'flex', alignItems: 'center', gap: 6, background: saving ? '#93c5fd' : C.primary,
      color: C.white, border: 'none', borderRadius: 8, padding: '10px 22px',
      fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', marginTop: 8 }}>
    {saving ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
    {saving ? 'Saving…' : 'Save Changes'}
  </button>
)

/* ══════════════════════════════════════════════════
   TAB COMPONENTS
══════════════════════════════════════════════════ */

/* ── Platform ── */
const PlatformTab = ({ settings, onChange, onSave, saving, loading }) => {
  if (loading) return <Skeleton rows={5} />
  return (
    <div>
      <SectionTitle>Platform Configuration</SectionTitle>
      <Grid2>
        <FieldInput label="Platform Name"
          value={settings.platformName || ''}
          onChange={e => onChange('platformName', e.target.value)} />
        <FieldSelect label="Default Timezone"
          value={settings.timezone || 'Asia/Kolkata'}
          onChange={e => onChange('timezone', e.target.value)}>
          <option value="Asia/Kolkata">IST — Asia/Kolkata (UTC+5:30)</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time (UTC-5)</option>
          <option value="Europe/London">London (UTC+0/+1)</option>
          <option value="Asia/Dubai">Dubai (UTC+4)</option>
        </FieldSelect>
        <FieldInput label="Admin Email" type="email"
          value={settings.adminEmail || ''}
          onChange={e => onChange('adminEmail', e.target.value)} />
        <FieldInput label="Support Email" type="email"
          value={settings.supportEmail || ''}
          onChange={e => onChange('supportEmail', e.target.value)} />
        <FieldInput label="Contact Phone"
          value={settings.phone || ''}
          onChange={e => onChange('phone', e.target.value)} />
        <FieldSelect label="Currency"
          value={settings.currency || 'INR (₹)'}
          onChange={e => onChange('currency', e.target.value)}>
          {['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'AED (د.إ)'].map(c => <option key={c}>{c}</option>)}
        </FieldSelect>
      </Grid2>
      <div style={{ gridColumn: '1/-1' }}>
        <FieldTextarea label="Business Address"
          value={settings.address || ''}
          onChange={e => onChange('address', e.target.value)}
          rows={2} placeholder="Full business address" />
      </div>

      {/* Logo upload placeholder */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: 'block', marginBottom: 5 }}>Platform Logo URL</label>
        <FieldInput label="" value={settings.logoUrl || ''} onChange={e => onChange('logoUrl', e.target.value)} placeholder="https://cdn.example.com/logo.png" />
      </div>

      <div style={{ background: C.bg, borderRadius: 10, padding: '4px 16px', marginBottom: 20 }}>
        <Toggle label="Maintenance Mode"
          checked={!!settings.maintenanceMode}
          onChange={() => onChange('maintenanceMode', !settings.maintenanceMode)} />
      </div>
      <SaveBtn onClick={onSave} saving={saving} />
    </div>
  )
}

/* ── Web Settings ── */
const WebTab = ({ settings, onChange, onSave, saving, loading }) => {
  if (loading) return <Skeleton rows={4} />
  return (
    <div>
      <SectionTitle>Web &amp; Site Settings</SectionTitle>
      <Grid2>
        <div style={{ gridColumn: '1/-1' }}>
          <FieldInput label="Site URL"
            value={settings.siteUrl || ''}
            onChange={e => onChange('siteUrl', e.target.value)}
            placeholder="https://franchizeall.com" />
        </div>
        <FieldInput label="Logo URL"
          value={settings.logoUrl || ''}
          onChange={e => onChange('logoUrl', e.target.value)}
          placeholder="https://cdn.example.com/logo.png" />
        <FieldInput label="Favicon URL"
          value={settings.faviconUrl || ''}
          onChange={e => onChange('faviconUrl', e.target.value)}
          placeholder="https://cdn.example.com/favicon.ico" />
        <FieldInput label="Google Analytics ID"
          value={settings.googleAnalytics || ''}
          onChange={e => onChange('googleAnalytics', e.target.value)}
          placeholder="G-XXXXXXXXXX" />
      </Grid2>
      <div style={{ background: C.bg, borderRadius: 10, padding: '4px 16px', marginBottom: 20 }}>
        <Toggle label="Enable Maintenance Mode"
          checked={!!settings.maintenanceMode}
          onChange={() => onChange('maintenanceMode', !settings.maintenanceMode)} />
      </div>
      {settings.maintenanceMode && (
        <div style={{ padding: '10px 14px', background: '#fff1f1', border: '1px solid #fecaca',
          borderRadius: 8, fontSize: 12, color: C.danger, marginBottom: 16, fontWeight: 600 }}>
          ⚠️ Maintenance mode is ON — the site will show a maintenance page to visitors.
        </div>
      )}
      <SaveBtn onClick={onSave} saving={saving} />
    </div>
  )
}

/* ── Security ── */
const SecurityTab = ({ settings, onChange, onSave, saving, loading }) => {
  if (loading) return <Skeleton rows={4} />
  return (
    <div>
      <SectionTitle>Security Settings</SectionTitle>
      <Grid2>
        <FieldInput label="Session Timeout (minutes)" type="number"
          value={settings.sessionTimeout ?? 30}
          onChange={e => onChange('sessionTimeout', parseInt(e.target.value) || 30)} />
        <FieldInput label="Max Login Attempts" type="number"
          value={settings.maxLoginAttempts ?? 5}
          onChange={e => onChange('maxLoginAttempts', parseInt(e.target.value) || 5)} />
        <FieldInput label="Password Minimum Length" type="number"
          value={settings.minPasswordLength ?? 8}
          onChange={e => onChange('minPasswordLength', parseInt(e.target.value) || 8)} />
        <FieldInput label="Audit Log Retention (days)" type="number"
          value={settings.auditRetentionDays ?? 90}
          onChange={e => onChange('auditRetentionDays', parseInt(e.target.value) || 90)} />
      </Grid2>
      <div style={{ background: C.bg, borderRadius: 10, padding: '4px 16px', marginBottom: 16 }}>
        <Toggle label="Force Two-Factor Authentication (2FA) for all admins"
          checked={!!settings.force2FA}
          onChange={() => onChange('force2FA', !settings.force2FA)} />
      </div>
      <FieldTextarea label="IP Whitelist (one IP per line)"
        value={settings.ipWhitelist || ''}
        onChange={e => onChange('ipWhitelist', e.target.value)}
        placeholder={'192.168.1.1\n10.0.0.0/24'}
        rows={4} />
      <SaveBtn onClick={onSave} saving={saving} />
    </div>
  )
}

/* ── Notifications ── */
const NotificationsTab = ({ settings, onChange, onSave, saving, loading }) => {
  if (loading) return <Skeleton rows={4} />
  const items = [
    { key: 'notifyExpiryEmail',    label: 'Subscription Expiry Email' },
    { key: 'notifyExpirySms',      label: 'Subscription Expiry SMS' },
    { key: 'notifyNewFranchise',   label: 'New Franchise Registered Alert' },
    { key: 'notifySupplierOnboard',label: 'Supplier Onboarding Alert' },
    { key: 'notifyLowStock',       label: 'Low Stock Alert' },
    { key: 'notifyAuditAlert',     label: 'Audit Activity Alert' },
  ]
  return (
    <div>
      <SectionTitle>Notification Preferences</SectionTitle>
      <Grid2>
        <FieldInput label="Notification Email" type="email"
          value={settings.notifyEmail || settings.adminEmail || ''}
          onChange={e => onChange('notifyEmail', e.target.value)} />
        <FieldInput label="Alert Days Before Expiry" type="number"
          value={settings.expiryAlertDays ?? 7}
          onChange={e => onChange('expiryAlertDays', parseInt(e.target.value) || 7)} />
      </Grid2>
      <div style={{ background: C.bg, borderRadius: 10, padding: '4px 16px', marginBottom: 20 }}>
        {items.map(item => (
          <Toggle key={item.key} label={item.label}
            checked={!!settings[item.key]}
            onChange={() => onChange(item.key, !settings[item.key])} />
        ))}
      </div>
      <SaveBtn onClick={onSave} saving={saving} />
    </div>
  )
}

/* ── Roles ─ (local state only, no API for roles matrix yet) ── */
const RolesTab = ({ saving }) => {
  const roles = ['Super Admin', 'Admin', 'Franchise Owner', 'Branch Manager', 'Pharmacist', 'Cashier']
  const perms = ['View Dashboard', 'Create Franchise', 'Edit Franchise', 'Suspend Franchise',
                 'Manage Suppliers', 'View Reports', 'Export Data', 'Manage Users']

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
      <SectionTitle>Roles &amp; Permissions</SectionTitle>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700,
                color: C.muted, background: C.bg, borderBottom: `1px solid ${C.border}`, minWidth: 140 }}>Permission</th>
              {roles.map(r => (
                <th key={r} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontWeight: 700,
                  color: r === 'Super Admin' ? C.primary : C.muted,
                  background: C.bg, borderBottom: `1px solid ${C.border}`, minWidth: 90 }}>{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perms.map((p, pi) => (
              <tr key={p} style={{ background: pi % 2 === 0 ? C.white : C.bg }}>
                <td style={{ padding: '10px 12px', fontSize: 13, color: C.text,
                  borderBottom: `1px solid ${C.border}`, fontWeight: 500 }}>{p}</td>
                {roles.map(r => (
                  <td key={r} style={{ padding: '10px 8px', textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>
                    <div onClick={() => toggle(r, p)}
                      style={{ cursor: r === 'Super Admin' ? 'default' : 'pointer', display: 'inline-flex', justifyContent: 'center' }}>
                      {matrix[r][p]
                        ? <ToggleRight size={22} color={r === 'Super Admin' ? '#9ca3af' : C.success} />
                        : <ToggleLeft  size={22} color={C.border} />}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 10, marginBottom: 16 }}>
        * Super Admin permissions are locked and cannot be modified.
      </div>
      <button
        onClick={() => toast.success('Role permissions saved (local) ✅')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary,
          color: C.white, border: 'none', borderRadius: 8, padding: '10px 22px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
        <Save size={15} /> Save Permissions
      </button>
    </div>
  )
}

/* ── Inventory Policy ── */
const InventoryTab = ({ settings, onChange, onSave, saving, loading }) => {
  if (loading) return <Skeleton rows={3} />
  return (
    <div>
      <SectionTitle>Inventory Policy</SectionTitle>
      <Grid2>
        <FieldInput label="Near Expiry Alert (days before)" type="number"
          value={settings.nearExpiryDays ?? 30}
          onChange={e => onChange('nearExpiryDays', parseInt(e.target.value) || 30)} />
        <FieldInput label="Low Stock Threshold (%)" type="number"
          value={settings.lowStockThreshold ?? 20}
          onChange={e => onChange('lowStockThreshold', parseInt(e.target.value) || 20)} />
      </Grid2>
      <div style={{ background: C.bg, borderRadius: 10, padding: '4px 16px', marginBottom: 20 }}>
        <Toggle label="Use FEFO (First Expiry First Out) — recommended over FIFO"
          checked={!!settings.fefo}
          onChange={() => onChange('fefo', !settings.fefo)} />
        <Toggle label="Batch Number Mandatory on Purchase Entry"
          checked={!!settings.batchMandatory}
          onChange={() => onChange('batchMandatory', !settings.batchMandatory)} />
        <Toggle label="Expiry Date Mandatory on Purchase Entry"
          checked={!!settings.expiryMandatory}
          onChange={() => onChange('expiryMandatory', !settings.expiryMandatory)} />
      </div>
      <SaveBtn onClick={onSave} saving={saving} />
    </div>
  )
}

/* ── Support ── */
const SupportTab = ({ settings, onChange, onSave, saving, loading }) => {
  if (loading) return <Skeleton rows={4} />
  return (
    <div>
      <SectionTitle>Support Configuration</SectionTitle>
      <Grid2>
        <FieldInput label="Support Email" type="email"
          value={settings.supportEmail || ''}
          onChange={e => onChange('supportEmail', e.target.value)} />
        <FieldInput label="Support Phone"
          value={settings.phone || ''}
          onChange={e => onChange('phone', e.target.value)} />
        <FieldInput label="WhatsApp Number"
          value={settings.whatsappNo || ''}
          onChange={e => onChange('whatsappNo', e.target.value)} />
        <FieldInput label="Ticket Auto-close (days)" type="number"
          value={settings.ticketAutoClose ?? 7}
          onChange={e => onChange('ticketAutoClose', parseInt(e.target.value) || 7)} />
        <FieldInput label="SLA Response Time (hours)" type="number"
          value={settings.slaHours ?? 24}
          onChange={e => onChange('slaHours', parseInt(e.target.value) || 24)} />
      </Grid2>
      <SaveBtn onClick={onSave} saving={saving} />
    </div>
  )
}

/* ── Email / SMTP ── */
const EmailTab = ({ settings, onChange, onSave, saving, loading }) => {
  if (loading) return <Skeleton rows={4} />
  return (
    <div>
      <SectionTitle>Email / SMTP Settings</SectionTitle>
      <Grid2>
        <FieldInput label="SMTP Host"
          value={settings.smtpHost || ''}
          onChange={e => onChange('smtpHost', e.target.value)}
          placeholder="smtp.gmail.com" />
        <FieldInput label="SMTP Port"
          value={settings.smtpPort || '587'}
          onChange={e => onChange('smtpPort', e.target.value)}
          placeholder="587" />
        <FieldInput label="SMTP Username"
          value={settings.smtpUser || ''}
          onChange={e => onChange('smtpUser', e.target.value)}
          placeholder="user@example.com" />
        <FieldInput label="SMTP Password" type="password"
          value={settings.smtpPass || ''}
          onChange={e => onChange('smtpPass', e.target.value)}
          placeholder="••••••••" />
        <FieldInput label="From Name"
          value={settings.fromName || ''}
          onChange={e => onChange('fromName', e.target.value)}
          placeholder="FranchizeAll" />
        <FieldInput label="From Email"
          value={settings.fromEmail || ''}
          onChange={e => onChange('fromEmail', e.target.value)}
          placeholder="noreply@example.com" />
      </Grid2>
      <div style={{ padding: '10px 14px', background: '#f8fafc', border: `1px solid ${C.border}`,
        borderRadius: 8, fontSize: 12, color: C.muted, marginBottom: 16 }}>
        💡 SMTP credentials are stored securely and used for system emails (password resets, notifications).
      </div>
      <SaveBtn onClick={onSave} saving={saving} />
    </div>
  )
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const SuperAdminSettings = () => {
  const [activeTab, setActiveTab] = useState('platform')
  const [settings,  setSettings]  = useState({})
  const [loading,   setLoading]   = useState(false)
  const [saving,    setSaving]    = useState(false)

  /* ── Load settings on mount ── */
  useEffect(() => {
    setLoading(true)
    getRequest('site-settings')
      .then(res => setSettings(res?.data?.data || {}))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  /* ── Field updater ── */
  const onChange = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  /* ── Save handler ── */
  const handleSave = useCallback(() => {
    setSaving(true)
    putRequest({ url: 'site-settings/update', cred: settings })
      .then(() => toast.success('Settings saved successfully ✅'))
      .catch(err => toast.error(err?.response?.data?.message || 'Failed to save settings'))
      .finally(() => setSaving(false))
  }, [settings])

  const tabs = [
    { key: 'platform',      label: 'Platform',         icon: <Monitor size={16} /> },
    { key: 'web',           label: 'Web',              icon: <Monitor size={16} /> },
    { key: 'email',         label: 'Email / SMTP',     icon: <Monitor size={16} /> },
    { key: 'security',      label: 'Security',         icon: <Shield size={16} /> },
    { key: 'notifications', label: 'Notifications',    icon: <Bell size={16} /> },
    { key: 'roles',         label: 'Roles & Perms',    icon: <Users size={16} /> },
    { key: 'inventory',     label: 'Inventory Policy', icon: <Archive size={16} /> },
    { key: 'support',       label: 'Support',          icon: <HeadphonesIcon size={16} /> },
  ]

  const tabProps = { settings, onChange, onSave: handleSave, saving, loading }

  const renderTab = () => {
    switch (activeTab) {
      case 'platform':      return <PlatformTab      {...tabProps} />
      case 'web':           return <WebTab           {...tabProps} />
      case 'email':         return <EmailTab         {...tabProps} />
      case 'security':      return <SecurityTab      {...tabProps} />
      case 'notifications': return <NotificationsTab {...tabProps} />
      case 'roles':         return <RolesTab         saving={saving} />
      case 'inventory':     return <InventoryTab     {...tabProps} />
      case 'support':       return <SupportTab       {...tabProps} />
      default: return null
    }
  }

  return (
    <div style={{ ...font, background: C.bg, minHeight: '100vh', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: 0 }}>Platform Settings</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>
            Configure platform-wide preferences, security and operational policies
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true)
            getRequest('site-settings')
              .then(res => { setSettings(res?.data?.data || {}); toast.success('Settings reloaded') })
              .catch(() => toast.error('Failed to reload'))
              .finally(() => setLoading(false))
          }}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#374151',
            border: `1px solid ${C.border}`, borderRadius: 9, padding: '9px 16px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Reload
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div style={{ width: 200, flexShrink: 0, background: C.white,
          border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, background: C.primary }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)',
              textTransform: 'uppercase', letterSpacing: 1 }}>Settings</span>
          </div>
          {tabs.map(t => {
            const isActive = activeTab === t.key
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '11px 16px', border: 'none', borderBottom: `1px solid ${C.border}`,
                  fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: 'pointer',
                  background: isActive ? '#e8f0fb' : C.white,
                  color:      isActive ? C.primary  : C.muted,
                  textAlign: 'left',
                  borderLeft: isActive ? `3px solid ${C.primary}` : '3px solid transparent',
                  transition: 'all .15s' }}>
                <span style={{ color: isActive ? C.primary : C.muted }}>{t.icon}</span>
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, background: C.white, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: 28, minHeight: 400 }}>
          {renderTab()}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default SuperAdminSettings
