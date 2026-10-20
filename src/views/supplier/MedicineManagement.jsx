import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Package, Search, Plus, Edit2, Trash2, Eye, 
  AlertCircle, CheckCircle, Filter, Download
} from 'lucide-react'
import { 
  Card, Table, Button, Input, Space, Tag, Modal, 
  Form, InputNumber, Select, Upload, message, Image 
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { getRequest, postRequest, putRequest, deleteRequest } from '../../Helpers'
import Cookies from 'js-cookie'

const { Option } = Select
const { TextArea } = Input

const MedicineManagement = () => {
  const navigate = useNavigate()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [form] = Form.useForm()

  useEffect(() => {
    // Check authentication
    const token = Cookies.get('supplierToken')
    if (!token) {
      navigate('/supplier/login')
      return
    }
    
    fetchMedicines()
  }, [navigate, statusFilter])

  const fetchMedicines = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchText,
        ...(statusFilter !== 'all' && { status: statusFilter })
      })
      
      const response = await getRequest(`/suppliers/medicines?${params}`)
      if (response.data.success) {
        setMedicines(response.data.data.medicines || [])
      }
    } catch (error) {
      message.error('Failed to fetch medicines')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMedicine = () => {
    setEditingMedicine(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditMedicine = (medicine) => {
    setEditingMedicine(medicine)
    form.setFieldsValue(medicine)
    setIsModalVisible(true)
  }

  const handleDeleteMedicine = (medicineId) => {
    Modal.confirm({
      title: 'Delete Medicine',
      content: 'Are you sure you want to delete this medicine? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteRequest(`/suppliers/medicines/${medicineId}`)
          message.success('Medicine deleted successfully')
          fetchMedicines()
        } catch (error) {
          message.error('Failed to delete medicine')
        }
      }
    })
  }

  const handleSubmit = async (values) => {
    try {
      if (editingMedicine) {
        await putRequest({
          url: `/suppliers/medicines/${editingMedicine._id}`,
          cred: values
        })
        message.success('Medicine updated successfully')
      } else {
        await postRequest({
          url: '/suppliers/medicines',
          cred: values
        })
        message.success('Medicine added successfully')
      }
      
      setIsModalVisible(false)
      form.resetFields()
      fetchMedicines()
    } catch (error) {
      message.error(error?.response?.data?.message || 'Operation failed')
    }
  }

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image) => (
        image ? (
          <Image 
            src={image} 
            alt="Medicine" 
            width={50} 
            height={50}
            style={{ objectFit: 'cover', borderRadius: 8 }}
          />
        ) : (
          <div style={{ 
            width: 50, height: 50, borderRadius: 8, 
            background: '#f0f0f0', display: 'flex', 
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Package size={20} color="#999" />
          </div>
        )
      )
    },
    {
      title: 'Medicine Code',
      dataIndex: 'medicineCode',
      key: 'medicineCode',
      render: (text) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{text}</span>
    },
    {
      title: 'Medicine Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.composition}</div>
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>
    },
    {
      title: 'MRP',
      dataIndex: 'mrp',
      key: 'mrp',
      render: (mrp) => `₹${mrp.toFixed(2)}`
    },
    {
      title: 'Your Price',
      dataIndex: 'supplierPrice',
      key: 'supplierPrice',
      render: (price) => (
        <span style={{ fontWeight: 600, color: '#52c41a' }}>
          ₹{price.toFixed(2)}
        </span>
      )
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock, record) => {
        const isLow = stock <= record.minStock
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isLow && <AlertCircle size={14} color="#ff4d4f" />}
            <span style={{ color: isLow ? '#ff4d4f' : '#000' }}>
              {stock} {record.unit}
            </span>
          </div>
        )
      }
    },
    {
      title: 'Status',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      render: (isAvailable) => (
        <Tag color={isAvailable ? 'green' : 'red'}>
          {isAvailable ? 'Available' : 'Out of Stock'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<Edit2 size={14} />}
            onClick={() => handleEditMedicine(record)}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDeleteMedicine(record._id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24 
      }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            Medicine Inventory
          </h1>
          <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
            Manage your medicine catalog visible to all franchises
          </p>
        </div>
        <Button 
          type="primary" 
          size="large"
          icon={<Plus size={18} />}
          onClick={handleAddMedicine}
        >
          Add New Medicine
        </Button>
      </div>

      {/* Filters */}
      <Card 
        bordered={false} 
        style={{ borderRadius: 12, marginBottom: 16 }}
      >
        <Space size="middle" wrap style={{ width: '100%' }}>
          <Input
            placeholder="Search medicines..."
            prefix={<Search size={16} />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={fetchMedicines}
          />
          
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">All Status</Option>
            <Option value="available">Available</Option>
            <Option value="outofstock">Out of Stock</Option>
            <Option value="lowstock">Low Stock</Option>
          </Select>

          <Button 
            type="primary"
            icon={<Search size={16} />}
            onClick={fetchMedicines}
          >
            Search
          </Button>

          <Button 
            icon={<Download size={16} />}
            onClick={() => {
              const csv = medicines.map(m => 
                `${m.medicineCode},${m.name},${m.category},${m.mrp},${m.supplierPrice},${m.stock}`
              ).join('\n')
              const blob = new Blob([`Code,Name,Category,MRP,Price,Stock\n${csv}`], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'medicines.csv'
              a.click()
            }}
          >
            Export CSV
          </Button>
        </Space>
      </Card>

      {/* Medicine Table */}
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={medicines}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} medicines`
          }}
        />
      </Card>

      {/* Add/Edit Medicine Modal */}
      <Modal
        title={editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Medicine Name"
            rules={[{ required: true, message: 'Please enter medicine name' }]}
          >
            <Input placeholder="e.g., Paracetamol 500mg" />
          </Form.Item>

          <Form.Item
            name="composition"
            label="Composition"
            rules={[{ required: true, message: 'Please enter composition' }]}
          >
            <Input placeholder="e.g., Paracetamol" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select category">
                <Option value="Tablet">Tablet</Option>
                <Option value="Capsule">Capsule</Option>
                <Option value="Syrup">Syrup</Option>
                <Option value="Injection">Injection</Option>
                <Option value="Ointment">Ointment</Option>
                <Option value="Drops">Drops</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="manufacturer"
              label="Manufacturer"
              rules={[{ required: true, message: 'Please enter manufacturer' }]}
            >
              <Input placeholder="e.g., Sun Pharma" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="mrp"
              label="MRP (₹)"
              rules={[{ required: true, message: 'Please enter MRP' }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              name="supplierPrice"
              label="Your Price (₹)"
              rules={[{ required: true, message: 'Please enter your price' }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              name="gst"
              label="GST (%)"
              rules={[{ required: true, message: 'Please enter GST' }]}
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="18"
              />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="stock"
              label="Current Stock"
              rules={[{ required: true, message: 'Please enter stock' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="100"
              />
            </Form.Item>

            <Form.Item
              name="minStock"
              label="Min Stock Alert"
              rules={[{ required: true, message: 'Please enter min stock' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="10"
              />
            </Form.Item>

            <Form.Item
              name="unit"
              label="Unit"
              rules={[{ required: true, message: 'Please select unit' }]}
            >
              <Select placeholder="Select unit">
                <Option value="Strip">Strip</Option>
                <Option value="Box">Box</Option>
                <Option value="Bottle">Bottle</Option>
                <Option value="Pack">Pack</Option>
                <Option value="Piece">Piece</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Medicine description..." />
          </Form.Item>

          <Form.Item
            name="isAvailable"
            label="Availability"
            initialValue={true}
            rules={[{ required: true }]}
          >
            <Select>
              <Option value={true}>Available</Option>
              <Option value={false}>Out of Stock</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsModalVisible(false)
                form.resetFields()
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MedicineManagement
