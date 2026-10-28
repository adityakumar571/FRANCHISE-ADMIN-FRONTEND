/* eslint-disable prettier/prettier */
/**
 * PharmacyLayout3D — Live Search + Responsive Tailwind UI
 * Debounced search (waits 800ms after typing stops)
 */
import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  MapPin, Plus, Package, Layers, AlertTriangle, Search, X, 
  ChevronRight, Grid3X3, RefreshCw, BarChart2, TrendingDown, Home, 
  Info, Box, Zap
} from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const STATUS = {
  available: { color: '#10b981', label: 'In Stock' },
  low: { color: '#f59e0b', label: 'Low Stock' },
  out: { color: '#ef4444', label: 'Out of Stock' },
}

const RACK_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6']

/* ════ DEBOUNCE HOOK (Like Google Search) ════ */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/* ════ VISUAL SHELF ════ */
const ShelfVisualization = ({ rack, medicines }) => {
  const shelves = rack.shelves || 5
  const rowsPerShelf = rack.rowsPerShelf || 3
  const columnsPerRow = rack.columnsPerRow || 4
  const totalSlots = shelves * rowsPerShelf * columnsPerRow
  const filledSlots = medicines.length
  const percentFull = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
      <div className="flex justify-between items-center mb-3">
        <p className="m-0 text-sm font-bold text-white">📊 Capacity</p>
        <span className="text-sm font-extrabold text-blue-400">{filledSlots}/{totalSlots}</span>
      </div>
      
      <div className="h-2 bg-slate-700 rounded overflow-hidden mb-3">
        <div 
          style={{ 
            width: `${percentFull}%`, 
            background: percentFull > 80 ? '#ef4444' : percentFull > 50 ? '#f59e0b' : '#10b981',
            transition: 'width 0.4s'
          }} 
          className="h-full"
        />
      </div>

      <div className="grid gap-1 mb-3" style={{ gridTemplateColumns: `repeat(${columnsPerRow}, 1fr)` }}>
        {Array.from({ length: columnsPerRow }).map((_, col) => (
          <div key={col} className="bg-slate-700 border border-slate-600 rounded p-1 text-center text-xs text-slate-400 font-semibold">
            C{col + 1}
          </div>
        ))}
      </div>

      <div className="p-2 bg-slate-700 rounded text-xs">
        <p className="m-0 mb-1 text-slate-300">Structure:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="text-slate-400">Shelves:</span> <span className="text-white font-bold">{shelves}</span></div>
          <div><span className="text-slate-400">Rows:</span> <span className="text-white font-bold">{rowsPerShelf}</span></div>
          <div><span className="text-slate-400">Cols:</span> <span className="text-white font-bold">{columnsPerRow}</span></div>
          <div><span className="text-slate-400">Total:</span> <span className="text-white font-bold">{totalSlots}</span></div>
        </div>
      </div>
    </div>
  )
}

