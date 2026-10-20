import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Tabs, message, Modal } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { isSupplierLoggedIn, saveSupplierSession } from '../../utils/supplierAuth'

const { TabPane } = Tabs
const { TextArea } = Input

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/'

const SupplierLogin = () => {
  const [activeTab, setActiveTab] = useState('login')
  const [loginLoading, setLoginLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if supplier is already logged in
    if (isSupplierLoggedIn()) {
      navigate('/supplier/dashboard')
    }
  }, [navigate])

  const handleLogin = async (values) => {
    setLoginLoading(true)
    try {
      console.log('🔍 Login attempt:', values.email)
      
      // ✅ Use GLOBAL supplier API (not tenant-based)
      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}suppliers/auth/login`,
        data: values,
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true // Send cookies
      })
      
      console.log('✅ Login response:', response.data)
      
      if (response.data.success) {
        message.success('Login successful!')
        
        const { token, supplier } = response.data.data
        
        console.log('📦 Supplier data:', supplier)
        
        // Use utility function to save session
        saveSupplierSession(token, supplier)
        
        console.log('🚀 Navigating to supplier dashboard')
        navigate('/supplier/dashboard')
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      console.error('❌ Error response:', error?.response?.data)
      message.error(error?.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (values) => {
    setRegisterLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}suppliers/auth/register`, values)
      
      if (response.data.success) {
        Modal.success({
          title: 'Registration Successful!',
          content: 'Your account has been created successfully. Please wait for admin approval to start using the system.',
          onOk: () => setActiveTab('login')
        })
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Registration failed')
    } finally {
      setRegisterLoading(false)
    }
  }

  const businessTypes = [
    'Manufacturer',
    'Distributor', 
    'Retailer',
    'Wholesaler',
    'Service Provider'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">PharmaNexus</h1>
          <p className="text-gray-600">Supplier Portal</p>
        </div>

        <Card className="shadow-xl">
          <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
            <TabPane tab="Login" key="login">
              <Form
                name="login"
                onFinish={handleLogin}
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Email Address"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loginLoading}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Form>

              <div className="text-center">
                <Button type="link" onClick={() => message.info('Please contact admin for password reset')}>
                  Forgot password?
                </Button>
              </div>
            </TabPane>

            <TabPane tab="Register" key="register">
              <Form
                name="register"
                onFinish={handleRegister}
                autoComplete="off"
                layout="vertical"
                scrollToFirstError
              >
                <Form.Item
                  name="companyName"
                  label="Company Name"
                  rules={[{ required: true, message: 'Please input company name!' }]}
                >
                  <Input
                    prefix={<HomeOutlined />}
                    placeholder="Enter company name"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="contactPerson"
                  label="Contact Person"
                  rules={[{ required: true, message: 'Please input contact person name!' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter contact person name"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please input email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Enter email address"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: 'Please input password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Create password (min 6 characters)"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please input phone number!' }]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Enter phone number"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="businessType"
                  label="Business Type"
                  rules={[{ required: true, message: 'Please select business type!' }]}
                >
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    size="large"
                  >
                    <option value="">Select Business Type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </Form.Item>

                {/* Address Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <Form.Item
                    name={['address', 'city']}
                    label="City"
                    rules={[{ required: true, message: 'Required!' }]}
                  >
                    <Input placeholder="City" />
                  </Form.Item>

                  <Form.Item
                    name={['address', 'state']}
                    label="State"
                    rules={[{ required: true, message: 'Required!' }]}
                  >
                    <Input placeholder="State" />
                  </Form.Item>
                </div>

                <Form.Item
                  name={['address', 'street']}
                  label="Street Address"
                  rules={[{ required: true, message: 'Please input street address!' }]}
                >
                  <Input placeholder="Enter complete address" />
                </Form.Item>

                <Form.Item
                  name={['address', 'pincode']}
                  label="Pincode"
                  rules={[{ required: true, message: 'Please input pincode!' }]}
                >
                  <Input placeholder="Enter pincode" />
                </Form.Item>

                {/* Optional Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <Form.Item
                    name="gstNumber"
                    label="GST Number (Optional)"
                  >
                    <Input placeholder="GST Number" />
                  </Form.Item>

                  <Form.Item
                    name="panNumber"
                    label="PAN Number (Optional)"
                  >
                    <Input placeholder="PAN Number" />
                  </Form.Item>
                </div>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={registerLoading}
                    className="w-full"
                  >
                    Register Company
                  </Button>
                </Form.Item>
              </Form>

              <div className="text-center text-sm text-gray-500">
                <p>* Account requires admin approval</p>
                <p>* You will receive email notification once approved</p>
              </div>
            </TabPane>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2026 PharmaNexus SaaS Platform</p>
          <p>Need help? Contact: support@pharmanexus.in</p>
        </div>
      </div>
    </div>
  )
}

export default SupplierLogin