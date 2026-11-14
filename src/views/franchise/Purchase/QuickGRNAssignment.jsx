/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { AlertCircle, Save, Plus, Trash2, Check, X, Zap, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRequest, postRequest } from '../../../Helpers'

/**
 * QuickGRNAssignment Component
 * Workflow:
 * 1. Select PO → Click "Auto Create GRN" 
 * 2. Assignment screen opens → Manual counter/rack selection per medicine
 * 3. Assign all → Save to database
 */

function QuickGRNAssignment() {
  const [step, setStep] = useState(1)  // 1: PO Select, 2: Assignment
  const [poList, setPoList] = useState([])
  const [selectedPO, setSelectedPO] = useState(null)
  const [poLoading, setPoLoading] = useState(false)

  const [grn, setGRN] = useState(null)
  const [grnLoading, setGRNLoading] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [saving, setSaving] = useState(false)

  const [rackConfig, setRackConfig] = useState(null)

  // Step 1: Load POs
  useEffect(() => {
    const fetchPOs = async () => {
      setPoLoading(true)
      try {
        const [res1, res2] = await Promise.all([
          getRequest('/franchise/purchase/orders?status=pending&limit=100').catch(() => ({ data: { data: { orders: [] } } })),
          getRequest('/franchise/purchase/orders?status=partially_received&limit=100').catch(() => ({ data: { data: { orders: [] } } })),
        ])

        const pending = Array.isArray(res1?.data?.data?.orders) ? res1.data.data.orders : []
        const partial = Array.isArray(res2?.data?.data?.orders) ? res2.data.data.orders : []
        setPoList([...pending, ...partial])

        // Load rack config
        const configRes = await getRequest('/franchise/racks/rack-config').catch(() => null)
        setRackConfig(configRes?.data || null)
      } catch (err) {
        console.error('Failed to load POs:', err)
        toast.error('Failed to load data')
      } finally {
        setPoLoading(false)
      }
    }

    fetchPOs()
  }, [])

  // Handle: Auto Create GRN
  const handleQuickCreateGRN = async () => {
    if (!selectedPO?._id) {
      toast.error('Select a PO first')
      return
    }

    setGRNLoading(true)
    try {
      const res = await postRequest({
        url: '/franchise/purchase/grn/quick-create',
        cred: { poId: selectedPO._id },
      })

      const newGRN = res?.data?.data
      setGRN(newGRN)

      // Initialize assignments array
      const newAssignments = (newGRN.itemCount || 0) > 0
        ? Array.from({ length: newGRN.itemCount }, (_, i) => ({
            itemIndex: i,
            medicineId: '',
            batchNo: '',
            expiryDate: '',
            counterId: 'Counter-1',
            rackId: 'RACK-A',
            shelf: 1,
            row: 'A',
            column: 1,
          }))
        : []

      setAssignments(newAssignments)
      setStep(2)
      toast.success(`✓ GRN ${newGRN.grnNo} created with ${newGRN.itemCount} items`)
    } catch (err) {
      toast.error(err?.message || 'Failed to create GRN')
    } finally {
      setGRNLoading(false)
    }
  }

  // Handle: Update assignment field
  const updateAssignment = (index, field, value) => {
    setAssignments((prev) =>
      prev.map((a, i) =>
        i === index ? { ...a, [field]: value } : a
      )
    )
  }

  // Handle: Save all assignments
  const handleSaveAssignments = async () => {
    // Validate all assignments filled
    const incomplete = assignments.some((a) => !a.batchNo || !a.expiryDate)
    if (incomplete) {
      toast.error('❌ All batch numbers and expiry dates are required')
      return
    }

    setSaving(true)
    try {
      const res = await postRequest({
        url: `/franchise/purchase/grn/${grn._id}/assign-all`,
        cred: { assignments },
      })

      toast.success(`✓ ${res?.data?.data?.assignedCount || 0} medicines assigned`)
      setStep(1)
      setSelectedPO(null)
      setGRN(null)
      setAssignments([])
    } catch (err) {
      toast.error(err?.message || 'Failed to save assignments')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* STEP 1: PO Selection */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Quick GRN Creation</h2>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Fast workflow:</strong> Select PO → Auto create GRN → Manually assign counter/rack → Done
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Purchase Order *
            </label>
            <select
              value={selectedPO?._id || ''}
              onChange={(e) => {
                const po = poList.find((p) => p._id === e.target.value)
                setSelectedPO(po)
              }}
              disabled={poLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer"
            >
              <option value="">
                {poLoading ? 'Loading POs...' : 'Select a PO to auto-create GRN'}
              </option>
              {poList.map((po) => (
                <option key={po._id} value={po._id}>
                  {po.poNo} - {po.supplier} ({po.items?.length || 0} items) [{po.status}]
                </option>
              ))}
            </select>

            {poList.length === 0 && !poLoading && (
              <p className="text-xs text-red-600 mt-2">
                No pending or partial POs found. Create a PO first.
              </p>
            )}
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={() => {
                setStep(1)
                setSelectedPO(null)
              }}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleQuickCreateGRN}
              disabled={!selectedPO || grnLoading}
              className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg text-sm font-bold hover:bg-yellow-600 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Zap size={16} />
              {grnLoading ? 'Creating...' : 'Auto Create GRN'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Manual Assignment */}
      {step === 2 && grn && (
        <div className="space-y-4">
          {/* GRN Header */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm border border-yellow-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">GRN #{grn.grnNo}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {grn.itemCount} medicines to assign • Status: {grn.status}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Auto-Assignment Strategy</p>
                <p className="text-sm font-bold text-gray-900">
                  {rackConfig?.autoAssignStrategy?.toUpperCase() || 'ROUND-ROBIN'}
                </p>
              </div>
            </div>
          </div>

          {/* Items Assignment Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Medicine</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Batch *</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Expiry *</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Counter *</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Rack *</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Position *</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assign, idx) => {
                    const isComplete = assign.batchNo && assign.expiryDate
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-gray-100 ${
                          !isComplete ? 'bg-red-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-xs font-semibold text-gray-600">#{idx + 1}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-gray-900">
                          {selectedPO?.items?.[idx]?.medicineName || 'Medicine'}
                        </td>

                        {/* Batch */}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={assign.batchNo}
                            onChange={(e) => updateAssignment(idx, 'batchNo', e.target.value)}
                            placeholder="B001"
                            className={`w-20 px-2 py-1.5 border rounded text-xs focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                              !assign.batchNo ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                        </td>

                        {/* Expiry */}
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            value={assign.expiryDate}
                            onChange={(e) => updateAssignment(idx, 'expiryDate', e.target.value)}
                            className={`w-28 px-2 py-1.5 border rounded text-xs focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                              !assign.expiryDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                        </td>

                        {/* Counter */}
                        <td className="px-4 py-3">
                          <select
                            value={assign.counterId}
                            onChange={(e) => updateAssignment(idx, 'counterId', e.target.value)}
                            className="w-24 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-yellow-400 focus:border-transparent cursor-pointer"
                          >
                            {(rackConfig?.counters || []).map((c) => (
                              <option key={c.counterId} value={c.counterId}>
                                {c.counterId}
                              </option>
                            ))}
                            <option value="Counter-1">Counter-1</option>
                          </select>
                        </td>

                        {/* Rack */}
                        <td className="px-4 py-3">
                          <select
                            value={assign.rackId}
                            onChange={(e) => updateAssignment(idx, 'rackId', e.target.value)}
                            className="w-20 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-yellow-400 focus:border-transparent cursor-pointer"
                          >
                            <option value="RACK-A">RACK-A</option>
                            <option value="RACK-B">RACK-B</option>
                            <option value="RACK-C">RACK-C</option>
                            <option value="RACK-D">RACK-D</option>
                            <option value="RACK-E">RACK-E</option>
                          </select>
                        </td>

                        {/* Position Preview */}
                        <td className="px-4 py-3">
                          <div className="text-xs font-mono bg-gray-100 px-2 py-1.5 rounded">
                            {assign.counterId}>{assign.rackId}>{assign.shelf}-{assign.row}-{assign.column}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          {isComplete ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
              * Required fields. Fill batch and expiry for all medicines.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setStep(1)
                setGRN(null)
                setAssignments([])
              }}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAssignments}
              disabled={saving}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save All Assignments'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickGRNAssignment
