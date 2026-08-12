/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest, getRequest } from '../../../Helpers'
import { SessionContext } from '../../../Context/Seesion'

const AllocateTransportModal = ({
  isModalOpen,
  setIsModalOpen,
  setUpdateStatus,
  modalData, // 🔥 edit data
}) => {
  const { currentSession } = useContext(SessionContext)

  const [formData, setFormData] = useState({
    busId: '',
    routeId: '',
    sessionId: currentSession?._id || '',
  })

  const [busList, setBusList] = useState([])
  const [routeList, setRouteList] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  /* ================= LOAD BUSES ================= */
  useEffect(() => {
    getRequest('transport/buses?isPagination=false')
      .then((res) => {
        setBusList(res?.data?.data?.buses || [])
      })
      .catch(() => toast.error('Failed to load buses'))
  }, [])

  /* ================= LOAD ROUTES ================= */
  useEffect(() => {
    getRequest('transport?isPagination=false')
      .then((res) => {
        setRouteList(res?.data?.data?.routes || [])
      })
      .catch(() => toast.error('Failed to load routes'))
  }, [])

  /* ================= PREFILL (EDIT MODE) ================= */
  useEffect(() => {
    if (modalData) {
      setFormData({
        busId: modalData?.busId?._id || '',
        routeId: modalData?.routeId?._id || '',
        sessionId: currentSession?._id || '',
      })
    }
  }, [modalData, currentSession])

  /* ================= CLOSE ================= */
  const handleCancel = () => {
    setFormData({
      busId: '',
      routeId: '',
      sessionId: currentSession?._id || '',
    })
    setErrors({})
    setIsModalOpen(false)
  }

  /* ================= CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  /* ================= VALIDATION ================= */
  const validate = () => {
    const err = {}

    if (!formData.busId) err.busId = 'Bus required'
    if (!formData.routeId) err.routeId = 'Route required'

    setErrors(err)
    return Object.keys(err).length === 0
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    const apiCall = modalData
      ? putRequest({
          url: `transport/buses/assign/${modalData._id}`,
          cred: formData,
        })
      : postRequest({
          url: 'transport/buses/assign',
          cred: formData,
        })

    apiCall
      .then((res) => {
        toast.success(res?.data?.message || 'Success')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((err) => toast.error(err?.response?.data?.message || 'Operation failed'))
      .finally(() => setLoading(false))
  }

  return (
    <Modal
      title={modalData ? 'Edit Assignment' : 'Assign Bus'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Bus Select */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Select Bus<span className="text-danger">*</span>
            </label>

            <select
              name="busId"
              value={formData.busId}
              onChange={handleChange}
              className={`form-select ${errors.busId ? 'is-invalid' : ''}`}
            >
              <option value="">Select Bus</option>

              {busList.map((bus) => (
                <option key={bus._id} value={bus._id}>
                  {bus.busNumber} ({bus.driverName})
                </option>
              ))}
            </select>

            {errors.busId && <div className="invalid-feedback">{errors.busId}</div>}
          </div>

          {/* Route Select */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">
              Select Route<span className="text-danger">*</span>
            </label>

            <select
              name="routeId"
              value={formData.routeId}
              onChange={handleChange}
              className={`form-select ${errors.routeId ? 'is-invalid' : ''}`}
            >
              <option value="">Select Route</option>

              {routeList.map((route) => (
                <option key={route._id} value={route._id}>
                  {route.routeName} ({route.routeCode})
                </option>
              ))}
            </select>

            {errors.routeId && <div className="invalid-feedback">{errors.routeId}</div>}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 border rounded"
            style={{ backgroundColor: '#0c3b73', color: '#fff' }}
            disabled={loading}
          >
            {loading
              ? modalData
                ? 'Updating...'
                : 'Assigning...'
              : modalData
                ? 'Update'
                : 'Assign'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AllocateTransportModal
