/* eslint-disable prettier/prettier */
/**
 * routes.js — Franchise Portal Routes
 *
 * Only franchise-domain routes.
 * All school-specific routes removed.
 * These are rendered inside DefaultLayout → AppContent.
 *
 * Note: /franchise/* routes are handled separately in App.js
 * via FranchiseLayout. This file handles the legacy DefaultLayout
 * shell which now redirects to /franchise/dashboard.
 */
import FranchiseDashboard   from './views/franchise/Dashboard/FranchiseDashboard'
import FranchisePlaceholder from './views/franchise/Placeholder/FranchisePlaceholder'

const routes = [
  /* Dashboard */
  {
    path: '/dashboard',
    element: FranchiseDashboard,
    roles: ['SuperAdmin', 'Admin'],
  },

  /* Branches */
  {
    path: '/franchise/branches',
    element: () => <FranchisePlaceholder title="Branches / Outlets" icon="🏪" />,
    roles: ['SuperAdmin', 'Admin'],
  },

  /* Customers */
  {
    path: '/franchise/customers',
    element: () => <FranchisePlaceholder title="Customers" icon="👥" />,
    roles: ['SuperAdmin', 'Admin'],
  },

  /* Products */
  {
    path: '/franchise/products',
    element: () => <FranchisePlaceholder title="Products" icon="📦" />,
    roles: ['SuperAdmin', 'Admin'],
  },

  /* Inventory */
  {
    path: '/franchise/inventory',
    element: () => <FranchisePlaceholder title="Inventory" icon="🗂️" />,
    roles: ['SuperAdmin', 'Admin'],
  },

  /* Orders */
  {
    path: '/franchise/orders',
    element: () => <FranchisePlaceholder title="Orders" icon="🛒" />,
    roles: ['SuperAdmin', 'Admin'],
  },

  /* Billing */
  {
    path: '/franchise/billing',
    element: () => <FranchisePlaceholder title="Billing & Invoices" icon="💳" />,
    roles: ['SuperAdmin', 'Admin'],
  },

  /* Staff */
  {
    path: '/franchise/staff',
    element: () => <FranchisePlaceholder title="Staff Management" icon="👤" />,
    roles: ['SuperAdmin', 'Admin'],
  },

  /* Reports */
  {
    path: '/franchise/reports/sales',
    element: () => <FranchisePlaceholder title="Sales Report" icon="📈" />,
    roles: ['SuperAdmin', 'Admin'],
  },
  {
    path: '/franchise/reports/purchase',
    element: () => <FranchisePlaceholder title="Purchase Report" icon="📊" />,
    roles: ['SuperAdmin', 'Admin'],
  },
  {
    path: '/franchise/reports/stock',
    element: () => <FranchisePlaceholder title="Stock Report" icon="📉" />,
    roles: ['SuperAdmin', 'Admin'],
  },
  {
    path: '/franchise/reports/financial',
    element: () => <FranchisePlaceholder title="Financial Report" icon="💰" />,
    roles: ['SuperAdmin', 'Admin'],
  },

  /* Attendance */
  {
    path: '/franchise/attendance',
    element: () => <FranchisePlaceholder title="Attendance" icon="📅" />,
    roles: ['SuperAdmin', 'Admin'],
  },

  /* Activity Logs */
  {
    path: '/franchise/activity',
    element: () => <FranchisePlaceholder title="Activity Logs" icon="🔍" />,
    roles: ['SuperAdmin', 'Admin'],
  },

  /* Settings */
  {
    path: '/franchise/settings',
    element: () => <FranchisePlaceholder title="Settings" icon="⚙️" />,
    roles: ['SuperAdmin', 'Admin'],
  },

  /* Support */
  {
    path: '/franchise/support',
    element: () => <FranchisePlaceholder title="Help & Support" icon="🎧" />,
    roles: ['SuperAdmin', 'Admin'],
  },
]

export default routes
