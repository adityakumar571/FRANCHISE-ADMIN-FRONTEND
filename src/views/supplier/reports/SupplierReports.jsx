import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormSelect,
  CSpinner,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import { BarChart3, TrendingUp, Package, Building, Calendar } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const SupplierReports = () => {
  const [activeTab, setActiveTab] = useState('sales')
  const [period, setPeriod] = useState('30days')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const supplierId = localStorage.getItem('supplierId')
      const response = await getRequest(
        `/api/franchise/suppliers/orders/analytics?supplierId=${supplierId}&period=${period}`
      )
      if (response.success) {
        setAnalytics(response.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  // Sales Report - Daily Trends Chart
  const getDailyTrendsChartData = () => {
    if (!analytics?.dailyTrends) return null

    return {
      labels: analytics.dailyTrends.map((item) =>
        new Date(item._id).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      ),
      datasets: [
        {
          label: 'Orders',
          data: analytics.dailyTrends.map((item) => item.orders),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Revenue (₹)',
          data: analytics.dailyTrends.map((item) => item.revenue),
          type: 'line',
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2,
          yAxisID: 'y1',
        },
      ],
    }
  }

  const dailyTrendsOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Orders',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Revenue (₹)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  // Franchise-wise Report Chart
  const getFranchiseChartData = () => {
    if (!analytics?.franchiseOrders) return null

    const top10 = analytics.franchiseOrders.slice(0, 10)

    return {
      labels: top10.map((item) => item.franchiseName || item.franchiseCode),
      datasets: [
        {
          label: 'Total Amount (₹)',
          data: top10.map((item) => item.totalAmount),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
            'rgba(83, 102, 255, 0.6)',
            'rgba(255, 99, 255, 0.6)',
            'rgba(99, 255, 132, 0.6)',
          ],
        },
      ],
    }
  }

  // Product Sales Chart
  const getProductChartData = () => {
    if (!analytics?.productSales) return null

    return {
      labels: analytics.productSales.map((item) => item._id),
      datasets: [
        {
          label: 'Quantity Sold',
          data: analytics.productSales.map((item) => item.totalQuantity),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    }
  }

  // Order Type Distribution
  const getOrderTypeChartData = () => {
    if (!analytics?.orderTypeDistribution) return null

    return {
      labels: analytics.orderTypeDistribution.map((item) => item._id),
      datasets: [
        {
          data: analytics.orderTypeDistribution.map((item) => item.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <BarChart3 size={24} />
          <h4 className="mb-0">Reports & Analytics</h4>
        </div>
        <CFormSelect
          style={{ width: 200 }}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="1year">Last 1 Year</option>
        </CFormSelect>
      </div>

      {/* Overall Stats */}
      <CRow className="mb-4">
        <CCol sm={6} lg={4}>
          <CCard style={{ borderLeft: '4px solid #0d6efd' }}>
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-medium-emphasis small">Total Orders</div>
                  <div className="fs-4 fw-semibold">
                    {analytics?.overallStats?.totalOrders || 0}
                  </div>
                </div>
                <Package size={40} color="#0d6efd" style={{ opacity: 0.2 }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={4}>
          <CCard style={{ borderLeft: '4px solid #198754' }}>
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-medium-emphasis small">Total Revenue</div>
                  <div className="fs-4 fw-semibold">
                    {formatCurrency(analytics?.overallStats?.totalRevenue)}
                  </div>
                </div>
                <TrendingUp size={40} color="#198754" style={{ opacity: 0.2 }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={4}>
          <CCard style={{ borderLeft: '4px solid #d97706' }}>
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-medium-emphasis small">Avg Order Value</div>
                  <div className="fs-4 fw-semibold">
                    {formatCurrency(analytics?.overallStats?.avgOrderValue)}
                  </div>
                </div>
                <Calendar size={40} color="#d97706" style={{ opacity: 0.2 }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Tabs */}
      <CCard>
        <CCardHeader>
          <CNav variant="tabs" role="tablist">
            <CNavItem>
              <CNavLink
                active={activeTab === 'sales'}
                onClick={() => setActiveTab('sales')}
                style={{ cursor: 'pointer' }}
              >
                Sales Trends
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 'franchise'}
                onClick={() => setActiveTab('franchise')}
                style={{ cursor: 'pointer' }}
              >
                Franchise-wise
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 'products'}
                onClick={() => setActiveTab('products')}
                style={{ cursor: 'pointer' }}
              >
                Top Products
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 'orderTypes'}
                onClick={() => setActiveTab('orderTypes')}
                style={{ cursor: 'pointer' }}
              >
                Order Types
              </CNavLink>
            </CNavItem>
          </CNav>
        </CCardHeader>
        <CCardBody>
          <CTabContent>
            {/* Sales Trends Tab */}
            <CTabPane visible={activeTab === 'sales'}>
              <h5 className="mb-4">Daily Sales & Revenue Trends</h5>
              {analytics?.dailyTrends && analytics.dailyTrends.length > 0 ? (
                <div style={{ height: 400 }}>
                  <Bar data={getDailyTrendsChartData()} options={dailyTrendsOptions} />
                </div>
              ) : (
                <div className="text-center py-5 text-muted">No data available</div>
              )}
            </CTabPane>

            {/* Franchise-wise Tab */}
            <CTabPane visible={activeTab === 'franchise'}>
              <h5 className="mb-4">Top 10 Franchises by Revenue</h5>
              <CRow>
                <CCol lg={6}>
                  {analytics?.franchiseOrders && analytics.franchiseOrders.length > 0 ? (
                    <div style={{ height: 400 }}>
                      <Bar
                        data={getFranchiseChartData()}
                        options={{
                          indexAxis: 'y',
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">No data available</div>
                  )}
                </CCol>
                <CCol lg={6}>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Franchise</CTableHeaderCell>
                        <CTableHeaderCell>Orders</CTableHeaderCell>
                        <CTableHeaderCell>Revenue</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {analytics?.franchiseOrders?.slice(0, 10).map((item, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell>
                            <div>{item.franchiseName}</div>
                            <small className="text-muted">{item.franchiseCode}</small>
                          </CTableDataCell>
                          <CTableDataCell>{item.totalOrders}</CTableDataCell>
                          <CTableDataCell>
                            <strong>{formatCurrency(item.totalAmount)}</strong>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCol>
              </CRow>
            </CTabPane>

            {/* Top Products Tab */}
            <CTabPane visible={activeTab === 'products'}>
              <h5 className="mb-4">Top 10 Products by Sales</h5>
              <CRow>
                <CCol lg={6}>
                  {analytics?.productSales && analytics.productSales.length > 0 ? (
                    <div style={{ height: 400 }}>
                      <Bar
                        data={getProductChartData()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">No data available</div>
                  )}
                </CCol>
                <CCol lg={6}>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Product</CTableHeaderCell>
                        <CTableHeaderCell>Quantity</CTableHeaderCell>
                        <CTableHeaderCell>Revenue</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {analytics?.productSales?.map((item, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell>
                            <strong>{item._id}</strong>
                          </CTableDataCell>
                          <CTableDataCell>{item.totalQuantity}</CTableDataCell>
                          <CTableDataCell>
                            <strong>{formatCurrency(item.totalRevenue)}</strong>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCol>
              </CRow>
            </CTabPane>

            {/* Order Types Tab */}
            <CTabPane visible={activeTab === 'orderTypes'}>
              <h5 className="mb-4">Order Distribution by Type</h5>
              <CRow>
                <CCol lg={6}>
                  {analytics?.orderTypeDistribution &&
                  analytics.orderTypeDistribution.length > 0 ? (
                    <div style={{ height: 400, display: 'flex', justifyContent: 'center' }}>
                      <Doughnut
                        data={getOrderTypeChartData()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">No data available</div>
                  )}
                </CCol>
                <CCol lg={6}>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Order Type</CTableHeaderCell>
                        <CTableHeaderCell>Count</CTableHeaderCell>
                        <CTableHeaderCell>Amount</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {analytics?.orderTypeDistribution?.map((item, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell>
                            <strong>{item._id}</strong>
                          </CTableDataCell>
                          <CTableDataCell>{item.count}</CTableDataCell>
                          <CTableDataCell>
                            <strong>{formatCurrency(item.totalAmount)}</strong>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCol>
              </CRow>
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>
    </>
  )
}

export default SupplierReports
