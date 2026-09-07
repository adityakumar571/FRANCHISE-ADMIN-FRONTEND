/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Store, Bell, Shield, Printer, Globe, User, Save, Check } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useFranchise } from '../../../Context/FranchiseContext'
import { getRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'business',  label: 'Business Profile',     icon: Store },
  { id: 'profile',   label: 'My Profile',            icon: User },
  { id: 'notif',     label: 'Notifications',         icon: Bell },
  { id: 'security',  label: 'Security',              icon: Shield },
  { id: 'printing',  label: 'Printing & Invoice',    icon: Printer },
  { id: 'prefs',     label: 'Preferences',           icon: Globe },
]

const Inp = ({ label, value, onChange, placeholder, type = 'text', readOnly }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: readOnly ? '#f9fafb' : '#fff', boxSizing: 'border-box', cursor: readOnly ? 'default' : 'text' }} />
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

export default function FranchiseSettings() {
  const { franchiseUser, franchiseInfo } = useFranchise()
  const [activeTab, setActiveTab] = useState('business')
  const [saving, setSaving]       = useState(false)
  const [loading, setLoading]     = useState(true)

  const [business, setBusiness] = useState({ storeName: '', storeCode: '', phone: '', email: '', address: '', gstin: '', drugLicense: '' })
  const [notif, setNotif]       = useState({ lowStock: true, expiry: true, orderStatus: true, subscription: true, dayClose: false, staffLogin: false })
  const [printing, setPrinting] = useState({ invoiceHeader: '', invoiceFooter: '', paperSize: 'A4', showLogo: true, showGSTIN: true, showDrugLicense: true, autoPrint: false })
  const [prefs, setPrefs]       = useState({ currency: 'INR', dateFormat: 'DD/MM/YYYY', timezone: 'Asia/Kolkata', language: 'English', theme: 'Light' })
  const [passwords, setPasswords] = useState({ currentPwd: '', newPwd: '', confirmPwd: '' })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/settings')
        const d = res.data?.data
        if (d?.businessProfile) setBusiness({ ...business, ...d.businessProfile })
        if (d?.notifications)   setNotif({ ...notif, ...d.notifications })
        if (d?.printing)        setPrinting({ ...printing, ...d.printing })
        if (d?.preferences)     setPrefs({ ...prefs, ...d.preferences })
      } catch {
        // fallback to context data
        setBusiness(p => ({
          ...p,
          storeName: franchiseInfo?.franchiseName || p.storeName,
          storeCode: franchiseInfo?.franchiseCode  || p.storeCode,
        }))
      }
      setLoading(false)
    }
    load()
  }, [])

  const save = async (type, data) => {
    setSaving(true)
    try {
      const URLS = {
        business: '/franchise/settings/business-profile',
        notif:    '/franchise/settings/notification-preferences',
        printing: '/franchise/settings/printing',
        prefs:    '/franchise/settings/preferences',
        security: '/franchise/settings/security/password',
      }
      await putRequest({ url: URLS[type], cred: data })
      toast.success('Settings saved successfully')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = () => {
    if (!passwords.currentPwd || !passwords.newPwd) { toast.error('Fill all password fields'); return }
    if (passwords.newPwd !== passwords.confirmPwd)   { toast.error('New passwords do not match'); return }
    if (passwords.newPwd.length < 6)                 { toast.error('Password must be at least 6 characters'); return }
    save('security', { currentPwd: passwords.currentPwd, newPwd: passwords.newPwd })
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={SettingsIcon} title="Settings" subtitle="Configure your pharmacy portal preferences" color="#0c3b73" />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Sidebar */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', border: 'none', background: activeTab === t.id ? '#0c3b73' : '#fff', color: activeTab === t.id ? '#fff' : '#374151', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === t.id ? 700 : 400, borderBottom: '1px solid #f3f4f6', textAlign: 'left' }}>
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>

          {/* Business Profile */}
          {activeTab === 'business' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Business Profile</h3>
              {loading ? <p style={{ color: '#9ca3af' }}>Loading...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <Inp label="Store Name *"      value={business.storeName}    onChange={e => setBusiness(p => ({ ...p, storeName: e.target.value }))}    placeholder="Pharmacy name" />
                  <Inp label="Store Code"        value={business.storeCode}    onChange={e => setBusiness(p => ({ ...p, storeCode: e.target.value }))}    placeholder="Store code" readOnly />
                  <Inp label="Phone"             value={business.phone}        onChange={e => setBusiness(p => ({ ...p, phone: e.target.value }))}        placeholder="Contact number" />
                  <Inp label="Email"             value={business.email}        onChange={e => setBusiness(p => ({ ...p, email: e.target.value }))}        placeholder="Store email" type="email" />
                  <Inp label="GSTIN"             value={business.gstin}        onChange={e => setBusiness(p => ({ ...p, gstin: e.target.value }))}        placeholder="GST number" />
                  <Inp label="Drug License No."  value={business.drugLicense}  onChange={e => setBusiness(p => ({ ...p, drugLicense: e.target.value }))} placeholder="DL number" />
                  <div style={{ gridColumn: '1/-1' }}>
                    <Inp label="Address" value={business.address} onChange={e => setBusiness(p => ({ ...p, address: e.target.value }))} placeholder="Full store address" />
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => save('business', business)} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', border: 'none', borderRadius: 8, background: saving ? '#9ca3af' : '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* My Profile */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>My Profile</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <Inp label="Full Name" value={franchiseUser?.name || ''} readOnly />
                <Inp label="User ID"   value={franchiseUser?.userId || ''} readOnly />
                <Inp label="Role"      value={franchiseUser?.role || ''} readOnly />
              </div>
              <div style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#0c3b73' }}>
                Profile details are managed by your system administrator.
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notif' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Notification Preferences</h3>
              <Toggle label="Low Stock Alerts"       desc="Notify when medicines reach reorder level" checked={notif.lowStock}     onChange={v => setNotif(p => ({ ...p, lowStock: v }))}     />
              <Toggle label="Expiry Alerts"          desc="Notify for near-expiry medicines"          checked={notif.expiry}       onChange={v => setNotif(p => ({ ...p, expiry: v }))}       />
              <Toggle label="Order Status Updates"   desc="B2B order status notifications"           checked={notif.orderStatus}  onChange={v => setNotif(p => ({ ...p, orderStatus: v }))}  />
              <Toggle label="Subscription Alerts"    desc="Billing and subscription reminders"       checked={notif.subscription} onChange={v => setNotif(p => ({ ...p, subscription: v }))} />
              <Toggle label="Day Closing Reminder"   desc="Remind at day end to close books"         checked={notif.dayClose}    onChange={v => setNotif(p => ({ ...p, dayClose: v }))}     />
              <Toggle label="Staff Login Alerts"     desc="Notify when staff logs in"                checked={notif.staffLogin}  onChange={v => setNotif(p => ({ ...p, staffLogin: v }))}   />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button onClick={() => save('notif', notif)} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', border: 'none', borderRadius: 8, background: saving ? '#9ca3af' : '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Change Password</h3>
              <div style={{ maxWidth: 400 }}>
                <Inp label="Current Password" value={passwords.currentPwd} onChange={e => setPasswords(p => ({ ...p, currentPwd: e.target.value }))} placeholder="••••••••" type="password" />
                <Inp label="New Password"     value={passwords.newPwd}     onChange={e => setPasswords(p => ({ ...p, newPwd: e.target.value }))}     placeholder="••••••••" type="password" />
                <Inp label="Confirm Password" value={passwords.confirmPwd} onChange={e => setPasswords(p => ({ ...p, confirmPwd: e.target.value }))} placeholder="••••••••" type="password" />
              </div>
              <button onClick={handlePasswordChange} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', border: 'none', borderRadius: 8, background: saving ? '#9ca3af' : '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                <Shield size={14} /> {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}

          {/* Printing */}
          {activeTab === 'printing' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Printing & Invoice Settings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <Inp label="Invoice Header" value={printing.invoiceHeader} onChange={e => setPrinting(p => ({ ...p, invoiceHeader: e.target.value }))} placeholder="e.g. Tax Invoice" />
                <Inp label="Invoice Footer" value={printing.invoiceFooter} onChange={e => setPrinting(p => ({ ...p, invoiceFooter: e.target.value }))} placeholder="e.g. Thank you!" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Paper Size</label>
                <select value={printing.paperSize} onChange={e => setPrinting(p => ({ ...p, paperSize: e.target.value }))}
                  style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', width: 200 }}>
                  {['A4', 'A5', 'Thermal 80mm'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <Toggle label="Show Logo on Invoice"          checked={printing.showLogo}         onChange={v => setPrinting(p => ({ ...p, showLogo: v }))} />
              <Toggle label="Show GSTIN on Invoice"         checked={printing.showGSTIN}        onChange={v => setPrinting(p => ({ ...p, showGSTIN: v }))} />
              <Toggle label="Show Drug License on Invoice"  checked={printing.showDrugLicense}  onChange={v => setPrinting(p => ({ ...p, showDrugLicense: v }))} />
              <Toggle label="Auto Print after Billing"      checked={printing.autoPrint}        onChange={v => setPrinting(p => ({ ...p, autoPrint: v }))} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button onClick={() => save('printing', printing)} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', border: 'none', borderRadius: 8, background: saving ? '#9ca3af' : '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeTab === 'prefs' && (
            <div>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Display Preferences</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Currency',    key: 'currency',   opts: ['INR', 'USD', 'EUR'] },
                  { label: 'Date Format', key: 'dateFormat', opts: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
                  { label: 'Timezone',    key: 'timezone',   opts: ['Asia/Kolkata', 'UTC', 'Asia/Dubai'] },
                  { label: 'Language',    key: 'language',   opts: ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu'] },
                  { label: 'Theme',       key: 'theme',      opts: ['Light', 'Dark', 'Auto'] },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
                    <select value={prefs[f.key]} onChange={e => setPrefs(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }}>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button onClick={() => save('prefs', prefs)} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', border: 'none', borderRadius: 8, background: saving ? '#9ca3af' : '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
