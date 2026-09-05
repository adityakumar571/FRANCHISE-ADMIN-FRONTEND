/* eslint-disable prettier/prettier */
/**
 * App.js — Franchise Portal
 *
 * Route structure:
 *  /franchise-login   → FranchiseLogin page
 *  /auto-login        → AutoLogin (token-based login from Super Admin quick-login)
 *  /404, /500         → Error pages
 *  /*                 → DefaultLayout (franchise portal — auth-guarded)
 *
 * DefaultLayout checks LMS cookie + FranchiseContext.
 * If not authenticated → redirects to /franchise-login.
 */
import React, { Suspense } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import './scss/style.scss'
import './App.css'
import { Toaster } from 'react-hot-toast'
import ScrollToTop from './components/ScrollToTop'
import Cookies from 'js-cookie'

/** Guard for distributor-only routes — checks DIST_TOKEN cookie */
function DistributorAuth({ children }) {
  const token = Cookies.get('DIST_TOKEN')
  if (!token) return <Navigate to="/distributor/login" replace />
  return children
}

// ── Layouts ──────────────────────────────────────────────────────────────────
const DefaultLayout      = React.lazy(() => import('./layout/DefaultLayout'))
const DistributorLayout  = React.lazy(() => import('./views/distributor/layout/DistributorLayout'))

// ── Public / Auth Pages ───────────────────────────────────────────────────────
const FranchiseLogin   = React.lazy(() => import('./views/pages/FranchiseLogin/FranchiseLogin'))
const AutoLogin        = React.lazy(() => import('./views/pages/AutoLogin/AutoLogin'))
const Page404          = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500          = React.lazy(() => import('./views/pages/page500/Page500'))

// ── Distributor Screens ───────────────────────────────────────────────────────
const DistLogin     = React.lazy(() => import('./views/distributor/screens/DistLogin'))
const DistDashboard = React.lazy(() => import('./views/distributor/screens/DistDashboard'))
const DistCatalogue = React.lazy(() => import('./views/distributor/screens/DistCatalogue'))

const Spinner = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <CSpinner color="primary" variant="grow" />
  </div>
)

const App = () => (
  <>
    <Toaster position="top-right" />
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={Spinner}>
        <Routes>
          {/* Public routes */}
          <Route path="/franchise-login"    element={<FranchiseLogin />} />
          <Route path="/login"              element={<FranchiseLogin />} />
          <Route path="/auto-login"         element={<AutoLogin />} />
          <Route path="/404"                element={<Page404 />} />
          <Route path="/500"                element={<Page500 />} />

          {/* ── Distributor portal ── */}
          <Route path="/distributor/login"  element={<DistLogin />} />
          <Route path="/distributor" element={<DistributorAuth><DistributorLayout /></DistributorAuth>}>
            <Route index                    element={<DistDashboard />} />
            <Route path="dashboard"         element={<DistDashboard />} />
            <Route path="catalogue"         element={<DistCatalogue />} />
            {/* Add more distributor routes here as screens are built */}
          </Route>

          {/* Franchise portal — DefaultLayout handles auth guard */}
          <Route path="*" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </>
)

export default App
