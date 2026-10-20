/* eslint-disable prettier/prettier */
/**
 * Medicine Images - Complete Flow with Primary Selection
 */
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Image, ArrowLeft, Upload, Trash2, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { getRequest, fileUpload, deleteRequest, postRequest } from '../../../Helpers'

export default function MedicineImages() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [med, setMed] = useState(null)
  const [images, setImages] = useState([])
  const [primaryImageUrl, setPrimaryImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!id) {
      toast.error('Medicine ID missing')
      navigate('/franchise/medicines')
      return
    }
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load medicine details
      const medRes = await getRequest(`/franchise/medicines/${id}`)
      const medicine = medRes?.data?.data || medRes?.data
      setMed(medicine)
      
      // Get primary image URL from medicine
      setPrimaryImageUrl(medicine?.imageUrl || '')

      // Load images
      const imgRes = await getRequest(`/franchise/medicines/${id}/images`)
      const rawImages = imgRes?.data?.data?.images || imgRes?.data?.images || []
      
      // Transform string URLs to objects
      const transformed = Array.isArray(rawImages) ? rawImages.map((url, idx) => ({
        url: url,
        isPrimary: url === medicine?.imageUrl,
        index: idx
      })) : []
      
      setImages(transformed)
    } catch (err) {
      console.error('Load failed:', err)
      toast.error('Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file) => {
    if (!file) return
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const res = await fileUpload({ 
        url: `/franchise/medicines/${id}/images`, 
        cred: formData 
      })
      
      if (res?.data?.data?.url) {
        toast.success('✅ Image uploaded')
        loadData() // Reload to get updated list
      }
    } catch (err) {
      console.error('Upload failed:', err)
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageUrl) => {
    if (!window.confirm('Delete this image?')) return
    
    try {
      const encodedUrl = encodeURIComponent(imageUrl)
      await deleteRequest(`/franchise/medicines/${id}/images/${encodedUrl}`)
      toast.success('Image deleted')
      loadData() // Reload
    } catch (err) {
      console.error('Delete failed:', err)
      toast.error('Delete failed')
    }
  }

  const handleSetPrimary = async (imageUrl) => {
    try {
      const encodedUrl = encodeURIComponent(imageUrl)
      await postRequest({ 
        url: `/franchise/medicines/${id}/images/${encodedUrl}/set-primary`, 
        cred: {} 
      })
      toast.success('⭐ Primary image set')
      setPrimaryImageUrl(imageUrl)
      
      // Update local state
      setImages(imgs => imgs.map(img => ({
        ...img,
        isPrimary: img.url === imageUrl
      })))
    } catch (err) {
      console.error('Set primary failed:', err)
      toast.error('Failed to set primary')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
        <div style={{ width: 40, height: 40, border: '4px solid #e5e7eb', borderTop: '4px solid #0891b2', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading images...</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: 20 }}>
      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Image size={24} color="#0891b2" />
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Medicine Images</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{med?.name || 'Loading...'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              onClick={() => navigate('/franchise/medicines')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}>
              <ArrowLeft size={14} /> Back
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#0891b2', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Image'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files[0])} disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Medicine Info Card */}
        {med && (
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💊</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{med.name}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                {med.salt || med.genericName} · {med.company || med.manufacturer} · {med.category}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Stock</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#059669' }}>{med.currentStock || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Gallery */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
            📸 Gallery ({images.length} {images.length === 1 ? 'image' : 'images'})
          </h3>
          {primaryImageUrl && (
            <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={14} color="#f59e0b" fill="#f59e0b" />
              Primary image set
            </div>
          )}
        </div>

        {images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#f9fafb', borderRadius: 8, border: '2px dashed #e5e7eb' }}>
            <Image size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280', fontWeight: 600 }}>No images uploaded yet</p>
            <p style={{ margin: '8px 0 16px', fontSize: 12, color: '#9ca3af' }}>Upload your first medicine image to get started</p>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#0891b2', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <Upload size={14} /> Upload First Image
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files[0])} />
            </label>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {images.map((img, idx) => (
              <div key={idx} style={{ 
                border: img.isPrimary ? '3px solid #0891b2' : '1px solid #e5e7eb', 
                borderRadius: 12, 
                overflow: 'hidden', 
                background: '#fff',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}>
                {/* Image */}
                <div style={{ 
                  height: 180, 
                  background: 'linear-gradient(135deg, #e0e7ff, #f0fdf4)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={img.url} 
                    alt={`Medicine ${idx + 1}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML += '<div style="font-size: 48px;">💊</div>'
                    }}
                  />
                  
                  {/* Primary Badge */}
                  {img.isPrimary && (
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: '#0891b2',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                      <Star size={12} fill="#fff" />
                      PRIMARY
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#111827' }}>Image {idx + 1}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>
                      {img.isPrimary ? 'Primary image' : 'Click star to set'}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 6 }}>
                    {/* Set Primary Button */}
                    {!img.isPrimary && (
                      <button 
                        onClick={() => handleSetPrimary(img.url)}
                        style={{ 
                          background: '#fef3c7', 
                          border: 'none', 
                          borderRadius: 6, 
                          padding: '6px 8px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                        title="Set as primary">
                        <Star size={14} color="#f59e0b" />
                      </button>
                    )}
                    
                    {/* Delete Button */}
                    <button 
                      onClick={() => handleDelete(img.url)}
                      style={{ 
                        background: '#fee2e2', 
                        border: 'none', 
                        borderRadius: 6, 
                        padding: '6px 8px', 
                        cursor: 'pointer' 
                      }}
                      title="Delete image">
                      <Trash2 size={14} color="#dc2626" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div style={{ marginTop: 20, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#1e40af', fontWeight: 600 }}>ℹ️ Tips:</p>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 12, color: '#1e3a8a' }}>
          <li>Upload clear, well-lit photos of the medicine</li>
          <li>First uploaded image becomes primary automatically</li>
          <li>Click the ⭐ star icon to set any image as primary</li>
          <li>Primary image is shown in medicine lists and POS</li>
          <li>Maximum file size: 2MB per image</li>
        </ul>
      </div>
    </div>
  )
}
