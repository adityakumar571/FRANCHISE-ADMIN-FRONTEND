/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { CalendarOff, Plus, AlertTriangle, Info, School, BookOpen } from 'lucide-react'
import { Modal, Select, Empty } from 'antd'
import toast from 'react-hot-toast'
import { getRequest, postRequest, deleteRequest, patchRequest } from '../../../Helpers'
import { SessionContext } from '../../../Context/Seesion'
import Loader from '../../../components/Loading/Loader'

const { Option } = Select

const MONTHS = [
  'APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER',
  'OCTOBER','NOVEMBER','DECEMBER','JANUARY','FEBRUARY','MARCH',
]
const M_SHORT = {
  APRIL:'Apr', MAY:'May', JUNE:'Jun', JULY:'Jul', AUGUST:'Aug', SEPTEMBER:'Sep',
  OCTOBER:'Oct', NOVEMBER:'Nov', DECEMBER:'Dec', JANUARY:'Jan', FEBRUARY:'Feb', MARCH:'Mar',
}

const TransportVacation = () => {
  const { currentSession } = useContext(SessionContext)

  const [rules,   setRules]   = useState([])
  const [loading, setLoading] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [classes, setClasses] = useState([])

  const [modal,        setModal]    = useState(false)
  const [editRule,     setEditRule] = useState(null)
  const [deleteTarget, setDelete]   = useState(null)
  const [deleting,     setDeleting] = useState(false)

  const [formLevel,   setFormLevel]   = useState('SCHOOL')
  const [formMonths,  setFormMonths]  = useState([])
  const [formClasses, setFormClasses] = useState([])
  const [formReason,  setFormReason]  = useState('')

  const fetchRules = () => {
    if (!currentSession?._id) return
    setLoading(true)
    getRequest(`transport-vacation?sessionId=${currentSession._id}`)
      .then((r) => setRules(r?.data?.data || []))
      .catch(() => toast.error('Failed to load vacation rules'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRules() }, [currentSession])

  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`)
      .then((r) => setClasses(r?.data?.data?.classes || []))
  }, [currentSession])

  const openCreate = (level = 'SCHOOL') => {
    setEditRule(null); setFormLevel(level)
    setFormMonths([]); setFormClasses([]); setFormReason('')
    setModal(true)
  }

  const openEdit = (rule) => {
    setEditRule(rule); setFormLevel(rule.level)
    setFormMonths(rule.months || [])
    setFormClasses((rule.classIds || []).map((c) => c._id || c))
    setFormReason(rule.reason || '')
    setModal(true)
  }

  const toggleMonth = (m) =>
    setFormMonths((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m])

  const handleSave = () => {
    if (!formMonths.length)                          { toast.error('Please select at least one month'); return }
    if (formLevel === 'CLASS' && !formClasses.length) { toast.error('Please select at least one class'); return }

    setSaving(true)
    const body = {
      sessionId: currentSession._id,
      level: formLevel,
      months: formMonths,
      reason: formReason,
      classIds: formLevel === 'CLASS' ? formClasses : [],
    }

    const req = editRule
      ? patchRequest({ url: `transport-vacation/${editRule._id}`, cred: body })
      : postRequest({ url: 'transport-vacation', cred: body })

    req
      .then((r) => {
        const { affectedStudents, message } = r?.data?.data || {}
        toast.success(message || `Saved. ${affectedStudents || 0} students updated.`)
        setModal(false)
        fetchRules()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed to save'))
      .finally(() => setSaving(false))
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setDeleting(true)
    deleteRequest(`transport-vacation/${deleteTarget._id}?sessionId=${currentSession._id}`)
      .then((r) => {
        toast.success(`Rule removed. ${r?.data?.data?.affectedStudents || 0} students' fees restored.`)
        setDelete(null)
        fetchRules()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Failed'))
      .finally(() => setDeleting(false))
  }

  const schoolRule = rules.find((r) => r.level === 'SCHOOL')
  const classRules = rules.filter((r) => r.level === 'CLASS')

  return (
    <div className="min-h-screen">

      {/* HEADER */}
      <div className="bg-white border border-blue-100 rounded-lg px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <CalendarOff className="text-[#e24028]" /> Transport Vacation Settings
            </h1>
            <p className="text-sm text-gray-500">
              Set school-level or class-level vacation — transport fees will be automatically waived
            </p>
          </div>
          <button
            onClick={() => openCreate('SCHOOL')}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold bg-[#0c3b73] hover:bg-blue-900"
          >
            <Plus size={15} /> Add Vacation Rule
          </button>
        </div>
      </div>

      {/* INFO BANNER */}
      <div className="bg-white border border-blue-100 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3 text-sm bg-[#0c3b73]/5 border border-[#0c3b73]/20 text-[#0c3b73] rounded p-3">
          <Info size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">How it works</p>
            <ul className="list-disc pl-4 space-y-0.5 text-xs">
              <li><b>School-level</b> — applies to all transport students (e.g. June-July whole school holiday)</li>
              <li><b>Class-level</b> — applies only to selected classes (e.g. Class 1-5 has a different summer break)</li>
              <li>On save, <b>all affected students' fees are automatically recalculated</b></li>
              <li>Already <b>paid months are protected</b> — only unpaid months are affected</li>
              <li>Delete a rule → fees are <b>restored</b> for affected students</li>
            </ul>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader /></div>
      ) : (
        <div className="space-y-4">

          {/* SCHOOL-LEVEL */}
          <div className="bg-white border border-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <School size={16} className="text-[#0c3b73]" />
                School-level Vacation
                <span className="text-xs text-gray-400 font-normal">(applies to all)</span>
              </h3>
            </div>

            {schoolRule ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex flex-wrap gap-2 flex-1">
                  {schoolRule.months.map((m) => (
                    <span key={m} className="px-3 py-1 rounded text-sm font-semibold bg-[#0c3b73]/10 text-[#0c3b73] border border-[#0c3b73]/20">
                      🏖 {m}
                    </span>
                  ))}
                </div>
                {schoolRule.reason && (
                  <p className="text-xs text-gray-500 italic flex-1">{schoolRule.reason}</p>
                )}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(schoolRule)}
                    className="px-3 py-1 border border-[#0c3b73]/30 text-[#0c3b73] rounded text-xs font-medium hover:bg-[#0c3b73]/5">
                    Edit
                  </button>
                  <button onClick={() => setDelete(schoolRule)}
                    className="px-3 py-1 border border-[#e24028]/30 text-[#e24028] rounded text-xs font-medium hover:bg-[#e24028]/5">
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Empty description="No school-level vacation set" />
                <button onClick={() => openCreate('SCHOOL')}
                  className="mt-3 px-4 py-1.5 rounded-md text-sm text-white font-semibold bg-[#0c3b73] hover:bg-blue-900">
                  + Add School Vacation
                </button>
              </div>
            )}
          </div>

          {/* CLASS-LEVEL */}
          <div className="bg-white border border-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <BookOpen size={16} className="text-[#0c3b73]" />
                Class-level Vacations
                <span className="text-xs text-gray-400 font-normal">(specific classes only)</span>
              </h3>
              <button onClick={() => openCreate('CLASS')}
                className="text-sm text-[#0c3b73] hover:underline flex items-center gap-1 font-medium">
                <Plus size={13} /> Add Class Rule
              </button>
            </div>

            {classRules.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p className="text-sm">No class-level vacation rules set</p>
              </div>
            ) : (
              <div className="space-y-3">
                {classRules.map((rule) => (
                  <div key={rule._id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border border-[#0c3b73]/10 rounded-lg bg-[#0c3b73]/5">
                    <div className="flex flex-wrap gap-1 min-w-[160px]">
                      {(rule.classIds || []).map((c) => (
                        <span key={c._id || c} className="px-2 py-0.5 rounded bg-[#0c3b73]/10 text-[#0c3b73] text-xs font-semibold border border-[#0c3b73]/20">
                          {c.name || 'Class'}
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-400 hidden sm:block">→</span>
                    <div className="flex flex-wrap gap-1 flex-1">
                      {rule.months.map((m) => (
                        <span key={m} className="px-2 py-0.5 rounded text-xs font-semibold bg-[#0c3b73]/10 text-[#0c3b73] border border-[#0c3b73]/20">
                          🏖 {m}
                        </span>
                      ))}
                    </div>
                    {rule.reason && (
                      <p className="text-xs text-gray-500 italic flex-1">{rule.reason}</p>
                    )}
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openEdit(rule)}
                        className="px-3 py-1 border border-[#0c3b73]/30 text-[#0c3b73] rounded text-xs font-medium hover:bg-[#0c3b73]/5">
                        Edit
                      </button>
                      <button onClick={() => setDelete(rule)}
                        className="px-3 py-1 border border-[#e24028]/30 text-[#e24028] rounded text-xs font-medium hover:bg-[#e24028]/5">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      <Modal
        title={
          <span className="flex items-center gap-2">
            <CalendarOff size={16} className="text-[#e24028]" />
            {editRule ? 'Edit Vacation Rule' : 'Add Vacation Rule'}
          </span>
        }
        open={modal}
        onCancel={() => setModal(false)}
        footer={null}
        width={520}
        destroyOnClose
      >
        {/* Level */}
        <div className="mb-4">
          <label className="form-label fw-bold">Vacation Level</label>
          <div className="flex gap-3 mt-1">
            {[
              { val: 'SCHOOL', label: 'School-wide',    icon: <School size={14} className="inline mr-1" /> },
              { val: 'CLASS',  label: 'Class-specific', icon: <BookOpen size={14} className="inline mr-1" /> },
            ].map(({ val, label, icon }) => (
              <button key={val}
                onClick={() => setFormLevel(val)}
                disabled={!!editRule}
                className={`flex-1 py-2 px-3 rounded border text-sm font-semibold transition-all disabled:opacity-50 ${
                  formLevel === val ? 'text-white border-transparent bg-[#0c3b73]' : 'bg-white text-gray-600 border-gray-300'
                }`}>
                {icon}{label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {formLevel === 'SCHOOL'
              ? 'Applies to all transport students'
              : 'Applies only to selected classes'}
          </p>
        </div>

        {/* Class selector */}
        {formLevel === 'CLASS' && (
          <div className="mb-4">
            <label className="form-label fw-bold">Select Classes <span className="text-danger">*</span></label>
            <Select mode="multiple" allowClear style={{ width: '100%' }}
              placeholder="Select classes" value={formClasses}
              onChange={(v) => setFormClasses(v)}>
              {classes.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
            </Select>
          </div>
        )}

        {/* Months */}
        <div className="mb-4">
          <label className="form-label fw-bold">Vacation Months <span className="text-danger">*</span></label>
          <div className="grid grid-cols-6 gap-2 mt-1">
            {MONTHS.map((m) => (
              <button key={m} onClick={() => toggleMonth(m)}
                className={`py-1.5 text-xs font-semibold rounded border transition-all ${
                  formMonths.includes(m)
                    ? 'text-white border-transparent bg-[#0c3b73]'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}>
                {M_SHORT[m]}
              </button>
            ))}
          </div>
          {formMonths.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {formMonths.map((m) => (
                <span key={m} className="px-2 py-0.5 rounded text-xs font-semibold bg-[#0c3b73]/10 text-[#0c3b73] border border-[#0c3b73]/20">
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reason */}
        <div className="mb-4">
          <label className="form-label">Reason (optional)</label>
          <input type="text" className="form-control"
            placeholder="e.g. Summer vacation 2025"
            value={formReason} onChange={(e) => setFormReason(e.target.value)} />
        </div>

        {/* Warning */}
        <div className="mb-4 p-3 bg-[#0c3b73]/5 border border-[#0c3b73]/20 rounded text-xs text-[#0c3b73] flex items-start gap-2">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-[#e24028]" />
          <span>
            On save, all affected students' transport fees will be recalculated automatically.
            Already paid months will not be affected.
          </span>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button onClick={() => setModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="btn btn-sm text-white px-4 bg-[#0c3b73] hover:bg-blue-900">
            {saving ? 'Saving...' : 'Save Vacation'}
          </button>
        </div>
      </Modal>

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3">
          <div className="bg-white p-6 w-full max-w-md rounded">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold">Remove Vacation Rule?</h3>
            </div>
            <p className="text-gray-600 mb-2">
              {deleteTarget.level === 'SCHOOL'
                ? `School vacation (${deleteTarget.months?.join(', ')}) will be removed.`
                : `Class vacation (${deleteTarget.months?.join(', ')}) will be removed.`}
            </p>
            <p className="text-sm text-amber-600 mb-6">
              All affected students' fees will be restored.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDelete(null)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-5 py-2 text-white bg-red-600 hover:bg-red-700 rounded text-sm font-semibold">
                {deleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransportVacation
