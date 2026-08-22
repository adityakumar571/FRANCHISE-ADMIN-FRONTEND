/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Settings as SettingsIcon, Save, Store, Bell, Shield, Printer, Globe } from 'lucide-react'

const TABS = [
  { id: 'store',         label: 'Store Profile',     icon: Store },
  { id: 'notifications', label: 'Notifications',     icon: Bell },
  { id: 'security',      label: 'Security',           icon: Shield },
  { id: 'printer',       label: 'Printer Settings',  icon: Printer },
  { id: 'system',        label: 'System',             icon: Globe },
]

const Field = ({ label, value, onChange, type = 'text', placeholder = '', wide = false }) => (
  <div style={{ gridColumn: wide ? '1/-1' : undefined }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.03em' }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box', transition: 'border .15s' }}
      onFocus={e => e.target.style.borderColor = '#0c3b73'}
      onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
  </div>
)

const Toggle = ({ label, desc, checked, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{label}</p>
      {desc && <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{desc}</p>}
    </div>
    <button onClick={() => onChange(!checked)} style={{ position: 'relative', width: 44, height: 24, borderRadius: 12, background: checked ? '#0c3b73' : '#e5e7eb', border: 'none', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
    </button>
  </div>
)

export default function Settings() {
  const [tab, setTab] = useState('store')

  const [store, setStore] = useState({
    name: 'Aarogya Medical Store', owner: 'Arjun Sharma', phone: '+91 9876543210',
    email: 'info@aarogya.com', address: 'Alambagh, Lucknow', gst: '09ABCDE1234F1Z5',
    dl: 'DL-123456', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226005',
  })

  const [notif, setNotif] = useState({ lowStock: true, expiry: true, orders: true, payments: true, salesTarget: false, systemUpdates: true })
  const [sec, setSec]     = useState({ twoFactor: false, sessionTimeout: '30', ipRestriction: false })
  const [print, setPrint] = useState({ printerName: 'HP LaserJet M126nw', paperSize: 'A4', copies: '1', showGST: true, showDiscount: true })
  const [sys, setSys]     = useState({ timezone: 'Asia/Kolkata', currency: 'INR (₹)', language: 'English', maintenanceMode: false })

  const s = (setter, key) => val => setter(prev => ({ ...prev, [key]: val }))

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingsIcon size={20} color="#0c3b73" /> Settings
        </h1>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage store preferences and configurations</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left tabs */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '11px 14px', border: 'none', textAlign: 'left', fontSize: 13, fontWeight: active ? 700 : 500, background: active ? '#e0e7ff' : '#fff', color: active ? '#0c3b73' : '#374151', cursor: 'pointer', borderLeft: active ? '3px solid #0c3b73' : '3px solid transparent', transition: 'all .15s' }}>
                <Icon size={15} color={active ? '#0c3b73' : '#9ca3af'} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Right content */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '22px 24px' }}>

          {/* Store Profile */}
          {tab === 'store' && (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>Store Profile</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Store Name"    value={store.name}    onChange={s(setStore,'name')}    placeholder="Store name" />
                <Field label="Owner Name"    value={store.owner}   onChange={s(setStore,'owner')}   placeholder="Owner name" />
                <Field label="Phone"         value={store.phone}   onChange={s(setStore,'phone')}   placeholder="+91 XXXXXXXXXX" />
                <Field label="Email"         value={store.email}   onChange={s(setStore,'email')}   type="email" placeholder="email@store.com" />
                <Field label="GSTIN"         value={store.gst}     onChange={s(setStore,'gst')}     placeholder="GST number" />
                <Field label="Drug License"  value={store.dl}      onChange={s(setStore,'dl')}      placeholder="DL number" />
                <Field label="Address" value={store.address} onChange={s(setStore,'address')} placeholder="Full address" wide />
                <Field label="City"    value={store.city}    onChange={s(setStore,'city')}    placeholder="City" />
                <Field label="State"   value={store.state}   onChange={s(setStore,'state')}   placeholder="State" />
                <Field label="Pincode" value={store.pincode} onChange={s(setStore,'pincode')} placeholder="PIN code" />
              </div>
            </>
          )}

          {/* Notifications */}
          {tab === 'notifications' && (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>Notification Preferences</h2>
              <Toggle label="Low Stock Alert"    desc="Notify when any item stock goes below threshold" checked={notif.lowStock}       onChange={s(setNotif,'lowStock')} />
              <Toggle label="Expiry Alert"       desc="Notify for medicines expiring within 30 days"   checked={notif.expiry}         onChange={s(setNotif,'expiry')} />
              <Toggle label="Order Notifications"desc="Notify on new orders and status changes"        checked={notif.orders}         onChange={s(setNotif,'orders')} />
              <Toggle label="Payment Notifications"desc="Notify on payment received or dues"          checked={notif.payments}       onChange={s(setNotif,'payments')} />
              <Toggle label="Sales Target Alert" desc="Notify when daily sales target is achieved"    checked={notif.salesTarget}    onChange={s(setNotif,'salesTarget')} />
              <Toggle label="System Updates"     desc="Notify on software updates and maintenance"    checked={notif.systemUpdates}  onChange={s(setNotif,'systemUpdates')} />
            </>
          )}

          {/* Security */}
          {tab === 'security' && (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>Security Settings</h2>
              <Toggle label="Two-Factor Authentication" desc="Enable OTP-based login verification" checked={sec.twoFactor}     onChange={s(setSec,'twoFactor')} />
              <Toggle label="IP Restriction"             desc="Allow access from specific IPs only" checked={sec.ipRestriction} onChange={s(setSec,'ipRestriction')} />
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Session Timeout (minutes)</label>
                <select value={sec.sessionTimeout} onChange={e => setSec(p => ({ ...p, sessionTimeout: e.target.value }))} style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer', width: '200px' }}>
                  {['15', '30', '60', '120'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div style={{ marginTop: 18 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: '0 0 8px' }}>Change Password</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <Field label="Current Password" value="" onChange={() => {}} type="password" placeholder="••••••••" />
                  <Field label="New Password"      value="" onChange={() => {}} type="password" placeholder="••••••••" />
                  <Field label="Confirm Password"  value="" onChange={() => {}} type="password" placeholder="••••••••" />
                </div>
              </div>
            </>
          )}

          {/* Printer */}
          {tab === 'printer' && (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>Printer Settings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Printer Name" value={print.printerName} onChange={s(setPrint,'printerName')} placeholder="Printer name" />
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Paper Size</label>
                  <select value={print.paperSize} onChange={e => setPrint(p => ({ ...p, paperSize: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
                    {['A4', '80mm (Thermal)', '58mm (Thermal)', 'A5'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>No. of Copies</label>
                  <select value={print.copies} onChange={e => setPrint(p => ({ ...p, copies: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
                    {['1', '2', '3'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <Toggle label="Show GST on Invoice"      desc="Print GST breakdown on invoice" checked={print.showGST}      onChange={s(setPrint,'showGST')} />
                <Toggle label="Show Discount on Invoice" desc="Print discount line on invoice" checked={print.showDiscount} onChange={s(setPrint,'showDiscount')} />
              </div>
            </>
          )}

          {/* System */}
          {tab === 'system' && (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>System Settings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Timezone</label>
                  <select value={sys.timezone} onChange={e => setSys(p => ({ ...p, timezone: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
                    {['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Currency</label>
                  <select value={sys.currency} onChange={e => setSys(p => ({ ...p, currency: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
                    {['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Language</label>
                  <select value={sys.language} onChange={e => setSys(p => ({ ...p, language: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
                    {['English', 'Hindi', 'Marathi', 'Gujarati'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <Toggle label="Maintenance Mode" desc="Temporarily disable access for users" checked={sys.maintenanceMode} onChange={s(setSys,'maintenanceMode')} />
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
