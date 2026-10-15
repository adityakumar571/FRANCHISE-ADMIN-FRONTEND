/* eslint-disable prettier/prettier */
/**
 * Supplier Reports - Simple placeholder (charts to be added later)
 */
import React from 'react'
import { BarChart2, TrendingUp, Package, ShoppingCart } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const SupplierReports = () => {
  return (
    <div>
      <PageHeader 
        icon={BarChart2} 
        title="Reports & Analytics" 
        subtitle="View your sales performance and insights" 
        color="#16a34a" 
      />

      <div style={{ 
        background: '#fff', 
        borderRadius: 10, 
        padding: '60px 20px', 
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: 80, 
          height: 80, 
          borderRadius: 16, 
          background: '#f0fdf4', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <BarChart2 size={40} color="#16a34a" />
        </div>
        
        <h3 style={{ 
          fontSize: 18, 
          fontWeight: 700, 
          color: '#111827', 
          marginBottom: 8 
        }}>
          Reports Coming Soon
        </h3>
        
        <p style={{ 
          fontSize: 14, 
          color: '#6b7280', 
          marginBottom: 24,
          maxWidth: 400,
          margin: '0 auto 24px'
        }}>
          Advanced analytics and reporting features are under development. 
          You'll be able to view sales trends, revenue analysis, and performance metrics here.
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 16,
          maxWidth: 800,
          margin: '0 auto'
        }}>
          {[
            { icon: TrendingUp, title: 'Sales Analytics', desc: 'Track revenue trends' },
            { icon: Package, title: 'Product Performance', desc: 'Best selling items' },
            { icon: ShoppingCart, title: 'Order Insights', desc: 'Order patterns' },
          ].map((item, i) => (
            <div key={i} style={{
              background: '#fafafa',
              borderRadius: 8,
              padding: '16px',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <item.icon size={24} color="#16a34a" />
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                {item.title}
              </h4>
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SupplierReports
