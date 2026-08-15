/* eslint-disable prettier/prettier */
import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => (
  <CFooter className="px-4" style={{ background: '#fff', borderTop: '1px solid #e5e7eb' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: 12, color: '#9ca3af' }}>
      <span>© {new Date().getFullYear()} Franchise Portal. All rights reserved.</span>
      <span>Powered by PharmaNexus SaaS</span>
    </div>
  </CFooter>
)

export default React.memo(AppFooter)
