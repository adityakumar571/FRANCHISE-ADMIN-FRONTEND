/* eslint-disable prettier/prettier */
import FranchiseDashboard   from './views/franchise/Dashboard/FranchiseDashboard'
import Branches             from './views/franchise/Branches/Branches'
import Customers            from './views/franchise/Customers/Customers'
import Products             from './views/franchise/Products/Products'
import Inventory            from './views/franchise/Inventory/Inventory'
import Orders               from './views/franchise/Orders/Orders'
import Staff                from './views/franchise/Staff/Staff'
import Billing              from './views/franchise/Billing/Billing'
import Attendance           from './views/franchise/Attendance/Attendance'
import ActivityLogs         from './views/franchise/ActivityLogs/ActivityLogs'
import Settings             from './views/franchise/Settings/Settings'
import SalesReport          from './views/franchise/Reports/SalesReport'
import PurchaseReport       from './views/franchise/Reports/PurchaseReport'
import StockReport          from './views/franchise/Reports/StockReport'
import FinancialReport      from './views/franchise/Reports/FinancialReport'

const routes = [
  { path: '/dashboard',                  element: FranchiseDashboard, roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/dashboard',        element: FranchiseDashboard, roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/branches',         element: Branches,           roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/customers',        element: Customers,          roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/products',         element: Products,           roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/inventory',        element: Inventory,          roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/orders',           element: Orders,             roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/billing',          element: Billing,            roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/staff',            element: Staff,              roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/reports/sales',    element: SalesReport,        roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/reports/purchase', element: PurchaseReport,     roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/reports/stock',    element: StockReport,        roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/reports/financial',element: FinancialReport,    roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/attendance',       element: Attendance,         roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/activity',         element: ActivityLogs,       roles: ['SuperAdmin', 'Admin'] },
  { path: '/franchise/settings',         element: Settings,           roles: ['SuperAdmin', 'Admin'] },
]

export default routes
