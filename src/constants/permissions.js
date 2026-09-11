import { ROLES } from './roles'

// Route-level permission map for franchise portal routes
export const ROUTE_PERMISSION = {
  '/franchise/dashboard':        [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.ACCOUNTS, ROLES.STAFF, ROLES.CUSTOMER, ROLES.VENDOR],
  '/franchise/pos':              [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER],
  '/franchise/purchase':         [ROLES.SUPERADMIN, ROLES.ADMIN],
  '/franchise/inventory':        [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF],
  '/franchise/live-rates':       [ROLES.SUPERADMIN, ROLES.ADMIN],
  '/franchise/medicines':        [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF],
  '/franchise/suppliers':        [ROLES.SUPERADMIN, ROLES.ADMIN],
  '/franchise/customers':        [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER],
  '/franchise/accounts':         [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.ACCOUNTS],
  '/franchise/reports':          [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.ACCOUNTS],
  '/franchise/staff':            [ROLES.SUPERADMIN, ROLES.ADMIN],
  '/franchise/b2b-orders':       [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.VENDOR],
  '/franchise/user-management':  [ROLES.SUPERADMIN, ROLES.ADMIN],
  '/franchise/settings':         [ROLES.SUPERADMIN, ROLES.ADMIN],
  '/franchise/audit':            [ROLES.SUPERADMIN, ROLES.ADMIN],
}
