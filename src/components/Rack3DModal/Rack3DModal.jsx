import React, { useState } from 'react'
import PropTypes from 'prop-types'
import './Rack3DModal.css'

/**
 * Rack3DModal — A pure CSS 3D rack viewer component.
 *
 * Props:
 *  - visible   : boolean  — show/hide the modal
 *  - onClose   : fn       — called when user closes the modal
 *  - rackData  : object   — rack info (see defaultProps for shape)
 */

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

// Build a demo shelf layout if no shelves are provided
function buildDemoShelves(capacity = 40, currentStock = 20) {
  const shelves = 4
  const boxesPerShelf = Math.ceil(capacity / shelves)
  const filled = currentStock

  let placed = 0
  return Array.from({ length: shelves }, (_, si) => ({
    id: si,
    label: si === 0 ? 'Top' : si === 1 ? 'Upper' : si === 2 ? 'Middle' : 'Bottom',
    boxes: Array.from({ length: boxesPerShelf }, (_, bi) => {
      const index = si * boxesPerShelf + bi
      const isFilled = index < filled
      placed++
      const rand = Math.random()
      const status =
        !isFilled
          ? 'empty'
          : rand < 0.15
          ? 'out'
          : rand < 0.35
          ? 'low'
          : 'available'
      return {
        id: `${si}-${bi}`,
        status,
        label: isFilled ? `M${index + 1}` : '',
      }
    }),
  }))
}

