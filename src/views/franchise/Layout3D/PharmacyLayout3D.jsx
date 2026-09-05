/* eslint-disable prettier/prettier */
/**
 * PharmacyLayout3D — Isometric 3D Pharmacy Floor Plan
 * API-integrated medicine location search
 */
import { useState, useEffect } from 'react'
import { MapPin, Plus, Package, Layers, AlertTriangle, Search, X, ChevronRight, Grid3X3, BoxSelect } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

/* ═══════════════════ MOCK DATA ═══════════════════ */
const COUNTERS = [
  { id: 'A', label: 'Counter A', color: '#3b82f6', x: 1, y: 0, status: 'active' },
  { id: 'B', label: 'Counter B', color: '#3b82f6', x: 3, y: 0, status: 'active' },
  { id: 'C', label: 'Counter C', color: '#3b82f6', x: 5, y: 0, status: 'active' },
  { id: 'E', label: 'Counter E', color: '#3b82f6', x: 3, y: 4, status: 'active' },
  { id: 'F', label: 'Counter F', color: '#3b82f6', x: 0, y: 2, status: 'active' },
]

const RACKS = [
  // Row A
  { id: 'A1', counter: 'A', shelf: 'Top',    box: 'Box 01', row: 0, col: 1, status: 'available', items: 38, capacity: 40 },
  { id: 'A2', counter: 'A', shelf: 'Middle', box: 'Box 02', row: 0, col: 2, status: 'available', items: 35, capacity: 40 },
  { id: 'A3', counter: 'A', shelf: 'Bottom', box: 'Box 03', row: 0, col: 3, status: 'low',       items: 12, capacity: 40 },
  { id: 'A4', counter: 'A', shelf: 'Top',    box: 'Box 04', row: 0, col: 4, status: 'available', items: 40, capacity: 40 },
  // Row B
  { id: 'B1', counter: 'B', shelf: 'Top',    box: 'Box 01', row: 1, col: 1, status: 'available', items: 30, capacity: 40 },
  { id: 'B2', counter: 'B', shelf: 'Middle', box: 'Box 02', row: 1, col: 2, status: 'low',       items: 8,  capacity: 40 },
  { id: 'B3', counter: 'B', shelf: 'Bottom', box: 'Box 03', row: 1, col: 3, status: 'available', items: 36, capacity: 40 },
  { id: 'B4', counter: 'B', shelf: 'Top',    box: 'Box 04', row: 1, col: 4, status: 'out',       items: 0,  capacity: 40 },
  { id: 'B5', counter: 'B', shelf: 'Middle', box: 'Box 05', row: 1, col: 5, status: 'available', items: 25, capacity: 40 },
  { id: 'B6', counter: 'B', shelf: 'Middle', box: 'Box 02', row: 1, col: 6, status: 'available', items: 20, capacity: 40 },
  // Row C
  { id: 'C1', counter: 'C', shelf: 'Top',    box: 'Box 01', row: 2, col: 1, status: 'available', items: 32, capacity: 40 },
  { id: 'C2', counter: 'C', shelf: 'Middle', box: 'Box 02', row: 2, col: 2, status: 'available', items: 28, capacity: 40 },
  { id: 'C3', counter: 'C', shelf: 'Bottom', box: 'Box 03', row: 2, col: 3, status: 'low',       items: 5,  capacity: 40 },
  { id: 'C4', counter: 'C', shelf: 'Top',    box: 'Box 04', row: 2, col: 4, status: 'available', items: 40, capacity: 40 },
]

