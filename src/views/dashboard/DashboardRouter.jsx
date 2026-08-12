/* eslint-disable prettier/prettier */
import { useContext } from 'react'
import { AppContext } from '../../Context/AppContext'

import AdminDashboard from './AdminDashboard'
import StudentDashboard from './StudentDashboard'
import ParentDashboard from './ParentDashboard'
import TeachersDashboard from './TeachersDashboard'
import HRDashboard from '../HR/HRDashboard'

const DashboardRouter = () => {
  const { user } = useContext(AppContext)

  if (!user || !user.role) return null

  switch (user.role) {
    case 'SuperAdmin':
      return <AdminDashboard />

    case 'Admin':
      return <AdminDashboard />

    case 'Teacher':
      return <TeachersDashboard />

    case 'Student':
      return <StudentDashboard />

    case 'Parent':
      return <ParentDashboard />

    // ── HR Roles ──
    case 'HRManager':
      return <HRDashboard />

    case 'HRStaff':
      return <HRDashboard />

    default:
      return null
  }
}

export default DashboardRouter
