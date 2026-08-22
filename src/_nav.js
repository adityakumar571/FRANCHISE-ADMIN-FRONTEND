/* eslint-disable prettier/prettier */
/**
 * _nav.js — Franchise Pharmacy Portal Navigation
 * Based on SOW: Pharmacy Franchise ERP & B2B Marketplace
 */
import { CNavGroup, CNavItem } from '@coreui/react'
import {
  LayoutDashboard, Store, Users, Package, ShoppingCart, Wallet, UserCheck,
  BarChart2, ClipboardList, Activity, Settings, HelpCircle, Bell,
  Truck, Layers, FlaskConical, Receipt, BookOpen, Warehouse, ScanLine,
  FileText, ShieldCheck, UserCog, RotateCcw,
} from 'lucide-react'

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

  /* ─── Sales / POS ─── */
  {
    component: CNavGroup,
    name: 'Sales / POS',
    to: '/franchise/pos',
    icon: <ScanLine className={`me-3 ${yellow}`} style={iconStyle} />,
    items: [
      {
        component: CNavItem,
        name: 'POS Billing',
        to: '/franchise/pos/billing',
        icon: <Receipt className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
      {
        component: CNavItem,
        name: 'Sales Returns',
        to: '/franchise/pos/returns',
        icon: <RotateCcw className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
      {
        component: CNavItem,
        name: 'Day Closing',
        to: '/franchise/pos/day-closing',
        icon: <BookOpen className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
    ],
  },

  /* ─── Purchase / Procurement ─── */
  {
    component: CNavGroup,
    name: 'Purchase',
    to: '/franchise/purchase',
    icon: <ShoppingCart className={`me-3 ${yellow}`} style={iconStyle} />,
    items: [
      {
        component: CNavItem,
        name: 'Purchase Dashboard',
        to: '/franchise/purchase/dashboard',
        icon: <LayoutDashboard className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
      {
        component: CNavItem,
        name: 'Live Rate Compare',
        to: '/franchise/purchase/live-rate',
        icon: <BarChart2 className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
      {
        component: CNavItem,
        name: 'Purchase Orders',
        to: '/franchise/purchase/orders',
        icon: <FileText className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
      {
        component: CNavItem,
        name: 'GRN / Inward',
        to: '/franchise/purchase/grn',
        icon: <Package className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
      {
        component: CNavItem,
        name: 'Purchase Returns',
        to: '/franchise/purchase/returns',
        icon: <RotateCcw className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
      {
        component: CNavItem,
        name: 'Supplier Ledger',
        to: '/franchise/purchase/supplier-ledger',
        icon: <BookOpen className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
    ],
  },

  /* ─── Inventory ─── */
  {
    component: CNavGroup,
    name: 'Inventory',
    to: '/franchise/inventory',
    icon: <Warehouse className={`me-3 ${yellow}`} style={iconStyle} />,
    items: [
      {
        component: CNavItem,
        name: 'Stock Overview',
        to: '/franchise/inventory/stock',
        icon: <ClipboardList className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
      {
        component: CNavItem,
        name: 'Rack & Warehouse',
        to: '/franchise/inventory/rack',
        icon: <Layers className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
      {
        component: CNavItem,
        name: 'Batch & Expiry',
        to: '/franchise/inventory/batch-expiry',
        icon: <FlaskConical className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
      {
        component: CNavItem,
        name: 'Stock Adjustments',
        to: '/franchise/inventory/adjustments',
        icon: <Activity className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
    ],
  },

  /* ─── Medicines ─── */
  {
    component: CNavItem,
    name: 'Medicines',
    to: '/franchise/medicines',
    icon: <FlaskConical className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Suppliers / Distributors ─── */
  {
    component: CNavItem,
    name: 'Suppliers',
    to: '/franchise/suppliers',
    icon: <Truck className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── B2B Orders ─── */
  {
    component: CNavItem,
    name: 'B2B Orders',
    to: '/franchise/b2b-orders',
    icon: <Store className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Customers / Ledger ─── */
  {
    component: CNavItem,
    name: 'Customers',
    to: '/franchise/customers',
    icon: <Users className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Staff ─── */
  {
    component: CNavItem,
    name: 'Staff & Users',
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
        icon: <FileText className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
      {
        component: CNavItem,
        name: 'Purchase Report',
        to: '/franchise/reports/purchase',
        icon: <FileText className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
      {
        component: CNavItem,
        name: 'Stock Report',
        to: '/franchise/reports/stock',
        icon: <FileText className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
      {
        component: CNavItem,
        name: 'Expiry Report',
        to: '/franchise/reports/expiry',
        icon: <FileText className={`me-3 ${yellow}`} style={{ fontSize: '16px' }} />,
      },
    ],
  },

  /* ─── Notifications ─── */
  {
    component: CNavItem,
    name: 'Notifications',
    to: '/franchise/notifications',
    icon: <Bell className={`me-3 ${yellow}`} style={iconStyle} />,
  },

  /* ─── Audit Logs ─── */
  {
    component: CNavItem,
    name: 'Audit Logs',
    to: '/franchise/audit',
    icon: <ShieldCheck className={`me-3 ${yellow}`} style={iconStyle} />,
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