/* ════ RACK CARD ════ */
const RackCard = ({ rack, isSelected, isPinned, onClick, medicineCount }) => {
  const pct = rack.capacity > 0 ? Math.round((medicineCount / rack.capacity) * 100) : 0
  const colorIdx = (rack.code?.charCodeAt(0) || 0) + (parseInt(rack.code?.slice(1) || 0) || 0)
  const accentColor = RACK_COLORS[colorIdx % RACK_COLORS.length]
  
  let st = STATUS.available
  if (pct >= 90) st = STATUS.out
  else if (pct >= 70) st = STATUS.low
  
  return (
    <div 
      onClick={onClick} 
      className={`relative p-3 rounded-lg cursor-pointer transition-all border-2 ${isSelected ? 'bg-slate-700' : 'bg-slate-800'}`}
      style={{ borderColor: isSelected ? accentColor : isPinned ? '#ef4444' : '#334155' }}
    >
      {isPinned && <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">📍</div>}
      
      <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full" style={{ background: st.color, boxShadow: `0 0 6px ${st.color}` }} />
      
      <p className="m-0 mb-2 text-sm font-extrabold" style={{ color: isSelected ? accentColor : '#cbd5e1' }}>{rack.code}</p>
      
      <div className="text-xs text-slate-400 mb-2">
        <p className="m-0 my-0.5">📦 {medicineCount} items</p>
        <p className="m-0 my-0.5">🎯 {rack.shelves || 5} shelves</p>
      </div>
      
      <div className="h-1 bg-slate-700 rounded overflow-hidden">
        <div style={{ height: '100%', width: `${pct}%`, background: st.color, transition: 'width 0.4s' }} />
      </div>
      <p className="m-0 mt-1 text-xs text-slate-400 font-semibold">{pct}% full</p>
    </div>
  )
}

/* ════ MAIN COMPONENT ════ */
export default function PharmacyLayout3D() {
  const [medicines, setMedicines] = useState([])
  const [counters, setCounters] = useState([])
  const [racks, setRacks] = useState([])
  const [selectedCounter, setCounter] = useState(null)
  const [selectedRack, setSelectedRack] = useState(null)
  const [search, setSearch] = useState('')
  const [foundMed, setFoundMed] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  
  // Debounced search - waits 800ms after user stops typing
  const debouncedSearch = useDebounce(search, 800)

  /* ── FETCH ALL DATA ── */
  const fetchAllData = useCallback(async () => {
    try {
      const [mRes, cRes, rRes] = await Promise.allSettled([
        getRequest('/franchise/medicines?limit=1000&layout=true'),  // ← Add layout=true to skip KPI/categories
        getRequest('/franchise/master/counters'),
        getRequest('/franchise/master/racks'),
      ])

      if (mRes.status === 'fulfilled') {
        const meds = mRes.value?.data?.data?.medicines || []
        console.log('✅ Medicines:', meds.length)
        setMedicines(meds)
      }

      if (cRes.status === 'fulfilled') {
        const cs = cRes.value?.data?.data || []
        console.log('✅ Counters:', cs.length)
        setCounters(cs)
        // Only set default on initial load, not on every refresh
        setCounter(prev => prev || cs[0])
      }

      if (rRes.status === 'fulfilled') {
        const rs = rRes.value?.data?.data || []
        console.log('✅ Racks:', rs.length)
        setRacks(rs)
        // Only set default on initial load, not on every refresh
        setSelectedRack(prev => prev || rs[0])
      }

      setLastRefresh(new Date())
      setLoading(false)
    } catch (err) {
      console.error('❌ Fetch error:', err)
      toast.error('Failed to load data')
      setLoading(false)
    }
  }, [])

  /* ── INITIAL LOAD ── */
  useEffect(() => {
    fetchAllData()
    const timer = setInterval(fetchAllData, 30000)
    return () => clearInterval(timer)
  }, [fetchAllData])

  /* ── DEBOUNCED SEARCH (Like Google - waits 800ms) ── */
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setFoundMed(null)
      return
    }

    const performSearch = async () => {
      setSearchLoading(true)
      try {
        const response = await getRequest(`/franchise/medicines?search=${encodeURIComponent(debouncedSearch)}&limit=1`)
        const meds = response?.data?.data?.medicines || []
        
        if (meds.length > 0) {
          const med = meds[0]
          console.log('🔍 Found:', med.name, 'Counter:', med.counterId, 'Rack:', med.rackLocation?.rackId)
          setFoundMed(med)
          
          // Auto-select counter if available
          if (med.counterId) {
            const cId = med.counterId?._id || med.counterId
            const counter = counters.find(c => c._id === cId)
            if (counter) {
              setCounter(counter)
              console.log('📍 Auto-selected counter:', counter.code)
            }
          }
          
          // Auto-select rack if available
          if (med.rackLocation?.rackId) {
            const rackData = racks.find(r => r.code === med.rackLocation.rackId)
            if (rackData) {
              setSelectedRack(rackData)
              console.log('📦 Auto-selected rack:', rackData.code)
            }
          }
          
          toast.success('Found: ' + med.name)
        } else {
          setFoundMed(null)
          toast.error('Medicine not found')
        }
      } catch (err) {
        console.error('❌ Search error:', err)
        setFoundMed(null)
        toast.error('Search failed')
      } finally {
        setSearchLoading(false)
      }
    }

    performSearch()
  }, [debouncedSearch, counters, racks])

  /* ── FILTERED DATA ── */
  const counterRacks = useMemo(() => {
    if (!selectedCounter) return racks
    return racks.filter(r => {
      const cId = r.counterId?._id || r.counterId
      const sId = selectedCounter._id || selectedCounter.id
      return cId === sId
    })
  }, [racks, selectedCounter])

  const rackMedicines = useMemo(() => {
    if (!selectedRack) return []
    return medicines.filter(m => {
      const rackCode = m.rackLocation?.rackId || ''
      return rackCode === selectedRack.code
    })
  }, [medicines, selectedRack])

  /* ── AVAILABLE SPACE ── */
  const rackSpace = useMemo(() => {
    if (!selectedRack) return { total: 0, used: 0, available: 0, percent: 0 }
    const total = selectedRack.capacity || 200
    const used = rackMedicines.length
    const available = total - used
    const percent = Math.round((used / total) * 100)
    return { total, used, available, percent }
  }, [selectedRack, rackMedicines])

  /* ── STATS ── */
  const stats = useMemo(() => {
    const low = medicines.filter(m => m.currentStock > 0 && m.currentStock <= m.reorderLevel).length
    const out = medicines.filter(m => m.currentStock === 0).length
    const assigned = medicines.filter(m => m.rackLocation?.position).length
    const unassigned = medicines.length - assigned
    return { total: medicines.length, low, out, assigned, unassigned }
  }, [medicines])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <RefreshCw size={32} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-slate-950 min-h-screen p-3 md:p-4 lg:p-6 text-white font-sans">
      
      {/* ═══ HEADER ═══ */}
      <div className="bg-slate-900 rounded-xl p-3 md:p-4 lg:p-6 mb-6 border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
          <div>
            <h1 className="m-0 text-xl md:text-2xl lg:text-3xl font-extrabold">📦 Pharmacy Layout</h1>
            <p className="m-0 mt-1 text-xs md:text-sm text-slate-400">
              {stats.total} medicines • {counters.length} counters • {racks.length} racks
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={fetchAllData} 
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white text-xs md:text-sm font-semibold transition-colors"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <span className="text-xs text-slate-400 px-3 md:px-4 py-2 bg-slate-800 rounded-lg whitespace-nowrap">
              {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ STATS GRID (Responsive) ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 md:gap-3 lg:gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: '📋', color: '#3b82f6' },
          { label: 'Counters', value: counters.length, icon: '🏪', color: '#8b5cf6' },
          { label: 'Racks', value: racks.length, icon: '📦', color: '#22c55e' },
          { label: 'Assigned', value: stats.assigned, icon: '✅', color: '#10b981' },
          { label: 'Unassigned', value: stats.unassigned, icon: '❌', color: '#f59e0b' },
          { label: 'Low Stock', value: stats.low, icon: '⚠️', color: '#f59e0b' },
          { label: 'Out of Stock', value: stats.out, icon: '🔴', color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 rounded-lg p-2 md:p-3 border border-slate-800">
            <p className="m-0 text-xs text-slate-400 flex items-center gap-1">
              {s.icon} {s.label}
            </p>
            <p className="m-0 mt-1 text-2xl md:text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ═══ MAIN LAYOUT (Responsive) ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
        
        {/* ─ LEFT: SEARCH + COUNTERS ─ */}
        <div className="md:col-span-1 flex flex-col gap-3 md:gap-4">
          
          {/* Search Box */}
          <div className="bg-slate-900 rounded-lg p-3 md:p-4 border border-slate-800">
            <p className="m-0 mb-2 md:mb-3 text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
              🔍 Search (Live)
            </p>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Type medicine..." 
                disabled={searchLoading}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs md:text-sm placeholder-slate-500 outline-none disabled:opacity-50 transition-opacity"
              />
              {searchLoading && <RefreshCw size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />}
            </div>
            
            {foundMed && (
              <div className="p-2 md:p-3 bg-slate-800 rounded-lg border border-slate-700">
                <p className="m-0 font-bold text-green-400 text-xs md:text-sm">✅ Found</p>
                <p className="m-0 mt-1 md:mt-2 font-bold text-white text-xs md:text-sm truncate">{foundMed.name}</p>
                <p className="m-0 mt-1 text-xs text-slate-400">Stock: {foundMed.currentStock}</p>
                <p className="m-0 mt-0.5 text-xs text-slate-400">Category: {foundMed.category}</p>
                {foundMed.rackLocation?.position ? (
                  <p className="m-0 mt-1 md:mt-2 text-xs font-semibold text-blue-400">📍 {foundMed.rackLocation.position}</p>
                ) : (
                  <p className="m-0 mt-1 md:mt-2 text-xs font-semibold text-amber-400">⚠️ Not assigned</p>
                )}
              </div>
            )}
          </div>

          {/* Counters List */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <div className="px-3 md:px-4 py-2 md:py-3 bg-slate-800 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase">
              🏪 Counters
            </div>
            <div className="max-h-64 md:max-h-96 overflow-y-auto">
              {counters.map(c => {
                const counterRackCount = racks.filter(r => {
                  const cId = r.counterId?._id || r.counterId
                  return cId === c._id
                }).length
                return (
                  <div 
                    key={c._id} 
                    onClick={() => setCounter(c)} 
                    className={`px-3 md:px-4 py-2 md:py-3 cursor-pointer border-l-4 transition-all text-xs md:text-sm ${selectedCounter?._id === c._id ? 'bg-slate-800 border-blue-500' : 'bg-slate-900 border-transparent hover:bg-slate-800'}`}
                  >
                    <p className="m-0 font-bold text-white">{c.code}</p>
                    <p className="m-0 mt-0.5 text-slate-400">{c.name} • {counterRackCount} racks</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ─ CENTER: RACK GRID ─ */}
        <div className="md:col-span-2 lg:col-span-2 bg-slate-900 rounded-lg p-3 md:p-4 border border-slate-800">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Layers size={16} className="text-blue-400" />
            <p className="m-0 text-sm md:text-base font-bold">
              {selectedCounter ? selectedCounter.code + ' - ' + counterRacks.length + ' Racks' : 'Select Counter'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 min-h-64 md:min-h-80">
            {counterRacks.length > 0 ? (
              counterRacks.map(rack => {
                const medCount = medicines.filter(m => m.rackLocation?.rackId === rack.code).length
                return (
                  <RackCard 
                    key={rack._id} 
                    rack={rack} 
                    onClick={() => setSelectedRack(rack)} 
                    isSelected={selectedRack?._id === rack._id} 
                    isPinned={foundMed?.rackLocation?.rackId === rack.code}
                    medicineCount={medCount} 
                  />
                )
              })
            ) : (
              <p className="col-span-full text-center text-slate-400 py-16 md:py-20">No racks in this counter</p>
            )}
          </div>
        </div>

        {/* ─ RIGHT: RACK DETAILS ─ */}
        <div className="md:col-span-1 bg-slate-900 rounded-lg p-3 md:p-4 border border-slate-800 max-h-80 md:max-h-96 lg:max-h-[600px] overflow-y-auto">
          {selectedRack ? (
            <div>
              <p className="m-0 mb-3 md:mb-4 text-base md:text-lg font-extrabold text-blue-400 flex items-center gap-2">
                📦 {selectedRack.code}
              </p>
              
              {/* Info Section */}
              <div className="bg-slate-800 rounded-lg p-2 md:p-3 mb-3 md:mb-4">
                {[
                  ['Name', selectedRack.name],
                  ['Counter', counters.find(c => c._id === (selectedRack.counterId?._id || selectedRack.counterId))?.code || 'N/A'],
                  ['Shelves', selectedRack.shelves || 5],
                  ['Rows/Shelf', selectedRack.rowsPerShelf || 3],
                  ['Cols/Row', selectedRack.columnsPerRow || 4],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs py-1 md:py-1.5 border-b border-slate-700 last:border-b-0">
                    <span className="text-slate-400">{k}:</span>
                    <span className="font-bold text-white">{v}</span>
                  </div>
                ))}
              </div>

              {/* Space Visualization */}
              <ShelfVisualization rack={selectedRack} medicines={rackMedicines} />

              {/* Capacity Info */}
              <div className="mt-3 md:mt-4 p-2 md:p-3 bg-slate-800 rounded-lg">
                <p className="m-0 mb-1 md:mb-2 text-xs font-bold text-slate-400">CAPACITY</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-400">Used:</span> <span className="text-amber-400 font-bold">{rackSpace.used}</span></div>
                  <div><span className="text-slate-400">Available:</span> <span className="text-green-400 font-bold">{rackSpace.available}</span></div>
                  <div><span className="text-slate-400">Total:</span> <span className="text-blue-400 font-bold">{rackSpace.total}</span></div>
                  <div><span className="text-slate-400">Full:</span> <span className="text-white font-bold">{rackSpace.percent}%</span></div>
                </div>
              </div>

              {/* Medicines List */}
              <p className="m-0 mt-3 md:mt-4 mb-2 text-xs font-bold text-slate-400 uppercase">
                📋 Medicines ({rackMedicines.length})
              </p>
              <div className="max-h-40 md:max-h-48 overflow-y-auto">
                {rackMedicines.length > 0 ? (
                  rackMedicines.map(m => (
                    <div key={m._id} className="p-1.5 md:p-2 bg-slate-800 rounded-lg mb-1 md:mb-2 border border-slate-700 text-xs">
                      <p className="m-0 font-bold text-white truncate">{m.name}</p>
                      <p className="m-0 mt-0.5 text-slate-400">📊 Stock: {m.currentStock}</p>
                      <p className="m-0 text-slate-400">💊 {m.formulation}</p>
                      {m.rackLocation?.position && (
                        <p className="m-0 mt-0.5 text-blue-400 text-xs">📍 {m.rackLocation.position}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="m-0 text-slate-400 text-xs text-center py-3 md:py-4">Empty</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 m-0 text-center pt-12 md:pt-16 lg:pt-20">Select a rack</p>
          )}
        </div>
      </div>
    </div>
  )
}
