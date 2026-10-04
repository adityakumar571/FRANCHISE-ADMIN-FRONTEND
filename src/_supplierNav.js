import { CNavGroup, CNavItem } from '@coreui/react'
import {
  LayoutDashboard, Package, ShoppingCart, FileText,
  Settings, User, Bell, BarChart2, Warehouse, TrendingUp, Box
} from 'lucide-react'

const C = '#d97706' // Orange color for supplier theme
const S = { marginRight: 10, flexShrink: 0 }
const ic = (Icon) => <Icon size={17} color={C} style={S} />

const supplierNav = [
  /* Dashboard */
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/supplier/dashboard',
    icon: ic(LayoutDashboard),
  },

  /* Orders Management */
  {
    component: CNavGroup,
    name: 'Orders',
    to: '/supplier/orders',
    icon: ic(ShoppingCart),
    items: [
      {
        component: CNavItem,
        name: 'All Orders',
        to: '/supplier/orders',
      },
      {
        component: CNavItem,
        name: 'Pending Orders',
        to: '/supplier/orders?status=pending',
      },
      {
        component: CNavItem,
        name: 'Completed Orders',
        to: '/supplier/orders?status=completed',
      },
    ],
  },

  /* Inventory Management */
  {
    component: CNavGroup,
    name: 'Inventory',
    to: '/supplier/inventory',
    icon: ic(Warehouse),
    items: [
      {
        component: CNavItem,
        name: 'All Products',
        to: '/supplier/inventory',
      },
      {
        component: CNavItem,
        name: 'Add Product',
        to: '/supplier/inventory/add',
      },
      {
        component: CNavItem,
        name: 'Low Stock',
        to: '/supplier/inventory?filter=low-stock',
      },
    ],
  },

  /* Reports & Analytics */
  {
    component: CNavGroup,
    name: 'Reports',
    to: '/supplier/reports',
    icon: ic(BarChart2),
    items: [
      {
        component: CNavItem,
        name: 'Sales Report',
        to: '/supplier/reports/sales',
      },
      {
        component: CNavItem,
        name: 'Franchise-wise Report',
        to: '/supplier/reports/franchise',
      },
      {
        component: CNavItem,
        name: 'Product Report',
        to: '/supplier/reports/products',
      },
      {
        component: CNavItem,
        name: 'Analytics',
        to: '/supplier/reports/analytics',
      },
    ],
  },

  /* Profile/Settings */
  {
    component: CNavItem,
    name: 'Profile',
    to: '/supplier/profile',
    icon: ic(User),
  },
]

export default supplierNav
