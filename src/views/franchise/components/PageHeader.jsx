/* eslint-disable prettier/prettier */
/**
 * PageHeader — reusable page header for franchise modules
 */
const PageHeader = ({ icon: Icon, title, subtitle, color = '#0c3b73', children }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 10,
      padding: '16px 20px',
      border: '1px solid #e5e7eb',
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {Icon && (
        <div
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: color + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Icon size={20} color={color} />
        </div>
      )}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
    </div>
    {children && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>}
  </div>
)

export default PageHeader
