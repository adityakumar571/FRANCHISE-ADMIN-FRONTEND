/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { X, AlertCircle, CheckCircle2 } from 'lucide-react'

/**
 * BatchSelectorModal - FIFO Batch Selection for Sales
 * Shows batches sorted by expiry (earliest first)
 * User can select which batch to sell from
 */
const BatchSelectorModal = ({ medicine, isOpen, onClose, onSelect }) => {
  const [selectedBatchId, setSelectedBatchId] = useState(null)
  const [selectedQty, setSelectedQty] = useState(1)

  if (!isOpen || !medicine) return null

  // Get active batches sorted by expiry (FIFO)
  const activeBatches = (medicine.batches || [])
    .filter(b => b.isActive && (b.availableQty || b.quantity) > 0)
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))

  // Calculate days left for each batch
  const getBatchInfo = (batch) => {
    const now = new Date()
    const expiry = new Date(batch.expiryDate)
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
    const qty = batch.availableQty !== undefined ? batch.availableQty : batch.quantity
    
    return {
      daysLeft,
      qty,
      isExpired: daysLeft < 0,
      isExpiringSoon: daysLeft <= 30 && daysLeft >= 0,
    }
  }

  const handleSelect = () => {
    if (!selectedBatchId || !selectedQty) return
    const batch = activeBatches.find(b => b._id === selectedBatchId)
    if (batch) {
      onSelect({ batch, qty: parseInt(selectedQty) })
      setSelectedBatchId(null)
      setSelectedQty(1)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        maxWidth: 500,
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
            Select Batch - {medicine.name}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Box */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
          fontSize: 12,
          color: '#166534',
          display: 'flex',
          gap: 8,
        }}>
          <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0 }}>
            ⏱️ <strong>FIFO Method:</strong> Batches are sorted by expiry date. Select the one expiring first (recommended).
          </p>
        </div>

        {/* Batches List */}
        {activeBatches.length === 0 ? (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: 16,
            textAlign: 'center',
            color: '#991b1b',
            fontSize: 12,
          }}>
            <AlertCircle size={16} style={{ margin: '0 auto 8px', display: 'block' }} />
            No active batches available
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            {activeBatches.map((batch, idx) => {
              const info = getBatchInfo(batch)
              const isSelected = selectedBatchId === batch._id
              
              return (
                <div
                  key={batch._id}
                  onClick={() => setSelectedBatchId(batch._id)}
                  style={{
                    border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 10,
                    cursor: 'pointer',
                    background: isSelected ? '#eff6ff' : '#fff',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827' }}>
                        {idx === 0 && '🔴 FIFO: '} Batch {batch.batchNo}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b7280' }}>
                        Mfg: {new Date(batch.purchaseDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <span style={{
                      background: info.isExpired ? '#fee2e2' : info.isExpiringSoon ? '#fef3c7' : '#d1fae5',
                      color: info.isExpired ? '#991b1b' : info.isExpiringSoon ? '#92400e' : '#166534',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      {info.isExpired ? '❌ Expired' : `${info.daysLeft} days`}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                    <div>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: 11 }}>Expiry</p>
                      <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#111827' }}>
                        {new Date(batch.expiryDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: 11 }}>Available Qty</p>
                      <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#111827' }}>
                        {info.qty} units
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: 11 }}>MRP</p>
                      <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#111827' }}>
                        ₹{batch.mrp || '—'}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: 11 }}>Purchase Price</p>
                      <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#111827' }}>
                        ₹{batch.purchasePrice || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Quantity Selector */}
        {selectedBatchId && (
          <div style={{ marginBottom: 20, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Quantity to Sell
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                min={1}
                max={activeBatches.find(b => b._id === selectedBatchId)?.availableQty || 1}
                value={selectedQty}
                onChange={(e) => setSelectedQty(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                / {activeBatches.find(b => b._id === selectedBatchId)?.availableQty || 0} available
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              background: '#fff',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer',
              color: '#374151',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedBatchId || !selectedQty}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: selectedBatchId && selectedQty ? '#3b82f6' : '#d1d5db',
              color: '#fff',
              fontWeight: 600,
              fontSize: 12,
              cursor: selectedBatchId && selectedQty ? 'pointer' : 'not-allowed',
            }}
          >
            Select & Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default BatchSelectorModal
