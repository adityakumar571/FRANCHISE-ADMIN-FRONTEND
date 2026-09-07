/* eslint-disable prettier/prettier */

export const ROLES = {
  // ── Core admin ──────────────────────────────────
  SUPERADMIN: 'SuperAdmin',
  ADMIN:      'Admin',

  // ── Pharmacy franchise roles ─────────────────────
  ACCOUNTS:   'Accounts',   // Accounts staff — cash book, bank, reports
  STAFF:      'Staff',      // Pharmacy staff — POS, dispensing, inventory
  CUSTOMER:   'Customer',   // Registered patient/customer
  VENDOR:     'Vendor',     // Supplier/vendor representative
}

/** Roles that can access the franchise portal */
export const FRANCHISE_ROLES = [
  ROLES.SUPERADMIN,
  ROLES.ADMIN,
  ROLES.ACCOUNTS,
  ROLES.STAFF,
  ROLES.CUSTOMER,
  ROLES.VENDOR,
]

/** Role → default landing page after login */
export const ROLE_REDIRECT = {
  [ROLES.SUPERADMIN]: '/franchise/dashboard',
  [ROLES.ADMIN]:      '/franchise/dashboard',
  [ROLES.ACCOUNTS]:   '/franchise/accounts/cash-book',
  [ROLES.STAFF]:      '/franchise/pos/billing',
  [ROLES.CUSTOMER]:   '/franchise/dashboard',
  [ROLES.VENDOR]:     '/franchise/b2b-orders',
}

