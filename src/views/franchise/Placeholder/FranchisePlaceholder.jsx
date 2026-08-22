/* eslint-disable prettier/prettier */
import { Construction } from 'lucide-react'

const FranchisePlaceholder = ({ title = 'Coming Soon' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 14, fontFamily: 'Inter, sans-serif' }}>
    <div style={{ width: 64, height: 64, borderRadius: 14, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Construction size={28} color="#0c3b73" />
    </div>
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>{title}</h2>
      <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, maxWidth: 300 }}>
        This module is under development. It will be available in Phase 2.
      </p>
    </div>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#fffbeb', border: '1px solid #fde68a', fontSize: 12, color: '#92400e', fontWeight: 600 }}>
      Under Development
    </div>
  </div>
)

export default FranchisePlaceholder
