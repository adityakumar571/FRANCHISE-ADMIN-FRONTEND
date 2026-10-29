import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Search, RefreshCw, MapPin, X, Layers, Package, Play, Pause, RotateCcw } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import BatchSelectorModal from '../../../components/BatchSelectorModal'

/* ───────── CONSTANTS ───────── */
const CELL = 46 // cube size
const PITCH = 58 // distance between cubes (x / z)
const LEVEL = 68 // vertical distance between shelves

const COLORS = {
  ok: { main: '#10b981', dark: '#047857', label: 'In Stock' },
  low: { main: '#f59e0b', dark: '#b45309', label: 'Low Stock' },
  out: { main: '#ef4444', dark: '#b91c1c', label: 'Out of Stock' },
  found: { main: '#38bdf8', dark: '#0369a1', label: 'Found' },
}

// object / id / null — kuch bhi aaye, render ke liye safe string
const txt = (v, fb = '—') => {
  if (v === null || v === undefined || v === '') return fb
  if (typeof v === 'object') {
    const n = v.name ?? v.label ?? v.title
    if (!n || /^[a-f0-9]{24}$/i.test(String(n))) return fb
    return String(n)
  }
  return String(v)
}

// API ka `status` field pehle, nahi mila to stock vs reorderLevel se nikalo
const stockState = (m) => {
  const st = String(m.status || '').toLowerCase()
  if (st.includes('out')) return 'out'
  if (st.includes('low')) return 'low'
  if (st.includes('in stock')) return 'ok'
  const s = Number(m.currentStock ?? m.stock ?? 0)
  if (s <= 0) return 'out'
  if (s <= Number(m.reorderLevel ?? 0)) return 'low'
  return 'ok'
}

const rowIndex = (letter) => (String(letter || 'A').toUpperCase().charCodeAt(0) - 65) || 0
const slotKey = (shelf, row, col) => `${shelf}-${String(row).toUpperCase()}-${col}`
const idOf = (v) => String(v?._id || v || '')

const PRESETS = {
  front: { x: -6, y: 0 },
  angle: { x: -20, y: -32 },
  side: { x: -8, y: -80 },
  top: { x: -78, y: 0 },
}

