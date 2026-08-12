/* eslint-disable prettier/prettier */
import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import './scss/style.scss'
import './App.css'
// import "./scss/examples.scss";
import { Toaster } from 'react-hot-toast'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import ForgotPassword from './views/pages/ForgotPassword/ForgotPassword'
// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const AutoLogin = React.lazy(() => import('./views/pages/AutoLogin/AutoLogin'))
const HRLogin   = React.lazy(() => import('./views/pages/HRLogin/HRLogin'))
const App = () => {
  return (
    <>
      <div>
        <Toaster />
      </div>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
          <Routes>
            <Route
              exact
              path="/forgot-password"
              name="Forgot Password"
              element={<ForgotPassword />}
            />
            <Route exact path="/login" name="Login Page" element={<Login />} />
            <Route exact path="/register" name="Register Page" element={<Register />} />
            <Route exact path="/404" name="Page 404" element={<Page404 />} />
            <Route exact path="/500" name="Page 500" element={<Page500 />} />
            <Route exact path="/auto-login" name="Auto Login" element={<AutoLogin />} />
            <Route exact path="/hr-login"   name="HR Login"   element={<HRLogin />} />
            <Route path="*" name="Home" element={<DefaultLayout />} />
            {/* <Route
              path="*"
              element={
                <ProtectedRoute>
                  <DefaultLayout />
                </ProtectedRoute>
              }
            /> */}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
