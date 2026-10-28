/* eslint-disable prettier/prettier */
/**
 * PharmacyLayout3D — World-Class 3D Pharmacy Floor Plan
 * Modern design with crash-proof null safety
 */
import { useState, useEffect, useMemo } from 'react'
import {
  MapPin, Plus, Package, Layers, AlertTriangle,
  Search, X, ChevronRight, Grid3X3, Thermometer,
  Warehouse, Zap, TrendingDown, BarChart2, RefreshCw,
} from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

/* ══════════════════════ CONSTANTS ══════════════════════ */
const STATUS = {
  available: { color: '#10b981', bg: '#d1fae5', border: '#6ee7b7', label: 'Available'    },
  low:       { color: '#f59e0b', bg: '#fef3c7', border: '#fcd34d', label: 'Low Stock'    },
  out:       { color: '#ef4444', bg: '#fee2e2', border: '#fca5a5', label: 'Out of Stock' },
  empty:     { color: '#94a3b8', bg: '#f1f5f9', border: '#cbd5e1', label: 'Empty'        },
}

const RACK_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e',
  '#f97316','#eab308','#22c55e','#14b8a6',
  '#06b6d4','#3b82f6','#a855f7','#84cc16',
]

const COUNTERS_FALLBACK = [
  { id: 'A', label: 'Counter A', status: 'active' },
  { id: 'B', label: 'Counter B', status: 'active' },
  { id: 'C', label: 'Counter C', status: 'active' },
  { id: 'D', label: 'Counter D', status: 'active' },
  { id: 'E', label: 'Counter E', status: 'active' },
  { id: 'F', label: 'Counter F', status: 'active' },
]

const RACKS_FALLBACK = [
  { id: 'A1', counter: 'A', shelf: 'Shelf 1', box: 'Analgesics & Antipyretics', status: 'available', items: 38, capacity: 40 },
  { id: 'A2', counter: 'A', shelf: 'Shelf 2', box: 'Antibiotics',               status: 'available', items: 35, capacity: 40 },
  { id: 'A3', counter: 'A', shelf: 'Shelf 3', box: 'Antacids',                  status: 'low',       items: 12, capacity: 40 },
  { id: 'A4', counter: 'A', shelf: 'Shelf 4', box: 'Vitamins & Supplements',    status: 'available', items: 40, capacity: 40 },
  { id: 'B1', counter: 'B', shelf: 'Shelf 1', box: 'Cardiovascular',            status: 'available', items: 30, capacity: 40 },
  { id: 'B2', counter: 'B', shelf: 'Shelf 2', box: 'Antidiabetics',             status: 'low',       items: 8,  capacity: 40 },
  { id: 'B3', counter: 'B', shelf: 'Shelf 3', box: 'Respiratory',               status: 'available', items: 36, capacity: 40 },
  { id: 'B4', counter: 'B', shelf: 'Shelf 4', box: 'Neurological',              status: 'out',       items: 0,  capacity: 40 },
  { id: 'B5', counter: 'B', shelf: 'Shelf 5', box: 'Dermatology',               status: 'available', items: 25, capacity: 40 },
  { id: 'B6', counter: 'B', shelf: 'Shelf 6', box: 'Ophthalmology',             status: 'available', items: 20, capacity: 40 },
  { id: 'C1', counter: 'C', shelf: 'Shelf 1', box: 'Gastroenterology',          status: 'available', items: 32, capacity: 40 },
  { id: 'C2', counter: 'C', shelf: 'Shelf 2', box: 'Oncology',                  status: 'available', items: 28, capacity: 40 },
  { id: 'C3', counter: 'C', shelf: 'Shelf 3', box: 'Hormones',                  status: 'low',       items: 5,  capacity: 40 },
  { id: 'C4', counter: 'C', shelf: 'Shelf 4', box: 'Pediatrics',                status: 'available', items: 40, capacity: 40 },
]

