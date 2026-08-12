/* eslint-disable prettier/prettier */
import React, { useContext } from 'react'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { cilBell, cilLockLocked, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import { deleteCookie } from '../../Hooks/cookie'
import { useNavigate } from 'react-router-dom'
import { useRoles } from '../../Context/AuthContext'
import { DropletIcon } from 'lucide-react'
import { MdArrowDropDown } from 'react-icons/md'
import { AppContext } from '../../Context/AppContext'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const { user } = useContext(AppContext)

  const { role } = useRoles() // ✅ CONTEXT SE ROLE
  const logOut = (e) => {
    e.preventDefault()
    deleteCookie('LMS')
    localStorage.removeItem('LMS')
    navigate('/login')
    window.location.reload()
  }

  const handleProfileNavigate = () => {
    if (role === 'Student') {
      navigate(`/studentdetail/:studentId`)
    } else if (role === 'Teacher') {
      navigate(`/TeacherDetailPage/:teacherId`)
    }
  }
  const showProfile = role === 'Student' || role === 'Teacher'

  return (
    <CDropdown style={{ height: '50px' }} className="" variant="nav-item">
      <CDropdownToggle placement="bottom-end" className=" py-0 pe-0 p-0 m-0" caret={false}>
        <div className="flex items-center ">
          <div className="flex text-white items-start">
            <div className=" text-white text-right">
              <div className=" fw-semibold text-capitalize">{user?.name || 'Guest'}</div>

              <div className="text-xs text-capitalize">{role || 'User'}</div>
            </div>
            <div>
              <MdArrowDropDown className="h-4 w-4" />
            </div>
          </div>

          <img
            src={user?.profilePic || "https://cdn-icons-png.flaticon.com/128/3135/3135715.png"}
            alt="Profile"
            style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>

        {/* <CAvatar src={avatar8} size="md" /> */}
      </CDropdownToggle>

      <CDropdownMenu
        style={{ overflow: 'hidden', cursor: 'pointer', minWidth: '180px' }}
        className="pt-0 p-0 m-0 "
        placement="bottom-end"
      >
        <div className="px-3 py-2 border-bottom bg-light">
          <div className="fw-semibold text-capitalize">{role || 'User'}</div>
        </div>

        {showProfile && (
          <CDropdownItem className="p-2" onClick={handleProfileNavigate}>
            <CIcon icon={cilUser} className="me-2" />
            Profile
          </CDropdownItem>
        )}
        <CDropdownItem className="p-2" onClick={() => navigate('/change-password')}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Change Password
        </CDropdownItem>

        <CDropdownItem className="p-2" onClick={logOut}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Log Out
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
