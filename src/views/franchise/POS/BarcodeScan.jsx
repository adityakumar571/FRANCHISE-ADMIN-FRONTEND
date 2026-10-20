/* eslint-disable prettier/prettier */
/**
 * Barcode Scan - Production Level
 * Features: Real scanner, Medicine images, Batch selection, Stock validation, Sound feedback
 */
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanLine, ArrowLeft, Zap, Plus, AlertCircle, CheckCircle2, Package } from 'lucide-react'
import Barcode from 'react-barcode'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers/index'
import toast from 'react-hot-toast'

export default function BarcodeScan() {
  const navigate = useNavigate()
  const [barcode, setBarcode] = useState('')
  const [scanned, setScanned] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scanMode, setScanMode] = useState('auto') // auto or manual
  const [qty, setQty] = useState(1)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [scanHistory, setScanHistory] = useState([])
  const inputRef = useRef()
  const scanBufferRef = useRef('')
  const scanTimeoutRef = useRef(null)

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // USB Barcode Scanner Handler (keyboard wedge)
  useEffect(() => {
    if (scanMode !== 'auto') return

    const handleKeyPress = (e) => {
      // Ignore if user is typing in other fields
      if (document.activeElement !== inputRef.current && document.activeElement.tagName === 'INPUT') return

      // Clear timeout
      clearTimeout(scanTimeoutRef.current)

      // Add character to buffer
      if (e.key.length === 1) {
        scanBufferRef.current += e.key
      }

      // Enter key = scan complete
      if (e.key === 'Enter' && scanBufferRef.current.length > 0) {
        e.preventDefault()
        const scannedCode = scanBufferRef.current.trim()
        scanBufferRef.current = ''
        
        if (scannedCode) {
          setBarcode(scannedCode)
          handleScan(scannedCode)
        }
        return
      }

      // Auto-submit after 100ms of no input (fast barcode scanner)
      scanTimeoutRef.current = setTimeout(() => {
        if (scanBufferRef.current.length >= 8) {
          const scannedCode = scanBufferRef.current.trim()
          scanBufferRef.current = ''
          
          if (scannedCode) {
            setBarcode(scannedCode)
            handleScan(scannedCode)
          }
        } else {
          scanBufferRef.current = ''
        }
      }, 100)
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => {
      window.removeEventListener('keypress', handleKeyPress)
      clearTimeout(scanTimeoutRef.current)
    }
  }, [scanMode])

  const playBeep = (success = true) => {
    const beep = new Audio(success 
      ? 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZURE' 
      : 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'
    )
    beep.volume = 0.3
    beep.play().catch(() => {}) // Ignore errors if sound blocked
  }

  const handleScan = async (code = barcode) => {
    if (!code.trim()) {
      toast.error('Enter barcode or batch number')
      return
    }

    setLoading(true)
    setScanned(null)
    setSelectedBatch(null)

    try {
      const res = await getRequest(`/franchise/pos/medicines/barcode/${encodeURIComponent(code.trim())}`)
      const medicine = res.data?.data

      if (medicine) {
        setScanned(medicine)
        setQty(1)
        playBeep(true)
        toast.success(`✅ ${medicine.name}`)
        
        // Add to scan history
        setScanHistory(prev => [{
          code,
          medicine: medicine.name,
          time: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 5))

        // Auto-select first batch if available
        if (medicine.batches && medicine.batches.length > 0) {
          setSelectedBatch(medicine.batches[0])
        }
      }
    } catch (err) {
      playBeep(false)
      toast.error('❌ Medicine not found for this barcode')
      console.error('Scan error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToBill = () => {
    if (!scanned) return

    const itemToAdd = {
      ...scanned,
      qty,
      ...(selectedBatch && {
        batch: selectedBatch.batchNo,
        exp: selectedBatch.expiry,
        mrp: selectedBatch.mrp || scanned.mrp,
        batchId: selectedBatch._id
      })
    }

    toast.success(`Added ${qty}x ${scanned.name}`)
    navigate('/franchise/pos/billing', { state: { addItem: itemToAdd } })
  }

  const stockColor = scanned?.stock <= 0 ? '#dc2626' : scanned?.stock <= 10 ? '#d97706' : '#16a34a'
  const stockLabel = scanned?.stock <= 0 ? 'Out of Stock' : scanned?.stock <= 10 ? 'Low Stock' : 'In Stock'

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '0 20px 40px', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader icon={ScanLine} title="Barcode Scanner" subtitle="Scan medicine barcode to add to bill" color="#0c3b73">
        <button
          onClick={() => navigate('/franchise/pos/billing')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={14} /> Back to Billing
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 20, marginTop: 20 }}>
        {/* Left: Scanner Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Scanner Visual */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Scanner Status</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setScanMode('auto')}
                  style={{
                    padding: '6px 12px',
                    border: `2px solid ${scanMode === 'auto' ? '#0c3b73' : '#e5e7eb'}`,
                    borderRadius: 6,
                    background: scanMode === 'auto' ? '#e0e7ff' : '#fff',
                    color: scanMode === 'auto' ? '#0c3b73' : '#6b7280',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                  <Zap size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Auto Scan
                </button>
                <button
                  onClick={() => setScanMode('manual')}
                  style={{
                    padding: '6px 12px',
                    border: `2px solid ${scanMode === 'manual' ? '#0c3b73' : '#e5e7eb'}`,
                    borderRadius: 6,
                    background: scanMode === 'manual' ? '#e0e7ff' : '#fff',
                    color: scanMode === 'manual' ? '#0c3b73' : '#6b7280',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                  Manual
                </button>
              </div>
            </div>

            {/* Animated Scanner */}
            <div style={{
              background: 'linear-gradient(135deg, #0a1520, #0c1a2e)',
              borderRadius: 12,
              padding: 32,
              marginBottom: 16,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Scanner Frame */}
              <div style={{
                width: '100%',
                maxWidth: 400,
                height: 140,
                border: `3px solid ${loading ? '#f59e0b' : scanMode === 'auto' ? '#16a34a' : '#6b7280'}`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                margin: '0 auto',
                background: 'rgba(10,21,32,0.5)',
                transition: 'border-color 0.3s'
              }}>
                {/* Corner Brackets */}
                {['tl', 'tr', 'bl', 'br'].map(corner => (
                  <div key={corner} style={{
                    position: 'absolute',
                    width: 20,
                    height: 20,
                    borderColor: loading ? '#f59e0b' : scanMode === 'auto' ? '#16a34a' : '#6b7280',
                    borderStyle: 'solid',
                    borderWidth: 0,
                    transition: 'border-color 0.3s',
                    ...(corner.includes('t') ? { top: 10, borderTopWidth: 4 } : { bottom: 10, borderBottomWidth: 4 }),
                    ...(corner.includes('l') ? { left: 10, borderLeftWidth: 4 } : { right: 10, borderRightWidth: 4 })
                  }} />
                ))}

                {/* Real Scannable Barcode */}
                {barcode ? (
                  <Barcode 
                    value={barcode} 
                    format="CODE128"
                    width={2}
                    height={60}
                    displayValue={false}
                    background="transparent"
                    lineColor="#ffffff"
                    margin={0}
                  />
                ) : (
                  // Placeholder animation when no barcode
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {Array.from({ length: 40 }, (_, i) => (
                      <div key={i} style={{
                        width: i % 5 === 0 ? 4 : i % 3 === 0 ? 2 : 1.5,
                        height: 60 + (i % 7) * 10,
                        background: '#fff',
                        opacity: 0.9,
                        borderRadius: 1
                      }} />
                    ))}
                  </div>
                )}

                {/* Scanning Laser Line */}
                {(loading || scanMode === 'auto') && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: loading ? 'rgba(245,158,11,0.9)' : 'rgba(239,68,68,0.9)',
                    boxShadow: `0 0 10px ${loading ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.5)'}`,
                    animation: 'scan 2s ease-in-out infinite'
                  }} />
                )}
              </div>

              {/* Barcode Number */}
              <p style={{
                margin: '16px 0 0',
                fontSize: 16,
                color: '#9ca3af',
                fontFamily: 'monospace',
                letterSpacing: 3,
                textAlign: 'center'
              }}>
                {barcode || '_ _ _ _ _ _ _ _ _ _ _ _'}
              </p>

              {/* Mode Indicator */}
              <div style={{
                position: 'absolute',
                top: 12,
                right: 12,
                padding: '4px 8px',
                background: scanMode === 'auto' ? 'rgba(22,163,74,0.2)' : 'rgba(107,114,128,0.2)',
                border: `1px solid ${scanMode === 'auto' ? 'rgba(22,163,74,0.5)' : 'rgba(107,114,128,0.5)'}`,
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                color: scanMode === 'auto' ? '#16a34a' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: scanMode === 'auto' ? '#16a34a' : '#6b7280',
                  animation: scanMode === 'auto' ? 'pulse 2s ease-in-out infinite' : 'none'
                }} />
                {scanMode === 'auto' ? 'READY' : 'MANUAL'}
              </div>
            </div>

            {/* Manual Input */}
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                ref={inputRef}
                type="text"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                placeholder={scanMode === 'auto' ? 'Scan barcode or type manually...' : 'Type barcode or batch number...'}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
                autoFocus
              />
              <button
                onClick={() => handleScan()}
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  background: loading ? '#93c5fd' : '#0c3b73',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}>
                {loading ? 'Scanning...' : 'Scan'}
              </button>
            </div>
          </div>

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Recent Scans</h4>
              {scanHistory.map((item, idx) => (
                <div key={idx} style={{
                  padding: '8px',
                  background: '#f9fafb',
                  borderRadius: 6,
                  marginBottom: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11
                }}>
                  <span style={{ fontWeight: 600 }}>{item.medicine}</span>
                  <span style={{ color: '#6b7280' }}>{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Scanned Medicine Details */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, position: 'sticky', top: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#374151' }}>
            📦 Scanned Item
          </h3>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div style={{
                width: 50,
                height: 50,
                border: '4px solid #e5e7eb',
                borderTopColor: '#0c3b73',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 0.8s linear infinite'
              }} />
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Searching database...</p>
            </div>
          ) : scanned ? (
            <>
              {/* Medicine Image + Info */}
              <div style={{
                padding: 16,
                background: 'linear-gradient(135deg, #f8faff, #f0f9ff)',
                border: '1px solid #e0e7ff',
                borderRadius: 10,
                marginBottom: 16,
                display: 'flex',
                gap: 12,
                alignItems: 'start'
              }}>
                {/* Medicine Image */}
                {scanned.imageUrl ? (
                  <img
                    src={scanned.imageUrl}
                    alt={scanned.name}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 8,
                      objectFit: 'cover',
                      border: '2px solid #0c3b73',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.querySelector('.fallback').style.display = 'flex'
                    }}
                  />
                ) : null}
                <div className="fallback" style={{
                  width: 70,
                  height: 70,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #e0e7ff, #f0fdf4)',
                  display: scanned.imageUrl ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  border: '2px solid #0c3b73',
                  flexShrink: 0
                }}>💊</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#111827' }}>
                    {scanned.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>
                    {scanned.salt}
                  </p>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '2px 6px',
                      background: stockColor + '20',
                      color: stockColor,
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 4
                    }}>
                      {stockLabel}
                    </span>
                    <span style={{
                      padding: '2px 6px',
                      background: '#eff6ff',
                      color: '#0c3b73',
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 4
                    }}>
                      {scanned.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              {[
                ['MRP', `₹ ${Number(scanned.mrp || 0).toFixed(2)}`, '#0c3b73'],
                ['Stock', `${scanned.stock || 0} Strips`, stockColor],
                ['Batch', scanned.batch || '—', '#374151'],
                ['Expiry', scanned.exp || '—', '#374151'],
                ['Rack', scanned.rackLabel || scanned.rackLocation?.position || '—', '#6b7280'],
                ['Company', scanned.company || '—', '#6b7280'],
              ].map(([label, value, color]) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: 13
                }}>
                  <span style={{ color: '#6b7280', fontSize: 12 }}>{label}</span>
                  <span style={{ fontWeight: 700, color }}>{value}</span>
                </div>
              ))}

              {/* Real Barcode Display */}
              {scanned.barcode && (
                <div style={{
                  marginTop: 16,
                  padding: 12,
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    margin: '0 0 8px', 
                    fontSize: 11, 
                    fontWeight: 700, 
                    color: '#6b7280',
                    textTransform: 'uppercase'
                  }}>
                    Product Barcode
                  </p>
                  <Barcode 
                    value={scanned.barcode} 
                    format="CODE128"
                    width={1.5}
                    height={40}
                    displayValue={true}
                    fontSize={11}
                    background="#f9fafb"
                    lineColor="#111827"
                    margin={0}
                  />
                </div>
              )}

              {/* Batch Selection (if multiple) */}
              {scanned.batches && scanned.batches.length > 1 && (
                <div style={{ marginTop: 16, padding: 12, background: '#fef3c7', border: '1px solid #fde047', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Package size={14} color="#d97706" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706' }}>Multiple Batches Available</span>
                  </div>
                  <select
                    value={selectedBatch?._id || ''}
                    onChange={e => {
                      const batch = scanned.batches.find(b => b._id === e.target.value)
                      setSelectedBatch(batch)
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #fde047',
                      borderRadius: 6,
                      fontSize: 12,
                      background: '#fff',
                      cursor: 'pointer'
                    }}>
                    {scanned.batches.map(batch => (
                      <option key={batch._id} value={batch._id}>
                        Batch: {batch.batchNo} | Exp: {batch.expiry} | Qty: {batch.qty}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity Selector */}
              <div style={{ marginTop: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>
                  QUANTITY
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: '2px solid #e5e7eb',
                      background: '#f9fafb',
                      cursor: 'pointer',
                      fontSize: 18,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                    -
                  </button>
                  <span style={{
                    fontSize: 22,
                    fontWeight: 800,
                    minWidth: 40,
                    textAlign: 'center',
                    color: '#111827'
                  }}>
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: '2px solid #e5e7eb',
                      background: '#f9fafb',
                      cursor: 'pointer',
                      fontSize: 18,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                    +
                  </button>
                </div>

                {/* Add to Bill Button */}
                <button
                  onClick={handleAddToBill}
                  disabled={scanned.stock <= 0}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: scanned.stock <= 0 ? '#d1d5db' : '#0c3b73',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: scanned.stock <= 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}>
                  <Plus size={16} />
                  {scanned.stock <= 0 ? 'Out of Stock' : 'Add to Bill'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <ScanLine size={48} color="#e5e7eb" style={{ margin: '0 auto 16px', display: 'block' }} />
              <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 8px' }}>
                Waiting for scan...
              </p>
              <p style={{ fontSize: 11, color: '#d1d5db', margin: 0 }}>
                {scanMode === 'auto' ? 'Place barcode under scanner' : 'Type barcode manually'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
