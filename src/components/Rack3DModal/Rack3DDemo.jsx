import React, { useState } from 'react'
import Rack3DModal from './Rack3DModal'

// Demo page to preview the 3D Rack Modal
// You can remove this file after integrating the modal into your actual layout

const demoRacks = [
  {
    name: 'Rack B6',
    counter: 'Counter B',
    shelf: 'Middle',
    box: 'Box 02',
    capacity: 40,
    currentStock: 20,
    remainingSpace: 20,
    status: 'available',
  },
  {
    name: 'Rack A1',
    counter: 'Counter A',
    shelf: 'Top',
    box: 'Box 01',
    capacity: 30,
    currentStock: 28,
    remainingSpace: 2,
    status: 'low',
  },
  {
    name: 'Rack C3',
    counter: 'Counter C',
    shelf: 'Bottom',
    box: 'Box 05',
    capacity: 35,
    currentStock: 0,
    remainingSpace: 35,
    status: 'out',
  },
]

export default function Rack3DDemo() {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif', background: '#f0f4ff', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: 8, color: '#0f172a' }}>3D Rack Modal — Demo</h2>
      <p style={{ color: '#64748b', marginBottom: 24 }}>
        Click any rack card below to open the 3D modal
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {demoRacks.map((rack) => (
          <button
            key={rack.name}
            onClick={() => setSelected(rack)}
            style={{
              padding: '16px 24px',
              borderRadius: 12,
              border: '2px solid #e2e8f0',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 600,
              color: '#1e293b',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0ea5e9')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
          >
            📦 {rack.name}
            <div style={{ fontSize: 12, fontWeight: 400, color: '#64748b', marginTop: 4 }}>
              {rack.counter} · {rack.currentStock}/{rack.capacity} items
            </div>
          </button>
        ))}
      </div>

      <Rack3DModal
        visible={!!selected}
        onClose={() => setSelected(null)}
        rackData={selected || {}}
      />
    </div>
  )
}