const MEDICINES = [
  { name: 'Clavm 625',          type: 'Tablet',  available: 128, location: { counter: 'B', rack: 'B6', shelf: 'Middle', box: 'Box 02' } },
  { name: 'Amoxicillin 500mg',  type: 'Capsule', available: 45,  location: { counter: 'A', rack: 'A2', shelf: 'Top',    box: 'Box 02' } },
  { name: 'Paracetamol 650mg',  type: 'Tablet',  available: 320, location: { counter: 'A', rack: 'A1', shelf: 'Top',    box: 'Box 01' } },
  { name: 'Azithromycin 500mg', type: 'Tablet',  available: 60,  location: { counter: 'B', rack: 'B3', shelf: 'Bottom', box: 'Box 03' } },
  { name: 'Pantop DSR Capsule', type: 'Capsule', available: 80,  location: { counter: 'C', rack: 'C1', shelf: 'Top',    box: 'Box 01' } },
  { name: 'Cetirizine 10mg',    type: 'Tablet',  available: 0,   location: { counter: 'B', rack: 'B4', shelf: 'Top',    box: 'Box 04' } },
  { name: 'Metformin 500mg',    type: 'Tablet',  available: 180, location: { counter: 'C', rack: 'C4', shelf: 'Top',    box: 'Box 04' } },
  { name: 'Omeprazole 20mg',    type: 'Capsule', available: 12,  location: { counter: 'B', rack: 'B2', shelf: 'Middle', box: 'Box 02' } },
]

const STATUS_COLORS = {
  available: '#22c55e',
  low:       '#f59e0b',
  out:       '#ef4444',
}