const MEDICINES = [
  { name: 'Clavamox 625',       type: 'Tablet',  available: 128, location: { counter: 'B', rack: 'B6', shelf: 'Shelf 6', box: 'Ophthalmology' } },
  { name: 'Amoxicillin 500mg',  type: 'Capsule', available: 45,  location: { counter: 'A', rack: 'A2', shelf: 'Shelf 2', box: 'Antibiotics' } },
  { name: 'Paracetamol 650mg',  type: 'Tablet',  available: 320, location: { counter: 'A', rack: 'A1', shelf: 'Shelf 1', box: 'Analgesics & Antipyretics' } },
  { name: 'Azithromycin 500mg', type: 'Tablet',  available: 60,  location: { counter: 'B', rack: 'B3', shelf: 'Shelf 3', box: 'Respiratory' } },
  { name: 'Pantop DSR',         type: 'Capsule', available: 80,  location: { counter: 'C', rack: 'C1', shelf: 'Shelf 1', box: 'Gastroenterology' } },
  { name: 'Cetirizine 10mg',    type: 'Tablet',  available: 0,   location: { counter: 'B', rack: 'B4', shelf: 'Shelf 4', box: 'Neurological' } },
  { name: 'Metformin 500mg',    type: 'Tablet',  available: 180, location: { counter: 'C', rack: 'C4', shelf: 'Shelf 4', box: 'Pediatrics' } },
  { name: 'Omeprazole 20mg',    type: 'Capsule', available: 12,  location: { counter: 'B', rack: 'B2', shelf: 'Shelf 2', box: 'Antidiabetics' } },
]

