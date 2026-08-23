/* eslint-disable prettier/prettier */
/**
 * _nav.js — Franchise Pharmacy Portal Navigation
 * Exact match to DoctorsAdda sidebar image
 */
import { CNavGroup, CNavItem } from '@coreui/react'
import {
  LayoutDashboard,
  ScanLine,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Warehouse,
  ArrowLeftRight,
  RotateCcw,
  FileText,
  Store,
  Users,
  Truck,
  BookOpen,
  BarChart2,
  Star,
  UserCheck,
  Settings,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Zap,
  Layers,
  Calendar,
  ClipboardList,
  List,
  Wallet,
  Crown,
  Bell,
  Award,
  History,
} from 'lucide-react'

const C = '#fabf22'
const S = { marginRight: 10, flexShrink: 0 }

/* helper — renders icon with consistent size/color/margin */
const ic = (Icon) => <Icon size={17} color={C} style={S} />

const franchiseNav = [

  /* 1 ── Dashboard ── */
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/franchise/dashboard',
    icon: ic(LayoutDashboard),
  },

  /* 2 ── POS Billing  F2 ── */
  {
    component: CNavItem,
    name: 'POS Billing',
    to: '/franchise/pos/billing',
    icon: ic(ScanLine),
    badge: { color: 'secondary', text: 'F2' },
  },

  /* 3 ── Sales (group) ── */
  {
    component: CNavGroup,
    name: 'Sales',
    to: '/franchise/pos',
    icon: ic(TrendingUp),
    items: [
      { component: CNavItem, name: "Today's Sale",  to: '/franchise/reports/sales',   icon: ic(FileText) },
      { component: CNavItem, name: 'Sales History', to: '/franchise/reports/sales',   icon: ic(BookOpen) },
      { component: CNavItem, name: 'Sale Return',   to: '/franchise/pos/returns',     icon: ic(RotateCcw) },
      { component: CNavItem, name: 'Day Closing',   to: '/franchise/pos/day-closing', icon: ic(FileText) },
    ],
  },

  /* 4 ── Purchase (group) ── */
  {
    component: CNavGroup,
    name: 'Purchase',
    to: '/franchise/purchase',
    icon: ic(ShoppingCart),
    items: [
      { component: CNavItem, name: 'Purchase Dashboard', to: '/franchise/purchase/dashboard',       icon: ic(LayoutDashboard) },
      { component: CNavItem, name: 'New Purchase',       to: '/franchise/purchase/orders',          icon: ic(ShoppingCart) },
      { component: CNavItem, name: 'Purchase Orders',    to: '/franchise/purchase/orders',          icon: ic(FileText) },
      { component: CNavItem, name: 'GRN / Inward',       to: '/franchise/purchase/grn',             icon: ic(Warehouse) },
      { component: CNavItem, name: 'Purchase Returns',   to: '/franchise/purchase/returns',         icon: ic(RotateCcw) },
      { component: CNavItem, name: 'Supplier Ledger',    to: '/franchise/purchase/supplier-ledger', icon: ic(BookOpen) },
    ],
  },

  /* 5 ── Inventory (group) ── */
  {
    component: CNavGroup,
    name: 'Inventory',
    to: '/franchise/inventory',
    icon: ic(Warehouse),
    items: [
      { component: CNavItem, name: 'Inventory Dashboard',       to: '/franchise/inventory/dashboard',    icon: ic(LayoutDashboard) },
      { component: CNavItem, name: 'Current Stock',             to: '/franchise/inventory/stock',        icon: ic(FileText) },
      { component: CNavItem, name: 'Stock Adjustment',          to: '/franchise/inventory/adjustments',  icon: ic(ArrowLeftRight) },
      { component: CNavItem, name: 'Physical Verification',     to: '/franchise/inventory/verification', icon: ic(ShieldCheck) },
      { component: CNavItem, name: 'Near Expiry',               to: '/franchise/inventory/near-expiry',  icon: ic(AlertCircle) },
      { component: CNavItem, name: 'Expired Stock',             to: '/franchise/inventory/expired',      icon: ic(Trash2) },
      { component: CNavItem, name: 'Damage Stock',              to: '/franchise/inventory/damage',       icon: ic(AlertTriangle) },
      { component: CNavItem, name: 'Dead Stock',                to: '/franchise/inventory/dead',         icon: ic(TrendingDown) },
      { component: CNavItem, name: 'Fast Moving',               to: '/franchise/inventory/fast-moving',  icon: ic(Zap) },
      { component: CNavItem, name: 'Slow Moving',               to: '/franchise/inventory/slow-moving',  icon: ic(TrendingDown) },
      { component: CNavItem, name: 'Stock Ledger',              to: '/franchise/inventory/ledger',       icon: ic(BookOpen) },
      { component: CNavItem, name: 'Rack & Warehouse',          to: '/franchise/inventory/rack',         icon: ic(Layers) },
      { component: CNavItem, name: 'Batch & Expiry',            to: '/franchise/inventory/batch-expiry', icon: ic(Calendar) },
      { component: CNavItem, name: 'Inventory Audit',           to: '/franchise/inventory/audit',        icon: ic(ClipboardList) },
    ],
  },

  /* 6 ── Live Wholesale Rates  LIVE ── */
  {
    component: CNavItem,
    name: 'Live Wholesale Rates',
    to: '/franchise/purchase/live-rate',
    icon: ic(TrendingUp),
    badge: { color: 'danger', text: 'LIVE' },
  },

  /* 7 ── Stock Transfer ── */
  {
    component: CNavItem,
    name: 'Stock Transfer',
    to: '/franchise/inventory/stock',
    icon: ic(ArrowLeftRight),
  },

  /* 8 ── Returns ── */
  {
    component: CNavItem,
    name: 'Returns',
    to: '/franchise/pos/returns',
    icon: ic(RotateCcw),
  },

  /* 9 ── Prescriptions ── */
  {
    component: CNavItem,
    name: 'Prescriptions',
    to: '/franchise/medicines',
    icon: ic(FileText),
  },

  /* 10 ── Online Orders  13 badge ── */
  {
    component: CNavItem,
    name: 'Online Orders',
    to: '/franchise/b2b-orders',
    icon: ic(Store),
    badge: { color: 'success', text: '13' },
  },

  /* 11 ── Customers (group) ── */
  {
    component: CNavGroup,
    name: 'Customers',
    to: '/franchise/customers',
    icon: ic(Users),
    items: [
      { component: CNavItem, name: 'Customer List',       to: '/franchise/customers',                     icon: ic(List)        },
      { component: CNavItem, name: 'Customer Wallet',     to: '/franchise/customers/CUS001/wallet',       icon: ic(Wallet)      },
      { component: CNavItem, name: 'Purchase History',    to: '/franchise/customers/CUS001/history',      icon: ic(History)     },
      { component: CNavItem, name: 'Medicine Reminder',   to: '/franchise/customers/CUS001/reminders',    icon: ic(Bell)        },
      { component: CNavItem, name: 'Membership',          to: '/franchise/customers/CUS001/membership',   icon: ic(Crown)       },
      { component: CNavItem, name: 'Loyalty',             to: '/franchise/customers/CUS001/loyalty',      icon: ic(Star)        },
      { component: CNavItem, name: 'CareCoin',            to: '/franchise/customers/CUS001/carecoin',     icon: ic(Award)       },
    ],
  },

  /* 12 ── Suppliers ── */
  {
    component: CNavItem,
    name: 'Suppliers',
    to: '/franchise/suppliers',
    icon: ic(Truck),
  },

  /* 13 ── Accounts ── */
  {
    component: CNavItem,
    name: 'Accounts',
    to: '/franchise/reports/sales',
    icon: ic(BookOpen),
  },

  /* 14 ── Reports (group) ── */
  {
    component: CNavGroup,
    name: 'Reports',
    to: '/franchise/reports',
    icon: ic(BarChart2),
    items: [
      { component: CNavItem, name: 'Sales Report',    to: '/franchise/reports/sales',    icon: ic(FileText) },
      { component: CNavItem, name: 'Purchase Report', to: '/franchise/reports/purchase', icon: ic(FileText) },
      { component: CNavItem, name: 'Stock Report',    to: '/franchise/reports/stock',    icon: ic(FileText) },
      { component: CNavItem, name: 'Expiry Report',   to: '/franchise/reports/expiry',   icon: ic(FileText) },
    ],
  },

  /* 15 ── CRM & Loyalty ── */
  {
    component: CNavItem,
    name: 'CRM & Loyalty',
    to: '/franchise/customers/CUS001/loyalty',
    icon: ic(Star),
  },

  /* 16 ── Staff & Users ── */
  {
    component: CNavItem,
    name: 'Staff & Users',
    to: '/franchise/staff',
    icon: ic(UserCheck),
  },

  /* 17 ── Settings ── */
  {
    component: CNavItem,
    name: 'Settings',
    to: '/franchise/settings',
    icon: ic(Settings),
  },

]

const useNav = () => franchiseNav

export default useNav