/* ═══════════════════ ISOMETRIC RACK COMPONENT ═══════════════════ */
const IsometricRack = ({ rack, selected, onClick, pinned }) => {
  const sc = STATUS_COLORS[rack.status] || '#22c55e'
  const isSelected = selected?.id === rack.id

  // Shelf colors alternating
  const shelfColors = ['#c8d6e8', '#b8c8dc', '#a8b8cc', '#98a8bc', '#88a0bc']

  return (
    <g
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      transform={`translate(${rack.col * 72 + rack.row * 36}, ${rack.row * 44 - rack.col * 0})`}
    >
      {/* Glow if selected */}
      {isSelected && (
        <rect x="-4" y="-4" width="68" height="90" rx="4" fill="none" stroke="#3b82f6" strokeWidth="2.5" opacity="0.7" />
      )}

      {/* Rack body - isometric shelves */}
      {[0, 1, 2, 3, 4].map(s => (
        <g key={s} transform={`translate(0, ${s * 14})`}>
          {/* Shelf board top */}
          <rect x="2" y={0} width="56" height="3" rx="1" fill={shelfColors[s]} />
          {/* Medicine strips on shelf */}
          {Array.from({ length: Math.floor(Math.random() * 4) + 3 }).map((_, mi) => (
            <rect key={mi} x={4 + mi * 10} y={3} width="8" height="9"
              rx="1"
              fill={['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c'][mi % 6]}
              opacity="0.85"
            />
          ))}
        </g>
      ))}

      {/* Rack frame */}
      <rect x="1" y="0" width="58" height="72" rx="3" fill="none" stroke="#94a3b8" strokeWidth="1.2" opacity="0.6" />

      {/* Top cap */}
      <rect x="0" y="0" width="60" height="4" rx="2" fill="#64748b" opacity="0.5" />

      {/* Rack label */}
      <rect x="18" y="74" width="24" height="14" rx="3"
        fill={isSelected ? '#3b82f6' : '#1e40af'}
      />
      <text x="30" y="84" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">{rack.id}</text>

      {/* Status dot */}
      <circle cx="52" cy="6" r="4" fill={sc} />
      {rack.status === 'out' && <circle cx="52" cy="6" r="4" fill="none" stroke="#fff" strokeWidth="1" />}

      {/* Pin marker if this rack has a searched medicine */}
      {pinned && (
        <g transform="translate(22, -16)">
          <circle cx="8" cy="8" r="8" fill="#ef4444" />
          <text x="8" y="12" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="800">!</text>
        </g>
      )}
    </g>
  )
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export default function PharmacyLayout3D() {
  const [search, setSearch]           = useState('')
  const [selectedRack, setSelectedRack] = useState(RACKS.find(r => r.id === 'B6'))
  const [selectedCounter, setCounter] = useState('B')
  const [foundMed, setFoundMed]       = useState(null)
  const [showAddModal, setAddModal]   = useState(false)
  const [addType, setAddType]         = useState('counter') // 'counter' | 'rack'

  /* Search logic */
  const handleSearch = async (val) => {
    setSearch(val)
    if (!val.trim()) { setFoundMed(null); return }
    // First check local mock data for instant feedback
    const med = MEDICINES.find(m => m.name.toLowerCase().includes(val.toLowerCase()))
    if (med) {
      setFoundMed(med)
      const rack = RACKS.find(r => r.id === med.location.rack)
      if (rack) { setSelectedRack(rack); setCounter(rack.counter) }
      return
    }
    // Then try API for real medicines
    try {
      const res = await getRequest(`/franchise/layout/medicine-location?q=${encodeURIComponent(val)}`)
      const apiMeds = res.data?.data || []
      if (apiMeds.length > 0) {
        const apiMed = apiMeds[0]
        setFoundMed({ name: apiMed.name, type: 'Tablet', available: apiMed.stock, location: { counter: 'A', rack: apiMed.rackLabel || 'A1', shelf: 'Top', box: 'Box 01' } })
        const rack = RACKS.find(r => r.id === apiMed.rackLabel) || RACKS[0]
        if (rack) { setSelectedRack(rack); setCounter(rack.counter) }
      } else {
        setFoundMed(null)
      }
    } catch {
      setFoundMed(null)
    }
  }

  const stats = [
    { label: 'Total Counters',   value: COUNTERS.length,                            icon: Grid3X3,    color: '#3b82f6', bg: '#eff6ff'  },
    { label: 'Total Racks',      value: 48,                                          icon: Layers,     color: '#7c3aed', bg: '#f5f3ff'  },
    { label: 'Total Medicines',  value: '12,450',                                    icon: Package,    color: '#0891b2', bg: '#e0f2fe'  },
    { label: 'Low Stock Items',  value: RACKS.filter(r=>r.status==='low').length,    icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Out of Stock',     value: RACKS.filter(r=>r.status==='out').length,    icon: BoxSelect,  color: '#ef4444', bg: '#fff1f2'  },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Page Header ── */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 22px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={22} color="#3b82f6" />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>3D Pharmacy Layout</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Visualize your pharmacy counters, racks and medicine locations in 3D</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            {[['#22c55e','Available'],['#f59e0b','Low Stock'],['#ef4444','Out of Stock']].map(([c,l])=>(
              <span key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#374151', fontWeight:600 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }} />{l}
              </span>
            ))}
          </div>
          <button onClick={() => { setAddType('counter'); setAddModal(true) }}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', background:'#1e40af', border:'none', borderRadius:8, color:'#fff', fontWeight:600, fontSize:13, cursor:'pointer' }}>
            <Plus size={14} /> Add Counter
          </button>
          <button onClick={() => { setAddType('rack'); setAddModal(true) }}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', background:'#0c3b73', border:'none', borderRadius:8, color:'#fff', fontWeight:600, fontSize:13, cursor:'pointer' }}>
            <Plus size={14} /> Add Rack
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 240px', gap: 14, alignItems: 'start' }}>

        {/* ── LEFT: Search Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Search */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Search Medicine</p>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={search} onChange={e => handleSearch(e.target.value)}
                placeholder="Search medicine..."
                style={{ width: '100%', padding: '9px 32px 9px 30px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
              {search && (
                <button onClick={() => { setSearch(''); setFoundMed(null) }}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Found medicine card */}
            {foundMed && (
              <div style={{ marginTop: 12, padding: '12px', background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 42, height: 42, background: '#e0e7ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={18} color="#3b82f6" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>{foundMed.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b7280' }}>{foundMed.type}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: foundMed.available === 0 ? '#ef4444' : foundMed.available < 50 ? '#f59e0b' : '#22c55e', fontWeight: 700 }}>
                      Available: {foundMed.available} Strip{foundMed.available !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: 10, padding: '8px 10px', background: '#fff', borderRadius: 7, border: '1px solid #e0e7ff' }}>
                  <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 5 }}>Location</p>
                  {[['Counter', foundMed.location.counter], ['Rack', foundMed.location.rack], ['Shelf', foundMed.location.shelf], ['Box', foundMed.location.box]].map(([k,v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ color: '#6b7280' }}>{k}</span>
                      <span style={{ fontWeight: 700, color: '#111827' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#1e40af', fontWeight: 600 }}>
                  <MapPin size={11} /> Highlighted on map — see red pin
                </div>
              </div>
            )}
          </div>

          {/* Counter List */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Counter List</p>
            </div>
            {COUNTERS.map(c => (
              <div key={c.id}
                onClick={() => setCounter(c.id)}
                style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: '1px solid #f9fafb', background: selectedCounter === c.id ? '#eff6ff' : '#fff', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (selectedCounter !== c.id) e.currentTarget.style.background = '#f9fafb' }}
                onMouseLeave={e => { if (selectedCounter !== c.id) e.currentTarget.style.background = '#fff' }}>
                <span style={{ fontSize: 13, fontWeight: selectedCounter === c.id ? 700 : 500, color: selectedCounter === c.id ? '#1e40af' : '#374151' }}>
                  Counter {c.id}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  {selectedCounter === c.id && <ChevronRight size={13} color="#3b82f6" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTER: 3D Isometric Floor Plan ── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>Floor Layout — Counter {selectedCounter}</p>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Counter A','Counter B','Counter C'].map(c => (
                <button key={c}
                  onClick={() => setCounter(c.slice(-1))}
                  style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer', borderColor: selectedCounter === c.slice(-1) ? '#3b82f6' : '#e5e7eb', background: selectedCounter === c.slice(-1) ? '#3b82f6' : '#fff', color: selectedCounter === c.slice(-1) ? '#fff' : '#374151' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Isometric SVG floor */}
          <div style={{ padding: '20px', background: 'linear-gradient(135deg,#f8faff 0%,#eef2ff 100%)', position: 'relative', minHeight: 440 }}>
            <svg width="100%" height="440" viewBox="0 0 680 420" style={{ display: 'block' }}>

              {/* ── FLOOR BASE ── */}
              <defs>
                <pattern id="floorGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                </pattern>
                <filter id="shadow">
                  <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Floor */}
              <rect x="20" y="10" width="640" height="400" rx="8" fill="#f1f5f9" />
              <rect x="20" y="10" width="640" height="400" rx="8" fill="url(#floorGrid)" />

              {/* ── WALLS ── */}
              {/* Top wall */}
              <rect x="20" y="10" width="640" height="18" rx="4" fill="#cbd5e1" opacity="0.6" />
              {/* Left wall */}
              <rect x="20" y="10" width="18" height="400" rx="4" fill="#cbd5e1" opacity="0.5" />

              {/* ── WAREHOUSE BOX (top right) ── */}
              <g filter="url(#shadow)">
                <rect x="530" y="30" width="110" height="80" rx="6" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5" />
                {/* Warehouse shelves */}
                {[0,1,2].map(s => <rect key={s} x="545" y={46 + s*18} width="80" height="6" rx="2" fill="#93c5fd" opacity="0.6" />)}
                {/* Boxes on shelves */}
                {[0,1,2].map(s => [0,1,2,3].map(b => (
                  <rect key={`${s}${b}`} x={548 + b*19} y={38 + s*18} width="15" height="8" rx="1"
                    fill={['#60a5fa','#34d399','#fbbf24','#f87171'][b % 4]} opacity="0.8" />
                )))}
                <text x="585" y="122" textAnchor="middle" fill="#1e40af" fontSize="11" fontWeight="700">Warehouse</text>
              </g>

              {/* ── FRIDGE (right side) ── */}
              <g filter="url(#shadow)">
                <rect x="565" y="180" width="75" height="90" rx="6" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1.5" />
                <rect x="575" y="190" width="55" height="35" rx="3" fill="#bae6fd" opacity="0.5" />
                <rect x="575" y="230" width="55" height="30" rx="3" fill="#bae6fd" opacity="0.5" />
                <line x1="602" y1="190" x2="602" y2="260" stroke="#7dd3fc" strokeWidth="1" />
                <circle cx="598" cy="207" r="3" fill="#0ea5e9" />
                <circle cx="598" cy="247" r="3" fill="#0ea5e9" />
                <text x="602" y="282" textAnchor="middle" fill="#0369a1" fontSize="10" fontWeight="700">Fridge</text>
              </g>

              {/* ── COLD STORAGE (bottom right) ── */}
              <g filter="url(#shadow)">
                <rect x="520" y="310" width="110" height="70" rx="6" fill="#cffafe" stroke="#67e8f9" strokeWidth="1.5" />
                <rect x="530" y="320" width="90" height="50" rx="4" fill="#a5f3fc" opacity="0.4" />
                {[0,1,2].map(i => <rect key={i} x={535+i*28} y="328" width="20" height="12" rx="2" fill="#06b6d4" opacity="0.5" />)}
                <text x="575" y="394" textAnchor="middle" fill="#0e7490" fontSize="10" fontWeight="700">Cold Storage</text>
              </g>

              {/* ── INJECTION RACK (bottom left) ── */}
              <g filter="url(#shadow)">
                <rect x="40" y="330" width="90" height="60" rx="6" fill="#fef3c7" stroke="#fde68a" strokeWidth="1.5" />
                {[0,1].map(s => <rect key={s} x="50" y={340 + s*22} width="70" height="8" rx="2" fill="#fbbf24" opacity="0.4" />)}
                {[0,1].map(s => [0,1,2,3].map(b => (
                  <rect key={`${s}${b}`} x={52+b*16} y={332+s*22} width="12" height="8" rx="1"
                    fill={['#f87171','#60a5fa','#34d399','#fbbf24'][b]} opacity="0.75" />
                )))}
                <text x="85" y="402" textAnchor="middle" fill="#92400e" fontSize="10" fontWeight="700">Injection Rack</text>
              </g>

              {/* ── COUNTER DESKS ── */}
              {/* Counter A - top */}
              <g filter="url(#shadow)">
                <rect x="90" y="25" width="100" height="35" rx="5" fill="#1e40af" />
                <rect x="92" y="27" width="96" height="31" rx="4" fill="#3b82f6" opacity="0.6" />
                <rect x="120" y="33" width="40" height="10" rx="2" fill="#93c5fd" opacity="0.5" />
                <text x="140" y="48" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">Counter A</text>
              </g>
              {/* Counter B - top center */}
              <g filter="url(#shadow)">
                <rect x="230" y="25" width="100" height="35" rx="5" fill="#1e40af" />
                <rect x="232" y="27" width="96" height="31" rx="4" fill="#3b82f6" opacity="0.6" />
                <text x="280" y="48" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">Counter B</text>
              </g>
              {/* Counter C - top right */}
              <g filter="url(#shadow)">
                <rect x="390" y="25" width="100" height="35" rx="5" fill="#1e40af" />
                <rect x="392" y="27" width="96" height="31" rx="4" fill="#3b82f6" opacity="0.6" />
                <text x="440" y="48" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">Counter C</text>
              </g>
              {/* Counter E - bottom center */}
              <g filter="url(#shadow)">
                <rect x="220" y="360" width="120" height="35" rx="5" fill="#1e40af" />
                <rect x="222" y="362" width="116" height="31" rx="4" fill="#3b82f6" opacity="0.6" />
                {/* Computer monitor */}
                <rect x="265" y="348" width="28" height="18" rx="2" fill="#1e293b" />
                <rect x="269" y="350" width="20" height="13" rx="1" fill="#38bdf8" opacity="0.7" />
                <text x="280" y="383" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">Counter E</text>
              </g>
              {/* Counter F - left */}
              <g filter="url(#shadow)">
                <rect x="38" y="140" width="35" height="100" rx="5" fill="#1e40af" />
                <rect x="40" y="142" width="31" height="96" rx="4" fill="#3b82f6" opacity="0.6" />
                <text x="55" y="197" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700"
                  transform="rotate(-90,55,197)">Counter F</text>
              </g>

              {/* ── RACKS - Row A ── */}
              {['A1','A2','A3','A4'].map((id, i) => {
                const rack = RACKS.find(r => r.id === id)
                const sc = STATUS_COLORS[rack.status]
                const isPinned = foundMed?.location?.rack === id
                const isSelected = selectedRack?.id === id
                const x = 90 + i * 110
                const y = 80

                return (
                  <g key={id} onClick={() => setSelectedRack(rack)} style={{ cursor: 'pointer' }}>
                    {isSelected && <rect x={x-4} y={y-4} width="90" height="95" rx="5" fill="none" stroke="#3b82f6" strokeWidth="2.5" opacity="0.8" />}
                    {/* Rack body */}
                    <rect x={x} y={y} width="82" height="85" rx="4" fill="#e2e8f0" filter="url(#shadow)" />
                    {/* Shelves */}
                    {[0,1,2,3].map(s => (
                      <g key={s}>
                        <rect x={x+2} y={y+4+s*20} width="78" height="4" rx="1" fill="#94a3b8" />
                        {[0,1,2,3,4].map(m => (
                          <rect key={m} x={x+4+m*14} y={y+8+s*20} width="11" height="12" rx="1"
                            fill={['#ef4444','#3b82f6','#22c55e','#f59e0b','#8b5cf6'][m % 5]}
                            opacity="0.8" />
                        ))}
                      </g>
                    ))}
                    {/* Label */}
                    <rect x={x+28} y={y+87} width="26" height="14" rx="3" fill={isSelected ? '#3b82f6' : '#1e40af'} />
                    <text x={x+41} y={y+97} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">{id}</text>
                    {/* Status */}
                    <circle cx={x+74} cy={y+8} r="5" fill={sc} />
                    {isPinned && (
                      <g transform={`translate(${x+30},${y-18})`}>
                        <circle cx="8" cy="8" r="8" fill="#ef4444" />
                        <text x="8" y="12" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800">!</text>
                      </g>
                    )}
                  </g>
                )
              })}

              {/* ── RACKS - Row B ── */}
              {['B1','B2','B3','B4','B5','B6'].map((id, i) => {
                const rack = RACKS.find(r => r.id === id)
                const sc = STATUS_COLORS[rack.status]
                const isPinned = foundMed?.location?.rack === id
                const isSelected = selectedRack?.id === id
                const x = 75 + i * 82
                const y = 200

                return (
                  <g key={id} onClick={() => setSelectedRack(rack)} style={{ cursor: 'pointer' }}>
                    {isSelected && <rect x={x-4} y={y-4} width="72" height="97" rx="5" fill="none" stroke="#3b82f6" strokeWidth="2.5" opacity="0.8" />}
                    <rect x={x} y={y} width="64" height="87" rx="4" fill="#e2e8f0" filter="url(#shadow)" />
                    {[0,1,2,3].map(s => (
                      <g key={s}>
                        <rect x={x+2} y={y+4+s*20} width="60" height="3" rx="1" fill="#94a3b8" />
                        {[0,1,2,3].map(m => (
                          <rect key={m} x={x+3+m*14} y={y+7+s*20} width="11" height="11" rx="1"
                            fill={['#ef4444','#3b82f6','#22c55e','#f59e0b'][m % 4]} opacity="0.8" />
                        ))}
                      </g>
                    ))}
                    <rect x={x+18} y={y+89} width="28" height="13" rx="3" fill={isSelected ? '#3b82f6' : (rack.status==='out'?'#ef4444':rack.status==='low'?'#f59e0b':'#1e40af')} />
                    <text x={x+32} y={y+98} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">{id}</text>
                    <circle cx={x+56} cy={y+8} r="5" fill={sc} />
                    {isPinned && (
                      <g transform={`translate(${x+22},${y-18})`}>
                        <circle cx="8" cy="8" r="9" fill="#ef4444" />
                        <text x="8" y="12" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800">!</text>
                      </g>
                    )}
                  </g>
                )
              })}

              {/* ── RACKS - Row C ── */}
              {['C1','C2','C3','C4'].map((id, i) => {
                const rack = RACKS.find(r => r.id === id)
                const sc = STATUS_COLORS[rack.status]
                const isPinned = foundMed?.location?.rack === id
                const isSelected = selectedRack?.id === id
                const x = 90 + i * 110
                const y = 310

                return (
                  <g key={id} onClick={() => setSelectedRack(rack)} style={{ cursor: 'pointer' }}>
                    {isSelected && <rect x={x-4} y={y-4} width="90" height="95" rx="5" fill="none" stroke="#3b82f6" strokeWidth="2.5" opacity="0.8" />}
                    <rect x={x} y={y} width="82" height="85" rx="4" fill="#e2e8f0" filter="url(#shadow)" />
                    {[0,1,2,3].map(s => (
                      <g key={s}>
                        <rect x={x+2} y={y+4+s*20} width="78" height="3" rx="1" fill="#94a3b8" />
                        {[0,1,2,3,4].map(m => (
                          <rect key={m} x={x+3+m*14} y={y+7+s*20} width="12" height="11" rx="1"
                            fill={['#f87171','#60a5fa','#34d399','#fbbf24','#a78bfa'][m % 5]} opacity="0.8" />
                        ))}
                      </g>
                    ))}
                    <rect x={x+28} y={y+87} width="26" height="14" rx="3" fill={isSelected ? '#3b82f6' : '#1e40af'} />
                    <text x={x+41} y={y+97} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">{id}</text>
                    <circle cx={x+74} cy={y+8} r="5" fill={sc} />
                    {isPinned && (
                      <g transform={`translate(${x+30},${y-18})`}>
                        <circle cx="8" cy="8" r="9" fill="#ef4444" />
                        <text x="8" y="12" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800">!</text>
                      </g>
                    )}
                  </g>
                )
              })}

              {/* ── Walking paths ── */}
              <rect x="76" y="175" width="464" height="18" rx="2" fill="#f8fafc" opacity="0.8" stroke="#e2e8f0" strokeWidth="0.5" />
              <rect x="76" y="295" width="464" height="12" rx="2" fill="#f8fafc" opacity="0.8" stroke="#e2e8f0" strokeWidth="0.5" />

              {/* ── Entrance ── */}
              <rect x="300" y="390" width="80" height="12" rx="3" fill="#fde68a" stroke="#f59e0b" strokeWidth="1" />
              <text x="340" y="400" textAnchor="middle" fill="#92400e" fontSize="9" fontWeight="700">ENTRANCE</text>

            </svg>
          </div>
        </div>

        {/* ── RIGHT: Rack Details Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Rack Details */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg,#1e40af,#3b82f6)', color: '#fff' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Rack Details</p>
            </div>
            {selectedRack ? (
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={20} color="#3b82f6" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e40af' }}>Rack {selectedRack.id}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: STATUS_COLORS[selectedRack.status] + '20', color: STATUS_COLORS[selectedRack.status] }}>
                      {selectedRack.status === 'available' ? 'Available' : selectedRack.status === 'low' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
                {[
                  ['Counter',  'Counter ' + selectedRack.counter],
                  ['Shelf',    selectedRack.shelf],
                  ['Box',      selectedRack.box],
                  ['Capacity', `${selectedRack.capacity} Items`],
                  ['Current Stock', `${selectedRack.items} Items`],
                  ['Remaining Space', `${selectedRack.capacity - selectedRack.items} Items`],
                ].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>
                    <span style={{ color: '#6b7280' }}>{k}</span>
                    <span style={{ fontWeight: 700, color: '#111827' }}>{v}</span>
                  </div>
                ))}

                {/* Capacity bar */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>Capacity Used</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>
                      {Math.round((selectedRack.items / selectedRack.capacity) * 100)}%
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 10, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(selectedRack.items / selectedRack.capacity) * 100}%`, background: STATUS_COLORS[selectedRack.status], borderRadius: 10, transition: 'width 0.4s' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                Click a rack to view details
              </div>
            )}
          </div>

          {/* Rack 3D Mini View */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#374151' }}>Rack 3D View</p>
            </div>
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', background: '#f8faff' }}>
              {/* Mini 3D rack CSS */}
              <div style={{ perspective: '400px', perspectiveOrigin: '50% 30%' }}>
                <div style={{ width: 110, height: 140, position: 'relative', transform: 'rotateX(20deg) rotateY(-20deg)', transformStyle: 'preserve-3d' }}>
                  {/* Rack label */}
                  <div style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', background: '#1e40af', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 6, zIndex: 10 }}>
                    {selectedRack?.id || 'B6'}
                  </div>
                  {/* Frame */}
                  <div style={{ position: 'absolute', inset: 0, border: '3px solid #64748b', borderRadius: 6, background: '#e2e8f0' }} />
                  {/* Shelves */}
                  {[0,1,2,3,4].map(s => (
                    <div key={s} style={{ position: 'absolute', left: 3, right: 3, top: 8 + s * 26, height: 4, background: '#94a3b8', borderRadius: 2 }} />
                  ))}
                  {/* Medicine boxes on each shelf */}
                  {[0,1,2,3,4].map(s => (
                    <div key={s} style={{ position: 'absolute', left: 4, right: 4, top: 12 + s * 26, height: 20, display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                      {['#ef4444','#3b82f6','#22c55e','#f59e0b','#8b5cf6','#06b6d4'].slice(0, 5 + (s % 2)).map((c,i) => (
                        <div key={i} style={{ flex: 1, height: 14 + (i%3)*3, background: c, borderRadius: '2px 2px 0 0', opacity: 0.85 }} />
                      ))}
                    </div>
                  ))}
                  {/* Side face */}
                  <div style={{ position: 'absolute', top: 0, right: -12, bottom: 0, width: 12, background: '#cbd5e1', borderRadius: '0 4px 4px 0', transform: 'rotateY(90deg)', transformOrigin: 'left center' }} />
                  {/* Top face */}
                  <div style={{ position: 'absolute', left: 0, right: 0, top: -8, height: 8, background: '#94a3b8', borderRadius: '4px 4px 0 0', transform: 'rotateX(-90deg)', transformOrigin: 'bottom center' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: s.color, margin: '2px 0 0' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Counter/Rack Modal ── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{addType === 'counter' ? 'Add New Counter' : 'Add New Rack'}</h3>
              <button onClick={() => setAddModal(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={15} color="#6b7280" />
              </button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(addType === 'counter'
                ? [['Counter Name','Counter G'],['Counter Type','Main / Secondary'],['Floor','Ground Floor'],['Capacity','20 Racks']]
                : [['Rack Code','D01'],['Counter','Counter A'],['Shelf','Top / Middle / Bottom'],['Box','Box 01'],['Capacity (Items)','40']]
              ).map(([label, ph]) => (
                <div key={label}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>{label}</label>
                  <input placeholder={ph} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setAddModal(false)} style={{ padding: '9px 20px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff' }}>Cancel</button>
              <button onClick={() => setAddModal(false)} style={{ padding: '9px 22px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: '#0c3b73', color: '#fff' }}>
                Save {addType === 'counter' ? 'Counter' : 'Rack'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
