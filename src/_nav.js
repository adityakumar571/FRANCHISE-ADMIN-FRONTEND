/* eslint-disable prettier/prettier */
/**
 * _nav.js — Franchise Portal Navigation
 *
 * Used by AppSidebar → AppSidebarNav (CoreUI).
 * All school-specific menus removed.
 * Franchise-domain menus added.
 */
import { CNavGroup, CNavItem } from '@coreui/react'
import {
  DashboardOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  SettingOutlined,
  CustomerServiceOutlined,
  BarChartOutlined,
  MoneyCollectOutlined,
  FileDoneOutlined,
  CalendarOutlined,
  AuditOutlined,
  BankOutlined,
  TruckOutlined,
} from '@ant-design/icons'
import { LayoutDashboard, Store, Users, Package, ShoppingCart, Wallet, UserCheck, BarChart2, ClipboardList, Activity, Settings, HelpCircle, CalendarDays, Bell } from 'lucide-react'

const yellow = 'text-[#fabf22]'
const iconStyle = { fontSize: '18px' }

const franchiseNav = [
  /* ─── Dashboard ─── */
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/franchise/dashboard',
    icon: <LayoutDashboard className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Branches / Outlets ─── */
  {
    component: CNavItem,
    name: 'Branches / Outlets',
    to: '/franchise/branches',
    icon: <Store className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Customers ─── */
  {
    component: CNavItem,
    name: 'Customers',
    to: '/franchise/customers',
    icon: <Users className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Products ─── */
  {
    component: CNavItem,
    name: 'Products',
    to: '/franchise/products',
    icon: <Package className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Inventory ─── */
  {
    component: CNavItem,
    name: 'Inventory',
    to: '/franchise/inventory',
    icon: <ClipboardList className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Orders ─── */
  {
    component: CNavItem,
    name: 'Orders',
    to: '/franchise/orders',
    icon: <ShoppingCart className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Billing ─── */
  {
    component: CNavItem,
    name: 'Billing & Invoices',
    to: '/franchise/billing',
    icon: <Wallet className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Staff ─── */
  {
    component: CNavItem,
    name: 'Staff Management',
    to: '/franchise/staff',
    icon: <UserCheck className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Reports ─── */
  {
    component: CNavGroup,
    name: 'Reports',
    to: '/franchise/reports',
    icon: <BarChart2 className={`me-3 ${yellow}`} style={iconStyle} />,
    items: [
      {
        component: CNavItem,
        name: 'Sales Report',
        to: '/franchise/reports/sales',
        icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      },
      {
        component: CNavItem,
        name: 'Purchase Report',
        to: '/franchise/reports/purchase',
        icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      },
      {
        component: CNavItem,
        name: 'Stock Report',
        to: '/franchise/reports/stock',
        icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      },
      {
        component: CNavItem,
        name: 'Financial Report',
        to: '/franchise/reports/financial',
        icon: <FileDoneOutlined className={`me-3 ${yellow}`} style={iconStyle} />,
      },
    ],
  },

  /* ─── Attendance ─── */
  {
    component: CNavItem,
    name: 'Attendance',
    to: '/franchise/attendance',
    icon: <CalendarDays className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Activity Logs ─── */
  {
    component: CNavItem,
    name: 'Activity Logs',
    to: '/franchise/activity',
    icon: <Activity className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Settings ─── */
  {
    component: CNavItem,
    name: 'Settings',
    to: '/franchise/settings',
    icon: <Settings className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Help & Support ─── */
  {
    component: CNavItem,
    name: 'Help & Support',
    to: '/franchise/support',
    icon: <HelpCircle className={`me-3 ${yellow}`} style={iconStyle} />,
  },
]

const useNav = () => franchiseNav

export default useNav
