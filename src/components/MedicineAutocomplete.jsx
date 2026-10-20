import React, { useState, useEffect, useRef } from 'react'
import { CFormInput, CFormLabel, CListGroup, CListGroupItem, CBadge } from '@coreui/react'
import axios from 'axios'
import './MedicineAutocomplete.css'

const MedicineAutocomplete = ({ 
  value, 
  onChange, 
  onSelect,
  label = 'Generic Medicine Name',
  placeholder = 'Search medicine (e.g., Paracetamol, Ibuprofen)',
  required = true 
}) => {
  const [searchTerm, setSearchTerm] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef(null)

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search medicines with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchMedicines(searchTerm)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const searchMedicines = async (query) => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${API_URL}/api/master-medicines/search?q=${encodeURIComponent(query)}`
      )

      if (response.data.status) {
        setSuggestions(response.data.data || [])
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Medicine search error:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (onChange) {
      onChange(value)
    }
  }

  const handleSelect = (medicine) => {
    setSearchTerm(medicine.genericName)
    setShowSuggestions(false)
    
    if (onSelect) {
      onSelect(medicine)
    }
    if (onChange) {
      onChange(medicine.genericName)
    }
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <CFormLabel>
        {label} {required && <span className="text-danger">*</span>}
      </CFormLabel>
      <CFormInput
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true)
          }
        }}
        required={required}
        autoComplete="off"
      />
      
      {loading && (
        <div className="text-muted small mt-1">
          Searching...
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <CListGroup
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
            marginTop: '2px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          {suggestions.map((medicine) => (
            <CListGroupItem
              key={medicine.id}
              onClick={() => handleSelect(medicine)}
              style={{ cursor: 'pointer' }}
              className="medicine-suggestion-item"
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{medicine.genericName}</strong>
                  <div className="small text-muted">{medicine.category}</div>
                  {medicine.commonBrands && medicine.commonBrands.length > 0 && (
                    <div className="small text-muted mt-1">
                      Brands: {medicine.commonBrands.slice(0, 3).join(', ')}
                      {medicine.commonBrands.length > 3 && '...'}
                    </div>
                  )}
                </div>
                <CBadge color="secondary" className="ms-2">
                  {medicine.category}
                </CBadge>
              </div>
            </CListGroupItem>
          ))}
        </CListGroup>
      )}

      {showSuggestions && suggestions.length === 0 && searchTerm.length >= 2 && !loading && (
        <div
          className="border rounded p-2 mt-1 small text-muted"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'white',
          }}
        >
          No medicines found. You can still enter the name manually.
        </div>
      )}
    </div>
  )
}

export default MedicineAutocomplete
