import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { postRequest, putRequest } from '../../../Helpers'
import toast from 'react-hot-toast'

const DepartmentModal = ({
  isModalOpen,
  setIsModalOpen,
  modalData,
  setModalData,
  setUpdateStatus,
}) => {
  const isEdit = !!modalData?._id

  const [form, setForm] = useState({
    name: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEdit) {
      setForm({
        name: modalData.name || '',
        description: modalData.description || '',
      })
    } else {
      setForm({ name: '', description: '' })
    }
    setErrors({})
  }, [modalData])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Department name is required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const payload = { name: form.name.trim(), description: form.description.trim() }

    const req = isEdit
      ? putRequest({ url: `hr/departments/${modalData._id}`, cred: payload })
      : postRequest({ url: 'hr/departments', cred: payload })

    req
      .then((res) => {
        toast.success(res?.data?.message || (isEdit ? 'Department updated' : 'Department created'))
        setUpdateStatus((prev) => !prev)
        handleClose()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Operation failed'))
      .finally(() => setLoading(false))
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setModalData(null)
    setForm({ name: '', description: '' })
    setErrors({})
  }

  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? 'Edit Department' : 'Add Department'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-red-500 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Teaching, Administration"
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                errors.name ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional description..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            />
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

export default DepartmentModal
