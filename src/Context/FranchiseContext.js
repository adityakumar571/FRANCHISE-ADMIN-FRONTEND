/* eslint-disable prettier/prettier */
/**
 * FranchiseContext
 *
 * Holds authenticated franchise session data:
 *   - franchiseUser  : { _id, userId, name, role }
 *   - franchiseInfo  : { _id, franchiseName, franchiseCode, subdomain, logo }
 *   - menuAccess     : { [key]: boolean } — controls sidebar visibility
 *
 * On login, menuAccess is initialised from ROLE_DEFAULT_ACCESS for the user's role.
 * SuperAdmin / Admin get full access; other roles get restricted access.
 * Admins can override per-user access via User Management → User Access tab.
 *
 * Loaded from localStorage on mount (persisted after FranchiseLogin).
 * Cleared on logout.
 */
import React, { createContext, useContext, useState, useCallback } from 'react'
import Cookies from 'js-cookie'

export const FranchiseContext = createContext()

/* ── All menu permission keys ── */
export const ALL_MENU_KEYS = [
  'dashboard','dashboard_main','dashboard_layout3d',
  'pos','pos_billing','pos_barcode','pos_prescription','pos_payment','pos_split',
  'pos_hold','pos_return','pos_exchange','pos_credit','pos_dayclosing',
  'purchase','purchase_dashboard','purchase_orders','purchase_grn','purchase_returns','purchase_ledger','purchase_liverates',
  'inventory','inventory_dashboard','inventory_stock','inventory_adjustment','inventory_nearexpiry',
  'inventory_expired','inventory_damage','inventory_dead','inventory_fastmoving','inventory_slowmoving',
  'inventory_ledger','inventory_rack','inventory_audit','inventory_verification',
  'liverates','liverates_dashboard','liverates_compare','liverates_stock','liverates_scheme',
  'liverates_bestdeal','liverates_cart','liverates_order','liverates_tracking',
  'medicines','medicines_list','medicines_add','medicines_edit','medicines_rack','medicines_barcode',
  'suppliers','suppliers_list','suppliers_add','suppliers_outstanding','suppliers_ledger','suppliers_payments',
  'customers','customers_list','customers_wallet','customers_history','customers_reminder',
  'customers_membership','customers_loyalty','customers_carecoin',
  'b2b','b2b_orders',
  'accounts','accounts_cashbook','accounts_bankbook','accounts_daybook','accounts_receipts',
  'accounts_payments','accounts_expenses','accounts_income','accounts_journal',
  'accounts_ledger','accounts_trial','accounts_pl','accounts_bs',
  'reports','reports_sales','reports_purchase','reports_stock','reports_expiry',
  'staff','staff_list','staff_add','staff_access',
  'settings','settings_business','settings_profile','settings_notif','settings_security','settings_print',
  'audit','audit_logs','audit_activity',
]

/* ── Full access map (SuperAdmin / Admin / Franchise Owner) ── */
export const FULL_MENU_ACCESS = Object.fromEntries(ALL_MENU_KEYS.map(k => [k, true]))

/* ── Role-based default allowed keys ── */
export const ROLE_DEFAULT_ACCESS = {
  SuperAdmin:       ALL_MENU_KEYS,
  Admin:            ALL_MENU_KEYS,
  'Franchise Owner': ALL_MENU_KEYS,
  Accounts: [
    'dashboard', 'dashboard_main',
    'accounts', 'accounts_cashbook', 'accounts_bankbook', 'accounts_daybook',
    'accounts_receipts', 'accounts_payments', 'accounts_expenses', 'accounts_income',
    'accounts_journal', 'accounts_ledger', 'accounts_trial', 'accounts_pl', 'accounts_bs',
    'reports', 'reports_sales', 'reports_purchase', 'reports_stock', 'reports_expiry',
  ],
  Staff: [
    'dashboard', 'dashboard_main',
    'pos', 'pos_billing', 'pos_barcode', 'pos_prescription', 'pos_payment',
    'pos_hold', 'pos_return', 'pos_dayclosing',
    'medicines', 'medicines_list',
    'inventory', 'inventory_dashboard', 'inventory_stock', 'inventory_nearexpiry',
    'customers', 'customers_list',
  ],
  Customer: [
    'dashboard', 'dashboard_main',
    'pos', 'pos_billing',
    'customers', 'customers_list', 'customers_wallet', 'customers_history', 'customers_loyalty',
  ],
  Vendor: [
    'dashboard', 'dashboard_main',
    'b2b', 'b2b_orders',
    'suppliers', 'suppliers_list',
  ],
}

