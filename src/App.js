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
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import './scss/style.scss'
import './App.css'
import { Toaster } from 'react-hot-toast'
import ScrollToTop from './components/ScrollToTop'

// ── Layouts ──────────────────────────────────────────────────────────────────
const DefaultLayout    = React.lazy(() => import('./layout/DefaultLayout'))

// ── Public / Auth Pages ───────────────────────────────────────────────────────
const FranchiseLogin   = React.lazy(() => import('./views/pages/FranchiseLogin/FranchiseLogin'))
const AutoLogin        = React.lazy(() => import('./views/pages/AutoLogin/AutoLogin'))
const Page404          = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500          = React.lazy(() => import('./views/pages/page500/Page500'))

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
          <Route path="/franchise-login" element={<FranchiseLogin />} />
          <Route path="/login"           element={<FranchiseLogin />} />
          <Route path="/auto-login"      element={<AutoLogin />} />
          <Route path="/404"             element={<Page404 />} />
          <Route path="/500"             element={<Page500 />} />

          {/* Franchise portal — DefaultLayout handles auth guard */}
          <Route path="*" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </>
)

export default App
