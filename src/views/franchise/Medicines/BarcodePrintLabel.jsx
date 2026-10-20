/* eslint-disable prettier/prettier */
/**
 * BarcodePrintLabel - Production-Level Barcode Label Printing
 * Supports CODE128, EAN13, and thermal printer formats
 */
import { useState, useEffect, useRef } from 'react'
import { Printer, Download, Eye, Settings, Grid, Package } from 'lucide-react'
import { useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { getRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import Barcode from 'react-barcode'

// Label size presets (in mm)
const LABEL_SIZES = {
  small: { width: 40, height: 20, name: '40mm × 20mm (Shelf Label)' },
  medium: { width: 50, height: 30, name: '50mm × 30mm (Product Label)' },
  large: { width: 70, height: 40, name: '70mm × 40mm (Detailed Label)' },
  thermal: { width: 57, height: 40, name: '57mm × 40mm (Thermal Printer)' },
}

// Barcode formats
const BARCODE_FORMATS = {
  CODE128: { name: 'CODE128 (Recommended)', value: 'CODE128' },
  EAN13: { name: 'EAN13 (13 digits)', value: 'EAN13' },
  CODE39: { name: 'CODE39', value: 'CODE39' },
}

export default function BarcodePrintLabel() {
  const { id } = useParams()
  const [medicine, setMedicine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [labelSize, setLabelSize] = useState('medium')
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128')
  const [copies, setCopies] = useState(1)
  const [showInfo, setShowInfo] = useState(true)
  const [showPrice, setShowPrice] = useState(true)
  const [showExpiry, setShowExpiry] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const printRef = useRef()

  useEffect(() => {
    fetchMedicine()
  }, [id])

  const fetchMedicine = async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/franchise/medicines/${id}`)
      const data = res.data?.data
      setMedicine(data)
      if (data?.batches?.length > 0) {
        setSelectedBatch(data.batches[0])
      }
    } catch (err) {
      toast.error('Failed to load medicine')
    } finally {
      setLoading(false)
    }
  }

  const generateEAN13 = (barcode) => {
    // Convert to 13 digits for EAN13
    const base = barcode.replace(/[^0-9]/g, '').substring(0, 12)
    const padded = base.padEnd(12, '0')
    
    // Calculate check digit
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += parseInt(padded[i]) * (i % 2 === 0 ? 1 : 3)
    }
    const checkDigit = (10 - (sum % 10)) % 10
    
    return padded + checkDigit
  }

  const getBarcodeValue = () => {
    if (!medicine?.barcode) return '0000000000000'
    
    if (barcodeFormat === 'EAN13') {
      return generateEAN13(medicine.barcode)
    }
    
    return medicine.barcode
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800')
    printWindow.document.write('<html><head><title>Print Barcode Labels</title>')
    printWindow.document.write('<style>')
    printWindow.document.write(`
      @media print {
        @page { margin: 0; size: ${LABEL_SIZES[labelSize].width}mm ${LABEL_SIZES[labelSize].height}mm; }
        body { margin: 0; padding: 0; }
        .no-print { display: none !important; }
      }
      body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
      .label-container { page-break-after: always; }
    `)
    printWindow.document.write('</style></head><body>')
    
    // Print multiple copies
    for (let i = 0; i < copies; i++) {
      printWindow.document.write(printRef.current.innerHTML)
    }
    
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
      toast.success(`${copies} label(s) sent to printer`)
    }, 250)
  }

  const handleDownloadPDF = () => {
    // For now, trigger print and user can save as PDF
    toast.info('Use "Save as PDF" in print dialog')
    handlePrint()
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#9ca3af' }}>Loading medicine details...</div>
      </div>
    )
  }

  if (!medicine) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#dc2626' }}>Medicine not found</div>
      </div>
    )
  }

  const size = LABEL_SIZES[labelSize]
  const mmToPx = 3.7795275591 // 1mm = 3.78px at 96 DPI

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader
        icon={Package}
        title="Print Barcode Label"
        subtitle={`Generate printable labels for ${medicine.name}`}
        color="#0c3b73"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 18 }}>
        {/* Preview Section */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px', minHeight: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Eye size={18} color="#0c3b73" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Label Preview</h3>
            <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 'auto' }}>
              {size.width}mm × {size.height}mm
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
            background: '#f9fafb',
            borderRadius: 8,
            padding: 20,
          }}>
            {/* Actual Label Preview */}
            <div
              ref={printRef}
              className="label-container"
              style={{
                width: size.width * mmToPx,
                height: size.height * mmToPx,
                background: '#fff',
                border: '2px dashed #d1d5db',
                borderRadius: 4,
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              {/* Medicine Info */}
              {showInfo && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: labelSize === 'small' ? 9 : labelSize === 'medium' ? 11 : 13,
                    fontWeight: 700,
                    color: '#111827',
                    marginBottom: 2,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {medicine.name}
                  </div>
                  {labelSize !== 'small' && (
                    <div style={{
                      fontSize: labelSize === 'medium' ? 8 : 9,
                      color: '#6b7280',
                      lineHeight: 1.2,
                    }}>
                      {medicine.company}
                    </div>
                  )}
                </div>
              )}

              {/* Barcode */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <Barcode
                  value={getBarcodeValue()}
                  format={barcodeFormat}
                  width={labelSize === 'small' ? 1 : labelSize === 'medium' ? 1.5 : 2}
                  height={labelSize === 'small' ? 30 : labelSize === 'medium' ? 40 : 50}
                  fontSize={labelSize === 'small' ? 10 : labelSize === 'medium' ? 12 : 14}
                  margin={0}
                  displayValue={true}
                />
              </div>

              {/* Additional Info */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: labelSize === 'small' ? 7 : labelSize === 'medium' ? 9 : 11,
                marginTop: 4,
              }}>
                {showPrice && (
                  <div style={{ fontWeight: 700, color: '#0c3b73' }}>
                    MRP: ₹{medicine.mrp}
                  </div>
                )}
                {showExpiry && selectedBatch?.expiryDate && (
                  <div style={{ color: '#dc2626', fontSize: labelSize === 'small' ? 7 : 8 }}>
                    Exp: {new Date(selectedBatch.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: '2-digit' })}
                  </div>
                )}
              </div>

              {labelSize === 'large' && (
                <div style={{
                  fontSize: 8,
                  color: '#9ca3af',
                  marginTop: 4,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span>{medicine.rackLocation?.position || 'No Location'}</span>
                  <span>{selectedBatch?.batchNo || ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Medicine Info Card */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 12px 0' }}>Medicine Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Name:</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>{medicine.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>MRP:</span>
                <span style={{ fontWeight: 600, color: '#0c3b73' }}>₹{medicine.mrp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Stock:</span>
                <span style={{ fontWeight: 600, color: '#16a34a' }}>{medicine.currentStock}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Location:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#0c3b73', fontSize: 11 }}>
                  {medicine.rackLocation?.position || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Label Settings */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Settings size={16} color="#0c3b73" />
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Label Settings</h4>
            </div>

            {/* Label Size */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 6, display: 'block' }}>
                Label Size
              </label>
              <select
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 12,
                  outline: 'none',
                }}
              >
                {Object.entries(LABEL_SIZES).map(([key, size]) => (
                  <option key={key} value={key}>{size.name}</option>
                ))}
              </select>
            </div>

            {/* Barcode Format */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 6, display: 'block' }}>
                Barcode Format
              </label>
              <select
                value={barcodeFormat}
                onChange={(e) => setBarcodeFormat(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 12,
                  outline: 'none',
                }}
              >
                {Object.entries(BARCODE_FORMATS).map(([key, format]) => (
                  <option key={key} value={format.value}>{format.name}</option>
                ))}
              </select>
            </div>

            {/* Batch Selection */}
            {medicine.batches?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 6, display: 'block' }}>
                  Batch (for expiry)
                </label>
                <select
                  value={selectedBatch?.batchNo || ''}
                  onChange={(e) => {
                    const batch = medicine.batches.find(b => b.batchNo === e.target.value)
                    setSelectedBatch(batch)
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 12,
                    outline: 'none',
                  }}
                >
                  {medicine.batches.map((batch, idx) => (
                    <option key={idx} value={batch.batchNo}>
                      {batch.batchNo} - Exp: {new Date(batch.expiryDate).toLocaleDateString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Number of Copies */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 6, display: 'block' }}>
                Number of Copies
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>

            {/* Toggle Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showInfo}
                  onChange={(e) => setShowInfo(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <span>Show Medicine Name</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <span>Show MRP</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showExpiry}
                  onChange={(e) => setShowExpiry(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <span>Show Expiry Date</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 20px',
                background: '#0c3b73',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <Printer size={16} />
              Print {copies} Label{copies > 1 ? 's' : ''}
            </button>

            <button
              onClick={handleDownloadPDF}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 20px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                color: '#374151',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <Download size={16} />
              Save as PDF
            </button>
          </div>

          {/* Tips */}
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '12px', marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 6 }}>💡 Printing Tips</div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#78350f', lineHeight: 1.6 }}>
              <li>Use thermal printer for best results</li>
              <li>Set margins to 0 in print settings</li>
              <li>Choose correct paper size</li>
              <li>Test print one label first</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
