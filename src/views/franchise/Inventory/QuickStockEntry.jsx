/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Package, Calendar, IndianRupee, Hash, Percent, Save, Search, AlertCircle, CheckCircle } from 'lucide-react'
import { getRequest, postRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

export default function QuickStockEntry() {
  const navigate = useNavigate()
  const [medicines, setMedicines] = useState([])
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Stock entry form
  const [formData, setFormData] = useState({
    batchNo: '',
    quantity: '',
    mrp: '',
    ptr: '',
    purchasePrice: '',
    expiryDate: '',
    gst: '12',
    discountPercent: '0',
    supplier: '',
    invoiceNo: '',
    invoiceDate: '',
  })

  // Fetch medicines for autocomplete
  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await getRequest('/franchise/medicines?limit=500')
        const medList = res.data?.data?.medicines || []
        setMedicines(medList)
      } catch (err) {
        console.error('Error loading medicines:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Auto-fill medicine details when selected
  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine)
    if (medicine) {
      setFormData(prev => ({
        ...prev,
        mrp: medicine.mrp || '',
        ptr: medicine.ptr || '',
        purchasePrice: medicine.purchasePrice || '',
      }))
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateTotals = () => {
    const qty = parseFloat(formData.quantity) || 0
    const price = parseFloat(formData.purchasePrice) || 0
    const discount = parseFloat(formData.discountPercent) || 0
    const gst = parseFloat(formData.gst) || 0
    
    const grossAmount = qty * price
    const discountAmount = (grossAmount * discount) / 100
    const taxableAmount = grossAmount - discountAmount
    const gstAmount = (taxableAmount * gst) / 100
    const totalAmount = taxableAmount + gstAmount
    
    return {
      grossAmount: grossAmount.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxableAmount: taxableAmount.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    }
  }

  const totals = calculateTotals()

  const handleSubmit = async () => {
    // Validation
    if (!selectedMedicine) {
      toast.error('Please select a medicine')
      return
    }
    if (!formData.batchNo) {
      toast.error('Please enter batch number')
      return
    }
    if (!formData.quantity || formData.quantity <= 0) {
      toast.error('Please enter valid quantity')
      return
    }
    if (!formData.expiryDate) {
      toast.error('Please select expiry date')
      return
    }

    setSaving(true)
    try {
      // Add stock via stock adjustment API
      const res = await postRequest({
        url: '/franchise/inventory/adjustments',
        cred: {
          medicineId: selectedMedicine._id,
          medicineName: selectedMedicine.name,
          adjustmentType: 'stock_in',
          reason: 'Purchase Entry - Quick Stock Addition',
          batchDetails: {
            batchNo: formData.batchNo,
            quantity: parseInt(formData.quantity),
            mrp: parseFloat(formData.mrp),
            ptr: parseFloat(formData.ptr),
            purchasePrice: parseFloat(formData.purchasePrice),
            expiryDate: formData.expiryDate,
            gst: parseFloat(formData.gst),
            discount: parseFloat(formData.discountPercent),
          },
          supplier: formData.supplier,
          invoiceNo: formData.invoiceNo,
          invoiceDate: formData.invoiceDate,
          totalAmount: parseFloat(totals.totalAmount),
          notes: `Quick stock entry - Added ${formData.quantity} units of ${selectedMedicine.name}`,
        }
      })

      toast.success(`Stock added successfully! ${formData.quantity} units added to inventory`)
      
      // Reset form
      setSelectedMedicine(null)
      setFormData({
        batchNo: '',
        quantity: '',
        mrp: '',
        ptr: '',
        purchasePrice: '',
        expiryDate: '',
        gst: '12',
        discountPercent: '0',
        supplier: '',
        invoiceNo: '',
        invoiceDate: '',
      })
      
      // Optionally navigate to inventory
      setTimeout(() => {
        navigate('/franchise/inventory')
      }, 2000)
      
    } catch (err) {
      console.error('Error adding stock:', err)
      toast.error('Failed to add stock. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
        borderRadius: 16, 
        padding: '28px 32px',
        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 180, height: 180, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Plus size={28} color="#fff" />
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Quick Stock Entry</h1>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            Add stock quickly when medicine arrives or needs emergency entry
          </p>
        </div>
      </div>

      {/* Help Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
        border: '2px solid #3b82f6',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'start',
        gap: 12
      }}>
        <AlertCircle size={20} style={{ color: '#1e40af', marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 4 }}>
            💡 When to use Quick Stock Entry:
          </div>
          <div style={{ fontSize: 12, color: '#1e3a8a', lineHeight: 1.6 }}>
            • Medicine just arrived from supplier<br/>
            • Emergency stock addition needed<br/>
            • Sample/bonus stock received<br/>
            • Stock return to be re-added
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
        {/* Main Form */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px 28px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: '#374151' }}>
            Stock Entry Details
          </h3>

          {/* Medicine Selection */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              <Package size={14} style={{ display: 'inline', marginRight: 6 }} />
              Select Medicine *
            </label>
            <Autocomplete
              options={medicines}
              getOptionLabel={(option) => `${option.name} ${option.strength ? `(${option.strength})` : ''}`}
              value={selectedMedicine}
              onChange={(e, newValue) => handleMedicineSelect(newValue)}
              loading={loading}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder="Search medicine by name..."
                  variant="outlined"
                  size="small"
                />
              )}
              style={{ width: '100%' }}
            />
          </div>

          {selectedMedicine && (
            <>
              {/* Batch & Quantity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    <Hash size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    value={formData.batchNo}
                    onChange={(e) => handleInputChange('batchNo', e.target.value)}
                    placeholder="e.g., BT12345"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    <Package size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="Enter quantity"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    <IndianRupee size={14} style={{ display: 'inline', marginRight: 6 }} />
                    MRP
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.mrp}
                    onChange={(e) => handleInputChange('mrp', e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    PTR
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ptr}
                    onChange={(e) => handleInputChange('ptr', e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Purchase Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Expiry & GST */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    <Calendar size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Expiry Date *
                  </label>
                  <input
                    type="month"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    <Percent size={14} style={{ display: 'inline', marginRight: 6 }} />
                    GST %
                  </label>
                  <select
                    value={formData.gst}
                    onChange={(e) => handleInputChange('gst', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none',
                      background: '#fff',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Discount %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountPercent}
                    onChange={(e) => handleInputChange('discountPercent', e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Supplier Info (Optional) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
                    Supplier (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    placeholder="Supplier name"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 13,
                      outline: 'none',
                      background: '#f9fafb',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
                    Invoice No
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNo}
                    onChange={(e) => handleInputChange('invoiceNo', e.target.value)}
                    placeholder="INV-123"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 13,
                      outline: 'none',
                      background: '#f9fafb',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 13,
                      outline: 'none',
                      background: '#f9fafb',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Summary Sidebar */}
        <div style={{ position: 'sticky', top: 20 }}>
          {/* Calculation Summary */}
          <div style={{ 
            background: '#fff', 
            border: '1px solid #e5e7eb', 
            borderRadius: 12, 
            padding: '20px 24px',
            marginBottom: 16
          }}>
            <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 800, color: '#374151' }}>
              Amount Summary
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { l: 'Gross Amount', v: `₹ ${totals.grossAmount}`, color: '#6b7280' },
                { l: 'Discount', v: `- ₹ ${totals.discountAmount}`, color: '#16a34a' },
                { l: 'Taxable Amount', v: `₹ ${totals.taxableAmount}`, color: '#6b7280' },
                { l: 'GST Amount', v: `₹ ${totals.gstAmount}`, color: '#6b7280' },
              ].map(({ l, v, color }) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#6b7280' }}>{l}</span>
                  <span style={{ fontWeight: 600, color }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0 0', 
              marginTop: 12,
              borderTop: '2px solid #e5e7eb',
              fontSize: 16 
            }}>
              <span style={{ fontWeight: 800, color: '#374151' }}>Total Amount</span>
              <span style={{ fontWeight: 800, color: '#10b981' }}>₹ {totals.totalAmount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={handleSubmit}
              disabled={saving || !selectedMedicine}
              style={{
                padding: '14px',
                background: saving || !selectedMedicine 
                  ? '#d1d5db' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 800,
                cursor: saving || !selectedMedicine ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: saving || !selectedMedicine ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Add Stock to Inventory
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/franchise/inventory')}
              style={{
                padding: '12px',
                background: '#fff',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
