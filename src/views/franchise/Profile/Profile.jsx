/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  User, Shield, LogOut, Camera, Save, Eye, EyeOff,
  Phone, Mail, MapPin, Building, Edit, CheckCircle, Key
} from 'lucide-react'

const TABS = [
  { id: 'profile',  label: 'My Profile',     icon: User },
  { id: 'security', label: 'Security',        icon: Shield },
  { id: 'sessions', label: 'Login Sessions',  icon: Key },
]

const Field = ({ label, value, onChange, type = 'text', placeholder = '', disabled = false }) => (
  <div>
    <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.03em' }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: disabled ? '#f9fafb' : '#fff', color: disabled ? '#9ca3af' : '#111827', boxSizing: 'border-box' }}
      onFocus={e => { if (!disabled) e.target.style.borderColor = '#0c3b73' }}
      onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
  </div>
)

const SESSIONS = [
  { device: 'Chrome on Windows 11',    location: 'Lucknow, UP',  time: 'Now — Active',       current: true  },
  { device: 'Firefox on Windows 10',   location: 'Lucknow, UP',  time: '20 May 2025, 02:15 PM', current: false },
  { device: 'Chrome on Android',       location: 'Kanpur, UP',   time: '19 May 2025, 09:30 AM', current: false },
]

export default function Profile() {
  const [tab, setTab]       = useState('profile')
  const [editMode, setEditMode] = useState(false)

  const [profile, setProfile] = useState({
    name: 'Arjun Sharma', email: 'arjun@aarogya.com', phone: '+91 9876543210',
    role: 'Store Admin', storeName: 'Aarogya Medical Store', city: 'Lucknow',
    state: 'Uttar Pradesh', address: '121, Alambagh, Lucknow — 226005',
  })

  const [pwd, setPwd] = useState({ current: '', newP: '', confirm: '' })
  const [showPwd, setShowPwd] = useState({ current: false, newP: false, confirm: false })
  const [twoFactor, setTwoFactor] = useState(false)
  const [saved, setSaved]       = useState(false)

  const s = (key) => (val) => setProfile(p => ({ ...p, [key]: val }))
  const sp = (key) => (val) => setPwd(p => ({ ...p, [key]: val }))
  const tgl = (k) => () => setShowPwd(p => ({ ...p, [k]: !p[k] }))

  const handleSave = () => { setSaved(true); setEditMode(false); setTimeout(() => setSaved(false), 2500) }

  const initials = profile.name.split(' ').map(w => w[0]).join('').toUpperCase()

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Saved toast */}
      {saved && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
          <CheckCircle size={16} color="#16a34a" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>Profile saved successfully!</span>
        </div>
      )}

      {/* Page header */}
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={20} color="#0c3b73" /> Profile &amp; Security
        </h1>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage your account information and security settings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 18, alignItems: 'start' }}>

        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Avatar card */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #0c3b73, #1a6fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff' }}>
                {initials}
              </div>
              <button style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: '#0c3b73', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={11} color="#fff" />
              </button>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{profile.name}</p>
              <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{profile.role}</p>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', marginTop: 6, display: 'inline-block' }}>● Active</span>
            </div>
            <div style={{ width: '100%', padding: '10px', background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <Building size={12} color="#6b7280" />
                <span style={{ fontSize: 11, color: '#374151', fontWeight: 500 }}>{profile.storeName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <MapPin size={12} color="#6b7280" />
                <span style={{ fontSize: 11, color: '#6b7280' }}>{profile.city}, {profile.state}</span>
              </div>
            </div>
          </div>

          {/* Nav tabs */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            {TABS.map(t => {
              const Icon = t.icon
              const active = tab === t.id
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', border: 'none', textAlign: 'left', fontSize: 13, fontWeight: active ? 700 : 500, background: active ? '#e0e7ff' : '#fff', color: active ? '#0c3b73' : '#374151', cursor: 'pointer', borderLeft: active ? '3px solid #0c3b73' : '3px solid transparent' }}>
                  <Icon size={15} color={active ? '#0c3b73' : '#9ca3af'} />
                  {t.label}
                </button>
              )
            })}
            <button style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', border: 'none', borderTop: '1px solid #f3f4f6', textAlign: 'left', fontSize: 13, fontWeight: 500, background: '#fff', color: '#dc2626', cursor: 'pointer', borderLeft: '3px solid transparent' }}>
              <LogOut size={15} color="#dc2626" /> Logout
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px' }}>

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Personal Information</h2>
                {!editMode
                  ? <button onClick={() => setEditMode(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#e0e7ff', color: '#0c3b73', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <Edit size={13} /> Edit Profile
                    </button>
                  : <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setEditMode(false)} style={{ padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                      <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        <Save size={13} /> Save Changes
                      </button>
                    </div>
                }
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Full Name"    value={profile.name}      onChange={editMode ? s('name')      : null} placeholder="Full name"    disabled={!editMode} />
                <Field label="Email Address" value={profile.email}    onChange={editMode ? s('email')     : null} type="email" placeholder="Email" disabled={!editMode} />
                <Field label="Phone Number" value={profile.phone}     onChange={editMode ? s('phone')     : null} placeholder="+91 XXXXXXXXXX" disabled={!editMode} />
                <Field label="Role"          value={profile.role}     onChange={null} disabled />
                <Field label="Store Name"   value={profile.storeName} onChange={editMode ? s('storeName') : null} placeholder="Store name" disabled={!editMode} />
                <Field label="City"          value={profile.city}     onChange={editMode ? s('city')      : null} placeholder="City"       disabled={!editMode} />
                <Field label="State"         value={profile.state}    onChange={editMode ? s('state')     : null} placeholder="State"      disabled={!editMode} />
              </div>
              <div style={{ marginTop: 16 }}>
                <Field label="Address" value={profile.address} onChange={editMode ? s('address') : null} placeholder="Full address" disabled={!editMode} />
              </div>

              {/* Info row */}
              <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                {[
                  { icon: Mail,  val: profile.email },
                  { icon: Phone, val: profile.phone },
                  { icon: MapPin,val: `${profile.city}, ${profile.state}` },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: '#f9fafb', borderRadius: 20, border: '1px solid #f3f4f6' }}>
                    <r.icon size={12} color="#6b7280" />
                    <span style={{ fontSize: 12, color: '#374151' }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── SECURITY TAB ── */}
          {tab === 'security' && (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 22px' }}>Security Settings</h2>

              {/* Change Password */}
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Key size={15} color="#0c3b73" /> Change Password
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  {[
                    { label: 'Current Password', key: 'current' },
                    { label: 'New Password',      key: 'newP' },
                    { label: 'Confirm Password',  key: 'confirm' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>{f.label}</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showPwd[f.key] ? 'text' : 'password'} value={pwd[f.key]} onChange={e => sp(f.key)(e.target.value)} placeholder="••••••••"
                          style={{ width: '100%', padding: '9px 36px 9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                          onFocus={e => e.target.style.borderColor = '#0c3b73'}
                          onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                        <button type="button" onClick={tgl(f.key)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                          {showPwd[f.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 14 }}>
                  <Save size={13} /> Update Password
                </button>
              </div>

              <div style={{ height: 1, background: '#f3f4f6', margin: '0 0 22px' }} />

              {/* 2FA */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: twoFactor ? '#f0fdf4' : '#f9fafb', borderRadius: 10, border: `1px solid ${twoFactor ? '#bbf7d0' : '#e5e7eb'}` }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Two-Factor Authentication</p>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0' }}>Add an extra layer of security with OTP verification on login</p>
                </div>
                <button onClick={() => setTwoFactor(v => !v)}
                  style={{ position: 'relative', width: 48, height: 26, borderRadius: 13, background: twoFactor ? '#0c3b73' : '#e5e7eb', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                  <span style={{ position: 'absolute', top: 3, left: twoFactor ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
                </button>
              </div>
            </>
          )}

          {/* ── SESSIONS TAB ── */}
          {tab === 'sessions' && (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 22px' }}>Active Login Sessions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {SESSIONS.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: s.current ? '#f0f4ff' : '#f9fafb', borderRadius: 10, border: `1px solid ${s.current ? '#c7d2fe' : '#e5e7eb'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: s.current ? '#e0e7ff' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Key size={17} color={s.current ? '#0c3b73' : '#9ca3af'} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{s.device}</p>
                        <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{s.location} · {s.time}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {s.current && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>Current</span>}
                      {!s.current && (
                        <button style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff1f2', color: '#dc2626', border: '1px solid #fecdd3', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 18 }}>
                <LogOut size={13} /> Logout All Other Sessions
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
