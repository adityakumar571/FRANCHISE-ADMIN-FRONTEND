/* eslint-disable prettier/prettier */
/**
 * Settings — Franchise Settings Page
 * Business profile, security, notifications, display preferences
 */
import { useState } from 'react'
import { Settings, Store, Bell, Shield, Printer, Globe, User, Save, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useFranchise } from '../../../Context/FranchiseContext'

const Section = ({ title, subtitle, icon: Icon, color = '#0c3b73', children }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={17} color={color} />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{title}</h3>
        {subtitle && <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{subtitle}</p>}
      </div>
    </div>
    <div style={{ padding: '20px' }}>{children}</div>
  </div>
)

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>
    {hint && <p style={{ margin: '0 0 6px', fontSize: 11, color: '#9ca3af' }}>{hint}</p>}
    {children}
  </div>
)

const Input = ({ value, onChange, placeholder, type = 'text', disabled = false }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    style={{
      width: '100%', padding: '9px 12px', borderRadius: 8,
      border: '1px solid #d1d5db', fontSize: 13, outline: 'none',
      boxSizing: 'border-box',
      background: disabled ? '#f9fafb' : '#fff',
      color: disabled ? '#9ca3af' : '#111827',
    }}
  />
)

const Toggle = ({ checked, onChange, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
    <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
        background: checked ? '#0c3b73' : '#d1d5db',
        position: 'relative', transition: 'background 0.2s',
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: checked ? 23 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  </div>
)

const SaveBar = ({ onSave }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
    <button
      onClick={onSave}
      style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}
    >
      <Save size={14} /> Save Changes
    </button>
  </div>
)

const TABS = [
  { id: 'business', label: 'Business Profile', icon: Store },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'printing', label: 'Printing & Invoice', icon: Printer },
  { id: 'preferences', label: 'Preferences', icon: Globe },
]

