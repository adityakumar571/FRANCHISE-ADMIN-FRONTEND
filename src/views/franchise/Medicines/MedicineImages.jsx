/* eslint-disable prettier/prettier */
/**
 * Screen 20 — Medicine Images
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Image, ArrowLeft, Upload, Trash2, CheckCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { MEDICINES } from './medicineMockData'

const IMAGE_SLOTS = [
  { label: 'Primary',   role: 'primary'   },
  { label: 'Secondary', role: 'secondary' },
  { label: 'Back Side', role: 'back'      },
  { label: 'Strip View',role: 'strip'     },
]

export default function MedicineImages() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const med      = MEDICINES.find(m => m._id === id) || MEDICINES[0]
  const [primary, setPrimary] = useState('primary')

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Image} title="Medicine Images" subtitle="Manage medicine images and photos" color="#0891b2">
        <button onClick={() => navigate(`/franchise/medicines/${med._id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#0891b2', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Upload size={14} /> Upload New Image
        </button>
      </PageHeader>

      {/* Medicine Header */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💊</div>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{med.name}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>{med.salt} · {med.company}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, alignItems: 'start' }}>
        {/* Image Gallery */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 22 }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 18px' }}>Image Gallery</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>
            {IMAGE_SLOTS.map(slot => (
              <div key={slot.role}
                style={{ border: `2px solid ${primary === slot.role ? '#0891b2' : '#e5e7eb'}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onClick={() => setPrimary(slot.role)}
                onMouseEnter={e => { if (primary !== slot.role) e.currentTarget.style.borderColor = '#bae6fd' }}
                onMouseLeave={e => { if (primary !== slot.role) e.currentTarget.style.borderColor = '#e5e7eb' }}>
                <div style={{ height: 130, background: 'linear-gradient(135deg,#e0e7ff,#f0fdf4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative' }}>
                  💊
                  {primary === slot.role && (
                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                      <CheckCircle size={18} color="#0891b2" fill="#fff" />
                    </div>
                  )}
                </div>
                <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#111827' }}>{med.name.split(' ')[0]}</p>
                    <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{slot.label}</p>
                  </div>
                  <button style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer' }}>
                    <Trash2 size={11} color="#dc2626" />
                  </button>
                </div>
              </div>
            ))}

            {/* Upload New */}
            <div style={{ border: '2px dashed #e5e7eb', borderRadius: 12, height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', background: '#f9fafb' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#0891b2'}
              onMouseLeave={e => e.currentTarget.style.borderColor='#e5e7eb'}>
              <Upload size={24} color="#9ca3af" />
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Upload Image</span>
              <span style={{ fontSize: 10, color: '#d1d5db' }}>PNG, JPG up to 2MB</span>
            </div>
          </div>

          <p style={{ fontSize: 11, color: '#9ca3af', margin: '16px 0 0' }}>
            Supported formats: JPG, PNG, JPEG (Max size: 2MB per image)
          </p>
        </div>

        {/* Selected Image Preview */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 16px' }}>Selected Image</p>

          <div style={{ height: 180, background: 'linear-gradient(135deg,#e0e7ff,#f0fdf4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, marginBottom: 14, border: '1px solid #e5e7eb' }}>
            💊
          </div>

          <div style={{ marginBottom: 14 }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151' }}>Image Type</p>
            <select defaultValue={primary} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, outline: 'none', background: '#f9fafb' }}>
              {IMAGE_SLOTS.map(s => <option key={s.role} value={s.role}>{s.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button style={{ padding: '9px', background: '#0891b2', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <CheckCircle size={13} /> Set as Primary
            </button>
            <button style={{ padding: '9px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Trash2 size={13} /> Delete Image
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
