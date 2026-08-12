/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
import { useContext, useEffect, useState } from 'react'
import { CNavGroup, CNavItem } from '@coreui/react'
import {
  AppstoreOutlined,
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
  MoneyCollectOutlined,
  FileDoneOutlined,
  CalendarOutlined,
  SwapOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  BookOutlined,
  FormOutlined,
  BarChartOutlined,
  CoffeeOutlined,
  NotificationOutlined,
  DashboardOutlined,
  CarOutlined,
  EnvironmentFilled,
  EnvironmentOutlined,
  UserSwitchOutlined,
  UserAddOutlined,
  LockOutlined,
  KeyOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons'
import { MdOutlineDashboard } from 'react-icons/md'
import { AppContext } from './Context/AppContext'
import { BookPlus, IndianRupee, User, Zap, HelpCircle, Settings, Gift, Building2, Briefcase, Users, TrendingUp, TrendingDown } from 'lucide-react'

const iconStyle = { fontSize: '20px' }
const yellow = 'text-[#fabf22]'

const useNav = () => {
  const { user } = useContext(AppContext)
  const role = user?.role
  const isClassTeacher = user?.profile?.classesAssigned?.some((cls) => cls?.isClassTeacher === true)
  /* ================= SUPER ADMIN NAV ================= */
  const superAdminNav = [
    {
      component: CNavItem,
      name: 'Admin Dashboard',
      to: '/dashboard',
      icon: <MdOutlineDashboard className={`me-3 ${yellow}`} style={iconStyle} />,
    },

    {
      component: CNavGroup,
      name: 'Masters',
      to: '/master',
      icon: <AppstoreOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Session Master',
          to: '/master/session',
          icon: <CalendarOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Category Master',
          to: '/master/category',
          icon: <TeamOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Class Master',
          to: '/master/class',
          icon: <TeamOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Section Master',
          to: '/master/section',
          icon: <TeamOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },

        {
          component: CNavItem,
          name: 'Streams Master',
          to: '/master/streams',
          icon: <BookOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Subject Master',
          to: '/master/subject',
          icon: <BookOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Documents  Master',
          to: '/master/documents',
          icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Exam Master',
          to: '/master/exam',
          icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Fees Installment Master',
          to: '/master/feesInstallment',
          icon: <IndianRupee className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },

    {
      component: CNavGroup,
      name: 'Fee Management',
      to: '/FeeManagement',
      icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Fees Structure',
          to: '/fee/feesStructure',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Fee Head',
          to: '/FeeManagement/FeesHead',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Late Fees',
          to: '/FeeManagement/FeeLate',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },

    {
      component: CNavItem,
      name: 'Notice Board ',
      to: '/communication',
      icon: <NotificationOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Create Admin',
      to: '/create-admin',
      icon: <UserAddOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Subscriptions',
      to: '/subscriptions',
      icon: <Zap className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Assign Free Trial',
      to: '/assign-free-trial',
      icon: <Gift className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'School Settings',
      to: '/school-settings',
      icon: <Settings className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Help & Support',
      to: '/support',
      icon: (
        <CustomerServiceOutlined
          className={`me-3 ${yellow}`}
          style={iconStyle}
        />
      ),
    },
    {
      component: CNavItem,
      name: 'FAQ',
      to: '/faq',
      icon: <HelpCircle className={`me-3 ${yellow}`} style={iconStyle} />,
    },
  ]
  /* ================= ADMIN NAV ================= */
  const adminNav = [
    {
      component: CNavItem,
      name: 'Admin Dashboard',
      to: '/dashboard',
      icon: <DashboardOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavGroup,
      name: 'Student Management',
      to: '/student',
      icon: <UserOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Registration Form',
          to: '/student/admission',
          icon: <FormOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Enrollment Form',
          to: '/student/enrollment',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Student List',
          to: '/student/StudentList',
          icon: <TeamOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Student Transfer',
          to: '/student/studenttransfer',
          icon: <SwapOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Roll Number Manage',
          to: '/rollnumber',
          icon: <CalendarOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        // {
        //   component: CNavItem,
        //   name: 'Attendance',
        //   to: '/attendance',
        //   icon: <CheckSquareOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        // },
        {
          component: CNavItem,
          name: 'Student ID Card',
          to: '/id-card-generator',
          icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },
    {
      component: CNavGroup,
      name: 'Attendance Management',
      to: '/student',
      icon: <UserOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Attendance Report',
          to: '/attendanceReport',
          icon: <FormOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },



        {
          component: CNavItem,
          name: 'Attendance',
          to: '/attendance',
          icon: <CheckSquareOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },

      ],
    },
    {
      component: CNavGroup,
      name: 'Teacher Management',
      to: '/teacher',
      icon: <TeamOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Registration Form',
          to: '/teacher/register',
          icon: <FormOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Teacher List',
          to: '/teacher/list',
          icon: <TeamOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Assigned Classes',
          to: '/teacher/assignedClass',
          icon: <BookOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },
    {
      component: CNavGroup,
      name: 'Fee Management',
      to: '/fee',
      icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Fees Structure',
          to: '/fee/feesStructure',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Fee Head',
          to: '/FeeManagement/FeesHead',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Fee Collection',
          to: '/fee/feescollection',
          icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Fee Reports',
          to: '/fee/feesreport',
          icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Late Fee Wavied',
          to: '/fee/late-fee-wavied',
          icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Additional Fee Waived',
          to: '/fee/additional-fee-waived',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },

   
    {
      component: CNavGroup,
      name: 'Transport Management',
      to: '/transport',
      icon: <CarOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Route Master',
          to: '/transport/route',
          icon: <EnvironmentOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Station Master',
          to: '/transport/station',
          icon: <EnvironmentFilled className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Bus Master',
          to: '/transport/bus',
          icon: <CarOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Allocate Transport',
          to: '/transport/allocate',
          icon: <UserSwitchOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Transport Fee Manage',
          to: '/transport/fee-manage',
          icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Vacation Settings',
          to: '/transport/vacation',
          icon: <CalendarOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },

    {
      component: CNavGroup,
      name: 'Examination Management',
      to: '/examination',
      icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Exam List',
          to: '/examination/exam-list',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Add and Update Marks',
          to: '/examination/update-marks',
          icon: <FormOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Upload Marks (Excel/CSV)',
          to: '/examination/upload-marks',
          icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Cross List Marksheet',
          to: '/examination/cross-list',
          icon: <SolutionOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Generate Marksheet',
          to: '/examination/marksheet',
          icon: <BookOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Print Marksheet (Class Wise)',
          to: '/examination/print-classwise',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Marksheet',
          to: '/marks',
          icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },
     {
      component: CNavGroup,
      name: 'Homework Management',
      to: '/homework',
      icon: <BookPlus className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Assigment',
          to: '/admin/homework/assign',
          icon: <BookPlus className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Homework',
          to: '/admin/homeworklist',
          icon: <BookPlus className={`me-3 ${yellow}`} style={iconStyle} />,
        },

      ]
    },
     {
      component: CNavGroup,
      name: 'HR Management',
      to: '/hr',
      icon: <Users className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'HR Dashboard',
          to: '/hr/dashboard',
          icon: <DashboardOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Department Master',
          to: '/hr/departments',
          icon: <Building2 className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Designation Master',
          to: '/hr/designations',
          icon: <Briefcase className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Staff List',
          to: '/hr/staff',
          icon: <TeamOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Add Staff',
          to: '/hr/staff/add',
          icon: <UserAddOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Attendance Entry',
          to: '/hr/attendance',
          icon: <CheckSquareOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Attendance Register',
          to: '/hr/attendance/register',
          icon: <CalendarOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Leave Entry',
          to: '/hr/leave',
          icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Leave Approval',
          to: '/hr/leave/approval',
          icon: <CoffeeOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'HR Users',
          to: '/hr/users',
          icon: <KeyOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },
    {
      component: CNavGroup,
      name: 'Payroll Management',
      to: '/hr/payroll',
      icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Payroll Dashboard',
          to: '/hr/payroll/dashboard',
          icon: <DashboardOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Salary Structure',
          to: '/hr/payroll/salary-structure',
          icon: <IndianRupee className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Monthly Payroll',
          to: '/hr/payroll/monthly',
          icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Salary Payment',
          to: '/hr/payroll/payment',
          icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Payroll Reports',
          to: '/hr/payroll/reports',
          icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },
     {
      component: CNavGroup,
      name: 'Reports',
      to: '/reports',
      icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavGroup,
          name: 'Fee Reports',
          to: '/reports/fee',
          icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
          items: [
            {
              component: CNavItem,
              name: 'Defaulter List (Summary)',
              to: '/reports/defaulterfees',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Class-SectionWise Defaulter List',
              to: '/reports/class-section-defaulter',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Defaulter List (Detailed)',
              to: '/reports/defaulter-detailed',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Defaulter List Detailed (MonthWise)',
              to: '/reports/defaulter-monthwise',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Registration Fee Statement',
              to: '/reports/registration-fee-statement',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Student Ledger',
              to: '/reports/studentLedger',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Fee Register (Detailed)',
              to: '/reports/fee-register-detailed',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Fee Transaction Report',
              to: '/fee/feesreport',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Registration Fee Statement (Class Wise)',
              to: '/reports/registration-fee-classwise',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },

            {
              component: CNavItem,
              name: 'Fee Deposit Summary (Class Wise)',
              to: '/reports/fee-deposit-summary-classwise',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },

            {
              component: CNavItem,
              name: 'Fee Deposited Statement (Detailed)',
              to: '/reports/fee-deposited-detailed',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Student Fee Details (Class Wise)',
              to: '/reports/student-fee-details-classwise',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },

            {
              component: CNavItem,
              name: 'Outstanding Fees',
              to: '/reports/outstandingfees',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Fee Head Report',
              to: '/reports/feeheadreport',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Late Fee Waiver Report',
              to: '/reports/late-fee-waiver',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Additional Fee Waiver Report',
              to: '/reports/additional-fee-waiver',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
          ],
        },
        {
          component: CNavGroup,
          name: 'Student Reports',
          to: '/reports/student',
          icon: <UserOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
          items: [
            {
              component: CNavItem,
              name: 'Student List',
              to: '/student/StudentList',
              icon: <TeamOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
          ],
        },
        {
          component: CNavGroup,
          name: 'Transport Reports',
          to: '/reports/transport',
          icon: <CarOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
          items: [
            {
              component: CNavItem,
              name: 'Transport List',
              to: '/transport/reports',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Fee Collection Report',
              to: '/transport/fee-collection',
              icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Transport Defaulters',
              to: '/transport/defaulters',
              icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Transport Analytics',
              to: '/transport/analytics',
              icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
          ],
        },
        {
          component: CNavGroup,
          name: 'Exam Reports',
          to: '/reports/exam',
          icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
          items: [
            {
              component: CNavItem,
              name: 'Exam Report',
              to: '/reports/examreport',
              icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'Class Wise Exam Report',
              to: '/reports/classwiseexamreport',
              icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'School Wise Exam Report',
              to: '/reports/schoolwiseexamreport',
              icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            // {
            //   component: CNavItem,
            //   name: 'Marksheet',
            //   to: '/marks',
            //   icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            // },
            {
              component: CNavItem,
              name: 'Performance Report',
              to: '/perfomacereport',
              icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            {
              component: CNavItem,
              name: 'ResultAnalysis',
              to: '/reports/result-analysis',
              icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
            // { component: CNavItem, name: 'Exam Report',        to: '/reports/examreport', icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} /> },
            // { component: CNavItem, name: 'Marksheet',          to: '/marks',              icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} /> },
            // { component: CNavItem, name: 'Performance Report', to: '/perfomacereport',    icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} /> },
          ],
        },
      ],
    },
    {
      component: CNavItem,
      name: 'Notice Board ',
      to: '/communication',
      icon: <NotificationOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    // {
    //   component: CNavItem,
    //   name: 'Homework',
    //   to: '/admin/homework',
    //   icon: <BookPlus className={`me-3 ${yellow}`} style={iconStyle} />,
    // },
    {
      component: CNavItem,
      name: 'Certificates',
      to: '/certificates',
      icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Subscriptions',
      to: '/subscriptions',
      icon: <Zap className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Help & Support',
      to: '/support',
      icon: (
        <CustomerServiceOutlined
          className={`me-3 ${yellow}`}
          style={iconStyle}
        />
      ),
    },
    {
      component: CNavItem,
      name: 'FAQ',
      to: '/faq',
      icon: <HelpCircle className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    // {
    //   component: CNavItem,
    //   name: 'Perfomance Report',
    //   to: '/perfomacereport',
    //   icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    // },

    // {
    //   component: CNavItem,
    //   name: 'Report Card',
    //   to: '/reportcard',
    //   icon: <SolutionOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    // },
  ]

  /* ================= STUDENT NAV ================= */
  const studentNav = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <DashboardOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'My Profile',
      to: `/studentdetail/:studentId`,
      icon: <UserOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Attendance',
      to: '/studentattendance/:studentId',
      icon: <CalendarOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Homework',
      to: '/homework',
      icon: <BookPlus className={`me-3 ${yellow}`} style={iconStyle} />,
    },

    {
      component: CNavItem,
      name: 'Academic Fees',
      to: '/StudentFeeCollection/:studentId',
      icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Payment History',
      to: '/StudentFeeCollectionReport/:studentId',
      icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Query',
      to: '/communication',
      icon: <NotificationOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },

    {
      component: CNavItem,
      name: 'Marksheet',
      to: '/student-marksheet',
      icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Help & Support',
      to: '/support',
      icon: (
        <CustomerServiceOutlined
          className={`me-3 ${yellow}`}
          style={iconStyle}
        />
      ),
    }
  ]

  /* ================= PARENT NAV ================= */
  const parentNav = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <TeamOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'FAQ',
      to: '/faq',
      icon: <HelpCircle className={`me-3 ${yellow}`} style={iconStyle} />,
    },
  ]

  /* ================= TEACHER NAV ================= */
  const teacherNav = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <DashboardOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },

    {
      component: CNavItem,
      name: 'Teacher Detail',
      to: '/TeacherDetailPage/:teacherId',
      icon: <UserOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },

    {
      component: CNavGroup,
      name: 'My Classes',
      to: '/teacher/my-classes',
      icon: <TeamOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Students',
          to: '/teacher/my-classes/students',
          icon: <UserOutlined className="me-2" />,
        },

        ...(isClassTeacher
          ? [
            {
              component: CNavItem,
              name: 'Attendance',
              to: '/teacher/my-classes/attendance',
              icon: <CheckSquareOutlined className="me-2" />,
            },
          ]
          : []),

        ...(isClassTeacher
          ? [
            {
              component: CNavItem,
              name: 'Marksheet',
              to: '/teacher/add-marks',
              icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
            },
          ]
          : []),

        // {
        //   component: CNavItem,
        //   name: 'Assignments',
        //   to: '/teacher/my-classes/assignments',
        //   icon: <FileTextOutlined className="me-2" />,
        // },
        // {
        //   component: CNavItem,
        //   name: 'Study Material',
        //   to: '/teacher/my-classes/materials',
        //   icon: <BookOutlined className="me-2" />,
        // },
      ],
    },
    // {
    //   component: CNavItem,
    //   name: 'Roll Number Manage',
    //   to: '/rollnumber',
    //   icon: <CalendarOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    // },
    // {
    //   component: CNavItem,
    //   name: 'Exams & Marks',
    //   to: '/teacher/exams-marks',
    //   icon: <FormOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    // },

    // {
    //   component: CNavItem,
    //   name: 'Report Card',
    //   to: '/teacher/report-card',
    //   icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    // },

    // {
    //   component: CNavItem,
    //   name: 'Timetable',
    //   to: '/teacher/timetable',
    //   icon: <CalendarOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    // },

    // {
    //   component: CNavItem,
    //   name: 'Leave Management',
    //   to: '/teacher/leave',
    //   icon: <CoffeeOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    // },
    // {
    //   component: CNavItem,
    //   name: 'Homework Assign',
    //   to: '/homework-assign',
    //   icon: <BookPlus className={`me-3 ${yellow}`} style={iconStyle} />,
    // },

        {
      component: CNavGroup,
      name: 'Homework Management',
      to: '/homework',
      icon: <BookPlus className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Assigment',
          to: '/teacher/assigment',
          icon: <BookPlus className={`me-3 ${yellow}`} style={iconStyle} />,
        },
       {
      component: CNavItem,
      name: 'Homework List',
      to: '/homeworklist',
      icon: <BookPlus className={`me-3 ${yellow}`} style={iconStyle} />,
    },

      ]
    },
    {
      component: CNavItem,
      name: 'Notice Board ',
      to: '/communication',
      icon: <NotificationOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Help & Support',
      to: '/support',
      icon: (
        <CustomerServiceOutlined
          className={`me-3 ${yellow}`}
          style={iconStyle}
        />
      ),
    },
    {
      component: CNavItem,
      name: 'FAQ',
      to: '/faq',
      icon: <HelpCircle className={`me-3 ${yellow}`} style={iconStyle} />,
    },
  ]

  /* ================= HR MANAGER NAV ================= */
  // Full HR access — can approve leave, generate payroll, view all reports
  const hrManagerNav = [
    {
      component: CNavItem,
      name: 'HR Dashboard',
      to: '/dashboard',
      icon: <DashboardOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavGroup,
      name: 'Staff Management',
      to: '/hr',
      icon: <Users className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Staff List',
          to: '/hr/staff',
          icon: <TeamOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Add Staff',
          to: '/hr/staff/add',
          icon: <UserAddOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Department Master',
          to: '/hr/departments',
          icon: <Building2 className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Designation Master',
          to: '/hr/designations',
          icon: <Briefcase className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },
    {
      component: CNavGroup,
      name: 'Attendance',
      to: '/hr/attendance',
      icon: <CheckSquareOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Mark Attendance',
          to: '/hr/attendance',
          icon: <CheckSquareOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Attendance Register',
          to: '/hr/attendance/register',
          icon: <CalendarOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },
    {
      component: CNavGroup,
      name: 'Leave Management',
      to: '/hr/leave',
      icon: <CoffeeOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Leave Entry',
          to: '/hr/leave',
          icon: <FormOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Leave Approval',
          to: '/hr/leave/approval',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },
    {
      component: CNavGroup,
      name: 'Payroll',
      to: '/hr/payroll',
      icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Payroll Dashboard',
          to: '/hr/payroll/dashboard',
          icon: <DashboardOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Salary Structure',
          to: '/hr/payroll/salary-structure',
          icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Monthly Payroll',
          to: '/hr/payroll/monthly',
          icon: <CalendarOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Salary Payment',
          to: '/hr/payroll/payment',
          icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Salary Slip',
          to: '/hr/payroll/slip',
          icon: <SolutionOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },
    {
      component: CNavGroup,
      name: 'Accounts',
      to: '/hr/accounts',
      icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Accounts Dashboard',
          to: '/hr/accounts/dashboard',
          icon: <DashboardOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Account Head Master',
          to: '/hr/accounts/heads',
          icon: <AppstoreOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Income / Expense Voucher',
          to: '/hr/accounts/voucher',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Voucher List',
          to: '/hr/accounts/vouchers',
          icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Day Book',
          to: '/hr/accounts/daybook',
          icon: <BookOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Income Register',
          to: '/hr/accounts/income-register',
          icon: <TrendingUp className={`me-3 ${yellow}`} style={{ width: 20, height: 20 }} />,
        },
        {
          component: CNavItem,
          name: 'Expense Register',
          to: '/hr/accounts/expense-register',
          icon: <TrendingDown className={`me-3 ${yellow}`} style={{ width: 20, height: 20 }} />,
        },
        {
          component: CNavItem,
          name: 'Account Ledger',
          to: '/hr/accounts/ledger',
          icon: <BookOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Monthly Summary',
          to: '/hr/accounts/summary',
          icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Annual Report',
          to: '/hr/accounts/annual',
          icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Payment Mode Report',
          to: '/hr/accounts/payment-mode',
          icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },
    {
      component: CNavGroup,
      name: 'HR Reports',
      to: '/hr/reports',
      icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Staff Report',
          to: '/hr/reports/staff',
          icon: <TeamOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Attendance Report',
          to: '/hr/reports/attendance',
          icon: <CalendarOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Payroll Report',
          to: '/hr/reports/payroll',
          icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Salary Slip Report',
          to: '/hr/reports/salary-slip',
          icon: <SolutionOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },
    {
      component: CNavItem,
      name: 'Help & Support',
      to: '/support',
      icon: <CustomerServiceOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
  ]

  /* ================= HR STAFF NAV ================= */
  // Data Entry only — cannot approve leave or generate payroll
  const hrStaffNav = [
    {
      component: CNavItem,
      name: 'HR Dashboard',
      to: '/dashboard',
      icon: <DashboardOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavGroup,
      name: 'Staff Management',
      to: '/hr',
      icon: <Users className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Staff List',
          to: '/hr/staff',
          icon: <TeamOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Add Staff',
          to: '/hr/staff/add',
          icon: <UserAddOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },
    {
      component: CNavItem,
      name: 'Mark Attendance',
      to: '/hr/attendance',
      icon: <CheckSquareOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavItem,
      name: 'Leave Entry',
      to: '/hr/leave',
      icon: <CoffeeOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
    {
      component: CNavGroup,
      name: 'Accounts',
      to: '/hr/accounts',
      icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Income / Expense Voucher',
          to: '/hr/accounts/voucher',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Voucher List',
          to: '/hr/accounts/vouchers',
          icon: <FileTextOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },
    {
      component: CNavItem,
      name: 'Help & Support',
      to: '/support',
      icon: <CustomerServiceOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },
  ]

  /* ================= ACCOUNTANT NAV ================= */
  const accountantNav = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <DashboardOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },

    /* ── Fee Management ── */
    {
      component: CNavGroup,
      name: 'Fee Management',
      to: '/fee',
      icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Fee Collection',
          to: '/fee/feescollection',
          icon: <MoneyCollectOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Fee Reports',
          to: '/fee/feesreport',
          icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Late Fee Waived',
          to: '/fee/late-fee-wavied',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Additional Fee Waived',
          to: '/fee/additional-fee-waived',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },

    /* ── Reports ── */
    {
      component: CNavGroup,
      name: 'Fee Reports',
      to: '/reports/fee',
      icon: <BarChartOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      items: [
        {
          component: CNavItem,
          name: 'Defaulter List (Summary)',
          to: '/reports/defaulterfees',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Class-SectionWise Defaulter List',
          to: '/reports/class-section-defaulter',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Defaulter List (Detailed)',
          to: '/reports/defaulter-detailed',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Defaulter List Detailed (MonthWise)',
          to: '/reports/defaulter-monthwise',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Outstanding Fees',
          to: '/reports/outstandingfees',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Student Ledger',
          to: '/reports/studentLedger',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Fee Register (Detailed)',
          to: '/reports/fee-register-detailed',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Fee Deposit Summary (Class Wise)',
          to: '/reports/fee-deposit-summary-classwise',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Fee Deposited Statement (Detailed)',
          to: '/reports/fee-deposited-detailed',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Registration Fee Statement',
          to: '/reports/registration-fee-statement',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Registration Fee Statement (Class Wise)',
          to: '/reports/registration-fee-classwise',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Student Fee Details (Class Wise)',
          to: '/reports/student-fee-details-classwise',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Fee Head Report',
          to: '/reports/feeheadreport',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Late Fee Waiver Report',
          to: '/reports/late-fee-waiver',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Additional Fee Waiver Report',
          to: '/reports/additional-fee-waiver',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
        {
          component: CNavItem,
          name: 'Fee Transaction Report',
          to: '/fee/feesreport',
          icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
        },
      ],
    },

    /* ── Student List (read-only) ── */
    {
      component: CNavItem,
      name: 'Student List',
      to: '/student/StudentList',
      icon: <TeamOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
    },

    /* ── Help ── */
    {
      component: CNavItem,
      name: 'Help & Support',
      to: '/support',
      icon: (
        <CustomerServiceOutlined
          className={`me-3 ${yellow}`}
          style={iconStyle}
        />
      ),
    },
    {
      component: CNavItem,
      name: 'FAQ',
      to: '/faq',
      icon: <HelpCircle className={`me-3 ${yellow}`} style={iconStyle} />,
    },
  ]
  /* ================= ROLE SWITCH ================= */
  if (!role) return []
  if (role === 'SuperAdmin') return superAdminNav
  if (role === 'Admin') return adminNav
  if (role === 'Accountant') return accountantNav
  if (role === 'Teacher') return teacherNav
  if (role === 'Student') return studentNav
  if (role === 'Parent') return parentNav
  if (role === 'HRManager') return hrManagerNav
  if (role === 'HRStaff') return hrStaffNav

  return []
}

export default useNav

