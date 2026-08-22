import React, { useEffect, useState } from 'react'
import { BookOpen, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../../Helpers'
import toast from 'react-hot-toast'
import { Empty } from 'antd'
import Loader from '../../../components/Loading/Loader'

const INCOME_EXAMPLES  = ['Franchise Fee Collection', 'Admission Fee', 'Transport Fee', 'Examination Fee', 'Late Fee', 'Other Income']
const EXPENSE_EXAMPLES = ['Staff Salary', 'Electricity Expense', 'Rent Expense', 'Transport Expense', 'Maintenance Expense', 'Stationery Expense', 'Internet Expense', 'Security Expense', 'Housekeeping Expense', 'Other Expense']

const AccountHeadMaster = () => {
  const [data, setData]             = useState([])
  const [loading, setLoading]       = useState(false)
  const [filterType, setFilterType] = useState('')
  const [refresh, setRefresh]       = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const [isEdit, setIsEdit]         = useState(false)
  const [editId, setEditId]         = useState(null)
  const [showDel, setShowDel]       = useState(false)
  const [selItem, setSelItem]       = useState(null)
  const [form, setForm]             = useState({ accountName: '', accountType: 'Income', description: '', status: 'Active' })
  const [errors, setErrors]         = useState({})

  useEffect(() => {
    setLoading(true)
    const q = new URLSearchParams()
    if (filterType) q.set('accountType', filterType)
    getRequest(`hr/account-heads?${q.toString()}`)
      .then((r) => setData(r?.data?.data?.heads || []))
      .catch(() => toast.error('Failed to load account heads'))
      .finally(() => setLoading(false))
  }, [filterType, refresh])

  const validate = () => {
    const e = {}
    if (!form.accountName.trim()) e.accountName = 'Name is required'
    if (!form.accountType)        e.accountType = 'Type is required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    const req = isEdit
      ? putRequest({ url: `hr/account-heads/${editId}`, cred: form })
      : postRequest({ url: 'hr/account-heads', cred: form })
    req.then(() => { toast.success(isEdit ? 'Updated' : 'Created'); setShowModal(false); setRefresh((p) => !p) })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed'))
      .finally(() => setLoading(false))
  }

  const handleDelete = () => {
    deleteRequest(`hr/account-heads/${selItem._id}`)
      .then(() => { toast.success('Deleted'); setShowDel(false); setRefresh((p) => !p) })
      .catch(() => toast.error('Delete failed'))
  }

  const openAdd  = () => { setForm({ accountName: '', accountType: 'Income', description: '', status: 'Active' }); setErrors({}); setIsEdit(false); setEditId(null); setShowModal(true) }
  const openEdit = (item) => { setForm({ accountName: item.accountName, accountType: item.accountType, description: item.description || '', status: item.status }); setErrors({}); setIsEdit(true); setEditId(item._id); setShowModal(true) }
  const set      = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: '' })) }

  const income  = data.filter((d) => d.accountType === 'Income')
  const expense = data.filter((d) => d.accountType === 'Expense')

  const FILTERS = ['', 'Income', 'Expense']

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-6 space-y-5">

      {/* ── DELETE CONFIRM ── */}
      {showDel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#7a2d2d18' }}>
                <AlertTriangle className="w-4 h-4" style={{ color: '#7a2d2d' }} />
              </div>
              <h3 className="font-black text-slate-800">Confirm Delete</h3>
            </div>
            <p className="text-sm text-slate-600 mb-5">Delete <b className="text-slate-800">{selItem?.accountName}</b>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDel(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-bold transition">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2 text-white rounded-xl text-sm font-bold transition active:scale-95 shadow-sm" style={{ background: '#7a2d2d' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: '#042954' }}>
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                </div>
                {isEdit ? 'Edit' : 'Add'} Account Head
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Account Type <span className="text-red-500">*</span></label>
                <div className="flex gap-3">
                  {['Income', 'Expense'].map((t) => {
                    const tc = t === 'Income' ? '#2d6a4f' : '#7a2d2d'
                    const active = form.accountType === t
                    return (
                      <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, accountType: t, accountName: '' }))}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition border-2 active:scale-95"
                        style={active ? { background: tc, color: '#fff', borderColor: tc } : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }}>
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Account Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.accountName} onChange={set('accountName')} placeholder="e.g. Franchise Fee Collection"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-slate-50 font-medium text-slate-700 ${errors.accountName ? 'border-red-400' : 'border-slate-200'}`} />
                {errors.accountName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.accountName}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(form.accountType === 'Income' ? INCOME_EXAMPLES : EXPENSE_EXAMPLES).map((ex) => (
                    <button key={ex} type="button" onClick={() => setForm((f) => ({ ...f, accountName: ex }))}
                      className="text-xs px-2 py-0.5 border border-slate-200 rounded-full text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition font-medium">
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea rows={2} value={form.description} onChange={set('description')}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-slate-50 font-medium text-slate-700 resize-none" />
              </div>
              {isEdit && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</label>
                  <select value={form.status} onChange={set('status')} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-slate-50 font-medium text-slate-700">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 font-bold transition">Cancel</button>
                <button type="submit" disabled={loading}
                  className="px-5 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-50 shadow-sm active:scale-95 transition"
                  style={{ background: '#042954' }}>
                  {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#042954]" /> Account Head Master
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Manage income and expense account categories</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition shadow-sm active:scale-95 hover:opacity-90"
          style={{ background: '#042954' }}>
          <Plus size={14} /> Add Account Head
        </button>
      </div>

      {/* FILTER PILLS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex gap-2">
        {FILTERS.map((t) => {
          const active = filterType === t
          return (
            <button key={t} onClick={() => setFilterType(t)}
              className="px-4 py-1.5 rounded-full text-sm font-bold transition active:scale-95"
              style={active
                ? { background: '#042954', color: '#fff' }
                : { background: '#f1f5f9', color: '#64748b' }}>
              {t || 'All'}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm"><Loader /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* INCOME HEADS */}
          {(filterType === '' || filterType === 'Income') && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between" style={{ background: '#2d6a4f' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h2 className="text-sm font-black text-white">Income Heads ({income.length})</h2>
                </div>
              </div>
              {income.length === 0 ? (
                <div className="py-10 text-center"><Empty description="No income heads" /></div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">Name</th>
                      <th className="px-4 py-2.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-2.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {income.map((item) => (
                      <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-700">{item.accountName}</div>
                          {item.description && <div className="text-xs text-slate-400 font-medium">{item.description}</div>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                            style={item.status === 'Active'
                              ? { background: '#2d6a4f18', color: '#2d6a4f' }
                              : { background: '#94a3b820', color: '#64748b' }}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-slate-100 transition" style={{ color: '#042954' }}><Edit size={13} /></button>
                            <button onClick={() => { setSelItem(item); setShowDel(true) }} className="p-1.5 rounded-lg hover:bg-red-50 transition" style={{ color: '#7a2d2d' }}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* EXPENSE HEADS */}
          {(filterType === '' || filterType === 'Expense') && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between" style={{ background: '#7a2d2d' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h2 className="text-sm font-black text-white">Expense Heads ({expense.length})</h2>
                </div>
              </div>
              {expense.length === 0 ? (
                <div className="py-10 text-center"><Empty description="No expense heads" /></div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">Name</th>
                      <th className="px-4 py-2.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-2.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expense.map((item) => (
                      <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-700">{item.accountName}</div>
                          {item.description && <div className="text-xs text-slate-400 font-medium">{item.description}</div>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                            style={item.status === 'Active'
                              ? { background: '#2d6a4f18', color: '#2d6a4f' }
                              : { background: '#94a3b820', color: '#64748b' }}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-slate-100 transition" style={{ color: '#042954' }}><Edit size={13} /></button>
                            <button onClick={() => { setSelItem(item); setShowDel(true) }} className="p-1.5 rounded-lg hover:bg-red-50 transition" style={{ color: '#7a2d2d' }}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default AccountHeadMaster
