/* eslint-disable prettier/prettier */
import React, { Suspense, useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import { ShieldCheck } from 'lucide-react'
import routes from '../routes'
import { FranchiseContext } from '../Context/FranchiseContext'

/* ── Unauthorized page ── */
const UnauthorizedPage = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, fontFamily: 'Inter, sans-serif' }}>
    <div style={{ width: 72, height: 72, borderRadius: 16, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ShieldCheck size={32} color="#dc2626" />
    </div>
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Access Denied</h2>
      <p style={{ fontSize: 14, color: '#6b7280', margin: 0, maxWidth: 340 }}>
        You don't have permission to access this page. Contact your administrator to enable access.
      </p>
    </div>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: '#fee2e2', border: '1px solid #fecdd3', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
      Permission Required
    </div>
  </div>
)

const AppContent = () => {
  const { franchiseUser, hasAccess } = useContext(FranchiseContext)
  const role = franchiseUser?.role

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '20px', minHeight: 'calc(100vh - 52px)' }}>
      <Suspense fallback={<div className="text-center pt-5"><CSpinner color="primary" /></div>}>
        <Routes>
          {routes.map((route, idx) => {
            if (!route.element) return null

            // Role-based access check (existing logic)
            const roleAllowed = !route.roles || route.roles.length === 0 || route.roles.includes(role)

            // Menu access check
            const menuAllowed = !route.accessKey || hasAccess(route.accessKey)

            return (
              <Route
                key={idx}
                path={route.path}
                element={
                  !roleAllowed
                    ? <Navigate to="/franchise/dashboard" replace />
                    : !menuAllowed
                      ? <UnauthorizedPage />
                      : <route.element />
                }
              />
            )
          })}

          {/* Default redirects */}
          <Route path="/"          element={<Navigate to="/franchise/dashboard" replace />} />
          <Route path="/dashboard" element={<Navigate to="/franchise/dashboard" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default React.memo(AppContent)
