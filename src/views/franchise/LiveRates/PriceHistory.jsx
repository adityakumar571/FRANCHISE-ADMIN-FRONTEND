/* eslint-disable prettier/prettier */
import { useState, useCallback, useRef } from 'react'
import { History, TrendingUp, TrendingDown } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PERIODS = [{ v: '30', l: '30 Days' }, { v: '60', l: '60 Days' }, { v: '90', l: '90 Days' }]

export default function PriceHistory() {
  const [medicine, setMedicineInput] = useState('Paracetamol 650mg')
  const [days, setDays]       = useState('30')
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef()

  const fetch = useCallback(async (med, d) => {
    if (!med) return
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/live-rates/price-history?medicine=${encodeURIComponent(med)}&days=${d}`)
      setData(res.data?.data)
    } catch { toast.error('Failed to load price history') }
    finally   { setLoading(false) }
  }, [])

  const handleSearch = () => fetch(medicine, days)
  const handleMedChange = (val) => {
    setMedicineInput(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetch(val, days), 600)
  }

  const minP = data?.minPrice, maxP = data?.maxPrice, avgP = data?.avgPrice

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={History} title="Price History" subtitle="Historical price trends for medicines" color="#0891b2" />

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={medicine} onChange={e => handleMedChange(e.target.value)}
          placeholder="Medicine name..."
          style={{ flex: 1, minWidth: 200, padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        <select value={days} onChange={e => { setDays(e.target.value); fetch(medicine, e.target.value) }}
          style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
          {PERIODS.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
        </select>
        <button onClick={handleSearch}
          style={{ padding: '9px 16px', border: 'none', borderRadius: 8, background: '#0c3b73', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Load History
        </button>
      </div>

      {!data && !loading && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
          <History size={36} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
          Search a medicine to see its price history
        </div>
      )}

      {loading && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 32, textAlign: 'center', color: '#9ca3af' }}>
          Loading price history...
        </div>
      )}

      {data && !loading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { l: 'Min Price', v: `₹${minP?.toFixed(2)}`, color: '#16a34a' },
              { l: 'Max Price', v: `₹${maxP?.toFixed(2)}`, color: '#dc2626' },
              { l: 'Avg Price', v: `₹${avgP?.toFixed(2)}`, color: '#0c3b73' },
            ].map(({ l, v, color }) => (
              <div key={l} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px' }}>{l}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color, margin: 0 }}>{v}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px' }}>
            <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700 }}>{data.medicine} — Price Trend (Last {days} Days)</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.history} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${v}`} domain={['auto', 'auto']} width={42} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 11 }} formatter={v => [`₹${v}`, 'Price']} />
                <Line type="monotone" dataKey="price" stroke="#0c3b73" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
