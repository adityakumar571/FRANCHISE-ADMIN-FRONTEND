import React, { Suspense, useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'

// routes config
import routes from '../routes'
import { AppContext } from '../Context/AppContext'

const AppContent = () => {
  const { user } = useContext(AppContext)
  const userRole = user?.role || user?.user?.role

  return (
    <>
      <div style={{ backgroundColor: '#F7F7F7' }} className="p-4">
        <Suspense fallback={<CSpinner color="primary" />}>
          <Routes>
            {routes.map((route, idx) => {
              // Route has role restriction defined
              if (route.roles && route.roles.length > 0) {
                const allowed = route.roles.includes(userRole)
                return (
                  route.element && (
                    <Route
                      key={idx}
                      path={route.path}
                      exact={route.exact}
                      name={route.name}
                      element={
                        allowed
                          ? <route.element />
                          : <Navigate to="/dashboard" replace />
                      }
                    />
                  )
                )
              }

              // No role restriction — open to all logged-in users
              return (
                route.element && (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    element={<route.element />}
                  />
                )
              )
            })}
            <Route path="/" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </Suspense>
      </div>
    </>
  )
}

export default React.memo(AppContent)