function ShelfRow({ shelf, activeBox, setActiveBox }) {
  return (
    <div className="rack3d__shelf-row">
      {/* shelf label */}
      <div className="rack3d__shelf-label">{shelf.label}</div>

      {/* 3D shelf surface */}
      <div className="rack3d__shelf-scene">
        {/* Back wall of shelf */}
        <div className="rack3d__shelf-back" />
        {/* Floor of shelf */}
        <div className="rack3d__shelf-floor" />
        {/* Left side */}
        <div className="rack3d__shelf-side rack3d__shelf-side--left" />
        {/* Right side */}
        <div className="rack3d__shelf-side rack3d__shelf-side--right" />

        {/* Boxes on shelf */}
        <div className="rack3d__boxes">
          {shelf.boxes.map((box) => (
            <button
              key={box.id}
              className={`rack3d__box rack3d__box--${box.status} ${
                activeBox === box.id ? 'rack3d__box--active' : ''
              }`}
              onClick={() => setActiveBox(activeBox === box.id ? null : box.id)}
              title={box.label || 'Empty slot'}
              aria-label={`Box ${box.label || 'empty'}, status: ${STATUS_LABEL[box.status]}`}
            >
              {box.label && <span className="rack3d__box-label">{box.label}</span>}
              {/* Box top face */}
              <span className="rack3d__box-top" />
              {/* Box right face */}
              <span className="rack3d__box-right" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Rack3DView({ rackData }) {
  const [activeBox, setActiveBox] = useState(null)
  const shelves = rackData.shelves || buildDemoShelves(rackData.capacity, rackData.currentStock)

  // Find active box details
  const activeBoxData = activeBox
    ? shelves.flatMap((s) => s.boxes).find((b) => b.id === activeBox)
    : null

  return (
    <div className="rack3d__viewer">
      {/* Rack frame */}
      <div className="rack3d__frame">
        {/* Left pole */}
        <div className="rack3d__pole rack3d__pole--left" />
        {/* Right pole */}
        <div className="rack3d__pole rack3d__pole--right" />

        {/* Shelves */}
        <div className="rack3d__shelves-container">
          {shelves.map((shelf) => (
            <ShelfRow
              key={shelf.id}
              shelf={shelf}
              activeBox={activeBox}
              setActiveBox={setActiveBox}
            />
          ))}
        </div>

        {/* Floor bar */}
        <div className="rack3d__floor-bar" />
      </div>

      {/* Rack name badge */}
      <div className="rack3d__name-badge">{rackData.name || 'Rack B6'}</div>

      {/* Box tooltip */}
      {activeBoxData && (
        <div className="rack3d__box-tooltip">
          <strong>{activeBoxData.label || 'Empty'}</strong>
          <span
            className="rack3d__tooltip-status"
            style={{ background: STATUS_COLOR[activeBoxData.status] }}
          >
            {STATUS_LABEL[activeBoxData.status]}
          </span>
        </div>
      )}
    </div>
  )
}

export default function Rack3DModal({ visible, onClose, rackData }) {
  if (!visible) return null

  const data = {
    name: 'Rack B6',
    counter: 'Counter B',
    shelf: 'Middle',
    box: 'Box 02',
    capacity: 40,
    currentStock: 20,
    remainingSpace: 20,
    status: 'available',
    ...rackData,
  }

  return (
    <div className="rack3d__overlay" role="dialog" aria-modal="true" aria-label="Rack 3D View">
      {/* Backdrop */}
      <div className="rack3d__backdrop" onClick={onClose} />

      {/* Modal card */}
      <div className="rack3d__modal">
        {/* Header */}
        <div className="rack3d__header">
          <div className="rack3d__header-left">
            <span className="rack3d__icon">🏪</span>
            <div>
              <h2 className="rack3d__title">{data.name}</h2>
              <p className="rack3d__subtitle">3D Rack Visualization</p>
            </div>
          </div>
          <button className="rack3d__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="rack3d__body">
          {/* Left: 3D View */}
          <div className="rack3d__view-panel">
            <div className="rack3d__view-title">Interactive 3D View</div>
            <div className="rack3d__scene-wrapper">
              <Rack3DView rackData={data} />
            </div>
            {/* Legend */}
            <div className="rack3d__legend">
              {Object.entries(STATUS_LABEL).map(([key, label]) => (
                <span key={key} className="rack3d__legend-item">
                  <span
                    className="rack3d__legend-dot"
                    style={{ background: STATUS_COLOR[key] }}
                  />
                  {label}
                </span>
              ))}
            </div>
            <p className="rack3d__hint">Click on any box to see details</p>
          </div>

          {/* Right: Details */}
          <div className="rack3d__details-panel">
            <div className="rack3d__details-title">Rack Details</div>

            <div className="rack3d__details-grid">
              {[
                { label: 'Counter', value: data.counter },
                { label: 'Shelf', value: data.shelf },
                { label: 'Box', value: data.box },
                { label: 'Capacity', value: `${data.capacity} Items` },
                { label: 'Current Stock', value: `${data.currentStock} Items` },
                { label: 'Remaining Space', value: `${data.remainingSpace} Items` },
              ].map(({ label, value }) => (
                <div key={label} className="rack3d__detail-row">
                  <span className="rack3d__detail-label">{label}</span>
                  <span className="rack3d__detail-value">{value}</span>
                </div>
              ))}

              <div className="rack3d__detail-row">
                <span className="rack3d__detail-label">Status</span>
                <span
                  className="rack3d__status-badge"
                  style={{
                    background: STATUS_COLOR[data.status] + '22',
                    color: STATUS_COLOR[data.status],
                    border: `1px solid ${STATUS_COLOR[data.status]}55`,
                  }}
                >
                  ● {STATUS_LABEL[data.status] || data.status}
                </span>
              </div>
            </div>

            {/* Stock bar */}
            <div className="rack3d__stock-section">
              <div className="rack3d__stock-header">
                <span>Stock Usage</span>
                <span>
                  {data.currentStock}/{data.capacity}
                </span>
              </div>
              <div className="rack3d__stock-track">
                <div
                  className="rack3d__stock-fill"
                  style={{
                    width: `${Math.min((data.currentStock / data.capacity) * 100, 100)}%`,
                    background:
                      data.currentStock / data.capacity > 0.8
                        ? '#ef4444'
                        : data.currentStock / data.capacity > 0.5
                        ? '#f59e0b'
                        : '#22c55e',
                  }}
                />
              </div>
              <div className="rack3d__stock-pct">
                {Math.round((data.currentStock / data.capacity) * 100)}% filled
              </div>
            </div>

            {/* Action buttons */}
            <div className="rack3d__actions">
              <button className="rack3d__btn rack3d__btn--primary">View Medicines</button>
              <button className="rack3d__btn rack3d__btn--secondary">Edit Rack</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

Rack3DModal.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  rackData: PropTypes.shape({
    name: PropTypes.string,
    counter: PropTypes.string,
    shelf: PropTypes.string,
    box: PropTypes.string,
    capacity: PropTypes.number,
    currentStock: PropTypes.number,
    remainingSpace: PropTypes.number,
    status: PropTypes.oneOf(['available', 'low', 'out', 'empty']),
    shelves: PropTypes.array,
  }),
}

Rack3DModal.defaultProps = {
  visible: false,
  onClose: () => {},
  rackData: {},
}
