import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, Grid3x3, Package, Building2, Plus, Pencil, Trash2, Check, X, AlertCircle } from 'lucide-react'
import { Table, Button, Input, Modal, Form, message, Tabs, Switch, Space } from 'antd'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../Helpers'
import Cookies from 'js-cookie'

/* ── Tab config ── */
const TABS = [
  { key: 'category', label: 'Medicine Categories', icon: <Grid3x3 size={15} />, color: '#1890ff', desc: 'e.g. Tablet, Capsule, Syrup' },
  { key: 'unit',     label: 'Units',               icon: <Package size={15} />,   color: '#52c41a', desc: 'e.g. Strip, Box, Bottle'  },
  { key: 'company',  label: 'Companies',            icon: <Building2 size={15} />, color: '#722ed1', desc: 'e.g. Sun Pharma, Cipla'   },
]

/* ══════════════════════════════════════════
   Single reusable tab panel
══════════════════════════════════════════ */
const MasterTab = ({ type, color }) => {
  const [data, setData]             = useState([])
  const [loading, setLoading]       = useState(false)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState(null)   // null = add mode
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  /* fetch */
  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRequest(`/suppliers/masters?type=${type}`)
      setData(res?.data?.data || [])
    } catch {
      message.error(`Failed to load ${type} list`)
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => { fetch() }, [fetch])

  /* open add modal */
  const openAdd = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  /* open edit modal */
  const openEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({ name: record.name, description: record.description || '' })
    setModalOpen(true)
  }

  /* submit add / edit */
  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      if (editing) {
        await putRequest({ url: `/suppliers/masters/${editing._id}`, cred: values })
        message.success('Updated successfully')
      } else {
        await postRequest({ url: '/suppliers/masters', cred: { type, ...values } })
        message.success('Added successfully')
      }
      setModalOpen(false)
      form.resetFields()
      fetch()
    } catch (err) {
      message.error(err?.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  /* toggle active */
  const toggleActive = async (record) => {
    try {
      await putRequest({ url: `/suppliers/masters/${record._id}`, cred: { isActive: !record.isActive } })
      message.success(`${record.name} ${record.isActive ? 'deactivated' : 'activated'}`)
      fetch()
    } catch {
      message.error('Failed to update status')
    }
  }

  /* delete */
  const handleDelete = (record) => {
    Modal.confirm({
      title: `Delete "${record.name}"?`,
      content: 'It will be hidden from all dropdowns. This is a soft delete.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteRequest(`/suppliers/masters/${record._id}`)
          message.success('Deleted successfully')
          fetch()
        } catch {
          message.error('Failed to delete')
        }
      },
    })
  }

  const columns = [
    {
      title: '#',
      key: 'idx',
      width: 50,
      render: (_, __, i) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{i + 1}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: record.isActive ? color : '#d9d9d9',
              display: 'inline-block', flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 600, color: '#111827' }}>{name}</span>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (d) => <span style={{ color: '#6b7280', fontSize: 13 }}>{d || '—'}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (active, record) => (
        <Switch
          size="small"
          checked={active}
          onChange={() => toggleActive(record)}
          checkedChildren={<Check size={10} />}
          unCheckedChildren={<X size={10} />}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<Pencil size={13} />}
            onClick={() => openEdit(record)}
            style={{ color: color }}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<Trash2 size={13} />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* Sub header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={14} color="#9ca3af" />
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            {data.length} {type}{data.length !== 1 ? 's' : ''} configured
          </span>
        </div>
        <Button
          type="primary"
          size="middle"
          icon={<Plus size={14} />}
          onClick={openAdd}
          style={{ background: color, borderColor: color }}
        >
          Add {type.charAt(0).toUpperCase() + type.slice(1)}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        size="middle"
        pagination={{ pageSize: 15, showSizeChanger: false }}
        style={{ borderRadius: 8, overflow: 'hidden' }}
      />

      {/* Add / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pencil size={14} color={color} />
            </div>
            <span>{editing ? `Edit ${type}` : `Add New ${type}`}</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        footer={null}
        width={480}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Name is required' }, { min: 2, message: 'Minimum 2 characters' }]}
          >
            <Input
              placeholder={
                type === 'category' ? 'e.g. Tablet' :
                type === 'unit'     ? 'e.g. Strip'  :
                'e.g. Sun Pharma'
              }
              size="large"
            />
          </Form.Item>

          <Form.Item name="description" label="Description (optional)">
            <Input.TextArea
              rows={2}
              placeholder="Short description or notes..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => { setModalOpen(false); form.resetFields() }}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                style={{ background: color, borderColor: color }}
              >
                {editing ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
const MedicineMasters = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const token = Cookies.get('supplierToken')
    if (!token) navigate('/supplier/login')
  }, [navigate])

  const tabItems = TABS.map((t) => ({
    key: t.key,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {t.icon} {t.label}
      </span>
    ),
    children: (
      <div style={{ paddingTop: 8 }}>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 16px' }}>{t.desc}</p>
        <MasterTab type={t.key} color={t.color} />
      </div>
    ),
  }))

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
          Medicine Masters
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          Manage Categories, Units and Companies used across medicine inventory
        </p>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '0 24px 24px', border: '1px solid #e5e7eb' }}>
        <Tabs defaultActiveKey="category" items={tabItems} size="large" />
      </div>
    </div>
  )
}

export default MedicineMasters
