/* eslint-disable prettier/prettier */
/**
 * Screen 20 — Medicine Images (API Integrated)
 */
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Image, ArrowLeft, Upload, Trash2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { getRequest, postRequest, deleteRequest } from '../../../Helpers'

const IMAGE_SLOTS = [
  { label: 'Primary',   role: 'primary'   },
  { label: 'Secondary', role: 'secondary' },
  { label: 'Back Side', role: 'back'      },
  { label: 'Strip View',role: 'strip'     },
]

export default function MedicineImages() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const [med, setMed]       = useState(null)
  const [images, setImages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [primary, setPrimary]   = useState('primary')

  useEffect(() => {
    if (id) {
      Promise.all([
        getRequest(`franchise/medicines/${id}`),
        getRequest(`franchise/medicines/${id}/images`),
      ]).then(([medRes, imgRes]) => {
        setMed(medRes?.data || medRes || null)
        setImages(imgRes?.data || [])
      }).catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [id])

  const handleUpload = async (file, role) => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('role', role || 'primary')
      formData.append('medicineId', id)
      const res = await postRequest(`franchise/medicines/${id}/images`, formData, true)
      if (res?.data) setImages(p => [...p, res.data])
      toast.success('Image uploaded successfully')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId) => {
    try {
      await deleteRequest(`franchise/medicines/${id}/images/${imageId}`)
      setImages(p => p.filter(img => img._id !== imageId))
      toast.success('Image deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const setPrimaryImage = async (imageId) => {
    try {
      await postRequest(`franchise/medicines/${id}/images/${imageId}/set-primary`, {})
      setPrimary(imageId)
      toast.success('Primary image updated')
    } catch {
      toast.error('Failed to set primary')
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#6b7280', fontSize: 14 }}>
      Loading...
    </div>
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={Image} title="Medicine Images" subtitle="Manage medicine images and photos" color="#0891b2">
        <button onClick={() => navigate(`/franchise/medicines/${id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#0891b2', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload New Image'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files[0], 'primary')} disabled={uploading} />
        </label>
      </PageHeader>

      {/* Medicine Header */}
      {med && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💊</div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{med.name}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>{med.salt || med.genericName} · {med.company || med.manufacturer}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, alignItems: 'start' }}>
        {/* Image Gallery */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 22 }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 18px' }}>Image Gallery ({images.length})</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>
            {/* Existing images from API */}
            {images.map(img => (
              <div key={img._id}
                style={{ border: `2px solid ${primary === img._id ? '#0891b2' : '#e5e7eb'}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onClick={() => setPrimary(img._id)}
                onMouseEnter={e => { if (primary !== img._id) e.currentTarget.style.borderColor = '#bae6fd' }}
                onMouseLeave={e => { if (primary !== img._id) e.currentTarget.style.borderColor = '#e5e7eb' }}>
                <div style={{ height: 130, background: 'linear-gradient(135deg,#e0e7ff,#f0fdf4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative', overflow: 'hidden' }}>
                  {img.url ? (
                    <img src={img.url} alt={img.role} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : '💊'}
                  {primary === img._id && (
                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                      <CheckCircle size={18} color="#0891b2" fill="#fff" />
                    </div>
                  )}
                </div>
                <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#111827' }}>{img.role || 'Image'}</p>
                    <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{img.label || img.role}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDelete(img._id) }}
                    style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer' }}>
                    <Trash2 size={11} color="#dc2626" />
                  </button>
                </div>
              </div>
            ))}

            {/* Empty slots from IMAGE_SLOTS for unfilled roles */}
            {IMAGE_SLOTS.filter(slot => !images.find(img => img.role === slot.role)).map(slot => (
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
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#111827' }}>{med?.name?.split(' ')[0] || 'Medicine'}</p>
                    <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>{slot.label}</p>
                  </div>
                  <label style={{ background: '#e0e7ff', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer' }}>
                    <Upload size={11} color="#0891b2" />
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files[0], slot.role)} />
                  </label>
                </div>
              </div>
            ))}

            {/* Upload New */}
            <label style={{ border: '2px dashed #e5e7eb', borderRadius: 12, height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', background: '#f9fafb' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#0891b2'}
              onMouseLeave={e => e.currentTarget.style.borderColor='#e5e7eb'}>
              <Upload size={24} color="#9ca3af" />
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Upload Image</span>
              <span style={{ fontSize: 10, color: '#d1d5db' }}>PNG, JPG up to 2MB</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files[0], 'primary')} />
            </label>
          </div>

          <p style={{ fontSize: 11, color: '#9ca3af', margin: '16px 0 0' }}>
            Supported formats: JPG, PNG, JPEG (Max size: 2MB per image)
          </p>
        </div>

        {/* Selected Image Preview */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 16px' }}>Selected Image</p>

          <div style={{ height: 180, background: 'linear-gradient(135deg,#e0e7ff,#f0fdf4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, marginBottom: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {images.find(img => img._id === primary)?.url ? (
              <img src={images.find(img => img._id === primary).url} alt="selected" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : '💊'}
          </div>

          <div style={{ marginBottom: 14 }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151' }}>Image Type</p>
            <select defaultValue={primary} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, outline: 'none', background: '#f9fafb' }}>
              {IMAGE_SLOTS.map(s => <option key={s.role} value={s.role}>{s.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => images.find(img => img._id === primary) && setPrimaryImage(primary)}
              style={{ padding: '9px', background: '#0891b2', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <CheckCircle size={13} /> Set as Primary
            </button>
            <button onClick={() => images.find(img => img._id === primary) && handleDelete(primary)}
              style={{ padding: '9px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Trash2 size={13} /> Delete Image
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
