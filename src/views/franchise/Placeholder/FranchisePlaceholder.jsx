/* eslint-disable prettier/prettier */
/**
 * FranchisePlaceholder
 *
 * Generic placeholder page for franchise module routes that are not yet implemented.
 * Phase 2 will replace these with real implementations.
 */
const FranchisePlaceholder = ({ title = 'Coming Soon', icon = '🚀' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', gap: 16, fontFamily: 'Inter, sans-serif',
  }}>
    <div style={{
      width: 80, height: 80, borderRadius: 20,
      background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 36, boxShadow: '0 4px 16px rgba(12,59,115,0.08)',
    }}>
      {icon}
    </div>
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{title}</h2>
      <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, maxWidth: 320 }}>
        This module is coming in Phase 2. The foundation and routing are ready — APIs and UI will be built next.
      </p>
    </div>
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 20,
      background: '#fffbeb', border: '1px solid #fde68a',
      fontSize: 12, color: '#92400e', fontWeight: 600,
    }}>
      🔧 Under Development — Phase 2
    </div>
  </div>
)

export default FranchisePlaceholder
