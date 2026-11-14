/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Settings, Save, Plus, Trash2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRequest, postRequest } from '../../../Helpers'

const RackConfigSettings = () => {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Load current config
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const res = await getRequest('/franchise/racks/rack-config')
      setConfig(res?.data || {})
    } catch (err) {
      toast.error('Failed to load rack configuration')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await postRequest('/franchise/racks/rack-config', 'PUT', config)
      toast.success('Rack configuration saved!')
      setEditMode(false)
    } catch (err) {
      toast.error(err.message || 'Failed to save configuration')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const addCounter = () => {
    const counters = config.counters || []
    const nextId = counters.length + 1
    const newCounter = {
      counterId: `Counter-${nextId}`,
      counterName: `Counter ${nextId}`,
      defaultRackId: 'RACK-A',
      shelfCount: 10,
      rowCount: 5,
      colCount: 20,
      autoAssignStrategy: 'round-robin',
      isActive: true,
    }
    setConfig({
      ...config,
      counters: [...counters, newCounter],
    })
    setEditMode(true)
  }

  const removeCounter = (index) => {
    const counters = config.counters || []
    setConfig({
      ...config,
      counters: counters.filter((_, i) => i !== index),
    })
    setEditMode(true)
  }

  const updateCounter = (index, field, value) => {
    const counters = [...(config.counters || [])]
    counters[index] = { ...counters[index], [field]: value }
    setConfig({ ...config, counters })
    setEditMode(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin text-3xl mb-2">⚙️</div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="w-7 h-7 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Rack Configuration</h1>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
              editMode
                ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Global Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Global Settings</h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Auto-assign enabled */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Auto-Assign Mode
              </label>
              <select
                value={config?.autoAssignStrategy || 'round-robin'}
                onChange={(e) => {
                  setConfig({ ...config, autoAssignStrategy: e.target.value })
                  setEditMode(true)
                }}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="round-robin">Round-Robin (default)</option>
                <option value="fill-first-rack">Fill First Rack</option>
                <option value="category-based">Category-Based</option>
                <option value="manual-only">Manual Only</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">How medicines are assigned to positions</p>
            </div>

            {/* Enable/Disable */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enable Auto-Assign
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config?.enableAutoAssign !== false}
                  onChange={(e) => {
                    setConfig({ ...config, enableAutoAssign: e.target.checked })
                    setEditMode(true)
                  }}
                  disabled={!editMode}
                  className="w-4 h-4 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">
                  {config?.enableAutoAssign !== false
                    ? 'Enabled: Medicines auto-assigned during GRN'
                    : 'Disabled: Manual assignment required'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Counters List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Counters & Racks</h2>
            {editMode && (
              <button
                onClick={addCounter}
                className="px-3 py-2 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add Counter
              </button>
            )}
          </div>

          <div className="space-y-4">
            {(config?.counters || []).map((counter, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{counter.counterId}</h3>
                    <p className="text-sm text-gray-600">{counter.counterName}</p>
                  </div>
                  {editMode && (
                    <button
                      onClick={() => removeCounter(idx)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Counter Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Counter Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Counter Name
                    </label>
                    <input
                      type="text"
                      value={counter.counterName || ''}
                      onChange={(e) => updateCounter(idx, 'counterName', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-white disabled:text-gray-600"
                    />
                  </div>

                  {/* Default Rack */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Default Rack
                    </label>
                    <input
                      type="text"
                      value={counter.defaultRackId || 'RACK-A'}
                      onChange={(e) => updateCounter(idx, 'defaultRackId', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-white disabled:text-gray-600"
                      placeholder="e.g., RACK-A"
                    />
                  </div>

                  {/* Shelf Count */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Shelves
                    </label>
                    <input
                      type="number"
                      value={counter.shelfCount || 10}
                      onChange={(e) => updateCounter(idx, 'shelfCount', Number(e.target.value))}
                      disabled={!editMode}
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-white disabled:text-gray-600"
                    />
                  </div>

                  {/* Row Count */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Rows (A-Z)
                    </label>
                    <input
                      type="number"
                      value={counter.rowCount || 5}
                      onChange={(e) => updateCounter(idx, 'rowCount', Number(e.target.value))}
                      disabled={!editMode}
                      min="1"
                      max="26"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-white disabled:text-gray-600"
                    />
                  </div>

                  {/* Column Count */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Columns
                    </label>
                    <input
                      type="number"
                      value={counter.colCount || 20}
                      onChange={(e) => updateCounter(idx, 'colCount', Number(e.target.value))}
                      disabled={!editMode}
                      min="1"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-white disabled:text-gray-600"
                    />
                  </div>

                  {/* Auto-Assign Strategy */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Strategy
                    </label>
                    <select
                      value={counter.autoAssignStrategy || 'round-robin'}
                      onChange={(e) => updateCounter(idx, 'autoAssignStrategy', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-white disabled:text-gray-600"
                    >
                      <option value="round-robin">Round-Robin</option>
                      <option value="fill-first">Fill First</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Status
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={counter.isActive !== false}
                        onChange={(e) => updateCounter(idx, 'isActive', e.target.checked)}
                        disabled={!editMode}
                        className="w-4 h-4 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                {/* Capacity indicator */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Capacity:</strong> {counter.shelfCount || 10} shelves × {counter.rowCount || 5} rows ×{' '}
                    {counter.colCount || 20} cols = {((counter.shelfCount || 10) * (counter.rowCount || 5) * (counter.colCount || 20)).toLocaleString()} slots
                  </p>
                </div>
              </div>
            ))}
          </div>

          {(!config?.counters || config.counters.length === 0) && (
            <div className="text-center p-6 bg-gray-100 rounded-lg">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No counters configured. Click "Add Counter" to create one.</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-indigo-600 font-semibold">Total Counters</p>
              <p className="text-2xl font-bold text-indigo-900">{config?.counters?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-indigo-600 font-semibold">Strategy</p>
              <p className="text-xl font-bold text-indigo-900 capitalize">
                {config?.autoAssignStrategy || 'Round-Robin'}
              </p>
            </div>
            <div>
              <p className="text-xs text-indigo-600 font-semibold">Auto-Assign</p>
              <p className="text-xl font-bold text-indigo-900">
                {config?.enableAutoAssign !== false ? '🟢 On' : '🔴 Off'}
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {editMode && (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 disabled:bg-gray-400"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
            <button
              onClick={() => {
                loadConfig()
                setEditMode(false)
              }}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RackConfigSettings
