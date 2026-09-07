/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { LayoutTemplate } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

const Section = ({ title, items, color }) => (
  <div>
    <p style={{ fontSize: 12, fontWeight: 700, color, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</p>
    {(items || []).map((r, i) => (
      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
        <span style={{ color: '#374151' }}>{r.label}</span>
        <span style={{ fontWeight: 600, color: '#111827' }}>{fmt(r.amount)}</span>
      </div>
    ))}
  </div>
)

export default function BalanceSheet() {
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/accounts/balance-sheet')
        setData(res.data?.data)
      } catch { toast.error('Failed to load balance sheet') }
      finally   { setLoading(false) }
    })()
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={LayoutTemplate} title="Balance Sheet" subtitle="Financial position as of today" color="#0c3b73" />

      {loading
        ? <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading balance sheet...</div>
        : data && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Total Assets',      value: fmt(data.totalAssets),      color: '#0c3b73' },
                { label: 'Total Liabilities', value: fmt(data.totalLiabilities), color: '#7c3aed' },
              ].map(k => (
                <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px' }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{k.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Assets */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#111827', borderBottom: '2px solid #0c3b73', paddingBottom: 10 }}>ASSETS</p>
                <Section title="Current Assets" items={data.assets?.currentAssets} color="#0891b2" />
                <div style={{ marginTop: 12 }} />
                <Section title="Fixed Assets" items={data.assets?.fixedAssets} color="#7c3aed" />
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #0c3b73', marginTop: 10, fontSize: 14, fontWeight: 800 }}>
                  <span>Total Assets</span>
                  <span style={{ color: '#0c3b73' }}>{fmt(data.totalAssets)}</span>
                </div>
              </div>

              {/* Liabilities */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#111827', borderBottom: '2px solid #7c3aed', paddingBottom: 10 }}>LIABILITIES & CAPITAL</p>
                <Section title="Current Liabilities" items={data.liabilities?.currentLiabilities} color="#dc2626" />
                <div style={{ marginTop: 12 }} />
                <Section title="Capital" items={data.liabilities?.capital} color="#16a34a" />
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #7c3aed', marginTop: 10, fontSize: 14, fontWeight: 800 }}>
                  <span>Total Liabilities</span>
                  <span style={{ color: '#7c3aed' }}>{fmt(data.totalLiabilities)}</span>
                </div>
              </div>
            </div>

            {data.totalAssets === data.totalLiabilities && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 8 }}>
                ✓ Balance Sheet is balanced — Total Assets = Total Liabilities = {fmt(data.totalAssets)}
              </div>
            )}
          </>
        )
      }
    </div>
  )
}
