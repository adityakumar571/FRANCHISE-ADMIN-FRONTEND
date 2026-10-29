/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react'
import { Grid3x3, Package, Building2, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { Table, Button, Input, Modal, Form, message, Tabs, Switch, Space, Tag } from 'antd'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../../Helpers'

/* ── Tab config ── */
const TABS = [
  { key: 'category', label: 'Categories',  icon: <Grid3x3  size={14} />, color: '#1890ff', placeholder: 'e.g. Tablet, Capsule, Syrup'  },
  { key: 'unit',     label: 'Units',        icon: <Package  size={14} />, color: '#52c41a', placeholder: 'e.g. Strip, Box, Bottle'       },
  { key: 'company',  label: 'Companies',    icon: <Building2 size={14}/>, color: '#722ed1', placeholder: 'e.g. Sun Pharma, Cipla'        },
]

/* ══════════════════════
   Reusable tab panel
══════════════════════ */
const MasterTab = ({ type, color, placeholder }) => {
  const [data, setData]             = useState([])
  const [loading, setLoading]       = useState(false)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      // Franchise uses its own route — no supplier auth needed
      const res = await getRequest(`/franchise/medicines/masters?type=${type}`)
      if (res?.data?.data) {
        setData(res.data.data)
      } else {
        setData([])
      }
    } catch (err) {
      console.error(`Error loading ${type}:`, err)
      message.error(`Failed to load ${type}s: ${err?.response?.data?.message || err?.message}`)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => { fetch() }, [fetch, type])

  const openAdd = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({ name: record.name, description: record.description || '' })
    setModalOpen(true)
  }

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      if (editing) {
        const res = await putRequest({ url: `/franchise/medicines/masters/${editing._id}`, cred: values })
        if (res?.data?.success || res?.data?._id) {
          message.success('Updated successfully')
        } else {
          throw new Error('Update failed')
        }
      } else {
        const res = await postRequest({ url: '/franchise/medicines/masters', cred: { type, ...values } })
        if (res?.data?.success || res?.data?._id) {
          message.success('Added successfully')
        } else {
          throw new Error('Add failed')
        }
      }
      setModalOpen(false)
      form.resetFields()
      fetch()
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (record) => {
    try {
      const newStatus = !record.isActive
      await putRequest({ url: `/franchise/medicines/masters/${record._id}`, cred: { isActive: newStatus } })
      
      // Update UI immediately
      setData(prev => prev.map(item => 
        item._id === record._id ? { ...item, isActive: newStatus } : item
      ))
      message.success(`Status updated to ${newStatus ? 'Active' : 'Inactive'}`)
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to update status')
    }
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: `Delete "${record.name}"?`,
      content: 'It will be hidden from all dropdowns.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await deleteRequest(`/franchise/medicines/masters/${record._id}`)
          if (res?.data?.success || res?.status === 200) {
            message.success('Deleted successfully')
            fetch()
          } else {
            throw new Error('Delete failed')
          }
        } catch (err) {
          message.error(err?.response?.data?.message || err?.message || 'Failed to delete')
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
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: record.isActive ? color : '#d9d9d9', display: 'inline-block' }} />
          <span style={{ fontWeight: 600 }}>{name}</span>
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
      width: 90,
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
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="text" size="small" icon={<Pencil size={13} />} onClick={() => openEdit(record)} style={{ color: color }} />
          <Button type="text" size="small" danger icon={<Trash2 size={13} />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: '#6b7280' }}>{data.length} {type}{data.length !== 1 ? 's' : ''} configured</span>
        <Button type="primary" size="middle" icon={<Plus size={14} />} onClick={openAdd} style={{ background: color, borderColor: color }}>
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
      />

      <Modal
        title={editing ? `Edit ${type}` : `Add New ${type}`}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        footer={null}
        width={440}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }, { min: 2 }]}>
            <Input placeholder={placeholder} size="large" />
          </Form.Item>
          <Form.Item name="description" label="Description (optional)">
            <Input.TextArea rows={2} placeholder="Short notes..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => { setModalOpen(false); form.resetFields() }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting} style={{ background: color, borderColor: color }}>
                {editing ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

/* ══════════════════════
   MAIN PAGE
══════════════════════ */
const FranchiseMedicineMasters = () => {
  const tabItems = TABS.map((t) => ({
    key: t.key,
    label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{t.icon} {t.label}</span>,
    children: (
      <div style={{ paddingTop: 8 }}>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 16px' }}>{t.placeholder}</p>
        <MasterTab type={t.key} color={t.color} placeholder={t.placeholder} />
      </div>
    ),
  }))

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Category & Units Master</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          Manage Categories, Units and Companies used in medicine forms
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: '0 24px 24px', border: '1px solid #e5e7eb' }}>
        <Tabs defaultActiveKey="category" items={tabItems} size="large" />
      </div>
    </div>
  )
}

export default FranchiseMedicineMasters
