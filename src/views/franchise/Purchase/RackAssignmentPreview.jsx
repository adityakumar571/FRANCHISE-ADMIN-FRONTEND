/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { X, Edit2, Save, ChevronDown, ChevronUp, AlertCircle, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRequest } from '../../../Helpers'

/**
 * RackAssignmentPreview Component
 * Shows where each medicine will be assigned before GRN submission
 * Allows manual override of positions
 */
function RackAssignmentPreview({ items = [], rackConfig = null, onClose, onUpdateAssignments }) {
  const [assignments, setAssignments] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Generate assignments based on strategy
  useEffect(() => {
    generateAssignments()
  }, [items, rackConfig])

  const generateAssignments = async () => {
    try {
      setLoading(true)
      
      // Fetch rack config if not provided
      let config = rackConfig
      if (!config) {
        const res = await getRequest('/franchise/racks/rack-config')
        config = res?.data || getDefaultConfig()
      }

      // Generate positions for each item
      const generated = items.map((item, idx) => {
        if (!item.medicineName || !item.grnReceivedQty || item.grnReceivedQty <= 0) {
          return null
        }

        const position = generatePosition(config, idx, item.category)
        return {
          uid: item.uid || idx,
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          category: item.category,
          qty: item.grnReceivedQty,
          batchNo: item.batchNo,
          ...position,
        }
      }).filter(Boolean)

      setAssignments(generated)
      onUpdateAssignments?.(generated)
    } catch (err) {
      console.error('Failed to generate assignments:', err)
      toast.error('Failed to load rack configuration')
    } finally {
      setLoading(false)
    }
  }

  const generatePosition = (config, index, category) => {
    const strategy = config?.autoAssignStrategy || 'round-robin'
    const counter = config?.counters?.[0] || getDefaultCounter()

    let shelf = 1, row = 'A', column = 1

    if (strategy === 'round-robin') {
      // Column → Row → Shelf progression
      const colCount = counter.colCount || 20
      const rowCount = counter.rowCount || 5
      const shelfCount = counter.shelfCount || 10

      column = (index % colCount) + 1
      row = String.fromCharCode(65 + Math.floor((index / colCount) % rowCount))
      shelf = Math.floor(index / (colCount * rowCount)) + 1

      if (shelf > shelfCount) shelf = shelfCount
    } else if (strategy === 'category-based') {
      // Use category to determine rack
      const categoryMap = {
        'Antibiotics': 1,
        'Pain Relief': 2,
        'Cardiac': 3,
        'Vitamins': 4,
      }
      shelf = categoryMap[category] || 1
      column = (index % 20) + 1
      row = String.fromCharCode(65 + Math.floor((index / 20) % 5))
    }

    const counterId = counter.counterId || 'Counter-1'
    const rackId = counter.defaultRackId || 'RACK-A'
    const position = `${counterId}>${rackId}>${shelf}-${row}-${column}`

    return { counterId, rackId, shelf, row, column, position }
  }

  const getDefaultConfig = () => ({
    autoAssignStrategy: 'round-robin',
    counters: [getDefaultCounter()],
  })

  const getDefaultCounter = () => ({
    counterId: 'Counter-1',
    defaultRackId: 'RACK-A',
    colCount: 20,
    rowCount: 5,
    shelfCount: 10,
  })

  const handleEditPosition = (uid, field, value) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.uid !== uid) return a
        const updated = { ...a, [field]: value }
        // Regenerate position string
        updated.position = `${updated.counterId}>${updated.rackId}>${updated.shelf}-${updated.row}-${updated.column}`
        return updated
      })
    )
  }

  const handleSaveEdit = (uid) => {
    const edited = assignments.find((a) => a.uid === uid)
    if (!edited) return
    
    toast.success(`Position updated for ${edited.medicineName}`)
    setEditingId(null)
    onUpdateAssignments?.(assignments)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-3 animate-spin" />
          <p className="text-gray-700 font-semibold">Generating assignments...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="m-0 text-lg font-bold text-gray-900">Rack Assignment Preview</h2>
              <p className="m-0 text-xs text-gray-600 mt-0.5">
                {assignments.length} medicines will be auto-assigned • Strategy: {rackConfig?.autoAssignStrategy || 'Round-Robin'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {assignments.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No valid items to assign (check qty &gt; 0)</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {assignments.map((assignment, idx) => (
                <div
                  key={assignment.uid}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-300 transition"
                >
                  {/* Collapsed View */}
                  <div
                    className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                    onClick={() =>
                      setExpandedId(expandedId === assignment.uid ? null : assignment.uid)
                    }
                  >
                    <div className="flex-1 flex items-center gap-4">
                      <span className="text-xs font-semibold text-gray-500 w-8">#{idx + 1}</span>
                      <div className="flex-1">
                        <p className="m-0 font-semibold text-gray-900 text-sm">
                          {assignment.medicineName}
                        </p>
                        <p className="m-0 text-xs text-gray-600 mt-0.5">
                          Batch: {assignment.batchNo || '—'} • Qty: {assignment.qty}
                        </p>
                      </div>
                    </div>

                    {/* Position Badge */}
                    <div className="text-right">
                      <div className="inline-block bg-gradient-to-r from-indigo-100 to-blue-100 px-3 py-1.5 rounded-lg">
                        <p className="m-0 text-xs font-mono font-bold text-indigo-700">
                          {assignment.position}
                        </p>
                      </div>
                    </div>

                    <ChevronDown
                      size={16}
                      className={`text-gray-500 ml-2 transition-transform ${
                        expandedId === assignment.uid ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {/* Expanded Edit View */}
                  {expandedId === assignment.uid && (
                    <div className="p-4 bg-white border-t border-gray-200 space-y-3">
                      {editingId === assignment.uid ? (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {/* Counter */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Counter
                              </label>
                              <input
                                type="text"
                                value={assignment.counterId}
                                onChange={(e) =>
                                  handleEditPosition(
                                    assignment.uid,
                                    'counterId',
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1.5 border border-blue-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Counter-1"
                              />
                            </div>

                            {/* Rack */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Rack
                              </label>
                              <input
                                type="text"
                                value={assignment.rackId}
                                onChange={(e) =>
                                  handleEditPosition(assignment.uid, 'rackId', e.target.value)
                                }
                                className="w-full px-2 py-1.5 border border-blue-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="RACK-A"
                              />
                            </div>

                            {/* Shelf */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Shelf
                              </label>
                              <input
                                type="number"
                                value={assignment.shelf}
                                onChange={(e) =>
                                  handleEditPosition(
                                    assignment.uid,
                                    'shelf',
                                    Number(e.target.value)
                                  )
                                }
                                min="1"
                                max="10"
                                className="w-full px-2 py-1.5 border border-blue-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* Row */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Row
                              </label>
                              <input
                                type="text"
                                value={assignment.row}
                                onChange={(e) =>
                                  handleEditPosition(
                                    assignment.uid,
                                    'row',
                                    e.target.value.toUpperCase()
                                  )
                                }
                                className="w-full px-2 py-1.5 border border-blue-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="A"
                                maxLength="1"
                              />
                            </div>

                            {/* Column */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Column
                              </label>
                              <input
                                type="number"
                                value={assignment.column}
                                onChange={(e) =>
                                  handleEditPosition(
                                    assignment.uid,
                                    'column',
                                    Number(e.target.value)
                                  )
                                }
                                min="1"
                                max="20"
                                className="w-full px-2 py-1.5 border border-blue-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          {/* Updated Position Preview */}
                          <div className="bg-indigo-50 p-3 rounded-lg">
                            <p className="m-0 text-xs font-semibold text-indigo-700 mb-1">
                              Updated Position:
                            </p>
                            <p className="m-0 text-sm font-mono font-bold text-indigo-900">
                              {assignment.position}
                            </p>
                          </div>

                          {/* Save/Cancel Buttons */}
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setEditingId(null)
                                generateAssignments() // Revert changes
                              }}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(assignment.uid)}
                              className="px-3 py-1.5 bg-green-600 rounded-lg text-xs font-semibold text-white hover:bg-green-700 flex items-center gap-1"
                            >
                              <Save size={14} />
                              Save Position
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="m-0 text-xs text-gray-600 font-semibold">Counter</p>
                              <p className="m-0 text-sm font-mono text-gray-900 mt-0.5">
                                {assignment.counterId}
                              </p>
                            </div>
                            <div>
                              <p className="m-0 text-xs text-gray-600 font-semibold">Rack</p>
                              <p className="m-0 text-sm font-mono text-gray-900 mt-0.5">
                                {assignment.rackId}
                              </p>
                            </div>
                            <div>
                              <p className="m-0 text-xs text-gray-600 font-semibold">Shelf</p>
                              <p className="m-0 text-sm font-mono text-gray-900 mt-0.5">
                                {assignment.shelf}
                              </p>
                            </div>
                            <div>
                              <p className="m-0 text-xs text-gray-600 font-semibold">Row</p>
                              <p className="m-0 text-sm font-mono text-gray-900 mt-0.5">
                                {assignment.row}
                              </p>
                            </div>
                            <div>
                              <p className="m-0 text-xs text-gray-600 font-semibold">Column</p>
                              <p className="m-0 text-sm font-mono text-gray-900 mt-0.5">
                                {assignment.column}
                              </p>
                            </div>
                            <div>
                              <p className="m-0 text-xs text-gray-600 font-semibold">Category</p>
                              <p className="m-0 text-sm font-mono text-gray-900 mt-0.5">
                                {assignment.category || '—'}
                              </p>
                            </div>
                          </div>

                          {/* Edit Button */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => setEditingId(assignment.uid)}
                              className="px-3 py-1.5 bg-indigo-100 rounded-lg text-xs font-semibold text-indigo-700 hover:bg-indigo-200 flex items-center gap-1"
                            >
                              <Edit2 size={14} />
                              Edit Position
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-600">
            <span className="font-semibold">{assignments.length}</span> medicines ready to be assigned
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 bg-white rounded-lg font-semibold text-sm hover:bg-gray-100 transition"
            >
              Cancel & Edit
            </button>
            <button
              onClick={() => {
                onClose()
                // Trigger final submit by calling parent handler
                setTimeout(() => {
                  const finalSubmitBtn = document.getElementById('final-submit-btn')
                  if (finalSubmitBtn) finalSubmitBtn.click()
                }, 100)
              }}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition flex items-center gap-2"
            >
              ✓ Confirm & Create GRN
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RackAssignmentPreview
