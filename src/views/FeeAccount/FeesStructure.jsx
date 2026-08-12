import React, { useContext, useEffect, useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Space,
  Popconfirm,
  Divider,
  message,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined } from '@ant-design/icons'
import { IndianRupee } from 'lucide-react'
import { SessionContext } from '../../Context/Seesion'

const FeesStructure = () => {
  const [selectedSession, setSelectedSession] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const { currentSession, sessionsList } = useContext(SessionContext)
  const [fees, setFees] = useState([
    {
      id: 1,
      class: 'Nursery',
      tuition: 15000,
      admission: 5000,
      exam: 2000,
      transport: 12000,
      session: '2027-2028',
    },
    {
      id: 2,
      class: 'LKG',
      tuition: 16000,
      admission: 5000,
      exam: 2000,
      transport: 12000,
      session: '2027-2028',
    },
    {
      id: 3,
      class: 'UKG',
      tuition: 17000,
      admission: 5000,
      exam: 2500,
      transport: 12000,
      session: '2027-28',
    },
    {
      id: 4,
      class: 'Class 1',
      tuition: 18000,
      admission: 6000,
      exam: 2500,
      transport: 13000,
      session: '2027-2028',
    },
    {
      id: 5,
      class: 'Class 2',
      tuition: 19000,
      admission: 6000,
      exam: 3000,
      transport: 13000,
      session: '2027-2028',
    },
    {
      id: 6,
      class: 'Class 3',
      tuition: 20000,
      admission: 6000,
      exam: 3000,
      transport: 14000,
      session: '2027-28',
    },
    {
      id: 7,
      class: 'Class 4',
      tuition: 21000,
      admission: 7000,
      exam: 3500,
      transport: 14000,
      session: '2025-26',
    },
    {
      id: 8,
      class: 'Class 5',
      tuition: 22000,
      admission: 7000,
      exam: 3500,
      transport: 15000,
      session: '2025-26',
    },
    {
      id: 9,
      class: 'Class 6',
      tuition: 24000,
      admission: 8000,
      exam: 4000,
      transport: 16000,
      session: '2025-26',
    },
    {
      id: 10,
      class: 'Class 7',
      tuition: 26000,
      admission: 8000,
      exam: 4500,
      transport: 17000,
      session: '2025-26',
    },
    {
      id: 11,
      class: 'Class 8',
      tuition: 28000,
      admission: 9000,
      exam: 5000,
      transport: 18000,
      session: '2025-26',
    },
    {
      id: 12,
      class: 'Class 9',
      tuition: 30000,
      admission: 10000,
      exam: 6000,
      transport: 20000,
      session: '2025-26',
    },
  ])
  useEffect(() => {
    if (currentSession?._id) {
      setSelectedSession(currentSession._id)
    }
  }, [currentSession])

  const [form] = Form.useForm()

  const sessions = [...new Set(fees.map((f) => f.session))]

  const filteredFees = fees.filter((f) => f.session === selectedSession || !selectedSession)

  const calculateTotal = (fee) =>
    Number(fee.tuition || 0) +
    Number(fee.admission || 0) +
    Number(fee.exam || 0) +
    Number(fee.transport || 0)

  /* ---------- MODAL HANDLERS ---------- */

  const openAddModal = () => {
    setEditData(null)
    form.resetFields()
    form.setFieldsValue({ session: selectedSession })
    setModalOpen(true)
  }

  const openEditModal = (record) => {
    setEditData(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditData(null)
    form.resetFields()
  }

  const handleSubmit = (values) => {
    const exists = fees.some(
      (f) => f.class === values.class && f.session === values.session && f.id !== editData?.id,
    )

    if (exists) {
      message.error('Fee for this class & session already exists')
      return
    }

    if (editData) {
      setFees((prev) =>
        prev.map((item) => (item.id === editData.id ? { ...values, id: editData.id } : item)),
      )
      message.success('Fee updated successfully')
    } else {
      setFees((prev) => [...prev, { ...values, id: Date.now() }])
      message.success('Fee added successfully')
    }

    closeModal()
  }

  const deleteFee = (id) => {
    setFees((prev) => prev.filter((item) => item.id !== id))
    message.success('Fee deleted')
  }

  /* ---------- TABLE COLUMNS ---------- */

  const columns = [
    {
      title: 'Sr. No.',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Class',
      dataIndex: 'class',
    },
    {
      title: 'Tuition',
      dataIndex: 'tuition',
      render: (v) => `₹${v}`,
    },
    {
      title: 'Admission',
      dataIndex: 'admission',
      render: (v) => `₹${v}`,
    },
    {
      title: 'Exam',
      dataIndex: 'exam',
      render: (v) => `₹${v}`,
    },
    {
      title: 'Transport',
      dataIndex: 'transport',
      render: (v) => `₹${v}`,
    },
    {
      title: 'Total',
      render: (_, record) => <b style={{ color: '#4f46e5' }}>₹{calculateTotal(record)}</b>,
    },
    {
      title: 'Action',
      align: 'center',
      render: (_, record) => (
        <Space>
          {/* Edit */}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              color: '#2563eb', // blue-600
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#2563eb'
            }}
          />

          {/* Delete */}
          <Popconfirm title="Delete this fee structure?" onConfirm={() => deleteFee(record.id)}>
            <Button
              danger
              type="link"
              icon={<DeleteOutlined />}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                color: '#dc2626', // red-600
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#dc2626'
              }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  /* ---------- UI ---------- */

  return (
    <div className="">
      {/* HEADER */}
      <div className="mb-4 bg-white px-4 py-2 rounded-lg border">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <IndianRupee style={{ color: '#e24028' }} />
          Fees Structure
        </h2>
        <p className="text-gray-500 text-sm">Automated fees tracking system</p>
      </div>

      {/* FILTER + ADD */}
      <div className="flex justify-between items-center mb-3">
        <Select value={selectedSession} onChange={setSelectedSession} style={{ width: 160 }}>
          {sessionsList.map((s) => (
            <Select.Option key={s._id} value={s._id}>
              {s.sessionName}
            </Select.Option>
          ))}
        </Select>

        <Button type=" " className='bg-[#0c3b73] text-white' icon={<PlusOutlined />} onClick={openAddModal}>
          Add Class
        </Button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg border fees-compact-table overflow-y-auto">
        <Table
          columns={columns}
          dataSource={filteredFees}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: 'No data found' }}
        />
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        title={editData ? 'Edit Fee Structure' : 'Add New Class Fee'}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        centered
        width={520}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Class Name"
                name="class"
                rules={[{ required: true, message: 'Class required' }]}
              >
                <Input placeholder="e.g. Class 1" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Session" name="session" rules={[{ required: true }]}>
                <Select>
                  {sessionsList.map((s) => (
                    <Select.Option key={s._id} value={s._id}>
                      {s.sessionName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            {['tuition', 'admission', 'exam', 'transport'].map((field) => (
              <Col span={12} key={field}>
                <Form.Item
                  label={`${field.charAt(0).toUpperCase() + field.slice(1)} Fee`}
                  name={field}
                  rules={[{ required: true }]}
                >
                  <Input type="number" />
                </Form.Item>
              </Col>
            ))}
          </Row>

          <Divider />

          <Button type="" className='bg-[#0c3b73] text-white' htmlType="submit" block size="large">
            {editData ? 'Update Fee' : 'Add Fee Structure'}
          </Button>
        </Form>
        <style>
          {`
  :where(.css-dev-only-do-not-override-1odpy5d).ant-divider-horizontal {
    display: flex;
    clear: both;
    width: 100%;
    min-width: 100%;
    margin: 0px 0;
  }
`}
        </style>

      </Modal>
    </div>
  )
}

export default FeesStructure
