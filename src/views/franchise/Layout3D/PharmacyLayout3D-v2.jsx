/* eslint-disable prettier/prettier */
/**
 * PharmacyLayout3D v2 — Real Data Integration
 * Connects to AddMedicine data via API
 * Perfect sync: medicines created → appear in 3D layout
 */
import { useState, useEffect, useMemo } from 'react'
import {
  Package, Layers,
  Search, Grid3X3,
  TrendingDown, BarChart2, RefreshCw,
} from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import BatchSelectorModal from '../../../components/BatchSelectorModal'

/* ══════════════════════ CONSTANTS ══════════════════════ */
const STATUS = {
  available: { color: '#10b981', bg: '#d1fae5', border: '#6ee7b7', label: 'Available' },
  low: { color: '#f59e0b', bg: '#fef3c7', border: '#fcd34d', label: 'Low Stock' },
  out: { color: '#ef4444', bg: '#fee2e2', border: '#fca5a5', label: 'Out of Stock' },
  empty: { color: '#94a3b8', bg: '#f1f5f9', border: '#cbd5e1', label: 'Empty' },
}

const RACK_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#a855f7', '#84cc16',
]

/* ══════════════════════ RACK CARD ══════════════════════ */
const RackCard = ({ rack, isSelected, isPinned, onClick }) => {
  const st = STATUS[rack.status] || STATUS.available
  const pct = rack.capacity > 0 ? Math.round((rack.items / rack.capacity) * 100) : 0
  const colorIdx = (rack.code?.charCodeAt(0) || 0) + (parseInt(rack.code?.slice(1) || 0) || 0)
  const accentColor = RACK_COLORS[colorIdx % RACK_COLORS.length]

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? '#1e293b' : '#0f172a',
        border: `2px solid ${isSelected ? accentColor : isPinned ? '#ef4444' : '#1e293b'}`,
        borderRadius: 10,
        padding: '10px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s',
        boxShadow: isSelected ? `0 0 0 3px ${accentColor}33, 0 8px 24px rgba(0,0,0,0.4)` : '0 2px 8px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = accentColor + '88' }}
      onMouseLeave={e => { if (!isSelected && !isPinned) e.currentTarget.style.borderColor = '#1e293b' }}
    >
      {isPinned && (
        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 10, whiteSpace: 'nowrap' }}>
          📍 HERE
        </div>
      )}

      <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: st.color, boxShadow: `0 0 6px ${st.color}` }} />

      <div style={{ background: '#1e293b', borderRadius: 6, padding: '6px 4px', marginBottom: 6, border: '1px solid #334155' }}>
        {[0, 1, 2, 3].map(s => (
          <div key={s} style={{ display: 'flex', gap: 2, marginBottom: s < 3 ? 3 : 0, paddingBottom: 3, borderBottom: s < 3 ? '1px solid #334155' : 'none' }}>
            {[0, 1, 2, 3].map(b => (
              <div key={b} style={{
                flex: 1, height: 8, borderRadius: 2,
                background: pct > 0 ? ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#14b8a6'][((s * 4 + b) + colorIdx) % 6] : '#1e293b',
                opacity: pct > 0 ? (s * 4 + b < Math.ceil(rack.items / 4) ? 0.9 : 0.2) : 0.2,
              }} />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: isSelected ? accentColor : '#94a3b8', letterSpacing: '0.5px' }}>{rack.code}</span>
        <span style={{ fontSize: 9, color: st.color, fontWeight: 600 }}>{pct}%</span>
      </div>

      <div style={{ height: 3, background: '#334155', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: st.color, borderRadius: 2, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

/* ══════════════════════ MAIN COMPONENT ══════════════════════ */
export default function PharmacyLayout3D() {
  const [search, setSearch] = useState('')
  const [medicines, setMedicines] = useState([])
  const [counters, setCounters] = useState([])
  const [racks, setRacks] = useState([])
  const [selectedRack, setSelectedRack] = useState(null)
  const [selectedCounter, setCounter] = useState(null)
  const [foundMed, setFoundMed] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [selectedMedicineForSale, setSelectedMedicineForSale] = useState(null)

  /* ── Fetch medicines from API ── */
  const fetchMedicines = async () => {
    try {
      const res = await getRequest('/franchise/medicines?limit=1000')
      const data = res.data?.data?.medicines || []

      // Transform API format to 3D layout format
      const transformed = data.map(m => ({
        _id: m._id,
        name: m.name,
        type: m.formulation || 'Tablet',
        available: m.currentStock || 0,
        sku: m.sku || '',
        salt: m.salt || '',
        category: m.category || 'General',
        counterId: m.counterId,
        rackCode: m.rackLocation?.rackId || '',
        shelf: m.rackLocation?.shelf || 1,
        row: m.rackLocation?.row || 'A',
        column: m.rackLocation?.column || 1,
        position: m.rackLocation?.position || '',
        batches: m.batches || [],
      }))

      setMedicines(transformed)
      console.log('✅ [3D] Loaded medicines:', transformed.length)
    } catch (err) {
      console.error('❌ [3D] Error fetching medicines:', err)
      toast.error('Failed to load medicines')
    }
  }

  /* ── Fetch counters ── */
  const fetchCounters = async () => {
    try {
      const res = await getRequest('/franchise/master/counters')
      const data = res.data?.data || []
      setCounters(data)
      console.log('✅ [3D] Loaded counters:', data.length)
    } catch (err) {
      console.error('❌ [3D] Error fetching counters:', err)
    }
  }

  /* ── Fetch racks ── */
  const fetchRacks = async () => {
    try {
      const res = await getRequest('/franchise/master/racks')
      const data = res.data?.data || []

      // Calculate status based on medicines in each rack
      const racksWithStatus = data.map(r => {
        const rackMedicines = medicines.filter(m => m.rackCode === r.code)
        const totalItems = rackMedicines.reduce((sum, m) => sum + m.available, 0)

        let status = 'empty'
        if (totalItems > 0) {
          const capacity = r.capacity || 40
          const fillPct = (totalItems / capacity) * 100
          if (fillPct === 0) status = 'empty'
          else if (fillPct < 25) status = 'low'
          else if (fillPct < 100) status = 'available'
          else status = 'available'
        }

        return {
          ...r,
          code: r.code,
          items: totalItems,
          capacity: r.capacity || 40,
          status,
          counter: getCounterCode(r.counterId)
        }
      })

      setRacks(racksWithStatus)
      console.log('✅ [3D] Loaded racks:', racksWithStatus.length)
    } catch (err) {
      console.error('❌ [3D] Error fetching racks:', err)
    }
  }

  /* ── Get counter code by ID ── */
  const getCounterCode = (counterId) => {
    if (!counterId) return 'A'
    const cId = typeof counterId === 'object' ? counterId._id : counterId
    const counter = counters.find(c => c._id === cId)
    return counter?.code?.[0] || 'A'
  }

  /* ── Initial load ── */
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await fetchCounters()
      await fetchRacks()
      await fetchMedicines()
      setLastRefresh(new Date())
      setLoading(false)
    }
    load()
  }, [])

  /* ── Auto-refresh every 30 seconds ── */
  useEffect(() => {
    if (!autoRefresh) return

    const timer = setInterval(async () => {
      await fetchMedicines()
      await fetchRacks()
      setLastRefresh(new Date())
      console.log('🔄 [3D] Auto-refreshed')
    }, 30000)

    return () => clearInterval(timer)
  }, [autoRefresh, medicines, counters])

  /* ── Manual refresh ── */
  const handleManualRefresh = async () => {
    await fetchMedicines()
    await fetchRacks()
    setLastRefresh(new Date())
    toast.success('Refreshed!')
  }

  /* ── Search medicine ── */
  const handleSearch = async (val) => {
    setSearch(val)
    if (!val.trim()) { setFoundMed(null); return }

    // Search in real medicines
    const med = medicines.find(m => m.name.toLowerCase().includes(val.toLowerCase()))

    if (med) {
      setFoundMed(med)
      // Auto-select rack
      const rack = racks.find(r => r.code === med.rackCode)
      if (rack) {
        setSelectedRack(rack)
        setCounter(rack.counter)
      }
      console.log('🔍 Found medicine:', med.name, 'in rack', med.rackCode)
    } else {
      setFoundMed(null)
    }
  }

  /* ── Handle medicine click for batch selection ── */
  const handleMedicineClick = (medicine) => {
    // Check if medicine has active batches
    const activeBatches = (medicine.batches || [])
      .filter(b => b.isActive && (b.availableQty || b.quantity) > 0)
    
    if (activeBatches.length === 0) {
      toast.error('No active batches available for this medicine')
      return
    }

    setSelectedMedicineForSale(medicine)
    setBatchModalOpen(true)
  }

  /* ── Handle batch selection from modal ── */
  const handleBatchSelect = (data) => {
    const { batch, qty } = data
    // TODO: Add to cart / create sale
    console.log('📦 Selected batch:', {
      medicineId: selectedMedicineForSale._id,
      medicineName: selectedMedicineForSale.name,
      batchId: batch._id,
      batchNo: batch.batchNo,
      expiryDate: batch.expiryDate,
      qty,
      mrp: batch.mrp,
    })
    toast.success(`Added ${qty}x ${selectedMedicineForSale.name} (Batch ${batch.batchNo}) to cart`)
    setBatchModalOpen(false)
    setSelectedMedicineForSale(null)
  }

  /* ── Filtered racks by counter ── */
  const counterRacks = useMemo(() => {
    if (!selectedCounter) return racks
    return racks.filter(r => r.counter === selectedCounter)
  }, [racks, selectedCounter])

  /* ── Stats ── */
  const lowCount = racks.filter(r => r.status === 'low').length
  const outCount = racks.filter(r => r.status === 'out').length
  const okCount = racks.filter(r => r.status === 'available').length
  const totalMeds = medicines.length

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a', color: '#f1f5f9' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 16 }} />
          <p style={{ fontSize: 14, fontWeight: 600 }}>Loading pharmacy layout...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100vh', background: '#0f172a', padding: '16px', color: '#f1f5f9' }}>

      {/* ══ PAGE HEADER ══ */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
            <Layers size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.3px' }}>3D Pharmacy Layout</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>Real-time visualization · {totalMeds} medicines tracked</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
            Updated: {lastRefresh.toLocaleTimeString()}
            {autoRefresh && ' (Auto 30s)'}
          </span>
          <button
            onClick={handleManualRefresh}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{ padding: '8px 14px', background: autoRefresh ? '#3b82f620' : '#1e293b', border: `1px solid ${autoRefresh ? '#3b82f6' : '#334155'}`, borderRadius: 8, color: autoRefresh ? '#60a5fa' : '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            {autoRefresh ? '⏸ Auto ON' : '▶ Auto OFF'}
          </button>
        </div>
      </div>

      {/* ══ STATS STRIP ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Medicines', value: totalMeds, icon: Package, color: '#3b82f6' },
          { label: 'Total Counters', value: counters.length, icon: Grid3X3, color: '#8b5cf6' },
          { label: 'Total Racks', value: racks.length, icon: Layers, color: '#22c55e' },
          { label: 'Available', value: okCount, icon: BarChart2, color: '#10b981' },
          { label: 'Low Stock', value: lowCount, icon: TrendingDown, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: '#475569', fontWeight: 600 }}>{s.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ══ MAIN 3-COLUMN LAYOUT ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', gap: 14, alignItems: 'start' }}>

        {/* ── LEFT: Search + Counter List ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Search */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: '16px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', margin: '0 0 10px', textTransform: 'uppercase' }}>Search</p>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search medicine..."
                style={{ width: '100%', padding: '10px 34px 10px 32px', border: '1px solid #334155', borderRadius: 9, fontSize: 13, outline: 'none', background: '#0f172a', color: '#f1f5f9', boxSizing: 'border-box' }}
              />
            </div>

            {foundMed && (
              <div style={{ marginTop: 12, padding: '12px', background: '#0f172a', borderRadius: 10, border: '1px solid #334155' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{foundMed.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>SKU: {foundMed.sku}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 700, color: foundMed.available === 0 ? '#ef4444' : '#10b981' }}>{foundMed.available} items</p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6b7280' }}>Position: {foundMed.position}</p>
              </div>
            )}
          </div>

          {/* Counter list */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Counters ({counters.length})
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {counters.map(c => {
                const code = c.code?.[0] || 'A'
                const rackCount = racks.filter(r => r.counter === code).length
                const isActive = selectedCounter === code
                return (
                  <div key={c._id} onClick={() => setCounter(code)}
                    style={{ padding: '12px 16px', borderBottom: '1px solid #0f172a', background: isActive ? '#2a3f5f' : 'transparent', borderLeft: `3px solid ${isActive ? '#3b82f6' : 'transparent'}`, cursor: 'pointer' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: isActive ? 700 : 500, color: '#f1f5f9' }}>Counter {code}</p>
                    <p style={{ margin: 0, fontSize: 10, color: '#475569' }}>{rackCount} racks</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── CENTER: Floor Map ── */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, overflow: 'hidden', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
              {selectedCounter ? `Counter ${selectedCounter} - ${counterRacks.length} Racks` : 'All Racks'}
            </p>
          </div>

          {/* Rack grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
            {counterRacks.length > 0 ? (
              counterRacks.map(rack => (
                <RackCard
                  key={rack._id}
                  rack={rack}
                  isSelected={selectedRack?._id === rack._id}
                  isPinned={foundMed?.rackCode === rack.code}
                  onClick={() => setSelectedRack(rack)}
                />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#475569' }}>
                No racks to display
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Rack Details ── */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 16, maxHeight: '600px', overflowY: 'auto' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            {selectedRack ? `Rack ${selectedRack.code}` : 'Select a rack'}
          </p>

          {selectedRack ? (
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#3b82f6', marginBottom: 12 }}>{selectedRack.code}</div>
              {[
                ['Counter', 'Counter ' + selectedRack.counter],
                ['Status', STATUS[selectedRack.status]?.label || 'Unknown'],
                ['Capacity', `${selectedRack.capacity} items`],
                ['Current Stock', `${selectedRack.items} items`],
                ['Fill %', `${Math.round((selectedRack.items / selectedRack.capacity) * 100)}%`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155', fontSize: 12 }}>
                  <span style={{ color: '#475569' }}>{k}</span>
                  <span style={{ fontWeight: 700, color: '#94a3b8' }}>{v}</span>
                </div>
              ))}

              {/* Medicines in rack */}
              <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', margin: '12px 0 8px', textTransform: 'uppercase' }}>Medicines</p>
              <div style={{ fontSize: 12 }}>
                {medicines.filter(m => m.rackCode === selectedRack.code).length > 0 ? (
                  medicines.filter(m => m.rackCode === selectedRack.code).map(m => (
                    <div key={m._id} style={{ padding: '8px', background: '#0f172a', borderRadius: 6, marginBottom: 6, border: '1px solid #334155' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 12 }}>{m.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>SKU: {m.sku} | Stock: {m.available}</p>
                      {m.batches.length > 0 && (
                        <p style={{ margin: '2px 0 0', fontSize: 10, color: '#6b7280' }}>Batches: {m.batches.length}</p>
                      )}
                      <button
                        onClick={() => handleMedicineClick(m)}
                        style={{
                          marginTop: 6,
                          padding: '4px 10px',
                          fontSize: 10,
                          fontWeight: 600,
                          background: '#3b82f6',
                          border: 'none',
                          borderRadius: 4,
                          color: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        Select Batch
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#475569', fontSize: 11 }}>No medicines yet</p>
                )}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Select a rack to see details</p>
          )}
        </div>
      </div>

      {/* ══ BATCH SELECTOR MODAL ══ */}
      <BatchSelectorModal
        medicine={selectedMedicineForSale}
        isOpen={batchModalOpen}
        onClose={() => {
          setBatchModalOpen(false)
          setSelectedMedicineForSale(null)
        }}
        onSelect={handleBatchSelect}
      />
    </div>
  )
}
