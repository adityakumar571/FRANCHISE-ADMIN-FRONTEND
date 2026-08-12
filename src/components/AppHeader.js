




import React, { useContext, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CButton,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilMenu, cilHeadphones } from '@coreui/icons'

import { SessionContext } from '../Context/Seesion'
import { AppContext } from '../Context/AppContext'

import { AppHeaderDropdown } from './header/index'
import Notification from './header/Notification'

import SupportModal from './SupportModal'

const AppHeader = () => {

  const headerRef = useRef()

  const dispatch = useDispatch()

  const sidebarShow = useSelector((state) => state.sidebarShow)

  const { currentSession, loading } = useContext(SessionContext)

  const { tenantDetails } = useContext(AppContext)

  // ==========================================
  // Modal State
  // ==========================================

  const [visible, setVisible] = useState(false)

  return (
    <>
      <CHeader position="sticky" className="p-0" ref={headerRef}>

        <CContainer
          fluid
          className="border-bottom px-4 d-flex align-items-center justify-content-between"
          style={{
            backgroundColor: '#042954',
            color: 'white',
          }}
        >

          {/* LEFT */}
          <div className="d-flex align-items-center gap-3">

            <CHeaderToggler
              onClick={() =>
                dispatch({
                  type: 'set',
                  sidebarShow: !sidebarShow,
                })
              }
              style={{ marginInlineStart: '-14px' }}
            >
              <CIcon
                icon={cilMenu}
                style={{ color: 'white' }}
                size="lg"
              />
            </CHeaderToggler>

          </div>

          {/* RIGHT */}
          <CHeaderNav className="d-flex align-items-center gap-3">

            {/* SESSION */}
            <div className="d-flex flex-column text-white">
              <span className="text-xs">Session</span>

              <span className="fw-semibold text-warning">
                {loading
                  ? 'Loading...'
                  : currentSession?.sessionName || 'N/A'}
              </span>
            </div>

            {/* DIVIDER */}
            <span
              style={{
                height: '32px',
                width: '1px',
                backgroundColor: 'rgba(255,255,255,0.5)',
              }}
            />

            {/* SUPPORT BUTTON */}
            <CButton
              color="warning"
              size="sm"
              className="d-flex align-items-center gap-2 fw-semibold"
              onClick={() => setVisible(true)}
            >
              <CIcon icon={cilHeadphones} />
              Support
            </CButton>

            {/* PROFILE */}
            <AppHeaderDropdown />

            {/* NOTIFICATION */}
            <Notification />

          </CHeaderNav>
        </CContainer>
      </CHeader>

      {/* SUPPORT MODAL */}
<SupportModal
   visible={visible}
   setVisible={setVisible}
   tenantDetails={tenantDetails}
   onSuccess={() => setUpdateStatus(prev => !prev)}
/>
    </>
  )
}

export default AppHeader