import React, { useState, useEffect } from 'react'
import { Award, Plus, Eye, Printer, Trash2, FileText, ShieldCheck, AlertTriangle } from 'lucide-react'
import { Pagination, Tag, Empty } from 'antd'
import toast from 'react-hot-toast'
import { deleteRequest, getRequest } from '../../../../Helpers'
import Loader from '../../../../components/Loading/Loader'
import CertificateFormModal from './CertificateFormModal'
import CertificatePrintModal from './CertificatePrintModal'
import CertificateFilters from './CertificateFilters'

const CERT_TABS = [
  { key: 'transfer',  label: 'Transfer Certificate (TC)', icon: FileText   },
  { key: 'character', label: 'Character Certificate',      icon: ShieldCheck },
]

/* status colour map */
const STATUS_COLOR = {
  issued: 'text-green-700 bg-green-50 border-green-200',
  Issued: 'text-green-700 bg-green-50 border-green-200',
  draft:  'text-orange-600 bg-orange-50 border-orange-200',
  Draft:  'text-orange-600 bg-orange-50 border-orange-200',
  cancelled: 'text-red-600 bg-red-50 border-red-200',
  Cancelled: 'text-red-600 bg-red-50 border-red-200',
}

const CertificateListing = () => {
  const [activeTab, setActiveTab] = useState('transfer')

  const [data, setData]           = useState([])
  const [loading, setLoading]     = useState(false)
  const [page, setPage]           = useState(1)
  const [limit, setLimit]         = useState(10)
  const [total, setTotal]         = useState(0)
  const [appliedFilters, setAppliedFilters] = useState({ search: '' })

  const [isFormOpen, setIsFormOpen]           = useState(false)
  const [isPrintOpen, setIsPrintOpen]         = useState(false)
  const [selectedItem, setSelectedItem]       = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading]     = useState(false)

  /* ── Fetch ── */
  const fetchCertificates = () => {
    setLoading(true)
    const params = { page, limit, isPagination: true, type: activeTab }
    if (appliedFilters.search) params.search = appliedFilters.search
    getRequest(`certificates?${new URLSearchParams(params).toString()}`)
      .then((res) => {
        setData(res?.data?.data?.list || res?.data?.data?.certificates || [])
        setTotal(res?.data?.data?.total || 0)
      })
      .catch(() => { setData([]); setTotal(0) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCertificates() }, [activeTab, appliedFilters, page, limit])

  /* ── Delete ── */
  const confirmDelete = async () => {
    if (!selectedItem) return
    setDeleteLoading(true)
    try {
      await deleteRequest(`certificates/${selectedItem._id}`)
      toast.success('Certificate deleted')
      setShowDeleteModal(false)
      setSelectedItem(null)
      fetchCertificates()
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="min-h-screen">

      {/* ── Page Header ── */}
      <div className="text-black px-4 py-3 mb-4 bg-white rounded-lg border border-blue-100">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <Award size={22} className="text-[#e24028]" />
              Certificate Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Issue, preview and print Transfer &amp; Character Certificates
            </p>
          </div>
          <button
            onClick={() => { setSelectedItem(null); setIsFormOpen(true) }}
            className="bg-[#0c3b73] hover:bg-[#0a2f5c] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition self-start sm:self-auto"
          >
            <Plus size={16} /> Issue Certificate
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <CertificateFilters
        appliedFilters={appliedFilters}
        onApply={(f) => { setAppliedFilters(f); setPage(1) }}
        onClear={() => { setAppliedFilters({ search: '' }); setPage(1) }}
      />

      {/* ── Tabs ── */}
      <div className="bg-white rounded-lg border border-blue-100 mb-4">
        <div className="flex border-b border-gray-200">
          {CERT_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setPage(1) }}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === key
                  ? 'border-[#0c3b73] text-[#0c3b73]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">
            <Loader />
            <p className="text-sm text-gray-400 mt-2">Loading certificates...</p>
          </div>
        )}

        <table className="min-w-max border-collapse w-full table-fixed">
          {/* ── Head ── */}
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-xs text-center" style={{ minWidth: 60 }}>
                Sr. No.
              </th>
              <th className="px-3 py-2 text-xs text-left bg-gray-200" style={{ minWidth: 200 }}>
                Student Name
              </th>
              <th className="px-3 py-2 text-xs text-center bg-gray-200" style={{ minWidth: 120 }}>
                Class
              </th>
              <th className="px-3 py-2 text-xs text-center bg-gray-200" style={{ minWidth: 130 }}>
                Issue Date
              </th>
              <th className="px-3 py-2 text-xs text-center bg-gray-200" style={{ minWidth: 120 }}>
                Cert No.
              </th>
              <th className="px-3 py-2 text-xs text-center bg-gray-200" style={{ minWidth: 100 }}>
                Status
              </th>
              <th className="sticky right-0 z-20 bg-gray-200 px-3 py-2 text-xs text-center" style={{ minWidth: 120 }}>
                Actions
              </th>
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex items-center justify-center py-12 text-gray-400">
                    <Empty description={`No ${activeTab === 'transfer' ? 'Transfer' : 'Character'} Certificates found`} />
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row._id} className="border-t hover:bg-gray-50">
                  {/* Sr */}
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 text-xs text-center" style={{ minWidth: 60 }}>
                    {(page - 1) * limit + idx + 1}
                  </td>

                  {/* Student Name */}
                  <td className="px-3 py-2 bg-white" style={{ minWidth: 200 }}>
                    <p className="text-xs font-medium text-gray-800 leading-tight">{row.studentName || '—'}</p>
                    {row.admissionNo && <p className="text-xs text-gray-400 mt-0.5">{row.admissionNo}</p>}
                  </td>

                  {/* Class */}
                  <td className="px-3 py-2 text-xs text-center bg-white" style={{ minWidth: 120 }}>
                    {row.className || '—'}{row.section ? ` – ${row.section}` : ''}
                  </td>

                  {/* Issue Date */}
                  <td className="px-3 py-2 text-xs text-center bg-white" style={{ minWidth: 130 }}>
                    {row.issueDate
                      ? new Date(row.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>

                  {/* Cert No */}
                  <td className="px-3 py-2 text-xs text-center bg-white" style={{ minWidth: 120 }}>
                    {row.certificateNo
                      ? <span className="font-mono bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-700">{row.certificateNo}</span>
                      : <span className="text-gray-400">—</span>}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2 text-xs text-center bg-white" style={{ minWidth: 100 }}>
                    <span className={`inline-block px-2 py-0.5 rounded border text-xs font-medium capitalize ${STATUS_COLOR[row.status] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                      {row.status || 'Draft'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="sticky right-0 z-10 bg-white px-3 py-2 text-center" style={{ minWidth: 120 }}>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedItem(row); setIsPrintOpen(true) }}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-green-600 hover:text-white hover:bg-green-600 transition"
                        title="Print"
                      >
                        <Printer size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedItem(row); setIsFormOpen(true) }}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-blue-600 hover:text-white hover:bg-blue-600 transition"
                        title="View / Edit"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedItem(row); setShowDeleteModal(true) }}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-red-500 hover:text-white hover:bg-red-500 transition"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="mt-4 flex justify-end">
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          showSizeChanger
          pageSizeOptions={['5', '10', '20', '50']}
          onChange={(p) => setPage(p)}
          onShowSizeChange={(_, size) => { setLimit(size); setPage(1) }}
        />
      </div>

      {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">Delete Certificate</h3>
                <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 pl-[52px]">
              Are you sure you want to delete the certificate of{' '}
              <span className="font-semibold text-gray-800">{selectedItem?.studentName || 'this student'}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedItem(null) }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-5 py-2 text-sm rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 transition flex items-center gap-2"
              >
                {deleteLoading && (
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Form Modal ── */}
      {isFormOpen && (
        <CertificateFormModal
          key={selectedItem?._id || 'new'}
          open={isFormOpen}
          editData={selectedItem}
          defaultType={activeTab}
          onClose={() => setIsFormOpen(false)}
          refresh={() => { setPage(1); fetchCertificates() }}
          onPrint={(cert) => { setSelectedItem(cert); setIsFormOpen(false); setIsPrintOpen(true) }}
        />
      )}

      {/* ── Print Modal ── */}
      {isPrintOpen && selectedItem && (
        <CertificatePrintModal
          open={isPrintOpen}
          certificate={selectedItem}
          onClose={() => { setIsPrintOpen(false); setSelectedItem(null) }}
        />
      )}
    </div>
  )
}

export default CertificateListing
