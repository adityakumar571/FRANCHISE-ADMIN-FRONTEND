import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { postRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const STAFF_TYPES = ['Teaching', 'Non-Teaching']

const DesignationModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
  departments = [],
}) => {
  const isEdit = !!modalData?._id

  const [form, setForm] = useState({ name: '', department: '', staffType: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEdit) {
      setForm({
        name: modalData.name || '',
        department: modalData.department?._id || modalData.department || '',
        staffType: modalData.staffType || '',
      })
    } else {
      setForm({ name: '', department: '', staffType: '' })
    }
    setErrors({})
  }, [modalData])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Designation name is required'
    if (!form.department) errs.department = 'Department is required'
    if (!form.staffType) errs.staffType = 'Staff type is required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const payload = {
      name: form.name.trim(),
      department: form.department,
      staffType: form.staffType,
    }

    const req = isEdit
      ? putRequest({ url: `hr/designations/${modalData._id}`, cred: payload })
      : postRequest({ url: 'hr/designations', cred: payload })

    req
      .then((res) => {
        toast.success(res?.data?.message || (isEdit ? 'Designation updated' : 'Designation created'))
        setUpdateStatus((prev) => !prev)
        handleClose()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Operation failed'))
      .finally(() => setLoading(false))
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setModalData(null)
    setForm({ name: '', department: '', staffType: '' })
    setErrors({})
  }

  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? 'Edit Designation' : 'Add Designation'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-red-500 transition">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Principal, Teacher, Accountant"
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                errors.name ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                errors.department ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              <option value="">— Select Department —</option>
              {departments
                .filter((d) => d.isActive)
                .map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
            </select>
            {errors.department && (
              <p className="text-red-500 text-xs mt-1">{errors.department}</p>
            )}
          </div>

          {/* Staff Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staff Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.staffType}
              onChange={(e) => setForm((f) => ({ ...f, staffType: e.target.value }))}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                errors.staffType ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              <option value="">— Select Staff Type —</option>
              {STAFF_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.staffType && (
              <p className="text-red-500 text-xs mt-1">{errors.staffType}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 text-sm text-white rounded transition ${
                loading ? 'bg-blue-300' : 'bg-[#0c3b73] hover:bg-blue-700'
              }`}
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DesignationModal
