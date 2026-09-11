/* eslint-disable prettier/prettier */
/**
 * Screen 2 — Barcode Scan — Real API integration
 */
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanLine, ArrowLeft, FileText, Zap, Plus, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { SBtn, TextInput, FieldLabel } from './posHelpers'
import { getRequest } from '../../../Helpers/index'
import toast from 'react-hot-toast'

export default function BarcodeScan() {
  const navigate  = useNavigate()
  const [barcode, setBarcode]   = useState('')
  const [scanned, setScanned]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [mode, setMode]         = useState('manual')
  const [qty, setQty]           = useState(1)
  const inputRef = useRef()

  const handleScan = async () => {
    if (!barcode.trim()) { toast.error('Enter barcode or batch number'); return }
    setLoading(true)
    setScanned(null)
    try {
      const res = await getRequest(`/franchise/pos/medicines/barcode/${encodeURIComponent(barcode.trim())}`)
      setScanned(res.data?.data)
      toast.success('Medicine found!')
    } catch {
      toast.error('Medicine not found for this barcode')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleScan()
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={ScanLine} title="Barcode Scan" subtitle="Scan medicine barcode to add to bill" color="#0c3b73">
        <SBtn label="Back to Billing" icon={ArrowLeft} bg="#f3f4f6" color="#374151" border="#e5e7eb" sm onClick={() => navigate('/franchise/pos/billing')} />
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18, alignItems: 'start' }}>
        {/* Scanner Area */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>Place the barcode under the scanner</p>

          {/* Barcode visual */}
          <div style={{ background: '#0c1a2e', borderRadius: 14, padding: 28, marginBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: '100%', maxWidth: 340, height: 130, border: `2px solid ${loading ? '#f59e0b' : '#16a34a'}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: '#0a1520', overflow: 'hidden', transition: 'border-color 0.3s' }}>
              {['top-left','top-right','bottom-left','bottom-right'].map(pos => (
                <div key={pos} style={{ position: 'absolute', width: 18, height: 18, borderColor: loading ? '#f59e0b' : '#16a34a', borderStyle: 'solid', borderWidth: 0,
                  ...(pos.includes('top') ? { top: 8, borderTopWidth: 3 } : { bottom: 8, borderBottomWidth: 3 }),
                  ...(pos.includes('left') ? { left: 8, borderLeftWidth: 3 } : { right: 8, borderRightWidth: 3 }),
                }} />
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {Array.from({ length: 34 }, (_, i) => (
                  <div key={i} style={{ width: i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5, height: 50 + (i % 6) * 8, background: '#fff', opacity: 0.9, borderRadius: 1 }} />
                ))}
              </div>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: loading ? 'rgba(245,158,11,0.8)' : 'rgba(239,68,68,0.8)', transform: 'translateY(-50%)', transition: 'background 0.3s' }} />
            </div>
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280', fontFamily: 'monospace', letterSpacing: 4 }}>
              {barcode || '890 1234 567890'}
            </p>
          </div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[{ key: 'manual', label: 'Manual Entry', icon: FileText }, { key: 'torch', label: 'Torch On', icon: Zap }].map(m => (
              <button key={m.key} onClick={() => setMode(m.key)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', border: `2px solid ${mode === m.key ? '#0c3b73' : '#e5e7eb'}`, borderRadius: 8, background: mode === m.key ? '#e0e7ff' : '#fff', color: mode === m.key ? '#0c3b73' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <m.icon size={13} /> {m.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <TextInput
                ref={inputRef}
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type barcode or batch number..."
                autoFocus
              />
            </div>
            <SBtn label={loading ? '...' : 'Scan'} icon={Search} disabled={loading} onClick={handleScan} />
          </div>
        </div>

        {/* Scanned Item Detail */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>Scanned Item</p>
          {loading && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#0c3b73', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 13, margin: 0 }}>Searching...</p>
            </div>
          )}
          {!loading && scanned && (
            <>
              <div style={{ padding: '14px', background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 10, marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{scanned.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{scanned.salt}</p>
              </div>
              {[
                ['Batch', scanned.batch],
                ['Exp', scanned.exp],
                ['MRP', `₹ ${scanned.mrp}`],
                ['Stock', `${scanned.stock} Strips`],
                ['Rack', scanned.rackLabel || '—'],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13, borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280' }}>{l}</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <FieldLabel>Quantity</FieldLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>-</button>
                  <span style={{ fontSize: 18, fontWeight: 800, minWidth: 30, textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
                </div>
                <SBtn label="Add to Bill [+]" icon={Plus} full onClick={() => navigate('/franchise/pos/billing', { state: { addItem: { ...scanned, qty } } })} />
              </div>
            </>
          )}
          {!loading && !scanned && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af' }}>
              <ScanLine size={40} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 13, margin: 0 }}>Scan or enter barcode to see medicine details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
