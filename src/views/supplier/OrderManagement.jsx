import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ShoppingCart, Search, Eye, CheckCircle, 
  XCircle, Package, Truck, Calendar, Filter
} from 'lucide-react'
import { 
  Card, Table, Button, Input, Space, Tag, Modal, 
  Descriptions, Select, message, Timeline, Badge
} from 'antd'
import { getRequest, putRequest } from '../../Helpers'
import Cookies from 'js-cookie'
import moment from 'moment'

const { Option } = Select

const OrderManagement = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    // Check authentication
    const token = Cookies.get('supplierToken')
    if (!token) {
      navigate('/supplier/login')
      return
    }
    
    fetchOrders()
  }, [navigate, statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchText,
        ...(statusFilter !== 'all' && { status: statusFilter })
      })
      
      const response = await getRequest(`/suppliers/orders?${params}`)
      if (response.data.success) {
        setOrders(response.data.data.orders || [])
      }
    } catch (error) {
      message.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (orderId) => {
    try {
      const response = await getRequest(`/suppliers/orders/${orderId}`)
      if (response.data.success) {
        setSelectedOrder(response.data.data)
        setDetailsModalVisible(true)
      }
    } catch (error) {
      message.error('Failed to fetch order details')
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    Modal.confirm({
      title: `Confirm Status Update`,
      content: `Are you sure you want to mark this order as "${newStatus}"?`,
      onOk: async () => {
        try {
          await putRequest({
            url: `/suppliers/orders/${orderId}/status`,
            cred: { status: newStatus }
          })
          message.success(`Order status updated to ${newStatus}`)
          fetchOrders()
          if (selectedOrder && selectedOrder._id === orderId) {
            handleViewDetails(orderId)
          }
        } catch (error) {
          message.error('Failed to update order status')
        }
      }
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'gold',
      confirmed: 'blue',
      processing: 'cyan',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red'
    }
    return colors[status] || 'default'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Calendar size={14} />
      case 'confirmed': return <CheckCircle size={14} />
      case 'processing': return <Package size={14} />
      case 'shipped': return <Truck size={14} />
      case 'delivered': return <CheckCircle size={14} />
      case 'cancelled': return <XCircle size={14} />
      default: return null
    }
  }

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (text) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{text}</span>
    },
    {
      title: 'Franchise',
      dataIndex: 'franchiseName',
      key: 'franchiseName',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.franchiseCity}</div>
        </div>
      )
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => moment(date).format('DD MMM YYYY, hh:mm A')
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => `${items?.length || 0} items`
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <span style={{ fontWeight: 600, fontSize: 15 }}>
          ₹{amount?.toLocaleString()}
        </span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.toUpperCase()}
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
            icon={<Eye size={14} />}
            onClick={() => handleViewDetails(record._id)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button 
                type="link"
                style={{ color: '#52c41a' }}
                onClick={() => handleUpdateStatus(record._id, 'confirmed')}
              >
                Confirm
              </Button>
              <Button 
                type="link"
                danger
                onClick={() => handleUpdateStatus(record._id, 'cancelled')}
              >
                Reject
              </Button>
            </>
          )}
          {record.status === 'confirmed' && (
            <Button 
              type="link"
              onClick={() => handleUpdateStatus(record._id, 'shipped')}
            >
              Mark Shipped
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
          Order Management
        </h1>
        <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
          Manage orders from all franchises
        </p>
      </div>

      {/* Filters */}
      <Card 
        bordered={false} 
        style={{ borderRadius: 12, marginBottom: 16 }}
      >
        <Space size="middle" wrap>
          <Input
            placeholder="Search by order ID or franchise..."
            prefix={<Search size={16} />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={fetchOrders}
          />
          
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            placeholder="Filter by status"
          >
            <Option value="all">All Orders</Option>
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="processing">Processing</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>

          <Button 
            type="primary"
            icon={<Search size={16} />}
            onClick={fetchOrders}
          >
            Search
          </Button>
        </Space>
      </Card>

      {/* Orders Table */}
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} orders`
          }}
        />
      </Card>

      {/* Order Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={20} />
            <span>Order Details</span>
          </div>
        }
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedOrder && (
          <div>
            {/* Order Info */}
            <Descriptions 
              bordered 
              column={2}
              size="small"
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Order ID" span={1}>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {selectedOrder.orderCode}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={1}>
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Franchise Name" span={2}>
                {selectedOrder.franchiseName}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Person" span={1}>
                {selectedOrder.contactPerson}
              </Descriptions.Item>
              <Descriptions.Item label="Phone" span={1}>
                {selectedOrder.contactPhone}
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Address" span={2}>
                {selectedOrder.deliveryAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Order Date" span={1}>
                {moment(selectedOrder.orderDate).format('DD MMM YYYY, hh:mm A')}
              </Descriptions.Item>
              <Descriptions.Item label="Expected Delivery" span={1}>
                {selectedOrder.expectedDelivery 
                  ? moment(selectedOrder.expectedDelivery).format('DD MMM YYYY')
                  : 'Not specified'
                }
              </Descriptions.Item>
            </Descriptions>

            {/* Order Items */}
            <Card 
              title="Order Items" 
              bordered={false}
              style={{ marginBottom: 24 }}
            >
              <Table
                columns={[
                  {
                    title: 'Medicine',
                    dataIndex: 'medicineName',
                    key: 'medicineName',
                  },
                  {
                    title: 'Batch No',
                    dataIndex: 'batchNo',
                    key: 'batchNo',
                    render: (text) => text || 'N/A'
                  },
                  {
                    title: 'Unit Price',
                    dataIndex: 'unitPrice',
                    key: 'unitPrice',
                    render: (price) => `₹${price.toFixed(2)}`
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: 'Subtotal',
                    key: 'subtotal',
                    render: (_, record) => (
                      `₹${(record.unitPrice * record.quantity).toFixed(2)}`
                    )
                  }
                ]}
                dataSource={selectedOrder.items}
                pagination={false}
                rowKey="_id"
                size="small"
              />
            </Card>

            {/* Price Breakdown */}
            <Card 
              title="Price Breakdown" 
              bordered={false}
              style={{ marginBottom: 24 }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Subtotal">
                  ₹{selectedOrder.subtotal?.toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="GST">
                  ₹{selectedOrder.gstAmount?.toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="Delivery Charges">
                  ₹{selectedOrder.deliveryCharges?.toFixed(2) || '0.00'}
                </Descriptions.Item>
                <Descriptions.Item label={
                  <span style={{ fontSize: 16, fontWeight: 700 }}>Total Amount</span>
                }>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#52c41a' }}>
                    ₹{selectedOrder.totalAmount?.toLocaleString()}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Order Timeline */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <Card title="Order Timeline" bordered={false}>
                <Timeline>
                  {selectedOrder.statusHistory.map((history, index) => (
                    <Timeline.Item 
                      key={index}
                      color={getStatusColor(history.status)}
                    >
                      <div>
                        <Tag color={getStatusColor(history.status)}>
                          {history.status.toUpperCase()}
                        </Tag>
                        <span style={{ marginLeft: 8, color: '#666' }}>
                          {moment(history.date).format('DD MMM YYYY, hh:mm A')}
                        </span>
                      </div>
                      {history.remarks && (
                        <div style={{ marginTop: 4, color: '#666', fontSize: 12 }}>
                          {history.remarks}
                        </div>
                      )}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {selectedOrder.status === 'pending' && (
                <>
                  <Button 
                    type="primary"
                    onClick={() => {
                      handleUpdateStatus(selectedOrder._id, 'confirmed')
                      setDetailsModalVisible(false)
                    }}
                  >
                    Confirm Order
                  </Button>
                  <Button 
                    danger
                    onClick={() => {
                      handleUpdateStatus(selectedOrder._id, 'cancelled')
                      setDetailsModalVisible(false)
                    }}
                  >
                    Reject Order
                  </Button>
                </>
              )}
              {selectedOrder.status === 'confirmed' && (
                <Button 
                  type="primary"
                  onClick={() => {
                    handleUpdateStatus(selectedOrder._id, 'shipped')
                    setDetailsModalVisible(false)
                  }}
                >
                  Mark as Shipped
                </Button>
              )}
              <Button onClick={() => setDetailsModalVisible(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default OrderManagement
