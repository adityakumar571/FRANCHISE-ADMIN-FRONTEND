/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Settings, Store, User, Bell, Shield, Save, Eye, EyeOff } from 'lucide-react'

const TABS = [
  { id: 'profile',  label: 'Business Profile', icon: Store },
  { id: 'personal', label: 'My Account',        icon: User  },
  { id: 'notif',    label: 'Notifications',     icon: Bell  },
  { id: 'security', label: 'Security',          icon: Shield },
]

const Inp = ({ label, value, onChange, placeholder, type = 'text', readOnly }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: readOnly ? '#f9fafb' : '#fff', cursor: readOnly ? 'default' : 'text' }} />
  </div>
)

const Toggle = ({ label, desc, checked, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
    <div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>{label}</p>
      {desc && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>{desc}</p>}
    </div>
    <button onClick={() => onChange(!checked)}
      style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: checked ? '#0c3b73' : '#e5e7eb', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: checked ? 22 : 2, transition: 'left 0.2s' }} />
    </button>
  </div>
)

export default function DistSettings() {
  const [tab, setTab] = useState('profile')
  const dist = (() => { try { return JSON.parse(localStorage.getItem('distributor_context') || '{}') } catch { return {} } })()

  const [profile, setProfile] = useState({
    name: dist.name || 'MedLine Pharma Distributors',
    type: dist.type || 'Distributor',
    phone: dist.phone || '9876543210',
    email: dist.email || 'contact@medline.in',
    gstin: dist.gstin || '',
    drugLicense: dist.drugLicense || '',
    address: dist.address || '',
    city: dist.city || '',
    state: dist.state || '',
  })

  const [notif, setNotif] = useState({ newOrder: true, paymentReceived: true, stockAlert: true, orderStatus: true })
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)

  const SaveBtn = ({ onClick }) => (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', border: 'none', borderRadius: 8, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
      <Save size={14} /> Save Changes
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: '#0c3b73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={20} color="#fabf22" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage your distributor account and preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>

        {/* Sidebar */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', border: 'none', background: tab === t.id ? '#0c3b73' : '#fff', color: tab === t.id ? '#fff' : '#374151', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 700 : 400, borderBottom: '1px solid #f3f4f6', textAlign: 'left' }}>
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>

          {tab === 'profile' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Business Profile</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <Inp label="Business Name *"    value={profile.name}        onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}        placeholder="Business name" />
                <Inp label="Type"               value={profile.type}        readOnly />
                <Inp label="Phone"              value={profile.phone}       onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}       placeholder="Contact number" />
                <Inp label="Email"              value={profile.email}       onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}       placeholder="Business email" type="email" />
                <Inp label="GSTIN"              value={profile.gstin}       onChange={e => setProfile(p => ({ ...p, gstin: e.target.value }))}       placeholder="15-digit GST number" />
                <Inp label="Drug License No."   value={profile.drugLicense} onChange={e => setProfile(p => ({ ...p, drugLicense: e.target.value }))} placeholder="Drug license" />
                <Inp label="City"               value={profile.city}        onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}        placeholder="City" />
                <Inp label="State"              value={profile.state}       onChange={e => setProfile(p => ({ ...p, state: e.target.value }))}       placeholder="State" />
                <div style={{ gridColumn: '1/-1' }}>
                  <Inp label="Address" value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} placeholder="Full business address" />
                </div>
              </div>
              <SaveBtn />
            </div>
          )}

          {tab === 'personal' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Account Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', maxWidth: 600 }}>
                <Inp label="Contact Person" value={dist.contactPerson || ''} readOnly />
                <Inp label="User ID"        value={dist.userId || ''}        readOnly />
                <Inp label="Role"           value="Distributor"              readOnly />
                <Inp label="Status"         value="Active"                   readOnly />
              </div>
              <div style={{ marginTop: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#0c3b73' }}>
                Account details are managed by the platform administrator.
              </div>
            </div>
          )}

          {tab === 'notif' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Notification Preferences</h3>
              <Toggle label="New Order Received"       desc="Alert when a franchise places an order"       checked={notif.newOrder}         onChange={v => setNotif(p => ({ ...p, newOrder: v }))} />
              <Toggle label="Payment Received"         desc="Alert when payment is received"               checked={notif.paymentReceived}   onChange={v => setNotif(p => ({ ...p, paymentReceived: v }))} />
              <Toggle label="Low Stock Alert"          desc="Alert when stock falls below threshold"       checked={notif.stockAlert}        onChange={v => setNotif(p => ({ ...p, stockAlert: v }))} />
              <Toggle label="Order Status Updates"     desc="Alert when order status changes"              checked={notif.orderStatus}       onChange={v => setNotif(p => ({ ...p, orderStatus: v }))} />
              <SaveBtn />
            </div>
          )}

          {tab === 'security' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Change Password</h3>
              <div style={{ maxWidth: 400 }}>
                <Inp label="Current Password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} placeholder="••••••••" type="password" />
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} value={passwords.newPw} onChange={e => setPasswords(p => ({ ...p, newPw: e.target.value }))} placeholder="Min 6 characters"
                      style={{ width: '100%', padding: '9px 40px 9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <Inp label="Confirm Password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" type="password" />
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', border: 'none', borderRadius: 8, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                <Shield size={14} /> Update Password
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
