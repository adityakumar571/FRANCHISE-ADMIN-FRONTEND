/* eslint-disable prettier/prettier */
/**
 * LiveRateCompare — Compare supplier stock, price and schemes
 * SOW §9.1: Live Medicine Price & Stock Comparison
 */
import { useState } from 'react'
import { Search, BarChart2, Star, ShoppingCart, TrendingDown, Package, Percent } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'

const MOCK_RESULTS = [
  { supplier: 'Medico Agencies', assignmentType: 'preferred', stock: 500, ptr: 42.50, scheme: '10+1', netRate: 38.64, isPreferred: true, isAvailable: true },
  { supplier: 'PharmaDist Pvt Ltd', assignmentType: 'assigned', stock: 1200, ptr: 44.00, scheme: null, netRate: 44.00, isPreferred: false, isAvailable: true },
  { supplier: 'SunPharma Dist', assignmentType: 'recommended', stock: 0, ptr: 41.00, scheme: null, netRate: 41.00, isPreferred: false, isAvailable: false },
]

const LiveRateCompare = () => {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [selectedMed, setSelectedMed] = useState(null)

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    // In production: getRequest(`franchise/purchase/live-rate?medicine=${query}`)
    setTimeout(() => {
      setResults(MOCK_RESULTS)
      setSelectedMed(query)
      setSearched(true)
      setLoading(false)
    }, 800)
  }

  const minRate = results.length ? Math.min(...results.filter((r) => r.isAvailable).map((r) => r.netRate)) : 0

  return (
    <div>
      <PageHeader icon={BarChart2} title="Live Rate Compare" subtitle="Compare supplier stock, price and schemes in real-time" color="#0c3b73" />

      {/* Search */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb', marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 10px', color: '#374151' }}>Search Medicine</p>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by medicine name, generic, barcode…"
              style={{ width: '100%', height: 42, border: '1px solid #e5e7eb', borderRadius: 8, paddingLeft: 36, fontSize: 13, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '0 24px', borderRadius: 8, border: 'none', background: '#0c3b73', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', height: 42, minWidth: 100 }}>
            {loading ? 'Searching…' : 'Compare'}
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>
              Results for: <span style={{ color: '#0c3b73' }}>{selectedMed}</span>
            </h3>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{results.length} supplier(s) found</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {results.map((r, i) => {
              const isBest = r.isAvailable && r.netRate === minRate
              return (
                <div key={i} style={{
                  background: '#fff', borderRadius: 12, border: `2px solid ${isBest ? '#0c3b73' : '#e5e7eb'}`,
                  padding: '18px 18px 14px', position: 'relative', overflow: 'hidden',
                }}>
                  {isBest && (
                    <div style={{ position: 'absolute', top: 0, right: 0, background: '#0c3b73', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderBottomLeftRadius: 8 }}>
                      BEST PRICE
                    </div>
                  )}
                  {r.isPreferred && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '2px 8px', borderRadius: 20, marginBottom: 10 }}>
                      <Star size={10} fill="#16a34a" /> Preferred Supplier
                    </div>
                  )}

                  <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', color: '#111827' }}>{r.supplier}</h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 3px', fontWeight: 500 }}>PTR Rate</p>
                      <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#111827' }}>₹{r.ptr.toFixed(2)}</p>
                    </div>
                    <div style={{ background: isBest ? '#eff6ff' : '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 3px', fontWeight: 500 }}>Net Rate</p>
                      <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: isBest ? '#2563eb' : '#111827' }}>₹{r.netRate.toFixed(2)}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: r.isAvailable ? '#16a34a' : '#e11d48', fontWeight: 600 }}>
                      <Package size={12} /> Stock: {r.isAvailable ? r.stock.toLocaleString() : 'Out of Stock'}
                    </div>
                    {r.scheme && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>
                        <Percent size={12} /> Scheme: {r.scheme}
                      </div>
                    )}
                  </div>

                  <button
                    disabled={!r.isAvailable}
                    style={{
                      width: '100%', height: 38, borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 13, cursor: r.isAvailable ? 'pointer' : 'not-allowed',
                      background: r.isAvailable ? '#0c3b73' : '#e5e7eb', color: r.isAvailable ? '#fff' : '#9ca3af',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <ShoppingCart size={14} /> {r.isAvailable ? 'Create PO' : 'Out of Stock'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!searched && (
        <div style={{ textAlign: 'center', padding: '64px 20px' }}>
          <BarChart2 size={48} color="#d1d5db" style={{ margin: '0 auto 16px', display: 'block' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>Search a medicine to compare rates</p>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Enter medicine name or barcode above to see live stock and prices from your suppliers</p>
        </div>
      )}
    </div>
  )
}

export default LiveRateCompare
