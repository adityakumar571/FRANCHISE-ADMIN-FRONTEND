import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import { putRequest } from '../../Helpers'

const STATUS_COLOR = {
  available: '#22c55e',
  low: '#f59e0b',
  out: '#ef4444',
  empty: '#94a3b8',
}

const STATUS_LABEL = {
  available: 'Available',
  low: 'Low Stock',
  out: 'Out of Stock',
  empty: 'Empty',
}

function buildDemoShelves(rackData = {}) {
  const shelves = rackData.shelves || 4
  const rows = rackData.rowsPerShelf || 3
  const columns = rackData.columnsPerRow || 4
  const capacity = rackData.capacity || 40
  const currentStock = rackData.currentStock || 0

  const boxesPerShelf = columns // boxes per row in each shelf
  const totalBoxes = shelves * rows * columns

  return Array.from({ length: shelves }, (_, shelfIndex) => ({
    id: shelfIndex,
    label:
      shelfIndex === 0
        ? 'Top'
        : shelfIndex === 1
          ? 'Upper'
          : shelfIndex === 2
            ? 'Middle'
            : 'Bottom',
    boxes: Array.from({ length: boxesPerShelf }, (_, boxIndex) => {
      const index = shelfIndex * boxesPerShelf + boxIndex
      const isFilled = index < currentStock
      const randomValue = ((index * 2654435761) >>> 0) / 4294967296

      const status = !isFilled
        ? 'empty'
        : randomValue < 0.15
          ? 'out'
          : randomValue < 0.35
            ? 'low'
            : 'available'

      return {
        id: `${shelfIndex}-${boxIndex}`,
        status,
        label: isFilled ? `M${index + 1}` : '',
      }
    }),
  }))
}

