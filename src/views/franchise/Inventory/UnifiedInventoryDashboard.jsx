/* eslint-disable prettier/prettier */
/**
 * Unified Inventory Dashboard - Production Level
 * Consolidates all inventory management in ONE page
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Warehouse, Package, AlertTriangle, Calendar, TrendingUp, TrendingDown, Search, Download, RefreshCw, Eye, MapPin, Box } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import Rack3DModal from '../../../components/Rack3DModal/Rack3DModal'

const Card = ({ icon: Icon, label, value, color, trend, bg }) => (
  <div style={{ background: bg || '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, borderRadius: '50%', background: color + '15', opacity: 0.5 }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} style={{ color }} />
      </div>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{label}</p>
    </div>
    <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 800, color: '#111827' }}>{value}</p>
    {trend && <p style={{ margin: '4px 0 0', fontSize: 11, color: trend > 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% vs last month</p>}
  </div>
)

const Th = ({ c }) => <th style={{ padding: '10px 14px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', ...style }}>{children}</td>

export default function UnifiedInventoryDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [medicines, setMedicines] = useState([])
  const [kpi, setKpi] = useState({ total: 0, value: 0, lowStock: 0, nearExpiry: 0, expired: 0, fastMoving: 0, deadStock: 0 })
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All') // All, Low Stock, Near Expiry, Fast Moving, Dead Stock
  const [show3D, setShow3D] = useState(false)
  const [rackData, setRackData] = useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 50

  const fetchInventory = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      // Include withLocation=true to get batches for stock calculation
      // Add pagination parameters
      const res = await getRequest(`/franchise/medicines?limit=${itemsPerPage}&page=${page}&withLocation=true`)
      const meds = res.data?.data?.medicines || []
      const total = res.data?.data?.total || 0
      const pages = res.data?.data?.totalPages || 1
      
      setTotalItems(total)
      setTotalPages(pages)
      setCurrentPage(page)
      
      console.log('📊 Inventory Data:', {
        totalMedicines: meds.length,
        sampleMedicine: meds[0] ? {
          name: meds[0].name,
          currentStock: meds[0].currentStock,
          mrp: meds[0].mrp,
          hasBatches: meds[0].batches?.length || 0,
          rackLocation: meds[0].rackLocation,
          rackLabel: meds[0].rackLabel,
          batches: meds[0].batches?.map(b => ({
            batchNo: b.batchNo,
            quantity: b.quantity,
            expiryDate: b.expiryDate
          }))
        } : null
      })
      
      // Calculate KPIs
      let totalValue = 0
      let lowStockCount = 0
      let nearExpiryCount = 0
      let expiredCount = 0
      
      const now = new Date()
      const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
      
      const processedMeds = meds.map(med => {
        // Use backend's calculated currentStock (already accurate from batches)
        const currentStock = med.currentStock || 0;
        
        // Find next expiry date from batches (only if batches exist)
        let nextExpiry = null;
        if (med.batches && med.batches.length > 0) {
          const validBatches = med.batches.filter(b => new Date(b.expiryDate) > now)
          nextExpiry = validBatches.length > 0 
            ? new Date(Math.min(...validBatches.map(b => new Date(b.expiryDate))))
            : null
        }
        
        // Check if near expiry (within 60 days)
        const isNearExpiry = nextExpiry && nextExpiry <= sixtyDaysFromNow
        
        // Calculate stock value using backend's currentStock and mrp
        const stockValue = currentStock * (med.mrp || 0)
        totalValue += stockValue
        
        // Check low stock
        const isLowStock = currentStock <= (med.reorderLevel || 10) && currentStock > 0
        if (isLowStock) lowStockCount++
        if (isNearExpiry) nearExpiryCount++
        
        // Check expired batches
        const hasExpired = med.batches && med.batches.some(b => new Date(b.expiryDate) <= now)
        if (hasExpired) expiredCount++
        
        return {
          ...med,
          currentStock,           // Use backend's value
          nextExpiry,
          isNearExpiry,
          isLowStock,
          hasExpired,
          stockValue,
          // Use rackLocation.position from backend (already correct field)
          rackLocationDisplay: med.rackLocation?.position || med.rackLabel || '—',
          stockStatus: currentStock === 0 ? 'Out' : isLowStock ? 'Low' : 'Available'
        }
      })
      
      setMedicines(processedMeds)
      setKpi({
        total: meds.length,
        value: totalValue.toFixed(2),
        lowStock: lowStockCount,
        nearExpiry: nearExpiryCount,
        expired: expiredCount,
        fastMoving: 0, // TODO: Calculate from sales data
        deadStock: 0   // TODO: Calculate from sales data
      })
    } catch (err) {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }, [itemsPerPage])

  useEffect(() => { fetchInventory(1) }, [fetchInventory])

  const filtered = medicines.filter(m => {
    const matchSearch = search === '' || 
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.salt?.toLowerCase().includes(search.toLowerCase()) ||
      m.company?.toLowerCase().includes(search.toLowerCase())
    
    if (filter === 'Low Stock') return matchSearch && m.isLowStock
    if (filter === 'Near Expiry') return matchSearch && m.isNearExpiry
    if (filter === 'Expired') return matchSearch && m.hasExpired
    if (filter === 'Out of Stock') return matchSearch && m.currentStock === 0
    return matchSearch
  })

  const exportInventory = () => {
    const csv = [
      ['Medicine', 'Salt', 'Company', 'Stock', 'Status', 'Rack Location', 'Next Expiry', 'Stock Value'],
      ...filtered.map(m => [
        m.name,
        m.salt || '',
        m.company || '',
        m.currentStock,
        m.stockStatus,
        m.rackLocationDisplay || 'Not Assigned',
        m.nextExpiry ? new Date(m.nextExpiry).toLocaleDateString() : 'N/A',
        `₹${m.stockValue?.toFixed(2) || 0}`
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Inventory exported')
  }

  const open3DView = (medicine) => {
    if (!medicine.rackLocation?.rackId) {
      toast.error('No rack location assigned')
      return
    }
    setRackData({
      name: medicine.rackLocation.rackId,
      counter: 'Main Pharmacy',
      shelf: medicine.rackLocation.shelf || 'Middle',
      capacity: 40,
      currentStock: medicine.currentStock,
      status: medicine.stockStatus.toLowerCase()
    })
    setShow3D(true)
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <PageHeader
        icon={Warehouse}
        title="Inventory Dashboard"
        subtitle="Real-time stock overview with rack location and expiry tracking"
        color="#7c3aed"
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportInventory}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Download size={14} /> Export
          </button>
          <button onClick={() => fetchInventory(1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: 'none', borderRadius: 8, background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <Card icon={Package} label="Total Items" value={kpi.total} color="#3b82f6" />
        <Card icon={TrendingUp} label="Stock Value" value={`₹${kpi.value}`} color="#16a34a" />
        <Card icon={AlertTriangle} label="Low Stock" value={kpi.lowStock} color="#f59e0b" bg="#fffbeb" />
        <Card icon={Calendar} label="Near Expiry" value={kpi.nearExpiry} color="#ef4444" bg="#fef2f2" />
      </div>

      {/* Filters & Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search medicine, salt, or company..."
              style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }}
            />
          </div>
          {['All', 'Low Stock', 'Near Expiry', 'Expired', 'Out of Stock'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding: '8px 16px', border: filter === f ? 'none' : '1px solid #e5e7eb', borderRadius: 8, background: filter === f ? '#7c3aed' : '#fff', color: filter === f ? '#fff' : '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Stock Overview</p>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{filtered.length} items</span>
        </div>
        
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading inventory...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>No items found</div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: 600 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <Th c="Medicine" />
                <Th c="Salt / Generic" />
                <Th c="Company" />
                <Th c="Current Stock" />
                <Th c="Status" />
                <Th c="Rack Location" />
                <Th c="Next Expiry" />
                <Th c="Stock Value" />
                <Th c="Actions" />
              </tr></thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <Td style={{ fontWeight: 700, color: '#0c3b73' }}>{m.name}</Td>
                    <Td style={{ fontSize: 12, color: '#6b7280' }}>{m.salt || '—'}</Td>
                    <Td style={{ fontSize: 12, color: '#6b7280' }}>{m.company || '—'}</Td>
                    <Td style={{ fontWeight: 700, color: m.currentStock === 0 ? '#dc2626' : m.isLowStock ? '#f59e0b' : '#16a34a' }}>{m.currentStock}</Td>
                    <Td>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: m.currentStock===0?'#fee2e2':m.isLowStock?'#fef3c7':'#dcfce7', color: m.currentStock===0?'#dc2626':m.isLowStock?'#d97706':'#16a34a' }}>
                        {m.stockStatus}
                      </span>
                    </Td>
                    <Td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>
                      {m.rackLocationDisplay && m.rackLocationDisplay !== '—' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} />
                          {m.rackLocationDisplay}
                        </div>
                      ) : '—'}
                    </Td>
                    <Td style={{ fontSize: 12, color: m.isNearExpiry ? '#dc2626' : '#6b7280', fontWeight: m.isNearExpiry ? 700 : 400 }}>
                      {m.nextExpiry ? new Date(m.nextExpiry).toLocaleDateString('en-IN') : '—'}
                    </Td>
                    <Td style={{ fontWeight: 600 }}>₹{m.stockValue?.toFixed(2) || 0}</Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => navigate(`/franchise/medicines/${m._id}`)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#f3f4f6', color: '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                          title="View Details"
                        >
                          <Eye size={11} />
                        </button>
                        {m.rackLocation?.rackId && (
                          <button
                            onClick={() => open3DView(m)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#dbeafe', color: '#2563eb', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                            title="View in 3D Rack"
                          >
                            <Box size={11} />
                          </button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#fff', borderTop: '1px solid #e5e7eb', borderRadius: '0 0 12px 12px', marginTop: -12 }}>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => fetchInventory(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: currentPage === 1 ? '#f3f4f6' : '#fff', color: currentPage === 1 ? '#9ca3af' : '#374151', fontSize: 13, fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              ← Previous
            </button>
            
            {/* Page numbers */}
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchInventory(pageNum)}
                    style={{ 
                      padding: '6px 12px', 
                      border: currentPage === pageNum ? 'none' : '1px solid #e5e7eb', 
                      borderRadius: 6, 
                      background: currentPage === pageNum ? '#7c3aed' : '#fff', 
                      color: currentPage === pageNum ? '#fff' : '#374151', 
                      fontSize: 13, 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      minWidth: 36
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => fetchInventory(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: currentPage === totalPages ? '#f3f4f6' : '#fff', color: currentPage === totalPages ? '#9ca3af' : '#374151', fontSize: 13, fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* 3D Rack Modal */}
      <Rack3DModal
        visible={show3D}
        onClose={() => setShow3D(false)}
        rackData={rackData}
      />
    </div>
  )
}