/* ───────── DEBOUNCE ───────── */
const useDebounce = (value, delay) => {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

/* ───────── 3D CUBE (one medicine slot) ───────── */
const Cube = ({ x, y, z, state, label, active, found, onClick }) => {
  const c = found ? COLORS.found : COLORS[state]
  const half = CELL / 2
  const face = (transform, extra = {}) => ({
    position: 'absolute',
    width: CELL,
    height: CELL,
    transform,
    background: `linear-gradient(135deg, ${c.main}, ${c.dark})`,
    border: `1px solid rgba(255,255,255,${active || found ? 0.9 : 0.25})`,
    backfaceVisibility: 'hidden',
    boxShadow: active ? `0 0 14px 2px ${c.main}` : undefined,
    ...extra,
  })
  return (
    <div
      onClick={onClick}
      className={found ? 'ph3d-pulse' : 'ph3d-cube'}
      style={{
        position: 'absolute',
        left: -half,
        top: -half,
        width: CELL,
        height: CELL,
        transformStyle: 'preserve-3d',
        transform: `translate3d(${x}px, ${y}px, ${z}px)`,
        cursor: 'pointer',
        pointerEvents: 'auto',
        '--glow': c.main,
      }}
    >
      <div style={face(`translateZ(${half}px)`, { display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <span className="text-white font-extrabold" style={{ fontSize: 9, textShadow: '0 1px 2px #000', padding: 2, textAlign: 'center', lineHeight: 1.05 }}>
          {label}
        </span>
      </div>
      <div style={face(`rotateY(180deg) translateZ(${half}px)`)} />
      <div style={face(`rotateY(90deg) translateZ(${half}px)`, { filter: 'brightness(0.75)' })} />
      <div style={face(`rotateY(-90deg) translateZ(${half}px)`, { filter: 'brightness(0.65)' })} />
      <div style={face(`rotateX(90deg) translateZ(${half}px)`, { filter: 'brightness(1.25)' })} />
      <div style={face(`rotateX(-90deg) translateZ(${half}px)`, { filter: 'brightness(0.5)' })} />
    </div>
  )
}

/* ───────── EMPTY SLOT (ghost outline) ───────── */
const Ghost = ({ x, y, z }) => (
  <div
    style={{
      position: 'absolute',
      left: -CELL / 2,
      top: -CELL / 2,
      width: CELL,
      height: CELL,
      transform: `translate3d(${x}px, ${y}px, ${z + CELL / 2}px)`,
      border: '1px dashed rgba(148,163,184,0.35)',
      background: 'rgba(148,163,184,0.05)',
      borderRadius: 4,
      pointerEvents: 'none',
    }}
  />
)

/* ───────── 3D RACK SCENE ───────── */
const Rack3D = ({ shelves, rows, cols, slotMap, foundKey, selectedKey, onSelect, rot, zoom }) => {
  const W = cols * PITCH
  const D = rows * PITCH
  const H = shelves * LEVEL
  const rowLetters = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i))

  const px = (col) => (col - 0.5 - cols / 2) * PITCH
  const pz = (r) => ((rows / 2) - (r + 0.5)) * PITCH // row A = front
  const py = (shelf) => (shelf - 0.5 - shelves / 2) * LEVEL // shelf 1 = top

  // decorative panels kabhi click nahi rokenge
  const panel = (style) => ({ position: 'absolute', pointerEvents: 'none', ...style })

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 0,
        height: 0,
        transformStyle: 'preserve-3d',
        transform: `scale(${zoom}) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
      }}
    >
      {/* floor grid */}
      <div
        style={panel({
          width: W + 260,
          height: D + 260,
          left: -(W + 260) / 2,
          top: -(D + 260) / 2,
          transform: `translateY(${H / 2 + 14}px) rotateX(90deg)`,
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.25) 1px, transparent 1px)',
          backgroundSize: '29px 29px',
          border: '1px solid rgba(99,102,241,0.4)',
          borderRadius: 12,
          boxShadow: '0 0 60px rgba(99,102,241,0.2) inset',
        })}
      />

      {/* back + side glass panels */}
      <div style={panel({ width: W + 20, height: H + 20, left: -(W + 20) / 2, top: -(H + 20) / 2, transform: `translateZ(${-D / 2 - 10}px)`, background: 'rgba(30,41,59,0.55)', border: '1px solid rgba(148,163,184,0.3)' })} />
      <div style={panel({ width: D + 20, height: H + 20, left: -(D + 20) / 2, top: -(H + 20) / 2, transform: `translateX(${-W / 2 - 10}px) rotateY(90deg)`, background: 'rgba(30,41,59,0.35)', border: '1px solid rgba(148,163,184,0.25)' })} />
      <div style={panel({ width: D + 20, height: H + 20, left: -(D + 20) / 2, top: -(H + 20) / 2, transform: `translateX(${W / 2 + 10}px) rotateY(90deg)`, background: 'rgba(30,41,59,0.35)', border: '1px solid rgba(148,163,184,0.25)' })} />

      {/* corner posts */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <div key={i} style={panel({ width: 8, height: H + 24, left: -4, top: -(H + 24) / 2, transform: `translate3d(${sx * (W / 2 + 10)}px, 0, ${sz * (D / 2 + 10)}px)`, background: 'linear-gradient(90deg,#64748b,#334155)', borderRadius: 3 })} />
      ))}

      {/* shelf boards + labels */}
      {Array.from({ length: shelves }).map((_, i) => {
        const s = i + 1
        const yBottom = py(s) + CELL / 2 + 3
        return (
          <div key={s} style={{ position: 'absolute', transformStyle: 'preserve-3d', pointerEvents: 'none' }}>
            <div
              style={panel({
                width: W + 20,
                height: D + 20,
                left: -(W + 20) / 2,
                top: -(D + 20) / 2,
                transform: `translateY(${yBottom}px) rotateX(90deg)`,
                background: 'linear-gradient(135deg, rgba(100,116,139,0.85), rgba(51,65,85,0.85))',
                border: '1px solid rgba(203,213,225,0.5)',
                borderRadius: 4,
              })}
            />
            <div
              className="text-slate-300 font-bold"
              style={panel({ left: -(W / 2) - 62, top: py(s) - 10, width: 44, textAlign: 'right', fontSize: 11, transform: 'translateZ(' + (D / 2) + 'px)' })}
            >
              S{s}
            </div>
          </div>
        )
      })}

      {/* column labels (front floor) */}
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="text-sky-300 font-bold" style={panel({ left: px(i + 1) - 14, top: -8, width: 28, textAlign: 'center', fontSize: 12, transform: `translate3d(0, ${H / 2 + 14}px, ${D / 2 + 40}px) rotateX(90deg)` })}>
          C{i + 1}
        </div>
      ))}
      {/* row labels (right floor) */}
      {rowLetters.map((l, r) => (
        <div key={l} className="text-pink-300 font-bold" style={panel({ left: -14, top: -8, width: 28, textAlign: 'center', fontSize: 12, transform: `translate3d(${W / 2 + 40}px, ${H / 2 + 14}px, ${pz(r)}px) rotateX(90deg)` })}>
          R{l}
        </div>
      ))}

      {/* slots */}
      {Array.from({ length: shelves }).map((_, si) =>
        rowLetters.map((l, r) =>
          Array.from({ length: cols }).map((__, ci) => {
            const s = si + 1
            const c = ci + 1
            const key = slotKey(s, l, c)
            const meds = slotMap[key]
            const x = px(c)
            const y = py(s)
            const z = pz(r)
            if (!meds) return <Ghost key={key} x={x} y={y} z={z} />
            const m = meds[0]
            const nm = txt(m.name, '?')
            return (
              <Cube
                key={key}
                x={x}
                y={y}
                z={z}
                state={stockState(m)}
                label={meds.length > 1 ? `${nm.slice(0, 5)}+${meds.length - 1}` : nm.slice(0, 7)}
                found={foundKey === key}
                active={selectedKey === key}
                onClick={() => onSelect(key)}
              />
            )
          })
        )
      )}
    </div>
  )
}

/* ───────── MAIN ───────── */
export default function PharmacyLayout3D() {
  const [medicines, setMedicines] = useState([])
  const [counters, setCounters] = useState([])
  const [racks, setRacks] = useState([])
  const [counterId, setCounterId] = useState(null)
  const [rackId, setRackId] = useState(null)
  const [search, setSearch] = useState('')
  const [foundMed, setFoundMed] = useState(null)
  const [selectedKey, setSelectedKey] = useState(null)
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [selectedMedicineForSale, setSelectedMedicineForSale] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const [rot, setRot] = useState(PRESETS.angle)
  const [zoom, setZoom] = useState(1)
  const [auto, setAuto] = useState(false)
  const drag = useRef({ on: false, moved: false, sx: 0, sy: 0, ox: 0, oy: 0 })

  const debouncedSearch = useDebounce(search, 800)
  const dataRef = useRef({ racks: [], counters: [] })
  dataRef.current = { racks, counters }

  /* ── FETCH ── */
  const fetchAllData = useCallback(async () => {
    try {
      const [mRes, cRes, rRes] = await Promise.allSettled([
        getRequest('/franchise/medicines?limit=1000&layout=true'),
        getRequest('/franchise/master/counters'),
        getRequest('/franchise/master/racks'),
      ])
      if (mRes.status === 'fulfilled') {
        const d = mRes.value?.data?.data
        let meds = d?.medicines || []
        // agar total zyada hai to saari medicines laao (koi limit hardcode nahi)
        if (d?.total > meds.length) {
          try {
            const full = await getRequest(`/franchise/medicines?limit=${d.total}&layout=true`)
            meds = full?.data?.data?.medicines || meds
          } catch { /* pehle wali list rakho */ }
        }
        setMedicines(meds)
      }
      if (cRes.status === 'fulfilled') {
        const cs = cRes.value?.data?.data || []
        setCounters(cs)
        setCounterId((p) => p || cs[0]?._id || null)
      }
      if (rRes.status === 'fulfilled') {
        const rs = rRes.value?.data?.data || []
        setRacks(rs)
      }
      setLastRefresh(new Date())
    } catch (e) {
      console.error(e)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllData()
    const t = setInterval(fetchAllData, 60000) // har 60s me auto refresh
    return () => clearInterval(t)
  }, [fetchAllData])

  /* ── DERIVED ── */
  const counterRacks = useMemo(
    () => racks.filter((r) => !counterId || idOf(r.counterId) === counterId),
    [racks, counterId]
  )

  // default rack = first rack of selected counter
  useEffect(() => {
    if (!counterRacks.length) return
    if (!counterRacks.find((r) => r._id === rackId)) setRackId(counterRacks[0]._id)
  }, [counterRacks, rackId])

  const rack = useMemo(() => racks.find((r) => r._id === rackId) || null, [racks, rackId])

  const rackMeds = useMemo(
    () => (rack ? medicines.filter((m) => m.rackLocation?.rackId === rack.code) : []),
    [medicines, rack]
  )

  const dims = useMemo(() => {
    let maxShelf = 0, maxRow = 0, maxCol = 0
    rackMeds.forEach((m) => {
      maxShelf = Math.max(maxShelf, Number(m.rackLocation?.shelf) || 0)
      maxRow = Math.max(maxRow, rowIndex(m.rackLocation?.row) + 1)
      maxCol = Math.max(maxCol, Number(m.rackLocation?.column) || 0)
    })
    // sab kuch rack ke API data se: shelves, capacity, aur medicines ki asli location
    const shelves = Math.max(typeof rack?.shelves === 'number' ? rack.shelves : 0, maxShelf, 1)
    const perShelf = rack?.capacity ? Math.ceil(rack.capacity / shelves) : 1
    const baseCols = Math.max(1, Math.ceil(Math.sqrt(perShelf)))
    const baseRows = Math.max(1, Math.ceil(perShelf / baseCols))
    return {
      shelves,
      rows: Math.max(rack?.rowsPerShelf || baseRows, maxRow),
      cols: Math.max(rack?.columnsPerRow || baseCols, maxCol),
    }
  }, [rack, rackMeds])

  const slotMap = useMemo(() => {
    const map = {}
    rackMeds.forEach((m) => {
      const l = m.rackLocation
      if (!l) return
      const k = slotKey(l.shelf, l.row, l.column)
      ;(map[k] = map[k] || []).push(m)
    })
    return map
  }, [rackMeds])

  const totalSlots = dims.shelves * dims.rows * dims.cols
  const capacity = rack?.capacity || totalSlots
  const percent = capacity ? Math.min(100, Math.round((rackMeds.length / capacity) * 100)) : 0

  const counterOfRack = useMemo(
    () => counters.find((c) => c._id === idOf(rack?.counterId)) || (typeof rack?.counterId === 'object' ? rack.counterId : null),
    [counters, rack]
  )

  // jin medicines ki rack nahi hai ya rack list me nahi mili
  const unassignedMeds = useMemo(
    () => medicines.filter((m) => !m.rackLocation?.rackId || !racks.some((r) => r.code === m.rackLocation.rackId)),
    [medicines, racks]
  )

  const stats = useMemo(() => {
    const unassigned = unassignedMeds.length
    return {
      total: medicines.length,
      assigned: medicines.length - unassigned,
      unassigned,
      low: medicines.filter((m) => stockState(m) === 'low').length,
      out: medicines.filter((m) => stockState(m) === 'out').length,
    }
  }, [medicines, unassignedMeds])

  const foundKey = foundMed?.rackLocation && foundMed.rackLocation.rackId === rack?.code
    ? slotKey(foundMed.rackLocation.shelf, foundMed.rackLocation.row, foundMed.rackLocation.column)
    : null

  const selectedMeds = selectedKey ? slotMap[selectedKey] || [] : []

  /* ── SEARCH (debounced) ── */
  useEffect(() => {
    const q = debouncedSearch.trim()
    if (!q) { setFoundMed(null); return }
    let cancelled = false
    ;(async () => {
      setSearchLoading(true)
      try {
        const res = await getRequest(`/franchise/medicines?search=${encodeURIComponent(q)}&limit=1`)
        if (cancelled) return
        const med = res?.data?.data?.medicines?.[0]
        if (!med) { setFoundMed(null); toast.error('Medicine not found'); return }
        setFoundMed(med)
        const loc = med.rackLocation
        if (loc?.rackId) {
          const r = dataRef.current.racks.find((x) => x.code === loc.rackId)
          if (r) {
            setCounterId(idOf(r.counterId) || idOf(med.counterId))
            setRackId(r._id)
            setSelectedKey(slotKey(loc.shelf, loc.row, loc.column))
            setRot(PRESETS.angle)
          }
        }
        toast.success('Found: ' + txt(med.name, ''))
      } catch {
        if (!cancelled) { setFoundMed(null); toast.error('Search failed') }
      } finally {
        if (!cancelled) setSearchLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [debouncedSearch])

  /* ── AUTO ROTATE ── */
  useEffect(() => {
    if (!auto) return
    const t = setInterval(() => {
      if (!drag.current.on) setRot((r) => ({ ...r, y: r.y + 0.4 }))
    }, 30)
    return () => clearInterval(t)
  }, [auto])

  /* ── DRAG ── */
  const onDown = (e) => {
    drag.current = { on: true, moved: false, sx: e.clientX, sy: e.clientY, ox: rot.x, oy: rot.y }
  }
  const onMove = (e) => {
    const d = drag.current
    if (!d.on) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true
    if (d.moved) setRot({ x: Math.max(-90, Math.min(10, d.ox - dy * 0.4)), y: d.oy + dx * 0.5 })
  }
  const onUp = () => { drag.current.on = false }
  // click tab hi select jab drag nahi hua
  const handleSelect = (k) => { if (!drag.current.moved) setSelectedKey(k) }

  const clearSearch = () => { setSearch(''); setFoundMed(null) }

  /* ── Handle medicine click for batch selection ── */
  const handleMedicineClick = (medicine) => {
    console.log('🔍 Medicine clicked:', medicine)
    console.log('📦 Batches:', medicine.batches)
    
    // Check if medicine has active batches
    const activeBatches = (medicine.batches || [])
      .filter(b => b.isActive && (b.availableQty || b.quantity) > 0)
    
    console.log('✅ Active batches:', activeBatches)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <RefreshCw size={32} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-slate-950 min-h-screen p-3 md:p-4 lg:p-6 text-white font-sans">
      <style>{`
        .ph3d-cube { transition: transform .25s; }
        .ph3d-cube:hover > div { filter: brightness(1.3); }
        @keyframes ph3dGlow { 0%,100% { box-shadow: 0 0 4px 0 var(--glow); } 50% { box-shadow: 0 0 22px 6px var(--glow); } }
        .ph3d-pulse > div { animation: ph3dGlow 1.2s ease-in-out infinite; }
      `}</style>

      {/* HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-4 mb-4 border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div>
            <h1 className="m-0 text-xl font-extrabold">📦 Pharmacy 3D Layout</h1>
            <p className="m-0 mt-1 text-xs md:text-sm text-slate-400">
              {stats.total} medicines • {counters.length} counters • {racks.length} racks
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <button onClick={fetchAllData} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs md:text-sm font-semibold">
              <RefreshCw size={14} /> Refresh
            </button>
            <span className="text-xs text-slate-400 px-3 py-2 bg-slate-800 rounded-lg">{lastRefresh.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mb-4">
        {[
          ['📋 Total', stats.total, '#3b82f6'],
          ['✅ Assigned', stats.assigned, '#10b981'],
          ['❌ Unassigned', stats.unassigned, '#f59e0b'],
          ['⚠️ Low Stock', stats.low, '#f59e0b'],
          ['🔴 Out of Stock', stats.out, '#ef4444'],
        ].map(([l, v, c]) => (
          <div key={l} className="bg-slate-900 rounded-lg p-3 border border-slate-800">
            <p className="m-0 text-xs text-slate-400">{l}</p>
            <p className="m-0 mt-1 text-2xl font-extrabold" style={{ color: c }}>{v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4">
        {/* LEFT: search + counters */}
        <div className="lg:col-span-1 flex flex-col gap-3 md:gap-4 order-2 lg:order-1">
          <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
            <p className="m-0 mb-2 text-xs font-bold text-slate-400 uppercase">🔍 Search medicine</p>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type medicine name..."
                className="w-full pl-9 pr-9 py-2 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg text-white text-sm placeholder-slate-500 outline-none"
              />
              {searchLoading ? (
                <RefreshCw size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />
              ) : search ? (
                <X size={14} onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer" />
              ) : null}
            </div>
            {foundMed && (
              <div className="mt-3 p-3 bg-slate-800 rounded-lg border border-sky-500/50">
                <p className="m-0 font-bold text-sky-400 text-xs">✅ Found</p>
                <p className="m-0 mt-1 font-bold text-sm truncate">{txt(foundMed.name)}</p>
                <p className="m-0 mt-1 text-xs text-slate-400">Stock: {txt(foundMed.currentStock, 0)} • {txt(foundMed.category)}</p>
                {foundMed.rackLocation?.position ? (
                  <p className="m-0 mt-2 text-xs font-semibold text-blue-400 flex items-center gap-1"><MapPin size={12} /> {foundMed.rackLocation.position}</p>
                ) : (
                  <p className="m-0 mt-2 text-xs font-semibold text-amber-400">⚠️ Rack assign nahi hai</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <div className="px-3 py-2 bg-slate-800 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase">🏪 Counters</div>
            <div className="max-h-72 overflow-y-auto">
              {counters.map((c) => {
                const n = racks.filter((r) => idOf(r.counterId) === c._id).length
                const on = counterId === c._id
                return (
                  <div
                    key={c._id}
                    onClick={() => setCounterId(c._id)}
                    className={`px-3 py-3 cursor-pointer border-l-4 transition-all text-sm ${on ? 'bg-slate-800 border-blue-500' : 'bg-slate-900 border-transparent hover:bg-slate-800'}`}
                  >
                    <p className="m-0 font-bold">{c.code}</p>
                    <p className="m-0 mt-0.5 text-xs text-slate-400">{c.name} • {c.location} • {n} racks</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* legend */}
          <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
            <p className="m-0 mb-2 text-xs font-bold text-slate-400 uppercase">Legend</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['ok', 'low', 'out', 'found'].map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: COLORS[k].main }} />
                  <span className="text-slate-300">{COLORS[k].label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 col-span-2">
                <span className="w-3 h-3 rounded-sm border border-dashed border-slate-400" />
                <span className="text-slate-300">Empty slot</span>
              </div>
            </div>
            <p className="m-0 mt-3 text-xs text-slate-500">S = Shelf (upar→neeche) • R = Row (aage→peeche) • C = Column (left→right)</p>
          </div>
        </div>

        {/* CENTER: 3D */}
        <div className="lg:col-span-2 order-1 lg:order-2 flex flex-col gap-3">
          {/* rack chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {counterRacks.length === 0 && <span className="text-sm text-slate-400 py-2">Is counter me koi rack nahi hai</span>}
            {counterRacks.map((r) => {
              const count = medicines.filter((m) => m.rackLocation?.rackId === r.code).length
              const on = r._id === rackId
              const pinned = foundMed?.rackLocation?.rackId === r.code
              return (
                <button
                  key={r._id}
                  onClick={() => { setRackId(r._id); setSelectedKey(null) }}
                  className={`shrink-0 px-3 py-2 rounded-lg border text-left transition-all ${on ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'}`}
                >
                  <p className="m-0 text-sm font-extrabold">{pinned && '📍 '}{r.code}</p>
                  <p className="m-0 text-xs text-slate-300">{count} items</p>
                </button>
              )
            })}
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            {/* toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-2 md:p-3 border-b border-slate-800 bg-slate-900/80">
              <Layers size={16} className="text-indigo-400" />
              <span className="text-sm font-bold mr-auto">{rack ? `${rack.code}${rack.name ? ' • ' + rack.name : ''}` : 'Select rack'}</span>
              {Object.keys(PRESETS).map((p) => (
                <button key={p} onClick={() => setRot(PRESETS[p])} className="px-2.5 py-1 text-xs capitalize bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md">{p}</button>
              ))}
              <button onClick={() => setAuto((a) => !a)} className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md" title="Auto rotate">
                {auto ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button onClick={() => { setRot(PRESETS.angle); setZoom(1) }} className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md" title="Reset">
                <RotateCcw size={14} />
              </button>
              <input type="range" min="0.5" max="1.6" step="0.05" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-24 accent-indigo-500" />
            </div>

            {/* stage */}
            <div
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={onUp}
              className="relative select-none touch-none cursor-grab active:cursor-grabbing"
              style={{
                height: 560,
                perspective: 1500,
                overflow: 'hidden',
                background: 'radial-gradient(ellipse at 50% 30%, #1e1b4b 0%, #0f172a 55%, #020617 100%)',
              }}
            >
              {rack ? (
                <Rack3D
                  shelves={dims.shelves}
                  rows={dims.rows}
                  cols={dims.cols}
                  slotMap={slotMap}
                  foundKey={foundKey}
                  selectedKey={selectedKey}
                  onSelect={handleSelect}
                  rot={rot}
                  zoom={zoom}
                />
              ) : (
                <p className="text-center text-slate-400 pt-48">Rack select karo</p>
              )}
              <div className="absolute bottom-2 left-3 text-xs text-slate-500 pointer-events-none">🖱 Drag = rotate • Slider = zoom • Cube pe click = details</div>
              <div className="absolute top-2 right-3 text-xs text-slate-300 bg-slate-900/70 px-2 py-1 rounded-md pointer-events-none">
                {dims.shelves} shelves × {dims.rows} rows × {dims.cols} cols
              </div>
            </div>

            {/* capacity bar */}
            <div className="p-3 border-t border-slate-800">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Items / rack capacity</span>
                <span className="font-bold">{rackMeds.length}/{capacity} ({percent}%)</span>
              </div>
              <div className="h-2 bg-slate-800 rounded overflow-hidden">
                <div className="h-full transition-all duration-500" style={{ width: `${percent}%`, background: percent > 80 ? '#ef4444' : percent > 50 ? '#f59e0b' : '#10b981' }} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: details */}
        <div className="lg:col-span-1 order-3 bg-slate-900 rounded-lg p-3 border border-slate-800 max-h-[760px] overflow-y-auto">
          {rack && (
            <div className="bg-slate-800 rounded-lg p-3 mb-3 text-xs">
              {[
                ['Rack', `${rack.code}${rack.name ? ' • ' + rack.name : ''}`],
                ['Counter', counterOfRack ? `${counterOfRack.name} (${counterOfRack.code})` : null],
                ['Floor', counterOfRack?.location],
                ['Area', rack.area],
                ['Shelf', typeof rack.shelf === 'string' ? rack.shelf : null],
                ['Detail', rack.description],
                ['Shelves', typeof rack.shelves === 'number' ? rack.shelves : null],
                ['Capacity', rack.capacity],
                ['Status', rack.status || (rack.isActive ? 'Active' : 'Inactive')],
              ]
                .filter(([, v]) => v !== null && v !== undefined && v !== '')
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 py-1 border-b border-slate-700 last:border-b-0">
                    <span className="text-slate-400">{k}</span>
                    <span className="font-bold text-right">{txt(v)}</span>
                  </div>
                ))}
            </div>
          )}

          {selectedKey ? (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="m-0 text-sm font-extrabold text-sky-400 flex items-center gap-1">
                  <MapPin size={14} /> {rack?.code}-{selectedKey}
                </p>
                <X size={14} className="cursor-pointer text-slate-400" onClick={() => setSelectedKey(null)} />
              </div>
              {selectedMeds.length === 0 && (
                <p className="m-0 text-xs text-slate-500 text-center py-3 border border-dashed border-slate-700 rounded-lg">Is slot me koi medicine nahi</p>
              )}
              {selectedMeds.map((m) => {
                const st = stockState(m)
                return (
                  <div key={m._id} className="p-3 bg-slate-800 rounded-lg border border-slate-700 mb-2 text-xs">
                    <p className="m-0 text-sm font-bold">{txt(m.name)}</p>
                    <p className="m-0 mt-0.5 text-slate-400">{txt(m.salt, '')}</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                      <span className="text-slate-400">Category: <b className="text-white">{txt(m.category)}</b></span>
                      <span className="text-slate-400">Form: <b className="text-white">{txt(m.formulation)}</b></span>
                      <span className="text-slate-400">Company: <b className="text-white">{txt(m.company)}</b></span>
                      <span className="text-slate-400">Pack: <b className="text-white">{txt(m.packSize)}</b></span>
                      <span className="text-slate-400">MRP: <b className="text-white">₹{txt(m.mrp, 0)}</b></span>
                      <span className="text-slate-400">GST: <b className="text-white">{txt(m.gstPercent, 0)}%</b></span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold" style={{ color: COLORS[st].main }}>● {COLORS[st].label}</span>
                      <span className="text-slate-300">Stock: <b>{txt(m.currentStock, 0)}</b> / reorder {txt(m.reorderLevel, 0)}</span>
                    </div>
                    <button
                      onClick={() => handleMedicineClick(m)}
                      className="mt-3 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-xs font-semibold text-white transition-colors"
                    >
                      Select Batch for Sale
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="m-0 mb-4 text-xs text-slate-500 text-center py-4 border border-dashed border-slate-700 rounded-lg">3D me kisi cube pe click karo — medicine ki details yahan dikhengi</p>
          )}

          <p className="m-0 mb-2 text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
            <Package size={12} /> Rack medicines ({rackMeds.length})
          </p>
          {rackMeds.length === 0 && <p className="text-xs text-slate-500 text-center py-4 m-0">Is rack me abhi koi medicine nahi hai</p>}
          {rackMeds.map((m) => {
            const l = m.rackLocation
            const k = slotKey(l.shelf, l.row, l.column)
            const st = stockState(m)
            return (
              <div
                key={m._id}
                onClick={() => setSelectedKey(k)}
                className={`p-2 rounded-lg mb-1.5 border text-xs cursor-pointer transition-colors ${selectedKey === k ? 'bg-slate-700 border-sky-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="m-0 font-bold truncate">{txt(m.name)}</p>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[st].main }} />
                </div>
                <p className="m-0 mt-0.5 text-slate-400">S{l.shelf} • R{String(l.row).toUpperCase()} • C{l.column} • Stock {txt(m.currentStock, 0)}</p>
              </div>
            )
          })}

          {unassignedMeds.length > 0 && (
            <div className="mt-4">
              <p className="m-0 mb-2 text-xs font-bold text-amber-400 uppercase">⚠️ Rack assign nahi ({unassignedMeds.length})</p>
              {unassignedMeds.map((m) => (
                <div key={m._id} className="p-2 rounded-lg mb-1.5 border border-amber-500/30 bg-slate-800 text-xs">
                  <p className="m-0 font-bold truncate">{txt(m.name)}</p>
                  <p className="m-0 mt-0.5 text-slate-400">
                    {m.rackLocation?.rackId ? `Rack "${m.rackLocation.rackId}" list me nahi mila` : 'Koi rack assign nahi'} • Stock {txt(m.currentStock, 0)}
                  </p>
                </div>
              ))}
            </div>
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