function ShelfRow({ shelf, activeBox, setActiveBox }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-[34px] shrink-0 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {shelf.label}
      </div>

      <div className="relative flex items-end [transform-style:preserve-3d]">
        <div className="absolute inset-0 z-0 rounded-t bg-gradient-to-b from-slate-200 to-slate-300" />

        <div className="absolute -bottom-1.5 left-0 right-0 z-[1] h-1.5 origin-top rounded-b bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 shadow-sm [transform:rotateX(90deg)]" />

        <div className="absolute -bottom-1.5 left-0 top-0 z-[2] w-1.5 origin-right bg-slate-500 [transform:rotateY(90deg)]" />
        <div className="absolute -bottom-1.5 right-0 top-0 z-[2] w-1.5 origin-left bg-slate-500 [transform:rotateY(-90deg)]" />

        <div className="relative z-[3] flex items-end gap-[3px] px-1.5 pt-1">
          {shelf.boxes.map((box) => (
            <button
              key={box.id}
              type="button"
              className={`relative flex h-7 w-[22px] shrink-0 items-center justify-center rounded-[3px] border-0 outline-none transition-all duration-200 [transform-style:preserve-3d] hover:z-10 hover:-translate-y-1 hover:scale-105 focus-visible:ring-2 focus-visible:ring-blue-500 ${box.status === 'available'
                ? 'bg-gradient-to-br from-green-400 to-green-600'
                : box.status === 'low'
                  ? 'bg-gradient-to-br from-amber-300 to-amber-600'
                  : box.status === 'out'
                    ? 'bg-gradient-to-br from-red-400 to-red-600'
                    : 'border border-dashed border-slate-400 bg-gradient-to-br from-slate-200 to-slate-300'
                } ${activeBox === box.id
                  ? 'z-10 -translate-y-1.5 scale-110 brightness-110 drop-shadow-lg'
                  : ''
                }`}
              onClick={() =>
                setActiveBox(activeBox === box.id ? null : box.id)
              }
              title={box.label || 'Empty slot'}
              aria-label={`Box ${box.label || 'empty'}, status: ${STATUS_LABEL[box.status]}`}
            >
              {box.label && (
                <span
                  className={`pointer-events-none z-[1] text-center text-[6px] font-bold leading-none ${box.status === 'empty' ? 'text-slate-500' : 'text-white'
                    }`}
                >
                  {box.label}
                </span>
              )}

              <span
                className={`absolute -top-[5px] left-0 right-0 h-[5px] origin-bottom rounded-t-[3px] [transform:rotateX(-90deg)] ${box.status === 'available'
                  ? 'bg-green-300'
                  : box.status === 'low'
                    ? 'bg-amber-200'
                    : box.status === 'out'
                      ? 'bg-red-300'
                      : 'bg-slate-100'
                  }`}
              />

              <span
                className={`absolute -right-1 bottom-0 top-0 w-1 origin-left rounded-r-[3px] [transform:rotateY(-90deg)] ${box.status === 'available'
                  ? 'bg-green-700'
                  : box.status === 'low'
                    ? 'bg-amber-700'
                    : box.status === 'out'
                      ? 'bg-red-700'
                      : 'bg-slate-400'
                  }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

ShelfRow.propTypes = {
  shelf: PropTypes.object.isRequired,
  activeBox: PropTypes.string,
  setActiveBox: PropTypes.func.isRequired,
}

function Rack3DView({ rackData }) {
  const [activeBox, setActiveBox] = useState(null)

  const shelves = useMemo(
    () => buildDemoShelves(rackData || {}),
    [rackData],
  )

  const activeBoxData = activeBox
    ? shelves.flatMap((shelf) => shelf.boxes).find((box) => box.id === activeBox)
    : null

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[300px] px-7 py-2 [transform:rotateX(6deg)_rotateY(-14deg)] [transform-style:preserve-3d] [filter:drop-shadow(0_20px_30px_rgba(0,0,0,0.2))] transition-transform duration-500 hover:[transform:rotateX(2deg)_rotateY(-8deg)] max-[640px]:w-[240px]">
        <div className="absolute bottom-0 left-1 top-0 w-3.5 rounded bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 shadow-md" />
        <div className="absolute bottom-0 right-1 top-0 w-3.5 rounded bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 shadow-md" />

        <div className="relative flex flex-col gap-1">
          {shelves.map((shelf) => (
            <ShelfRow
              key={shelf.id}
              shelf={shelf}
              activeBox={activeBox}
              setActiveBox={setActiveBox}
            />
          ))}
        </div>

        <div className="relative mt-1 h-3 w-full rounded-b-md bg-gradient-to-b from-slate-400 to-slate-500 shadow-lg after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-1.5 after:bg-slate-600" />
      </div>

      <div className="rounded-full bg-gradient-to-r from-slate-900 to-blue-900 px-4 py-1 text-[13px] font-bold tracking-wider text-white shadow-md">
        {rackData.name || 'Rack B6'}
      </div>

      {activeBoxData && (
        <div className="flex animate-[rackFadeIn_150ms_ease] items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs text-slate-50 shadow-lg">
          <strong>{activeBoxData.label || 'Empty'}</strong>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
            style={{ background: STATUS_COLOR[activeBoxData.status] }}
          >
            {STATUS_LABEL[activeBoxData.status]}
          </span>
        </div>
      )}
    </div>
  )
}

Rack3DView.propTypes = {
  rackData: PropTypes.object.isRequired,
}

export default function Rack3DModal({ visible, onClose, rackData }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  if (!visible) return null

  // Use real data from props with fallbacks
  const data = useMemo(() => {
    if (!rackData || Object.keys(rackData).length === 0) {
      return {
        _id: '',
        name: 'Rack B6',
        code: 'B6',
        counter: 'Counter B',
        shelf: 'Middle',
        box: 'Box 02',
        capacity: 40,
        currentStock: 20,
        remainingSpace: 20,
        status: 'available',
        shelves: 4,
        rowsPerShelf: 3,
        columnsPerRow: 4,
      }
    }

    // Calculate remaining space from actual data
    const capacity = rackData.capacity || 40
    const current = rackData.currentStock || 0
    const remaining = Math.max(0, capacity - current)

    return {
      _id: rackData._id || '',
      name: rackData.name || rackData.code || 'Rack',
      code: rackData.code || 'A1',
      counter: rackData.counterName || rackData.counter || 'Counter A',
      shelf: rackData.shelf || 'Middle',
      box: rackData.box || 'Box 01',
      capacity,
      currentStock: current,
      remainingSpace: remaining,
      status: rackData.status || (current <= 0 ? 'empty' : current <= capacity * 0.25 ? 'low' : 'available'),
      shelves: rackData.shelves || 4,
      rowsPerShelf: rackData.rowsPerShelf || 3,
      columnsPerRow: rackData.columnsPerRow || 4,
    }
  }, [rackData])

  const stockPercentage =
    data.capacity > 0
      ? Math.min((data.currentStock / data.capacity) * 100, 100)
      : 0

  const startEdit = () => {
    setEditForm({
      counter: data.counter || '',
      shelf: data.shelf || '',
      capacity: data.capacity || 40,
    })
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditForm({})
  }

  const handleSave = async () => {
    if (!editForm.counter?.trim()) {
      toast.error('Counter name is required')
      return
    }

    if (!editForm.capacity || editForm.capacity < 1) {
      toast.error('Capacity must be at least 1')
      return
    }

    setSaving(true)

    try {
      if (data._id) {
        const payload = {
          warehouse: editForm.counter,
          shelf: editForm.shelf,
          capacity: parseInt(editForm.capacity, 10),
        }

        await putRequest({
          url: `/franchise/rack-management/${data._id}`,
          cred: payload,
        })

        toast.success('Rack updated successfully!')
        setIsEditing(false)

        if (rackData.onUpdate) {
          rackData.onUpdate()
        }
      } else {
        toast.error('Cannot update: Rack ID missing')
      }
    } catch (err) {
      console.error('Failed to save rack:', err)
      toast.error(
        err?.response?.data?.message || 'Failed to save rack',
      )
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full min-w-0 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Rack 3D View"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close rack modal"
        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-[1] my-auto w-full max-w-[860px] overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_rgba(0,0,0,0.3)] animate-[rackSlideUp_280ms_cubic-bezier(0.34,1.56,0.64,1)]">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-blue-900 px-5 py-4 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-md">🏪</span>
            <div>
              <h2 className="m-0 text-lg font-bold tracking-wide text-white">
                {data.name}
              </h2>
              <p className="m-0 mt-0.5 text-xs text-slate-300">
                3D Rack Visualization
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-white/10 text-lg text-white transition hover:bg-white/25"
          >
            ✕
          </button>
        </div>

        {/* Main Content */}
        <div className="grid min-h-[460px] grid-cols-[minmax(0,1fr)_260px] max-[640px]:grid-cols-1">
          {/* 3D View */}
          <div className="flex flex-col items-center gap-3 border-r border-slate-200 bg-gradient-to-br from-indigo-50 to-slate-100 p-4 sm:p-6 max-[640px]:border-r-0">
            <div className="self-start text-xs font-semibold uppercase tracking-widest text-slate-600">
              Interactive 3D View
            </div>

            <div className="flex w-full flex-1 items-center justify-center py-3 [perspective:900px]">
              <Rack3DView rackData={data} />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-2">
              {Object.entries(STATUS_LABEL).map(([key, label]) => (
                <span
                  key={key}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: STATUS_COLOR[key] }}
                  />
                  {label}
                </span>
              ))}
            </div>

            <p className="m-0 text-center text-[11px] italic text-slate-400">
              Click on any cube in the 3D view to see its details.
            </p>
          </div>

          {/* Details Panel */}
          <div className="flex flex-col gap-4 bg-white p-4 sm:p-5 max-[640px]:border-t max-[640px]:border-slate-200">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
              <h3 className="m-0 text-sm font-bold text-slate-900">
                Rack Details
              </h3>

              {!isEditing && (
                <button
                  type="button"
                  onClick={startEdit}
                  className="rounded-md border-0 bg-blue-500 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-blue-600"
                >
                  ✏️ Edit
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {/* Counter */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Counter
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.counter}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        counter: e.target.value,
                      }))
                    }
                    placeholder="e.g. Counter A"
                    className={inputClass}
                  />
                ) : (
                  <span className="text-right text-xs font-semibold text-slate-800">
                    {data.counter}
                  </span>
                )}
              </div>

              {/* Shelf */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Shelf
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.shelf}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        shelf: e.target.value,
                      }))
                    }
                    placeholder="e.g. Middle"
                    className={inputClass}
                  />
                ) : (
                  <span className="text-right text-xs font-semibold text-slate-800">
                    {data.shelf}
                  </span>
                )}
              </div>

              {/* Box */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Box
                </span>
                <span className="text-right text-xs font-semibold text-slate-800">
                  {data.box}
                </span>
              </div>

              {/* Capacity */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Capacity
                </span>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.capacity}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        capacity: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    placeholder="40"
                    min="1"
                    max="200"
                    className={inputClass}
                  />
                ) : (
                  <span className="text-right text-xs font-semibold text-slate-800">
                    {data.capacity} Items
                  </span>
                )}
              </div>

              {/* Current Stock */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Current Stock
                </span>
                <span className="text-right text-xs font-semibold text-slate-800">
                  {data.currentStock} Items
                </span>
              </div>

              {/* Remaining Space */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Remaining Space
                </span>
                <span className="text-right text-xs font-semibold text-slate-800">
                  {data.remainingSpace} Items
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Status
                </span>
                <span
                  className="rounded-full border px-2.5 py-1 text-[11px] font-bold"
                  style={{
                    background: `${STATUS_COLOR[data.status] || STATUS_COLOR.empty}22`,
                    color: STATUS_COLOR[data.status] || STATUS_COLOR.empty,
                    borderColor: `${STATUS_COLOR[data.status] || STATUS_COLOR.empty}55`,
                  }}
                >
                  ● {STATUS_LABEL[data.status] || data.status}
                </span>
              </div>
            </div>

            {/* Stock Progress */}
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="mb-2 flex justify-between text-[11px] font-semibold text-slate-600">
                <span>Stock Usage</span>
                <span>
                  {data.currentStock}/{data.capacity}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stockPercentage}%`,
                    background:
                      stockPercentage > 80
                        ? '#ef4444'
                        : stockPercentage > 50
                          ? '#f59e0b'
                          : '#22c55e',
                  }}
                />
              </div>

              <p className="m-0 mt-1.5 text-right text-[11px] text-slate-400">
                {Math.round(stockPercentage)}% filled
              </p>
            </div>

            {/* Actions */}
            <div className="mt-auto flex flex-col gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="w-full rounded-lg border-0 bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:from-sky-400 hover:to-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? '💾 Saving...' : '💾 Save Changes'}
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    ✕ Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="w-full rounded-lg border-0 bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:from-sky-400 hover:to-sky-500"
                  >
                    📦 View Medicines
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-200"
                    onClick={startEdit}
                  >
                    ✏️ Edit Rack
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Local keyframes; no separate CSS file required */}
      <style>
        {`
          @keyframes rackSlideUp {
            from { transform: translateY(40px) scale(.95); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
          }
          @keyframes rackFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  )
}

Rack3DModal.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  rackData: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    counter: PropTypes.string,
    shelf: PropTypes.string,
    box: PropTypes.string,
    capacity: PropTypes.number,
    currentStock: PropTypes.number,
    remainingSpace: PropTypes.number,
    status: PropTypes.oneOf(['available', 'low', 'out', 'empty']),
    shelves: PropTypes.array,
    onUpdate: PropTypes.func,
  }),
}

Rack3DModal.defaultProps = {
  visible: false,
  onClose: () => { },
  rackData: {},
}
