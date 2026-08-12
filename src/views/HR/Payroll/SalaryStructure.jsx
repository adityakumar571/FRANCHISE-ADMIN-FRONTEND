import React, { useEffect, useState } from 'react'
import { IndianRupee, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import AppTable, { Td } from '../../../components/AppTable'

const fmt = (n) => Number(n || 0).toLocaleString('en-IN')

const SalaryStructure = () => {
  const [data, setData]           = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [limit]                   = useState(20)
  const [staff, setStaff]         = useState([])
  const [loading, setLoading]     = useState(false)
  const [refresh, setRefresh]     = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit]       = useState(false)
  const [editId, setEditId]       = useState(null)
  const [showDelete, setShowDelete] = useState(false)
  const [selItem, setSelItem]     = useState(null)
  const [form, setForm] = useState({ staff: '', effectiveFrom: '', basicSalary: '', allowance: '', fixedDeduction: '' })
  const [errors, setErrors] = useState({})

  const grossPreview = () => Math.max(0, (Number(form.basicSalary) || 0) + (Number(form.allowance) || 0) - (Number(form.fixedDeduction) || 0))

  useEffect(() => {
    getRequest('hr/staff?limit=300').then((r) => setStaff(r?.data?.data?.staff || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const q = new URLSearchParams({ page, limit }).toString()
    getRequest(`hr/salary-structures?${q}`)
      .then((r) => { setData(r?.data?.data?.structures || []); setTotal(r?.data?.data?.total || 0) })
      .catch(() => toast.error('Failed to fetch salary structures'))
      .finally(() => setLoading(false))
  }, [page, refresh])

  const validate = () => {
    const e = {}
    if (!form.staff)          e.staff         = 'Staff is required'
    if (!form.effectiveFrom)  e.effectiveFrom  = 'Date is required'
    if (!form.basicSalary || Number(form.basicSalary) <= 0) e.basicSalary = 'Basic salary must be > 0'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    const payload = { staff: form.staff, effectiveFrom: form.effectiveFrom, basicSalary: Number(form.basicSalary), allowance: Number(form.allowance) || 0, fixedDeduction: Number(form.fixedDeduction) || 0 }
    const req = isEdit ? putRequest({ url: `hr/salary-structures/${editId}`, cred: payload }) : postRequest({ url: 'hr/salary-structures', cred: payload })
    req.then(() => { toast.success(isEdit ? 'Updated' : 'Created'); setShowModal(false); setRefresh((p) => !p) })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed'))
      .finally(() => setLoading(false))
  }

  const handleDelete = () => {
    setLoading(true)
    deleteRequest(`hr/salary-structures/${selItem._id}`)
      .then(() => { toast.success('Deleted'); setShowDelete(false); setRefresh((p) => !p) })
      .catch(() => toast.error('Delete failed'))
      .finally(() => setLoading(false))
  }

  const openAdd = () => {
    setForm({ staff: '', effectiveFrom: new Date().toISOString().slice(0, 10), basicSalary: '', allowance: '', fixedDeduction: '' })
    setErrors({}); setIsEdit(false); setEditId(null); setShowModal(true)
  }
  const openEdit = (item) => {
    setForm({ staff: item.staff?._id || '', effectiveFrom: item.effectiveFrom?.slice(0, 10) || '', basicSalary: item.basicSalary, allowance: item.allowance, fixedDeduction: item.fixedDeduction })
    setErrors({}); setIsEdit(true); setEditId(item._id); setShowModal(true)
  }
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: '' })) }

  return (
    <div className="min-h-screen space-y-4">
      {/* DELETE MODAL */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4"><AlertTriangle className="text-red-500 w-5 h-5" /><h3 className="font-semibold">Confirm Delete</h3></div>
            <p className="text-gray-600 mb-5 text-sm">Delete salary structure for <b>{selItem?.staff?.employeeName}</b>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleDelete} disabled={loading} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm disabled:opacity-50">{loading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b bg-gray-50">
              <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-[#e24028]" />
                {isEdit ? 'Edit' : 'Add'} Salary Structure
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">

              {/* Staff */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Staff <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.staff} onChange={set('staff')} disabled={isEdit}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0c3b73]/20 focus:border-[#0c3b73] transition
                    ${isEdit ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
                    ${errors.staff ? 'border-red-400' : 'border-gray-300'}`}>
                  <option value="">— Select Staff Member —</option>
                  {staff.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.employeeName} ({s.employeeCode || '—'})
                    </option>
                  ))}
                </select>
                {errors.staff && <p className="text-red-500 text-xs mt-1">{errors.staff}</p>}
              </div>

              {/* Effective From */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Effective From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date" value={form.effectiveFrom} onChange={set('effectiveFrom')}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c3b73]/20 focus:border-[#0c3b73] transition
                    ${errors.effectiveFrom ? 'border-red-400' : 'border-gray-300'}`} />
                {errors.effectiveFrom && <p className="text-red-500 text-xs mt-1">{errors.effectiveFrom}</p>}
              </div>

              {/* Salary fields */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Salary Components
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Basic Salary <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                      <input
                        type="number" min="1" value={form.basicSalary}
                        onChange={set('basicSalary')} placeholder="25000"
                        className={`w-full border rounded-lg pl-6 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c3b73]/20 focus:border-[#0c3b73] transition
                          ${errors.basicSalary ? 'border-red-400' : 'border-gray-300'}`} />
                    </div>
                    {errors.basicSalary && <p className="text-red-500 text-xs mt-0.5">{errors.basicSalary}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Allowance</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                      <input
                        type="number" min="0" value={form.allowance}
                        onChange={set('allowance')} placeholder="0"
                        className="w-full border border-gray-300 rounded-lg pl-6 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c3b73]/20 focus:border-[#0c3b73] transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fixed Deduction</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                      <input
                        type="number" min="0" value={form.fixedDeduction}
                        onChange={set('fixedDeduction')} placeholder="0"
                        className="w-full border border-gray-300 rounded-lg pl-6 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c3b73]/20 focus:border-[#0c3b73] transition" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gross preview */}
              <div className="rounded-lg border border-[#0c3b73]/20 bg-[#0c3b73]/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    Basic <span className="font-semibold text-gray-700">₹{fmt(Number(form.basicSalary)||0)}</span>
                  </span>
                  <span className="text-green-600">
                    + Allow <span className="font-semibold">₹{fmt(Number(form.allowance)||0)}</span>
                  </span>
                  <span className="text-red-500">
                    - Ded <span className="font-semibold">₹{fmt(Number(form.fixedDeduction)||0)}</span>
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#0c3b73]/70 font-medium uppercase tracking-wide">Gross</p>
                  <p className="text-lg font-black text-[#0c3b73]">₹{fmt(grossPreview())}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition">
                  Cancel
                </button>
                <button
                  type="submit" disabled={loading}
                  className="px-6 py-2 bg-[#0c3b73] hover:bg-blue-900 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition shadow-sm">
                  {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded border flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2"><IndianRupee className="text-[#e24028] w-5 h-5" />Salary Structure</h1>
          <p className="text-xs text-gray-500">Define basic salary, allowance and deductions per staff</p>
        </div>
        <button onClick={openAdd} className="bg-[#0c3b73] hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm"><Plus size={15} /> Add Structure</button>
      </div>

      {/* TABLE */}
      <AppTable
        columns={[
          { key: 'sr', label: 'Sr', align: 'center', width: 50 },
          { key: 'staff', label: 'Staff', align: 'left', width: 180 },
          { key: 'department', label: 'Department', align: 'left', width: 130 },
          { key: 'effective', label: 'Effective From', align: 'center', width: 120 },
          { key: 'basic', label: 'Basic', align: 'right', width: 100 },
          { key: 'allowance', label: 'Allowance', align: 'right', width: 100 },
          { key: 'deduction', label: 'Deduction', align: 'right', width: 100 },
          { key: 'gross', label: 'Gross', align: 'right', width: 100 },
          { key: 'status', label: 'Status', align: 'center', width: 90 },
          { key: 'actions', label: 'Actions', align: 'center', width: 90, sticky: 'right' },
        ]}
        data={data}
        loading={loading}
        emptyText="No salary structures yet"
        page={page}
        limit={limit}
        total={total}
        onPageChange={(p) => setPage(p)}
        rowKey={(item) => item._id}
      >
        {(item, idx) => (
          <>
            <Td align="center">{(page - 1) * limit + idx + 1}</Td>
            <Td>
              <div className="font-medium text-gray-800">{item.staff?.employeeName || '—'}</div>
              <div className="text-xs text-gray-400">{item.staff?.employeeCode}</div>
            </Td>
            <Td>{item.staff?.department?.name || '—'}</Td>
            <Td align="center">{item.effectiveFrom?.slice(0, 10)}</Td>
            <Td align="right">₹{fmt(item.basicSalary)}</Td>
            <Td align="right"><span className="text-green-600">+₹{fmt(item.allowance)}</span></Td>
            <Td align="right"><span className="text-red-500">-₹{fmt(item.fixedDeduction)}</span></Td>
            <Td align="right"><span className="font-bold text-[#0c3b73]">₹{fmt(item.grossSalary)}</span></Td>
            <Td align="center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{item.status}</span>
            </Td>
            <Td align="center" sticky="right">
              <div className="flex justify-center gap-1">
                <button onClick={() => openEdit(item)} className="text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded transition"><Edit size={14} /></button>
                <button onClick={() => { setSelItem(item); setShowDelete(true) }} className="text-red-600 hover:bg-red-600 hover:text-white p-2 rounded transition"><Trash2 size={14} /></button>
              </div>
            </Td>
          </>
        )}
      </AppTable>
    </div>
  )
}

export default SalaryStructure
