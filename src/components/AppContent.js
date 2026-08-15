/* eslint-disable prettier/prettier */
import React, { Suspense, useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import routes from '../routes'
import { FranchiseContext } from '../Context/FranchiseContext'

const AppContent = () => {
  const { franchiseUser } = useContext(FranchiseContext)
  const role = franchiseUser?.role

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '20px', minHeight: 'calc(100vh - 52px)' }}>
      <Suspense fallback={<div className="text-center pt-5"><CSpinner color="primary" /></div>}>
        <Routes>
          {routes.map((route, idx) => {
            if (route.roles && route.roles.length > 0) {
              const allowed = route.roles.includes(role)
              return route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  element={allowed ? <route.element /> : <Navigate to="/franchise/dashboard" replace />}
                />
              )
            }
            return route.element && (
              <Route key={idx} path={route.path} element={<route.element />} />
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
