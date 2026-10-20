/* eslint-disable prettier/prettier */
/**
 * BulkBarcodePrint - Print Multiple Barcode Labels at Once
 * Production-level batch printing for inventory labeling
 */
import { useState, useEffect, useRef } from 'react'
import { Printer, Grid, Search, CheckSquare, Square } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import Barcode from 'react-barcode'

export default function BulkBarcodePrint() {
  const [medicines, setMedicines] = useState([])
  const [selectedMedicines, setSelectedMedicines] = useState(new Set())
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [labelSize, setLabelSize] = useState('medium')
  const printRef = useRef()

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    setLoading(true)
    try {
      const res = await getRequest('/franchise/medicines?limit=100')
      setMedicines(res.data?.data?.medicines || [])
    } catch (err) {
      toast.error('Failed to load medicines')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedMedicines)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedMedicines(newSelected)
  }

  const selectAll = () => {
    const filtered = medicines.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase())
    )
    setSelectedMedicines(new Set(filtered.map(m => m._id)))
  }

  const clearAll = () => {
    setSelectedMedicines(new Set())
  }

  const handlePrint = () => {
    if (selectedMedicines.size === 0) {
      toast.error('Please select at least one medicine')
      return
    }

    const printWindow = window.open('', '', 'height=600,width=800')
    printWindow.document.write('<html><head><title>Print Barcode Labels</title>')
    printWindow.document.write('<style>')
    printWindow.document.write(`
      @media print {
        @page { margin: 5mm; }
        body { margin: 0; padding: 0; }
      }
      body { font-family: Arial, sans-serif; }
      .label-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 5mm;
        padding: 5mm;
      }
      .label {
        width: 50mm;
        height: 30mm;
        border: 1px solid #ddd;
        padding: 2mm;
        page-break-inside: avoid;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .label-title {
        font-size: 11px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 2px;
      }
      .label-info {
        font-size: 9px;
        text-align: center;
        color: #666;
      }
      .label-price {
        font-size: 10px;
        font-weight: bold;
        text-align: center;
        color: #0c3b73;
        margin-top: 2px;
      }
    `)
    printWindow.document.write('</style></head><body>')
    printWindow.document.write('<div class="label-grid">')
    
    selectedMedicines.forEach(id => {
      const medicine = medicines.find(m => m._id === id)
      if (medicine) {
        printWindow.document.write(`
          <div class="label">
            <div class="label-title">${medicine.name}</div>
            <div class="label-info">${medicine.company || ''}</div>
            <div style="display:flex;justify-content:center;margin:2px 0;">
              <svg id="barcode-${medicine._id}"></svg>
            </div>
            <div class="label-price">MRP: ₹${medicine.mrp}</div>
          </div>
        `)
      }
    })
    
    printWindow.document.write('</div>')
    
    // Add JsBarcode library
    printWindow.document.write('<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>')
    printWindow.document.write('<script>')
    printWindow.document.write(`
      window.onload = function() {
        ${Array.from(selectedMedicines).map(id => {
          const medicine = medicines.find(m => m._id === id)
          if (medicine && medicine.barcode) {
            return `JsBarcode("#barcode-${medicine._id}", "${medicine.barcode}", {
              format: "CODE128",
              width: 1.5,
              height: 40,
              fontSize: 12,
              margin: 0
            });`
          }
          return ''
        }).join('\n')}
        setTimeout(function() {
          window.print();
        }, 500);
      }
    `)
    printWindow.document.write('</script>')
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    
    toast.success(`${selectedMedicines.size} labels sent to printer`)
  }

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.salt?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader
        icon={Grid}
        title="Bulk Barcode Printing"
        subtitle={`Print multiple barcode labels at once`}
        color="#7c3aed"
      >
        <button
          onClick={selectAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 12,
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          <CheckSquare size={14} /> Select All
        </button>
        <button
          onClick={clearAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 12,
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          <Square size={14} /> Clear All
        </button>
        <button
          onClick={handlePrint}
          disabled={selectedMedicines.size === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            background: selectedMedicines.size === 0 ? '#e5e7eb' : '#7c3aed',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            cursor: selectedMedicines.size === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <Printer size={14} /> Print {selectedMedicines.size} Label{selectedMedicines.size !== 1 ? 's' : ''}
        </button>
      </PageHeader>

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicines by name or salt..."
            style={{
              width: '100%',
              padding: '9px 10px 9px 32px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 13,
              outline: 'none',
              background: '#f9fafb',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Medicine Grid */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px' }}>
        <div style={{ marginBottom: 16, fontSize: 13, color: '#6b7280' }}>
          {selectedMedicines.size} of {filteredMedicines.length} selected
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading medicines...</div>
        ) : filteredMedicines.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No medicines found</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {filteredMedicines.map((medicine) => {
              const isSelected = selectedMedicines.has(medicine._id)
              return (
                <div
                  key={medicine._id}
                  onClick={() => toggleSelection(medicine._id)}
                  style={{
                    background: isSelected ? '#eff6ff' : '#fff',
                    border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: 8,
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => !isSelected && (e.currentTarget.style.borderColor = '#d1d5db')}
                  onMouseLeave={e => !isSelected && (e.currentTarget.style.borderColor = '#e5e7eb')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      border: `2px solid ${isSelected ? '#3b82f6' : '#d1d5db'}`,
                      background: isSelected ? '#3b82f6' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
                        {medicine.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                        {medicine.salt}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                        <span style={{ color: '#0c3b73', fontWeight: 600 }}>₹{medicine.mrp}</span>
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>Stock: {medicine.stock || 0}</span>
                      </div>
                      {medicine.barcode && (
                        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, fontFamily: 'monospace' }}>
                          {medicine.barcode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
