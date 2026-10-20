import { CNavGroup, CNavItem } from '@coreui/react'
import {
  LayoutDashboard, Package, ShoppingCart,
  User, BarChart2, Warehouse, BookOpen
} from 'lucide-react'

const C = '#fff' // White color for dark sidebar theme (matching franchise)
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
    component: CNavItem,
    name: 'Orders',
    to: '/supplier/orders',
    icon: ic(ShoppingCart),
  },

  /* Inventory Management */
  {
    component: CNavItem,
    name: 'Inventory',
    to: '/supplier/inventory',
    icon: ic(Warehouse),
  },

  /* Medicine Masters */
  {
    component: CNavItem,
    name: 'Medicine Masters',
    to: '/supplier/masters',
    icon: ic(BookOpen),
  },

  /* Reports */
  {
    component: CNavItem,
    name: 'Reports',
    to: '/supplier/reports',
    icon: ic(BarChart2),
  },

  /* Profile */
  {
    component: CNavItem,
    name: 'Profile',
    to: '/supplier/profile',
    icon: ic(User),
  },
]

export default supplierNav
