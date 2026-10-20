/* eslint-disable prettier/prettier */
/**
 * ExpiryDashboard - Proactive Expiry Management
 * Track expiring and expired medicines with actionable insights
 */
import { useState, useEffect } from 'react'
import { AlertTriangle, Calendar, Package, DollarSign, RefreshCw, Download, TrendingDown } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const Th = ({ c }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>

export default function ExpiryDashboard() {
  const [tab, setTab] = useState('expiring') // 'expiring' | 'expired'
  const [days, setDays] = useState(60)
  const [expiringData, setExpiringData] = useState([])
  const [expiredData, setExpiredData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchExpiringMedicines = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/medicines/expiring-soon?days=${days}`)
      setExpiringData(res.data?.data?.expiringMedicines || [])
    } catch (err) {
      toast.error('Failed to load expiring medicines')
    } finally {
      setLoading(false)
    }
  }

  const fetchExpiredMedicines = async () => {
    setLoading(true)
    try {
      const res = await getRequest('/franchise/medicines/expired')
      setExpiredData(res.data?.data?.expiredMedicines || [])
    } catch (err) {
      toast.error('Failed to load expired medicines')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'expiring') {
      fetchExpiringMedicines()
    } else {
      fetchExpiredMedicines()
    }
  }, [tab, days])

  const currentData = tab === 'expiring' ? expiringData : expiredData
  const totalValue = currentData.reduce((sum, item) => sum + (item.value || item.quantity * 20), 0) // Estimate if value not provided

  const exportCSV = () => {
    const headers = tab === 'expiring' 
      ? 'Medicine,Salt,Batch,Expiry Date,Days Left,Quantity,Location,Category'
      : 'Medicine,Salt,Batch,Expiry Date,Days Expired,Quantity,Location,Value'
    
    const rows = currentData.map(m => {
      if (tab === 'expiring') {
        return `"${m.medicineName}","${m.salt}","${m.batchNo}","${m.expiryDate}",${m.daysLeft},${m.quantity},"${m.rackLocation || '—'}","${m.category || '—'}"`
      } else {
        return `"${m.medicineName}","${m.salt}","${m.batchNo}","${m.expiryDate}",${m.daysExpired},${m.quantity},"${m.rackLocation || '—'}",${m.value || 0}`
      }
    })
    
    const csv = `${headers}\n${rows.join('\n')}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tab}_medicines_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success(`Exported ${currentData.length} medicines`)
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader 
        icon={AlertTriangle} 
        title="Expiry Management" 
        subtitle="Track and manage expiring & expired medicines" 
        color="#dc2626"
      >
        <button 
          onClick={() => tab === 'expiring' ? fetchExpiringMedicines() : fetchExpiredMedicines()}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
        <button 
          onClick={exportCSV}
          disabled={currentData.length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: currentData.length === 0 ? 'not-allowed' : 'pointer', opacity: currentData.length === 0 ? 0.5 : 1 }}
        >
          <Download size={13} /> Export CSV
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Calendar size={18} color="#f59e0b" />
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, fontWeight: 600 }}>EXPIRING SOON ({days} DAYS)</p>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b', margin: 0 }}>{expiringData.length}</p>
          <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>batches need attention</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', borderLeft: '4px solid #dc2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertTriangle size={18} color="#dc2626" />
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, fontWeight: 600 }}>EXPIRED</p>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#dc2626', margin: 0 }}>{expiredData.length}</p>
          <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>batches expired</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', borderLeft: '4px solid #0c3b73' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Package size={18} color="#0c3b73" />
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, fontWeight: 600 }}>TOTAL QUANTITY</p>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#0c3b73', margin: 0 }}>
            {currentData.reduce((sum, item) => sum + item.quantity, 0)}
          </p>
          <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>units affected</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <DollarSign size={18} color="#7c3aed" />
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, fontWeight: 600 }}>ESTIMATED VALUE</p>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed', margin: 0 }}>
            ₹{totalValue.toLocaleString('en-IN')}
          </p>
          <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>at risk</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setTab('expiring')}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: tab === 'expiring' ? '#0c3b73' : '#f3f4f6',
            color: tab === 'expiring' ? '#fff' : '#6b7280',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Expiring Soon
        </button>
        <button
          onClick={() => setTab('expired')}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: tab === 'expired' ? '#0c3b73' : '#f3f4f6',
            color: tab === 'expired' ? '#fff' : '#6b7280',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Expired
        </button>

        {tab === 'expiring' && (
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: '#fff',
              fontSize: 13,
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            <option value={30}>Next 30 days</option>
            <option value={60}>Next 60 days</option>
            <option value={90}>Next 90 days</option>
            <option value={120}>Next 120 days</option>
          </select>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {tab === 'expiring' ? (
                  <>
                    <Th c="Medicine Name" />
                    <Th c="Salt" />
                    <Th c="Batch No" />
                    <Th c="Expiry Date" />
                    <Th c="Days Left" />
                    <Th c="Quantity" />
                    <Th c="Location" />
                    <Th c="Category" />
                    <Th c="Action" />
                  </>
                ) : (
                  <>
                    <Th c="Medicine Name" />
                    <Th c="Salt" />
                    <Th c="Batch No" />
                    <Th c="Expiry Date" />
                    <Th c="Days Expired" />
                    <Th c="Quantity" />
                    <Th c="Location" />
                    <Th c="Value (₹)" />
                    <Th c="Action" />
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(9).fill(0).map((_, j) => (
                      <td key={j} style={{ padding: '10px 12px' }}>
                        <div style={{ height: 13, background: '#f3f4f6', borderRadius: 4 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                    {tab === 'expiring' 
                      ? `No medicines expiring in next ${days} days` 
                      : 'No expired medicines found'}
                  </td>
                </tr>
              ) : (
                currentData.map((item, idx) => (
                  <tr key={idx} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <Td>
                      <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 13 }}>{item.medicineName}</p>
                    </Td>
                    <Td style={{ fontSize: 12, color: '#6b7280' }}>{item.salt || '—'}</Td>
                    <Td style={{ fontSize: 12, fontFamily: 'monospace', color: '#0c3b73', fontWeight: 600 }}>{item.batchNo}</Td>
                    <Td style={{ fontSize: 12 }}>{new Date(item.expiryDate).toLocaleDateString('en-IN')}</Td>
                    <Td>
                      {tab === 'expiring' ? (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: 20,
                          background: item.daysLeft <= 15 ? '#fee2e2' : item.daysLeft <= 30 ? '#fef3c7' : '#fef3c7',
                          color: item.daysLeft <= 15 ? '#dc2626' : item.daysLeft <= 30 ? '#d97706' : '#d97706',
                        }}>
                          {item.daysLeft} days
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: 20,
                          background: '#fee2e2',
                          color: '#dc2626',
                        }}>
                          {item.daysExpired} days ago
                        </span>
                      )}
                    </Td>
                    <Td style={{ fontWeight: 600, color: item.quantity === 0 ? '#dc2626' : '#0c3b73' }}>{item.quantity}</Td>
                    <Td>
                      {item.rackLocation ? (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 6, background: '#eff6ff', color: '#0c3b73', fontFamily: 'monospace' }}>
                          {item.rackLocation}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>—</span>
                      )}
                    </Td>
                    {tab === 'expiring' ? (
                      <Td style={{ fontSize: 12 }}>{item.category || '—'}</Td>
                    ) : (
                      <Td style={{ fontWeight: 700, color: '#dc2626' }}>₹{(item.value || 0).toFixed(2)}</Td>
                    )}
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {tab === 'expiring' ? (
                          <>
                            <button
                              onClick={() => toast.success('Return to supplier initiated')}
                              style={{ padding: '5px 10px', border: 'none', borderRadius: 6, background: '#dbeafe', color: '#0c3b73', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                            >
                              Return
                            </button>
                            <button
                              onClick={() => toast.success('Discount sale marked')}
                              style={{ padding: '5px 10px', border: 'none', borderRadius: 6, background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                            >
                              Discount
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => toast.success('Marked for disposal')}
                            style={{ padding: '5px 10px', border: 'none', borderRadius: 6, background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                          >
                            Dispose
                          </button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      {currentData.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <TrendingDown size={20} color="#d97706" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#92400e', margin: 0 }}>Recommendations</h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#78350f', lineHeight: 1.8 }}>
            {tab === 'expiring' && (
              <>
                <li>Contact suppliers for return policy on medicines expiring in next 30 days</li>
                <li>Offer discounts (10-20%) on medicines with 30-60 days to expiry</li>
                <li>Prioritize FIFO (First In First Out) during billing to use older batches first</li>
                <li>Review purchase quantities to avoid overstocking slow-moving items</li>
              </>
            )}
            {tab === 'expired' && (
              <>
                <li>Remove expired medicines from shelves immediately to prevent accidental sale</li>
                <li>Document disposal process as per regulatory requirements</li>
                <li>Review inventory management to reduce expiry wastage</li>
                <li>Consider demand forecasting to optimize stock levels</li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
