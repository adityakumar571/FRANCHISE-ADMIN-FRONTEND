/* eslint-disable prettier/prettier */
import { useContext, useEffect, useState } from 'react'
import { Modal, Input, Row, Col } from 'antd'
import toast from 'react-hot-toast'
import { postRequest, putRequest } from '../../../../Helpers'
import { SessionContext } from '../../../../Context/Seesion'

const CreateAdminModal = ({ open, onClose, refresh, editData, defaultRole = 'Admin' }) => {
  const { currentSession } = useContext(SessionContext)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: defaultRole,
  })
  /* ================= EDIT MODE / RESET ================= */
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        email: editData.email || '',
        role: editData.role || defaultRole,
        status: editData.status || 'ACTIVE',
        sessionId: editData.sessionId?._id || editData.sessionId || currentSession?._id,
      })
    } else {
      setFormData({
        name: '',
        email: '',
        role: defaultRole,
        status: 'ACTIVE',
        sessionId: currentSession?._id || '',
      })
    }
  }, [editData, open, currentSession, defaultRole])

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and Email are mandatory')
      return
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role || 'Admin',
    }

    setLoading(true)
    try {
      if (editData?._id) {
        await putRequest({
          url: `admins/${editData._id}`,
          cred: payload,
        })
        toast.success('Admin Updated Successfully')
      } else {
        await postRequest({
          url: 'admins/create',
          cred: payload,
        })
        toast.success('Admin Created Successfully')
      }

      refresh()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      title={
        editData
          ? `Edit ${formData.role} Details`
          : `Create New ${defaultRole} Account`
      }
      width={500}
      okText={editData ? `Update ${formData.role}` : `Save ${defaultRole}`}
      okButtonProps={{
        className: 'px-4 py-2 border rounded',
        style: { backgroundColor: '#0c3b73', color: '#fff' },
      }}
    >
      <div className="py-2">
        <Row gutter={[0, 20]}>
          {/* Full Name Row */}
          <Col span={24}>
            <label className="mb-2 block font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              size="large"
              value={formData.name}
              placeholder="Enter full name (e.g. John Doe)"
onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}            />
          </Col>

          {/* Email Address Row */}
          <Col span={24}>
            <label className="mb-2 block font-medium text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              size="large"
              type="email"
              value={formData.email}
              placeholder="admin@school.com"
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            />
          </Col>

          {/* Role Row */}
          <Col span={24}>
            <label className="mb-2 block font-medium text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="Admin">Admin</option>
              <option value="Accountant">Accountant</option>
            </select>
            <small className="text-gray-400 mt-1 block">
              Admin — full access &nbsp;|&nbsp; Accountant — only fee collection
            </small>
          </Col>

          {/* Password Row */}
          {/* <Col span={24}>
            <label className="mb-2 block font-medium text-gray-700">
              Password {!editData && <span className="text-red-500">*</span>}
              {editData && <small className="ml-2 text-gray-400">(Leave blank to keep current)</small>}
            </label>
            <Input.Password
              size="large"
              value={formData.password}
              placeholder="Set login password"
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
            />
          </Col> */}
        </Row>
      </div>
    </Modal>
  )
}

export default CreateAdminModal