const FranchiseSettings = () => {
  const { franchiseInfo, franchiseUser } = useFranchise()
  const [tab, setTab] = useState('business')

  // Business Profile state
  const [biz, setBiz] = useState({
    name: franchiseInfo?.franchiseName || 'PharmaNexus Store',
    code: franchiseInfo?.franchiseCode || 'FRN-001',
    phone: '9876543210',
    email: 'store@pharmanexus.com',
    address: '12, Medical Lane, MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    gstin: '29AABCT1332L1ZP',
    drug_license: 'KA-BLR-DL-00245',
  })

  // Notification toggles
  const [notif, setNotif] = useState({
    low_stock: true, expiry: true, order_status: true,
    subscription: true, day_close: false, staff_login: true,
  })

  // Security
  const [sec, setSec] = useState({ currentPwd: '', newPwd: '', confirmPwd: '' })

  // Printing
  const [print, setPrint] = useState({
    header: franchiseInfo?.franchiseName || 'PharmaNexus',
    footer: 'Thank you for choosing us! Get well soon.',
    show_gstin: true, show_logo: true, show_dl: true, auto_print: false,
    paper_size: 'A4',
  })

  // Preferences
  const [pref, setPref] = useState({
    currency: 'INR (₹)',
    date_format: 'DD/MM/YYYY',
    time_zone: 'Asia/Kolkata (IST)',
    language: 'English',
    theme: 'Light',
  })

  const saved = () => alert('Settings saved successfully!')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={Settings} title="Settings" subtitle="Manage franchise profile, preferences and security" color="#0c3b73" />

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Sidebar Tabs */}
        <div style={{ width: 220, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
          {TABS.map(t => {
            const TIcon = t.icon
            const active = tab === t.id
            return (
              <div
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '13px 16px', cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  background: active ? '#0c3b7308' : '#fff',
                  borderLeft: active ? '3px solid #0c3b73' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TIcon size={15} color={active ? '#0c3b73' : '#9ca3af'} />
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, color: active ? '#0c3b73' : '#374151' }}>{t.label}</span>
                </div>
                <ChevronRight size={13} color="#d1d5db" />
              </div>
            )
          })}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Business Profile ── */}
          {tab === 'business' && (
            <Section icon={Store} title="Business Profile" subtitle="Your franchise's business information" color="#0c3b73">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0 }}>
                <Field label="Store / Business Name">
                  <Input value={biz.name} onChange={e => setBiz(p => ({ ...p, name: e.target.value }))} />
                </Field>
                <div style={{ width: 16 }} />
                <Field label="Franchise Code">
                  <Input value={biz.code} disabled />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <Field label="Phone Number">
                  <Input value={biz.phone} onChange={e => setBiz(p => ({ ...p, phone: e.target.value }))} />
                </Field>
                <Field label="Email Address">
                  <Input value={biz.email} onChange={e => setBiz(p => ({ ...p, email: e.target.value }))} type="email" />
                </Field>
              </div>
              <Field label="Full Address">
                <textarea
                  value={biz.address}
                  onChange={e => setBiz(p => ({ ...p, address: e.target.value }))}
                  rows={2}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                <Field label="City"><Input value={biz.city} onChange={e => setBiz(p => ({ ...p, city: e.target.value }))} /></Field>
                <Field label="State"><Input value={biz.state} onChange={e => setBiz(p => ({ ...p, state: e.target.value }))} /></Field>
                <Field label="Pincode"><Input value={biz.pincode} onChange={e => setBiz(p => ({ ...p, pincode: e.target.value }))} /></Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <Field label="GSTIN" hint="15-character GST identification number">
                  <Input value={biz.gstin} onChange={e => setBiz(p => ({ ...p, gstin: e.target.value }))} />
                </Field>
                <Field label="Drug License Number">
                  <Input value={biz.drug_license} onChange={e => setBiz(p => ({ ...p, drug_license: e.target.value }))} />
                </Field>
              </div>
              <SaveBar onSave={saved} />
            </Section>
          )}

          {/* ── My Profile ── */}
          {tab === 'profile' && (
            <Section icon={User} title="My Profile" subtitle="Update your personal account details" color="#7c3aed">
              <Field label="Full Name">
                <Input value={franchiseUser?.name || ''} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="User ID / Login">
                  <Input value={franchiseUser?.userId || ''} disabled />
                </Field>
                <Field label="Role">
                  <Input value={franchiseUser?.role || ''} disabled />
                </Field>
              </div>
              <Field label="Phone Number">
                <Input value="" placeholder="Your phone number" />
              </Field>
              <Field label="Profile Photo">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#0c3b7318', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#0c3b73' }}>
                    {(franchiseUser?.name || 'U')[0]}
                  </div>
                  <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, cursor: 'pointer' }}>Upload Photo</button>
                </div>
              </Field>
              <SaveBar onSave={saved} />
            </Section>
          )}

          {/* ── Notifications ── */}
          {tab === 'notifications' && (
            <Section icon={Bell} title="Notifications" subtitle="Choose what alerts you want to receive" color="#d97706">
              <Toggle checked={notif.low_stock} onChange={v => setNotif(p => ({ ...p, low_stock: v }))} label="Low stock alerts" />
              <Toggle checked={notif.expiry} onChange={v => setNotif(p => ({ ...p, expiry: v }))} label="Expiry / near-expiry alerts" />
              <Toggle checked={notif.order_status} onChange={v => setNotif(p => ({ ...p, order_status: v }))} label="B2B order status updates" />
              <Toggle checked={notif.subscription} onChange={v => setNotif(p => ({ ...p, subscription: v }))} label="Subscription renewal reminders" />
              <Toggle checked={notif.day_close} onChange={v => setNotif(p => ({ ...p, day_close: v }))} label="Day closing reminder" />
              <Toggle checked={notif.staff_login} onChange={v => setNotif(p => ({ ...p, staff_login: v }))} label="Staff login notifications" />
              <div style={{ marginTop: 16 }}>
                <SaveBar onSave={saved} />
              </div>
            </Section>
          )}

          {/* ── Security ── */}
          {tab === 'security' && (
            <Section icon={Shield} title="Security" subtitle="Change your password and manage account security" color="#dc2626">
              <Field label="Current Password">
                <Input type="password" value={sec.currentPwd} onChange={e => setSec(p => ({ ...p, currentPwd: e.target.value }))} placeholder="Enter current password" />
              </Field>
              <Field label="New Password">
                <Input type="password" value={sec.newPwd} onChange={e => setSec(p => ({ ...p, newPwd: e.target.value }))} placeholder="Minimum 8 characters" />
              </Field>
              <Field label="Confirm New Password">
                <Input type="password" value={sec.confirmPwd} onChange={e => setSec(p => ({ ...p, confirmPwd: e.target.value }))} placeholder="Repeat new password" />
              </Field>

              {sec.newPwd && sec.confirmPwd && sec.newPwd !== sec.confirmPwd && (
                <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 8, background: '#fee2e2', border: '1px solid #fecdd3' }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#dc2626', fontWeight: 600 }}>Passwords do not match</p>
                </div>
              )}

              <div style={{ background: '#f9fafb', borderRadius: 8, padding: '14px 16px', marginBottom: 18 }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#374151' }}>Password Requirements</p>
                {['At least 8 characters', 'Include uppercase and lowercase letters', 'Include at least one number', 'Include at least one special character'].map(r => (
                  <p key={r} style={{ margin: '3px 0', fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#16a34a' }}>✓</span> {r}
                  </p>
                ))}
              </div>

              <SaveBar onSave={saved} />
            </Section>
          )}

          {/* ── Printing & Invoice ── */}
          {tab === 'printing' && (
            <Section icon={Printer} title="Printing & Invoice" subtitle="Configure invoice header, footer and printing settings" color="#0891b2">
              <Field label="Invoice Header Text">
                <Input value={print.header} onChange={e => setPrint(p => ({ ...p, header: e.target.value }))} />
              </Field>
              <Field label="Invoice Footer Text">
                <Input value={print.footer} onChange={e => setPrint(p => ({ ...p, footer: e.target.value }))} />
              </Field>
              <Field label="Paper Size">
                <select value={print.paper_size} onChange={e => setPrint(p => ({ ...p, paper_size: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}>
                  <option>A4</option><option>A5</option><option>Thermal (58mm)</option><option>Thermal (80mm)</option>
                </select>
              </Field>
              <Toggle checked={print.show_logo} onChange={v => setPrint(p => ({ ...p, show_logo: v }))} label="Show store logo on invoice" />
              <Toggle checked={print.show_gstin} onChange={v => setPrint(p => ({ ...p, show_gstin: v }))} label="Show GSTIN on invoice" />
              <Toggle checked={print.show_dl} onChange={v => setPrint(p => ({ ...p, show_dl: v }))} label="Show Drug License on invoice" />
              <Toggle checked={print.auto_print} onChange={v => setPrint(p => ({ ...p, auto_print: v }))} label="Auto-print after sale" />
              <div style={{ marginTop: 16 }}>
                <SaveBar onSave={saved} />
              </div>
            </Section>
          )}

          {/* ── Preferences ── */}
          {tab === 'preferences' && (
            <Section icon={Globe} title="Preferences" subtitle="Display and regional settings" color="#16a34a">
              {[
                { label: 'Currency', key: 'currency', options: ['INR (₹)', 'USD ($)', 'EUR (€)'] },
                { label: 'Date Format', key: 'date_format', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
                { label: 'Time Zone', key: 'time_zone', options: ['Asia/Kolkata (IST)', 'UTC', 'Asia/Dubai'] },
                { label: 'Language', key: 'language', options: ['English', 'Hindi', 'Gujarati', 'Tamil', 'Telugu'] },
                { label: 'Theme', key: 'theme', options: ['Light', 'Dark', 'System'] },
              ].map(({ label, key, options }) => (
                <Field key={key} label={label}>
                  <select
                    value={pref[key]}
                    onChange={e => setPref(p => ({ ...p, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}
                  >
                    {options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </Field>
              ))}
              <SaveBar onSave={saved} />
            </Section>
          )}

        </div>
      </div>
    </div>
  )
}

export default FranchiseSettings
