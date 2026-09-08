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
const SuperAdminLayout   = React.lazy(() => import('./layout/SuperAdminLayout'))

// ── Public / Auth Pages ───────────────────────────────────────────────────────
const FranchiseLogin     = React.lazy(() => import('./views/pages/FranchiseLogin/FranchiseLogin'))
const SuperAdminLogin    = React.lazy(() => import('./views/pages/SuperAdminLogin/SuperAdminLogin'))
const AutoLogin          = React.lazy(() => import('./views/pages/AutoLogin/AutoLogin'))
const Page404            = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500            = React.lazy(() => import('./views/pages/page500/Page500'))

// ── Super Admin Screens ───────────────────────────────────────────────────────
const SADashboard    = React.lazy(() => import('./views/superadmin/Dashboard/SuperAdminDashboard'))
const SAAdmins       = React.lazy(() => import('./views/superadmin/Admins/AdminManagement'))
const SAFranchises   = React.lazy(() => import('./views/superadmin/Franchise/FranchiseManagement'))
const SASubscriptions= React.lazy(() => import('./views/superadmin/Subscriptions/SubscriptionManagement'))
const SAMedicines    = React.lazy(() => import('./views/superadmin/Medicine/GlobalMedicineMaster'))
const SADistributors = React.lazy(() => import('./views/superadmin/Distributors/DistributorManagement'))
const SASupplierAssign= React.lazy(() => import('./views/superadmin/Suppliers/SupplierAssignment'))
const SAReports      = React.lazy(() => import('./views/superadmin/Reports/SuperAdminReports'))
const SAAuditLogs    = React.lazy(() => import('./views/superadmin/AuditLogs/SuperAdminAuditLogs'))
const SASettings     = React.lazy(() => import('./views/superadmin/Settings/SuperAdminSettings'))

// ── Distributor Screens ───────────────────────────────────────────────────────
const DistLogin         = React.lazy(() => import('./views/distributor/screens/DistLogin'))
const DistDashboard     = React.lazy(() => import('./views/distributor/screens/DistDashboard'))
const DistCatalogue     = React.lazy(() => import('./views/distributor/screens/DistCatalogue'))
const DistOrders        = React.lazy(() => import('./views/distributor/screens/DistOrders'))
const DistStockPricing  = React.lazy(() => import('./views/distributor/screens/DistStockPricing'))
const DistSchemes       = React.lazy(() => import('./views/distributor/screens/DistSchemes'))
const DistDispatch      = React.lazy(() => import('./views/distributor/screens/DistDispatch'))
const DistPayments      = React.lazy(() => import('./views/distributor/screens/DistPayments'))
const DistReports       = React.lazy(() => import('./views/distributor/screens/DistReports'))
const DistNotifications = React.lazy(() => import('./views/distributor/screens/DistNotifications'))
const DistSettings      = React.lazy(() => import('./views/distributor/screens/DistSettings'))

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
          <Route path="/superadmin/login"   element={<SuperAdminLogin />} />
          <Route path="/auto-login"         element={<AutoLogin />} />
          <Route path="/404"                element={<Page404 />} />
          <Route path="/500"                element={<Page500 />} />

          {/* ── Super Admin Portal ── */}
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route index                         element={<SADashboard />} />
            <Route path="dashboard"              element={<SADashboard />} />
            <Route path="admins"                 element={<SAAdmins />} />
            <Route path="franchises"             element={<SAFranchises />} />
            <Route path="subscriptions"          element={<SASubscriptions />} />
            <Route path="medicines"              element={<SAMedicines />} />
            <Route path="distributors"           element={<SADistributors />} />
            <Route path="supplier-assignment"    element={<SASupplierAssign />} />
            <Route path="reports"                element={<SAReports />} />
            <Route path="audit"                  element={<SAAuditLogs />} />
            <Route path="settings"               element={<SASettings />} />
          </Route>

          {/* ── Distributor portal ── */}
          <Route path="/distributor/login"  element={<DistLogin />} />
          <Route path="/distributor" element={<DistributorAuth><DistributorLayout /></DistributorAuth>}>
            <Route index                        element={<DistDashboard />} />
            <Route path="dashboard"             element={<DistDashboard />} />
            <Route path="catalogue"             element={<DistCatalogue />} />
            <Route path="orders"                element={<DistOrders />} />
            <Route path="stock-pricing"         element={<DistStockPricing />} />
            <Route path="schemes"               element={<DistSchemes />} />
            <Route path="dispatch"              element={<DistDispatch />} />
            <Route path="payments"              element={<DistPayments />} />
            <Route path="reports"               element={<DistReports />} />
            <Route path="notifications"         element={<DistNotifications />} />
            <Route path="settings"              element={<DistSettings />} />
          </Route>

          {/* Franchise portal — DefaultLayout handles auth guard */}
          <Route path="*" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </>
)

export default App