/* ══════════════════════ RACK CARD ══════════════════════ */
const RackCard = ({ rack, isSelected, isPinned, onClick }) => {
  const st = STATUS[rack.status] || STATUS.available
  const pct = rack.capacity > 0 ? Math.round((rack.items / rack.capacity) * 100) : 0
  const colorIdx = rack.id.charCodeAt(0) + parseInt(rack.id.slice(1) || 0)
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
      {/* Pin marker */}
      {isPinned && (
        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 10, whiteSpace: 'nowrap' }}>
          📍 HERE
        </div>
      )}

      {/* Status dot */}
      <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: st.color, boxShadow: `0 0 6px ${st.color}` }} />

      {/* Rack shelves visual */}
      <div style={{ background: '#1e293b', borderRadius: 6, padding: '6px 4px', marginBottom: 6, border: '1px solid #334155' }}>
        {[0,1,2,3].map(s => (
          <div key={s} style={{ display: 'flex', gap: 2, marginBottom: s < 3 ? 3 : 0, paddingBottom: 3, borderBottom: s < 3 ? '1px solid #334155' : 'none' }}>
            {[0,1,2,3].map(b => (
              <div key={b} style={{
                flex: 1, height: 8, borderRadius: 2,
                background: pct > 0 ? ['#6366f1','#8b5cf6','#ec4899','#f97316','#22c55e','#14b8a6'][((s*4+b) + colorIdx) % 6] : '#1e293b',
                opacity: pct > 0 ? (s * 4 + b < Math.ceil(rack.items / 4) ? 0.9 : 0.2) : 0.2,
              }} />
            ))}
          </div>
        ))}
      </div>

      {/* Rack ID */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: isSelected ? accentColor : '#94a3b8', letterSpacing: '0.5px' }}>{rack.id}</span>
        <span style={{ fontSize: 9, color: st.color, fontWeight: 600 }}>{pct}%</span>
      </div>

      {/* Fill bar */}
      <div style={{ height: 3, background: '#334155', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: st.color, borderRadius: 2, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

/* ══════════════════════ MAIN COMPONENT ══════════════════════ */
export default function PharmacyLayout3D() {
  const [search, setSearch]             = useState('')
  const [COUNTERS, setCounters]         = useState(COUNTERS_FALLBACK)
  const [RACKS, setRacks]               = useState(RACKS_FALLBACK)
  const [selectedRack, setSelectedRack] = useState(RACKS_FALLBACK.find(r => r.id === 'B6') || RACKS_FALLBACK[0])
  const [selectedCounter, setCounter]   = useState('B')
  const [foundMed, setFoundMed]         = useState(null)
  const [showAddModal, setAddModal]     = useState(false)
  const [addType, setAddType]           = useState('rack')
  const [loading, setLoading]           = useState(false)

  /* Load from API */
  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, rRes] = await Promise.allSettled([
          getRequest('/franchise/layout/counters'),
          getRequest('/franchise/layout/racks'),
        ])
        if (cRes.status === 'fulfilled') {
          const data = cRes.value.data?.data || []
          if (data.length > 0) setCounters(data.map((c, i) => ({ id: c.id || String.fromCharCode(65+i), label: c.label || `Counter ${String.fromCharCode(65+i)}`, status: c.status || 'active' })))
        }
        if (rRes.status === 'fulfilled') {
          const data = rRes.value.data?.data || []
          if (data.length > 0) {
            const mapped = data.map((r, i) => ({
              id: r.code || r.id || `R${i+1}`,
              counter: r.counter || 'A',
              shelf: r.shelf || 'Shelf 1',
              box: r.description || 'General',
              status: r.status || 'available',
              items: r.items || 0,
              capacity: r.capacity || 40,
            }))
            setRacks(mapped)
            setSelectedRack(mapped[0])
          }
        }
      } catch { /* use fallback */ }
    }
    load()
  }, [])

  /* Search */
  const handleSearch = async (val) => {
    setSearch(val)
    if (!val.trim()) { setFoundMed(null); return }
    const med = MEDICINES.find(m => m.name.toLowerCase().includes(val.toLowerCase()))
    if (med) {
      setFoundMed(med)
      const rack = RACKS.find(r => r.id === med.location.rack) || RACKS_FALLBACK.find(r => r.id === med.location.rack)
      if (rack) { setSelectedRack(rack); setCounter(rack.counter) }
      return
    }
    try {
      const res = await getRequest(`/franchise/layout/medicine-location?q=${encodeURIComponent(val)}`)
      const list = res.data?.data || []
      if (list.length > 0) {
        const m = list[0]
        setFoundMed({ name: m.name, type: 'Tablet', available: m.stock || 0, location: { counter: 'A', rack: m.rackLabel || 'A1', shelf: 'Shelf 1', box: 'General' } })
      } else setFoundMed(null)
    } catch { setFoundMed(null) }
  }

  /* Safe rack lookup */
  const getRack = (id) =>
    RACKS.find(r => r.id === id) ||
    RACKS_FALLBACK.find(r => r.id === id) ||
    { id, counter: id[0], shelf: 'Shelf 1', box: 'General', status: 'available', items: 0, capacity: 40 }

  /* Filtered racks by counter */
  const counterRacks = useMemo(() =>
    RACKS.filter(r => r.counter === selectedCounter).length > 0
      ? RACKS.filter(r => r.counter === selectedCounter)
      : RACKS_FALLBACK.filter(r => r.counter === selectedCounter)
  , [RACKS, selectedCounter])

  /* Stats */
  const lowCount  = RACKS.filter(r => r.status === 'low').length
  const outCount  = RACKS.filter(r => r.status === 'out').length
  const okCount   = RACKS.filter(r => r.status === 'available').length

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100vh' }}>

      {/* ══ PAGE HEADER ══ */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
            <Layers size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.3px' }}>3D Pharmacy Layout</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>Real-time rack visualization · Medicine location tracking</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Live legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
            {Object.entries(STATUS).filter(([k]) => k !== 'empty').map(([k, v]) => (
              <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.color, boxShadow: `0 0 6px ${v.color}`, display: 'inline-block' }} />
                {v.label}
              </span>
            ))}
          </div>
          <button onClick={() => { setAddType('counter'); setAddModal(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 9, color: '#60a5fa', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            <Plus size={14} /> Add Counter
          </button>
          <button onClick={() => { setAddType('rack'); setAddModal(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            <Plus size={14} /> Add Rack
          </button>
        </div>
      </div>

      {/* ══ STATS STRIP ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        {[
          { label: 'Total Counters', value: COUNTERS.length, icon: Grid3X3,       color: '#3b82f6', glow: '#3b82f633' },
          { label: 'Total Racks',    value: RACKS.length,    icon: Layers,         color: '#8b5cf6', glow: '#8b5cf633' },
          { label: 'Available',      value: okCount,          icon: BarChart2,      color: '#10b981', glow: '#10b98133' },
          { label: 'Low Stock',      value: lowCount,         icon: TrendingDown,   color: '#f59e0b', glow: '#f59e0b33' },
          { label: 'Out of Stock',   value: outCount,         icon: AlertTriangle,  color: '#ef4444', glow: '#ef444433' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.glow, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Search Medicine</p>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input value={search} onChange={e => handleSearch(e.target.value)}
                placeholder="Search medicine name..."
                style={{ width: '100%', padding: '10px 34px 10px 32px', border: '1px solid #1e293b', borderRadius: 9, fontSize: 13, outline: 'none', background: '#1e293b', color: '#f1f5f9', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#1e293b'}
              />
              {search && (
                <button onClick={() => { setSearch(''); setFoundMed(null) }}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex' }}>
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Found medicine */}
            {foundMed && (
              <div style={{ marginTop: 12, padding: '12px', background: '#1e293b', borderRadius: 10, border: '1px solid #334155' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, background: '#0f172a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={17} color="#6366f1" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{foundMed.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#475569' }}>{foundMed.type}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: foundMed.available === 0 ? '#ef4444' : foundMed.available < 50 ? '#f59e0b' : '#10b981' }}>
                      {foundMed.available} strips available
                    </p>
                  </div>
                </div>
                {[['Counter',foundMed.location.counter],['Rack',foundMed.location.rack],['Shelf',foundMed.location.shelf],['Box',foundMed.location.box]].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #334155', fontSize: 12 }}>
                    <span style={{ color: '#475569' }}>{k}</span>
                    <span style={{ fontWeight: 700, color: '#94a3b8' }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
                  <MapPin size={11} /> Highlighted on floor map
                </div>
              </div>
            )}
          </div>

          {/* Counter list */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Grid3X3 size={13} color="#475569" />
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Counter List</p>
            </div>
            {COUNTERS.map(c => {
              const rackCount = RACKS.filter(r => r.counter === c.id).length || RACKS_FALLBACK.filter(r => r.counter === c.id).length
              const isActive = selectedCounter === c.id
              return (
                <div key={c.id} onClick={() => setCounter(c.id)}
                  style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: '1px solid #0f172a', background: isActive ? '#1e293b' : 'transparent', borderLeft: `3px solid ${isActive ? '#3b82f6' : 'transparent'}`, transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#1e293b80' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: isActive ? '#3b82f620' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: isActive ? '#3b82f6' : '#475569' }}>
                      {c.id}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#f1f5f9' : '#64748b' }}>Counter {c.id}</p>
                      <p style={{ margin: 0, fontSize: 10, color: '#334155' }}>{rackCount} racks</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'inline-block' }} />
                    {isActive && <ChevronRight size={13} color="#3b82f6" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── CENTER: Floor Map ── */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {/* Map header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
                Floor Layout — Counter {selectedCounter}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {COUNTERS.slice(0,4).map(c => (
                <button key={c.id} onClick={() => setCounter(c.id)}
                  style={{ padding: '5px 13px', borderRadius: 7, border: `1px solid ${selectedCounter === c.id ? '#3b82f6' : '#1e293b'}`, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: selectedCounter === c.id ? '#3b82f6' : '#1e293b', color: selectedCounter === c.id ? '#fff' : '#64748b', transition: 'all 0.15s' }}>
                  {c.id}
                </button>
              ))}
            </div>
          </div>

          {/* Floor grid */}
          <div style={{ padding: 20, background: 'linear-gradient(135deg, #080f1a 0%, #0d1623 50%, #080f1a 100%)', position: 'relative', minHeight: 420 }}>

            {/* Grid lines */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(30,41,59,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(30,41,59,0.6) 1px, transparent 1px)', backgroundSize: '40px 40px', borderRadius: 8 }} />

            {/* Floor label */}
            <div style={{ position: 'relative', zIndex: 2, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#334155', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {counterRacks.length} Racks · Counter {selectedCounter}
              </span>
              <div style={{ flex: 1, height: 1, background: '#1e293b' }} />
            </div>

            {/* Rack grid */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Row labels + racks */}
              {(() => {
                const rows = {}
                counterRacks.forEach(r => {
                  const row = r.id[0]
                  if (!rows[row]) rows[row] = []
                  rows[row].push(r)
                })
                return Object.entries(rows).map(([rowId, rowRacks]) => (
                  <div key={rowId} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#475569' }}>
                        {rowId}
                      </div>
                      <div style={{ fontSize: 10, color: '#334155', fontWeight: 600 }}>Row {rowId}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                      {rowRacks.map(rack => (
                        <RackCard
                          key={rack.id}
                          rack={rack}
                          isSelected={selectedRack?.id === rack.id}
                          isPinned={foundMed?.location?.rack === rack.id}
                          onClick={() => setSelectedRack(rack)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              })()}
            </div>

            {/* Special zones */}
            <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 8 }}>
              {[
                { label: 'Cold Storage', icon: Thermometer, color: '#06b6d4', bg: '#0e7490' },
                { label: 'Warehouse',    icon: Warehouse,   color: '#8b5cf6', bg: '#6d28d9' },
                { label: 'Fridge',       icon: Zap,         color: '#3b82f6', bg: '#1d4ed8' },
              ].map(z => (
                <div key={z.label} style={{ background: z.bg + '18', border: `1px dashed ${z.bg}66`, borderRadius: 10, padding: '10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <z.icon size={14} color={z.color} />
                  <span style={{ fontSize: 11, color: z.color, fontWeight: 600 }}>{z.label}</span>
                </div>
              ))}
            </div>

            {/* Entrance */}
            <div style={{ position: 'relative', zIndex: 2, marginTop: 12, textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c720', border: '1px dashed #f59e0b66', borderRadius: 8, padding: '6px 20px', fontSize: 11, color: '#f59e0b', fontWeight: 700, letterSpacing: '2px' }}>
                ▲ ENTRANCE / EXIT
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Rack Details ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Selected rack details */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg,#1e3a8a,#1e40af)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Layers size={16} color="#93c5fd" />
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>Rack Details</p>
            </div>

            {selectedRack ? (
              <div style={{ padding: '16px' }}>
                {/* Rack header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.5px' }}>Rack {selectedRack.id}</p>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: (STATUS[selectedRack.status] || STATUS.available).color + '22',
                      color: (STATUS[selectedRack.status] || STATUS.available).color,
                      border: `1px solid ${(STATUS[selectedRack.status] || STATUS.available).color}44`,
                    }}>
                      ● {(STATUS[selectedRack.status] || STATUS.available).label}
                    </span>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={22} color="#3b82f6" />
                  </div>
                </div>

                {/* Details list */}
                {[
                  ['Counter',         'Counter ' + selectedRack.counter],
                  ['Shelf',            selectedRack.shelf],
                  ['Box / Category',   selectedRack.box],
                  ['Capacity',         `${selectedRack.capacity} Items`],
                  ['Current Stock',    `${selectedRack.items} Items`],
                  ['Remaining Space',  `${selectedRack.capacity - selectedRack.items} Items`],
                ].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e293b', fontSize: 12 }}>
                    <span style={{ color: '#475569', fontWeight: 500 }}>{k}</span>
                    <span style={{ fontWeight: 700, color: '#94a3b8', maxWidth: 140, textAlign: 'right' }}>{v}</span>
                  </div>
                ))}

                {/* Capacity bar */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>Capacity Used</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: (STATUS[selectedRack.status] || STATUS.available).color }}>
                      {Math.round((selectedRack.items / (selectedRack.capacity || 1)) * 100)}%
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 10, background: '#1e293b', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.round((selectedRack.items / (selectedRack.capacity || 1)) * 100)}%`,
                      background: (STATUS[selectedRack.status] || STATUS.available).color,
                      borderRadius: 10, transition: 'width 0.5s',
                      boxShadow: `0 0 10px ${(STATUS[selectedRack.status] || STATUS.available).color}88`,
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#334155' }}>
                    <span>0</span>
                    <span>{selectedRack.items}/{selectedRack.capacity}</span>
                    <span>{selectedRack.capacity}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
                  <button style={{ padding: '9px 0', borderRadius: 9, border: '1px solid #1e293b', background: '#1e293b', color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    View Medicines
                  </button>
                  <button style={{ padding: '9px 0', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                    Edit Rack
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: '#334155', fontSize: 13 }}>
                Click a rack to view details
              </div>
            )}
          </div>

          {/* Mini 3D rack preview */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BoxIcon />
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>3D Preview</p>
            </div>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', background: '#080f1a' }}>
              <div style={{ perspective: '500px' }}>
                <div style={{ width: 120, height: 150, position: 'relative', transform: 'rotateX(15deg) rotateY(-20deg)', transformStyle: 'preserve-3d' }}>
                  {/* Rack label */}
                  <div style={{ position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: 12, fontWeight: 800, padding: '3px 12px', borderRadius: 8, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                    {selectedRack?.id || 'B6'}
                  </div>
                  {/* Frame */}
                  <div style={{ position: 'absolute', inset: 0, border: '2px solid #334155', borderRadius: 8, background: '#0d1623' }} />
                  {/* Shelves */}
                  {[0,1,2,3,4].map(s => (
                    <div key={s} style={{ position: 'absolute', left: 4, right: 4, top: 10 + s*28, height: 3, background: '#334155', borderRadius: 2 }} />
                  ))}
                  {/* Medicine boxes */}
                  {[0,1,2,3,4].map(s => (
                    [0,1,2,3,4].map(b => (
                      <div key={`${s}${b}`} style={{
                        position: 'absolute',
                        left: 6 + b * 21, top: 13 + s * 28,
                        width: 17, height: 14, borderRadius: 3,
                        background: RACK_COLORS[(s*5+b) % RACK_COLORS.length],
                        opacity: (selectedRack?.items || 0) > (s*5+b) ? 0.85 : 0.15,
                        boxShadow: (selectedRack?.items || 0) > (s*5+b) ? `0 0 6px ${RACK_COLORS[(s*5+b) % RACK_COLORS.length]}66` : 'none',
                      }} />
                    ))
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* All racks mini list */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>All Racks</p>
              <span style={{ fontSize: 10, color: '#334155', fontWeight: 600 }}>{counterRacks.length} in Counter {selectedCounter}</span>
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto' }}>
              {counterRacks.map(r => {
                const st = STATUS[r.status] || STATUS.available
                const pct = Math.round((r.items / (r.capacity || 1)) * 100)
                return (
                  <div key={r.id} onClick={() => setSelectedRack(r)}
                    style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderBottom: '1px solid #0f172a', background: selectedRack?.id === r.id ? '#1e293b' : 'transparent', transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (selectedRack?.id !== r.id) e.currentTarget.style.background = '#1e293b50' }}
                    onMouseLeave={e => { if (selectedRack?.id !== r.id) e.currentTarget.style.background = 'transparent' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.color, boxShadow: `0 0 6px ${st.color}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', width: 28, flexShrink: 0 }}>{r.id}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: st.color, borderRadius: 2 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: st.color, fontWeight: 700, width: 28, textAlign: 'right' }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══ ADD MODAL ══ */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#0f172a', borderRadius: 16, padding: '28px', width: '100%', maxWidth: 440, border: '1px solid #1e293b', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Add New {addType === 'counter' ? 'Counter' : 'Rack'}</h3>
              <button onClick={() => setAddModal(false)} style={{ background: '#1e293b', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}><X size={15} /></button>
            </div>
            {(addType === 'rack'
              ? [['Rack Code *','code','e.g. D1'],['Counter','counter','e.g. D'],['Shelf','shelf','e.g. Shelf 1'],['Category','box','e.g. Antibiotics'],['Capacity','capacity','40']]
              : [['Counter ID *','id','e.g. D'],['Label *','label','e.g. Counter D']]
            ).map(([label, key, ph]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                <input placeholder={ph}
                  style={{ width: '100%', height: 42, border: '1px solid #1e293b', borderRadius: 9, padding: '0 14px', fontSize: 13, outline: 'none', background: '#1e293b', color: '#f1f5f9', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#1e293b'}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setAddModal(false)} style={{ flex: 1, padding: '11px 0', borderRadius: 9, border: '1px solid #1e293b', background: '#1e293b', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
              <button onClick={() => { toast.success(`${addType === 'counter' ? 'Counter' : 'Rack'} added successfully`); setAddModal(false) }}
                style={{ flex: 2, padding: '11px 0', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                Add {addType === 'counter' ? 'Counter' : 'Rack'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* tiny box icon inline */
const BoxIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)