/* Build a boolean access map from an allowed-keys array */
const buildAccessMap = (allowedKeys) => {
  const map = {}
  ALL_MENU_KEYS.forEach(k => { map[k] = allowedKeys.includes(k) })
  return map
}

/* Get the default access map for a role */
export const getDefaultAccessForRole = (role) => {
  const allowed = ROLE_DEFAULT_ACCESS[role] || ROLE_DEFAULT_ACCESS['Staff']
  return buildAccessMap(allowed)
}

export const FranchiseProvider = ({ children }) => {
  const [franchiseUser, setFranchiseUserState] = useState(() => {
    try {
      const s = localStorage.getItem('franchise_user')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  const [franchiseInfo, setFranchiseInfoState] = useState(() => {
    try {
      const s = localStorage.getItem('franchise_context')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  /* ── Menu Access — persisted per user, role-aware ── */
  const [menuAccess, setMenuAccessState] = useState(() => {
    try {
      const stored = localStorage.getItem('franchise_user')
      const user   = stored ? JSON.parse(stored) : null
      if (!user) return { ...FULL_MENU_ACCESS }

      // Try user-specific saved access first
      const saved = localStorage.getItem(`franchise_menu_access_${user._id || 'default'}`)
      if (saved) return JSON.parse(saved)

      // Otherwise fall back to role default
      return getDefaultAccessForRole(user.role)
    } catch { return { ...FULL_MENU_ACCESS } }
  })

  const setMenuAccess = useCallback((access, userId) => {
    const key = userId || 'default'
    setMenuAccessState(access)
    localStorage.setItem(`franchise_menu_access_${key}`, JSON.stringify(access))
  }, [])

  /* Check if a key is allowed */
  const hasAccess = useCallback((key) => {
    if (!key) return true
    const role = franchiseUser?.role
    if (role === 'SuperAdmin' || role === 'Admin' || role === 'Franchise Owner') return true
    return menuAccess[key] === true
  }, [menuAccess, franchiseUser])

  const setFranchiseUser = useCallback((user) => {
    setFranchiseUserState(user)
    if (user) {
      localStorage.setItem('franchise_user', JSON.stringify(user))

      // Try user-specific saved access, else use role default
      const saved = localStorage.getItem(`franchise_menu_access_${user._id || 'default'}`)
      if (saved) {
        try { setMenuAccessState(JSON.parse(saved)); return } catch { /* fall through */ }
      }
      // Set role-based default access
      const defaultAccess = getDefaultAccessForRole(user.role)
      setMenuAccessState(defaultAccess)
      localStorage.setItem(`franchise_menu_access_${user._id || 'default'}`, JSON.stringify(defaultAccess))
    } else {
      localStorage.removeItem('franchise_user')
    }
  }, [])

  const setFranchiseInfo = useCallback((info) => {
    setFranchiseInfoState(info)
    if (info) {
      localStorage.setItem('franchise_context', JSON.stringify(info))
      localStorage.setItem('franchise_subdomain', info.subdomain || '')
    } else {
      localStorage.removeItem('franchise_context')
      localStorage.removeItem('franchise_subdomain')
    }
  }, [])

  const logoutFranchise = useCallback(() => {
    Cookies.remove('LMS', { path: '/' })
    localStorage.removeItem('franchise_user')
    localStorage.removeItem('franchise_context')
    localStorage.removeItem('franchise_subdomain')
    setFranchiseUserState(null)
    setFranchiseInfoState(null)
    setMenuAccessState({ ...FULL_MENU_ACCESS })
  }, [])

  const isAuthenticated = !!Cookies.get('LMS') && !!franchiseUser

  // Re-check auth whenever franchiseUser changes (covers logout + login cycles)

  return (
    <FranchiseContext.Provider
      value={{
        franchiseUser,
        franchiseInfo,
        menuAccess,
        setMenuAccess,
        hasAccess,
        setFranchiseUser,
        setFranchiseInfo,
        logoutFranchise,
        isAuthenticated,
      }}
    >
      {children}
    </FranchiseContext.Provider>
  )
}

export const useFranchise = () => useContext(FranchiseContext)
