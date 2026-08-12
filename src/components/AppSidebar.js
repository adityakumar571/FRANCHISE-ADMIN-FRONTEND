import React, { useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'

import logo from '../assets/auctech-logo.png'


import useNav from '../_nav'
import { AppContext } from '../Context/AppContext'

const AppSidebar = () => {


  const navigation = useNav()
  const dispatch = useDispatch()
  const {tenantDetails} = useContext(AppContext)
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
    style={{zIndex:"3"}}
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
     
    >
      <CSidebarHeader style={{backgroundColor:" #042954"}} className="border-bottom">
        <CSidebarBrand style={{textAlign:"center"}} to="/">
          <img style={{ width: "50%",margin:"auto" }} src={tenantDetails?.logo || logo} />
        </CSidebarBrand>
       
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      {/* <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />

      </CSidebarFooter> */}
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
