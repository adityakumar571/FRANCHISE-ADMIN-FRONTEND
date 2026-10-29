/* eslint-disable prettier/prettier */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Package,
  Calendar,
  IndianRupee,
  Hash,
  Percent,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
  ArrowLeft,
  Receipt,
  Truck,
  FileText,
  Calculator,
} from 'lucide-react'
import { getRequest, postRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

const initialFormData = {
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
}

const inputClass =
  'w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-100'

const labelClass = 'mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700'

const SectionHeading = ({ icon: Icon, title, description }) => (
  <div className="mb-5 flex items-start gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
      <Icon size={19} />
    </div>
    <div className="min-w-0">
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
      {description && <p className="mt-1 text-sm leading-5 text-gray-500">{description}</p>}
    </div>
  </div>
)

const FormField = ({ label, icon: Icon, children, optional = false }) => (
  <div className="min-w-0">
    <label className={labelClass}>
      {Icon && <Icon size={15} className="shrink-0 text-gray-500" />}
      <span>{label}</span>
      {optional && <span className="font-normal text-gray-400">(Optional)</span>}
    </label>
    {children}
  </div>
)

export default function QuickStockEntry() {
  const navigate = useNavigate()

  const [medicines, setMedicines] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [loading, setLoading] = useState(false)
  const [suppliersLoading, setSuppliersLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(initialFormData)

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      setLoading(true)

      try {
        const [medsRes, suppRes] = await Promise.all([
          getRequest('/franchise/medicines?limit=500'),
          getRequest('/franchise-suppliers/suppliers')
        ])
        
        const medList = medsRes.data?.data?.medicines || []
        const suppList = suppRes.data?.data || []

        if (mounted) {
          setMedicines(medList)
          setSuppliers(suppList)
        }
      } catch (err) {
        console.error('Error loading data:', err)
        if (mounted) {
          toast.error('Failed to load medicines or suppliers')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [])

  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine)

    if (medicine) {
      setFormData((prev) => ({
        ...prev,
        mrp: medicine.mrp ?? '',
        ptr: medicine.ptr ?? '',
        purchasePrice: medicine.purchasePrice ?? '',
      }))
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateTotals = () => {
    const qty = Math.max(0, Number(formData.quantity) || 0)
    const price = Math.max(0, Number(formData.purchasePrice) || 0)
    const discount = Math.min(100, Math.max(0, Number(formData.discountPercent) || 0))
    const gst = Math.max(0, Number(formData.gst) || 0)

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

  const formatCurrency = (value) =>
    `₹ ${Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const handleSubmit = async () => {
    if (!selectedMedicine) {
      toast.error('Please select a medicine')
      return
    }

    if (!formData.batchNo.trim()) {
      toast.error('Please enter batch number')
      return
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      toast.error('Please enter valid quantity')
      return
    }

    if (!Number.isInteger(Number(formData.quantity))) {
      toast.error('Quantity must be a whole number')
      return
    }

    if (!formData.purchasePrice || Number(formData.purchasePrice) < 0) {
      toast.error('Please enter a valid purchase price')
      return
    }

    if (!formData.expiryDate) {
      toast.error('Please select expiry date')
      return
    }

    if (Number(formData.discountPercent) < 0 || Number(formData.discountPercent) > 100) {
      toast.error('Discount must be between 0 and 100')
      return
    }

    setSaving(true)

    try {
      // Find selected supplier details
      const selectedSupplier = suppliers.find(s => s._id === formData.supplier);
      const supplierName = selectedSupplier?.companyName || selectedSupplier?.name || 'Manual Entry';

      // QuickStockEntry should create GRN instead of using inventory/adjustments
      // This ensures batch is properly stored in Medicine.batches[]
      const res = await postRequest({
        url: '/franchise/purchase/grn',
        cred: {
          supplierId: formData.supplier || 'manual',
          supplier: supplierName,
          poRef: '',
          invoiceNo: formData.invoiceNo || `QUICK-${Date.now()}`,
          invoiceDate: formData.invoiceDate || new Date().toISOString().split('T')[0],
          items: [{
            medicineId: selectedMedicine._id,
            medicineName: selectedMedicine.name,
            batchNo: formData.batchNo.trim(),
            expiry: formData.expiryDate,
            qty: parseInt(formData.quantity, 10),
            freeQty: 0,
            ptr: Number(formData.ptr) || 0,
            mrp: Number(formData.mrp) || 0,
          }],
        },
      })

      toast.success(`Stock added successfully! ${formData.quantity} units added to inventory`)

      setSelectedMedicine(null)
      setFormData({ ...initialFormData })

      setTimeout(() => {
        navigate('/franchise/inventory')
      }, 2000)
    } catch (err) {
      console.error('Error adding stock:', err)
      toast.error(err?.response?.data?.message || 'Failed to add stock. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const summaryItems = [
    {
      label: 'Gross Amount',
      value: totals.grossAmount,
      color: 'text-gray-700',
    },
    {
      label: 'Discount',
      value: totals.discountAmount,
      color: 'text-emerald-600',
      prefix: '- ',
    },
    {
      label: 'Taxable Amount',
      value: totals.taxableAmount,
      color: 'text-gray-700',
    },
    {
      label: 'GST Amount',
      value: totals.gstAmount,
      color: 'text-gray-700',
    },
  ]

  return (
    <div className="flex min-w-0 flex-col gap-5 pb-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 shadow-lg shadow-emerald-900/10 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
              <Plus size={27} />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white sm:text-2xl">Quick Stock Entry</h1>
              <p className="mt-1 max-w-xl text-sm leading-6 text-emerald-50">
                Add medicines to your inventory quickly when new stock arrives.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/franchise/inventory')}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 sm:self-center"
          >
            <ArrowLeft size={16} />
            Back to Inventory
          </button>
        </div>
      </div>

      {/* Help Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
          <AlertCircle size={19} />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-blue-900">When to use Quick Stock Entry</h2>
          <p className="mt-1 text-sm leading-6 text-blue-800">
            Use this form when medicine arrives from a supplier, emergency stock needs to be added,
            sample stock is received, or returned stock needs to be re-added.
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main Form */}
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <SectionHeading
            icon={Package}
            title="Stock Entry Details"
            description="Select a medicine and enter its stock, pricing and purchase details."
          />

          <div className="space-y-6">
            {/* Medicine Selection */}
            <div>
              <FormField label="Select Medicine" icon={Package}>
                <Autocomplete
                  options={medicines}
                  getOptionLabel={(option) =>
                    `${option.name || ''}${option.strength ? ` (${option.strength})` : ''}`
                  }
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  value={selectedMedicine}
                  onChange={(_, newValue) => handleMedicineSelect(newValue)}
                  loading={loading}
                  fullWidth
                  size="small"
                  noOptionsText={loading ? 'Loading medicines...' : 'No medicines found'}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search medicine by name..."
                      variant="outlined"
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        className: 'rounded-lg bg-white text-sm',
                      }}
                    />
                  )}
                  slotProps={{
                    paper: {
                      sx: {
                        '& .MuiAutocomplete-option': {
                          fontSize: '14px',
                          py: 1,
                        },
                      },
                    },
                  }}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Search and select the medicine you want to add.
                </p>
              </FormField>
            </div>

            {selectedMedicine && (
              <>
                {/* Selected Medicine */}
                <div className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <Package size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold text-gray-800">
                        {selectedMedicine.name}
                      </p>
                      {selectedMedicine.strength && (
                        <p className="mt-1 text-xs text-gray-600">
                          Strength: {selectedMedicine.strength}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Medicine Selected
                  </span>
                </div>

                {/* Batch and Quantity */}
                <section>
                  <SectionHeading
                    icon={Hash}
                    title="Batch & Quantity"
                    description="Enter the batch identification and the quantity received."
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Batch Number" icon={Hash}>
                      <input
                        type="text"
                        value={formData.batchNo}
                        onChange={(e) => handleInputChange('batchNo', e.target.value)}
                        placeholder="e.g. BT12345"
                        className={inputClass}
                        required
                      />
                    </FormField>

                    <FormField label="Quantity" icon={Package}>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        placeholder="Enter quantity"
                        className={inputClass}
                        required
                      />
                    </FormField>
                  </div>
                </section>

                {/* Pricing */}
                <section>
                  <SectionHeading
                    icon={IndianRupee}
                    title="Pricing Details"
                    description="Enter the medicine prices. Existing medicine prices are filled automatically when available."
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField label="MRP" icon={IndianRupee}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.mrp}
                        onChange={(e) => handleInputChange('mrp', e.target.value)}
                        placeholder="0.00"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="PTR" icon={IndianRupee}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.ptr}
                        onChange={(e) => handleInputChange('ptr', e.target.value)}
                        placeholder="0.00"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Purchase Price" icon={IndianRupee}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.purchasePrice}
                        onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                        placeholder="0.00"
                        className={inputClass}
                        required
                      />
                    </FormField>
                  </div>
                </section>

                {/* Expiry, GST and Discount */}
                <section>
                  <SectionHeading
                    icon={Calendar}
                    title="Expiry, GST & Discount"
                    description="Set the expiry month and applicable tax and discount percentages."
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField label="Expiry Date" icon={Calendar}>
                      <input
                        type="month"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        className={inputClass}
                        required
                      />
                    </FormField>

                    <FormField label="GST Rate" icon={Percent}>
                      <select
                        value={formData.gst}
                        onChange={(e) => handleInputChange('gst', e.target.value)}
                        className={inputClass}
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </FormField>

                    <FormField label="Discount" icon={Percent}>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={formData.discountPercent}
                          onChange={(e) => handleInputChange('discountPercent', e.target.value)}
                          placeholder="0"
                          className={`${inputClass} pr-9`}
                        />
                        <Percent
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>
                    </FormField>
                  </div>
                </section>

                {/* Supplier and Invoice */}
                <section>
                  <SectionHeading
                    icon={Truck}
                    title="Supplier & Invoice Details"
                    description="These fields are optional and can be completed using your purchase invoice."
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField label="Supplier" icon={Truck} optional>
                      <select
                        value={formData.supplier}
                        onChange={(e) => handleInputChange('supplier', e.target.value)}
                        className={inputClass}
                      >
                        <option value="">— Select Supplier —</option>
                        {suppliers.map((sup) => (
                          <option key={sup._id} value={sup._id}>
                            {sup.companyName || sup.name || 'Unknown Supplier'}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Invoice Number" icon={Receipt} optional>
                      <input
                        type="text"
                        value={formData.invoiceNo}
                        onChange={(e) => handleInputChange('invoiceNo', e.target.value)}
                        placeholder="e.g. INV-123"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Invoice Date" icon={Calendar} optional>
                      <input
                        type="date"
                        value={formData.invoiceDate}
                        onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                        className={inputClass}
                      />
                    </FormField>
                  </div>
                </section>
              </>
            )}

            {!selectedMedicine && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Package size={24} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-gray-700">
                  Select a medicine to continue
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-500">
                  Once you select a medicine, the batch, quantity, pricing, expiry and invoice
                  fields will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Sidebar */}
        <aside className="min-w-0 space-y-4 xl:sticky xl:top-5">
          {/* Amount Summary */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Calculator size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">Amount Summary</h3>
                <p className="mt-0.5 text-xs text-gray-500">Live purchase calculation</p>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-500">Quantity</span>
                <span className="text-sm font-semibold text-gray-800">
                  {Number(formData.quantity) || 0} units
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-500">Purchase Price</span>
                <span className="text-sm font-semibold text-gray-800">
                  {formatCurrency(Number(formData.purchasePrice) || 0)}
                </span>
              </div>

              <div className="border-t border-dashed border-gray-200" />

              {summaryItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className={`shrink-0 text-right text-sm font-semibold ${item.color}`}>
                    {item.prefix || ''}
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}

              <div className="mt-2 rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Total Amount
                </p>
                <p className="mt-1 break-words text-2xl font-extrabold text-emerald-700">
                  {formatCurrency(totals.totalAmount)}
                </p>
                <p className="mt-1 text-xs text-emerald-700/80">Including discount and GST</p>
              </div>

              {!selectedMedicine && (
                <p className="text-xs leading-5 text-gray-400">
                  Select a medicine and enter quantity and purchase price to calculate the purchase
                  amount.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || loading || !selectedMedicine}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:bg-none disabled:bg-gray-300 disabled:shadow-none"
            >
              {saving ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Saving Stock...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Add Stock to Inventory
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/franchise/inventory')}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              Cancel
            </button>

            <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
              <FileText size={16} className="mt-0.5 shrink-0 text-gray-400" />
              <p className="text-xs leading-5 text-gray-500">
                Verify the batch number, expiry, quantity and purchase amount before submitting the
                stock entry.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
