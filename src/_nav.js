/* eslint-disable prettier/prettier */
/**
 * _nav.js — Franchise Pharmacy Portal Navigation
 * Every item has an `accessKey` that maps to menuAccess permissions.
 * AppSidebar filters items based on menuAccess from FranchiseContext.
 */
import { CNavGroup, CNavItem } from '@coreui/react'
import {
  LayoutDashboard, ScanLine, TrendingUp, TrendingDown,
  ShoppingCart, Warehouse, ArrowLeftRight, RotateCcw,
  FileText, Store, Users, Truck, BookOpen, BarChart2,
  Star, UserCheck, Settings, ShieldCheck, AlertCircle,
  AlertTriangle, Trash2, Zap, Layers, Calendar, ClipboardList,
  List, Wallet, Crown, Bell, Award, History,
  CreditCard, Pause, Printer, Search, UploadCloud,
  BookMarked, Scale, LayoutTemplate, Landmark,
  ArrowDownCircle, ArrowUpCircle, CalendarDays,
  Tag, GitCompare, Send, StarHalf, FlaskConical, Plus, IndianRupee,
  Map,
} from 'lucide-react'


const C = '#fabf22'
const S = { marginRight: 10, flexShrink: 0 }
const ic = (Icon) => <Icon size={17} color={C} style={S} />

const franchiseNav = [

  /* 1 ── Dashboard ── */
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/franchise/dashboard',
    icon: ic(LayoutDashboard),
    accessKey: 'dashboard_main',
  },

  /* 1b ── Location / Rack Layout ── */
  {
    component: CNavItem,
    name: 'Location / Rack Layout',
    to: '/franchise/layout-3d',
    icon: ic(Map),
    badge: { color: 'info', text: '3D' },
    accessKey: 'dashboard_layout3d',
  },

  /* 2 ── POS Billing (group) ── */
  {
    component: CNavGroup,
    name: 'POS Billing',
    to: '/franchise/pos/billing',
    icon: ic(ScanLine),
    badge: { color: 'secondary', text: 'F2' },
    accessKey: 'pos',
    items: [
      { component: CNavItem, name: 'New Billing',           to: '/franchise/pos/billing',              icon: ic(ScanLine),    accessKey: 'pos_billing'      },
      { component: CNavItem, name: 'Barcode Scan',          to: '/franchise/pos/barcode-scan',         icon: ic(Zap),         accessKey: 'pos_barcode'      },
      { component: CNavItem, name: 'Medicine Search',       to: '/franchise/pos/medicine-search',      icon: ic(Search),      accessKey: 'pos_billing'      },
      { component: CNavItem, name: 'Customer Selection',    to: '/franchise/pos/customer-selection',   icon: ic(Users),       accessKey: 'pos_billing'      },
      { component: CNavItem, name: 'Prescription Billing',  to: '/franchise/pos/prescription-billing', icon: ic(UploadCloud), accessKey: 'pos_prescription' },
      { component: CNavItem, name: 'Payment',               to: '/franchise/pos/payment',              icon: ic(CreditCard),  accessKey: 'pos_payment'      },
      { component: CNavItem, name: 'Split Payment',         to: '/franchise/pos/split-payment',        icon: ic(ArrowLeftRight), accessKey: 'pos_split'     },
      { component: CNavItem, name: 'Hold Bill',             to: '/franchise/pos/hold-bill',            icon: ic(Pause),       accessKey: 'pos_hold'         },
      { component: CNavItem, name: 'Print Invoice',         to: '/franchise/pos/print-invoice',        icon: ic(Printer),     accessKey: 'pos_billing'      },
      { component: CNavItem, name: 'Return Bill',           to: '/franchise/pos/return-bill',          icon: ic(RotateCcw),   accessKey: 'pos_return'       },
      { component: CNavItem, name: 'Exchange Bill',         to: '/franchise/pos/exchange-bill',        icon: ic(ArrowLeftRight), accessKey: 'pos_exchange'  },
      { component: CNavItem, name: 'Credit Sale',           to: '/franchise/pos/credit-sale',          icon: ic(FileText),    accessKey: 'pos_credit'       },
      { component: CNavItem, name: 'Day Closing',           to: '/franchise/pos/day-closing',          icon: ic(ClipboardList), accessKey: 'pos_dayclosing' },
    ],
  },

  /* 3 ── Sales (group) ── */
  {
    component: CNavGroup,
    name: 'Sales',
    to: '/franchise/pos',
    icon: ic(TrendingUp),
    accessKey: 'pos',
    items: [
      { component: CNavItem, name: "Today's Sale",  to: '/franchise/reports/sales',   icon: ic(FileText),  accessKey: 'reports_sales' },
      { component: CNavItem, name: 'Sales History', to: '/franchise/reports/sales',   icon: ic(BookOpen),  accessKey: 'reports_sales' },
      { component: CNavItem, name: 'Sale Return',   to: '/franchise/pos/return-bill', icon: ic(RotateCcw), accessKey: 'pos_return'    },
      { component: CNavItem, name: 'Day Closing',   to: '/franchise/pos/day-closing', icon: ic(FileText),  accessKey: 'pos_dayclosing'},
    ],
  },

  /* 4 ── Purchase (group) ── */
  {
    component: CNavGroup,
    name: 'Purchase',
    to: '/franchise/purchase',
    icon: ic(ShoppingCart),
    accessKey: 'purchase',
    items: [
      { component: CNavItem, name: 'Purchase Dashboard', to: '/franchise/purchase/dashboard',       icon: ic(LayoutDashboard), accessKey: 'purchase_dashboard' },
      { component: CNavItem, name: 'New Purchase',       to: '/franchise/purchase/orders',          icon: ic(ShoppingCart),    accessKey: 'purchase_orders'    },
      { component: CNavItem, name: 'Purchase Orders',    to: '/franchise/purchase/orders',          icon: ic(FileText),        accessKey: 'purchase_orders'    },
      { component: CNavItem, name: 'GRN / Inward',       to: '/franchise/purchase/grn',             icon: ic(Warehouse),       accessKey: 'purchase_grn'       },
      { component: CNavItem, name: 'Purchase Returns',   to: '/franchise/purchase/returns',         icon: ic(RotateCcw),       accessKey: 'purchase_returns'   },
      { component: CNavItem, name: 'Supplier Ledger',    to: '/franchise/purchase/supplier-ledger', icon: ic(BookOpen),        accessKey: 'purchase_ledger'    },
    ],
  },

  /* 5 ── Inventory (group) ── */
  {
    component: CNavGroup,
    name: 'Inventory',
    to: '/franchise/inventory',
    icon: ic(Warehouse),
    accessKey: 'inventory',
    items: [
      { component: CNavItem, name: 'Inventory Dashboard',   to: '/franchise/inventory/dashboard',    icon: ic(LayoutDashboard), accessKey: 'inventory_dashboard'    },
      { component: CNavItem, name: 'Current Stock',         to: '/franchise/inventory/stock',        icon: ic(FileText),        accessKey: 'inventory_stock'        },
      { component: CNavItem, name: 'Stock Adjustment',      to: '/franchise/inventory/adjustments',  icon: ic(ArrowLeftRight),  accessKey: 'inventory_adjustment'   },
      { component: CNavItem, name: 'Physical Verification', to: '/franchise/inventory/verification', icon: ic(ShieldCheck),     accessKey: 'inventory_verification' },
      { component: CNavItem, name: 'Near Expiry',           to: '/franchise/inventory/near-expiry',  icon: ic(AlertCircle),     accessKey: 'inventory_nearexpiry'   },
      { component: CNavItem, name: 'Expired Stock',         to: '/franchise/inventory/expired',      icon: ic(Trash2),          accessKey: 'inventory_expired'      },
      { component: CNavItem, name: 'Damage Stock',          to: '/franchise/inventory/damage',       icon: ic(AlertTriangle),   accessKey: 'inventory_damage'       },
      { component: CNavItem, name: 'Dead Stock',            to: '/franchise/inventory/dead',         icon: ic(TrendingDown),    accessKey: 'inventory_dead'         },
      { component: CNavItem, name: 'Fast Moving',           to: '/franchise/inventory/fast-moving',  icon: ic(Zap),             accessKey: 'inventory_fastmoving'   },
      { component: CNavItem, name: 'Slow Moving',           to: '/franchise/inventory/slow-moving',  icon: ic(TrendingDown),    accessKey: 'inventory_slowmoving'   },
      { component: CNavItem, name: 'Stock Ledger',          to: '/franchise/inventory/ledger',       icon: ic(BookOpen),        accessKey: 'inventory_ledger'       },
      { component: CNavItem, name: 'Rack & Warehouse',      to: '/franchise/inventory/rack',         icon: ic(Layers),          accessKey: 'inventory_rack'         },
      { component: CNavItem, name: 'Batch & Expiry',        to: '/franchise/inventory/batch-expiry', icon: ic(Calendar),        accessKey: 'inventory_nearexpiry'   },
      { component: CNavItem, name: 'Inventory Audit',       to: '/franchise/inventory/audit',        icon: ic(ClipboardList),   accessKey: 'inventory_audit'        },
    ],
  },

  /* 6 ── Live Wholesale Rates (group) ── */
  {
    component: CNavGroup,
    name: 'Live Wholesale Rates',
    to: '/franchise/live-rates',
    icon: ic(TrendingUp),
    badge: { color: 'danger', text: 'LIVE' },
    accessKey: 'liverates',
    items: [
      { component: CNavItem, name: 'Live Rates',        to: '/franchise/live-rates',                   icon: ic(Zap),         accessKey: 'liverates_dashboard' },
      { component: CNavItem, name: 'Compare Suppliers', to: '/franchise/live-rates/compare-suppliers', icon: ic(GitCompare),  accessKey: 'liverates_compare'   },
      { component: CNavItem, name: 'Supplier Stock',    to: '/franchise/live-rates/supplier-stock',    icon: ic(Warehouse),   accessKey: 'liverates_stock'     },
      { component: CNavItem, name: 'Scheme Comparison', to: '/franchise/live-rates/scheme-comparison', icon: ic(Tag),         accessKey: 'liverates_scheme'    },
      { component: CNavItem, name: 'Best Deal',         to: '/franchise/live-rates/best-deal',         icon: ic(Star),        accessKey: 'liverates_bestdeal'  },
      { component: CNavItem, name: 'Purchase Cart',     to: '/franchise/live-rates/purchase-cart',     icon: ic(ShoppingCart),accessKey: 'liverates_cart'      },
      { component: CNavItem, name: 'Place Order',       to: '/franchise/live-rates/place-order',       icon: ic(Send),        accessKey: 'liverates_order'     },
      { component: CNavItem, name: 'Order Tracking',    to: '/franchise/live-rates/order-tracking',    icon: ic(Truck),       accessKey: 'liverates_tracking'  },
      { component: CNavItem, name: 'Price History',     to: '/franchise/live-rates/price-history',     icon: ic(History),     accessKey: 'liverates_stock'     },
      { component: CNavItem, name: 'Supplier Rating',   to: '/franchise/live-rates/supplier-rating',   icon: ic(StarHalf),    accessKey: 'liverates_stock'     },
    ],
  },

  /* 7 ── Stock Transfer ── */
  {
    component: CNavItem,
    name: 'Stock Transfer',
    to: '/franchise/inventory/stock',
    icon: ic(ArrowLeftRight),
    accessKey: 'inventory_stock',
  },

  /* 8 ── Returns ── */
  {
    component: CNavItem,
    name: 'Returns',
    to: '/franchise/pos/returns',
    icon: ic(RotateCcw),
    accessKey: 'pos_return',
  },

  /* 9 ── Medicine Master (group) ── */
  {
    component: CNavGroup,
    name: 'Medicine Master',
    to: '/franchise/medicines',
    icon: ic(FlaskConical),
    accessKey: 'medicines',
    items: [
      { component: CNavItem, name: 'Medicine List',   to: '/franchise/medicines',        icon: ic(List),   accessKey: 'medicines_list' },
      { component: CNavItem, name: 'Add Medicine',    to: '/franchise/medicines/add',    icon: ic(Plus),   accessKey: 'medicines_add'  },
      { component: CNavItem, name: 'Rack Management', to: '/franchise/medicines/racks',  icon: ic(Layers), accessKey: 'medicines_rack' },
    ],
  },

  /* 10 ── Online Orders ── */
  {
    component: CNavItem,
    name: 'Online Orders',
    to: '/franchise/b2b-orders',
    icon: ic(Store),
    badge: { color: 'success', text: '13' },
    accessKey: 'b2b_orders',
  },

  /* 11 ── Customers (group) ── */
  {
    component: CNavGroup,
    name: 'Customers',
    to: '/franchise/customers',
    icon: ic(Users),
    accessKey: 'customers',
    items: [
      { component: CNavItem, name: 'Customer List',     to: '/franchise/customers',                   icon: ic(List),    accessKey: 'customers_list'       },
      { component: CNavItem, name: 'Customer Wallet',   to: '/franchise/customers/CUS001/wallet',     icon: ic(Wallet),  accessKey: 'customers_wallet'     },
      { component: CNavItem, name: 'Purchase History',  to: '/franchise/customers/CUS001/history',    icon: ic(History), accessKey: 'customers_history'    },
      { component: CNavItem, name: 'Medicine Reminder', to: '/franchise/customers/CUS001/reminders',  icon: ic(Bell),    accessKey: 'customers_reminder'   },
      { component: CNavItem, name: 'Membership',        to: '/franchise/customers/CUS001/membership', icon: ic(Crown),   accessKey: 'customers_membership' },
      { component: CNavItem, name: 'Loyalty',           to: '/franchise/customers/CUS001/loyalty',    icon: ic(Star),    accessKey: 'customers_loyalty'    },
      { component: CNavItem, name: 'CareCoin',          to: '/franchise/customers/CUS001/carecoin',   icon: ic(Award),   accessKey: 'customers_carecoin'   },
    ],
  },

  /* 12 ── Suppliers (group) ── */
  {
    component: CNavGroup,
    name: 'Suppliers',
    to: '/franchise/suppliers',
    icon: ic(Truck),
    accessKey: 'suppliers',
    items: [
      { component: CNavItem, name: 'Supplier List', to: '/franchise/suppliers',             icon: ic(List),        accessKey: 'suppliers_list'        },
      { component: CNavItem, name: 'Add Supplier',  to: '/franchise/suppliers/add',         icon: ic(Plus),        accessKey: 'suppliers_add'         },
      { component: CNavItem, name: 'Outstanding',   to: '/franchise/suppliers/outstanding', icon: ic(IndianRupee), accessKey: 'suppliers_outstanding' },
    ],
  },

  /* 13 ── Accounts (group) ── */
  {
    component: CNavGroup,
    name: 'Accounts',
    to: '/franchise/accounts',
    icon: ic(BookOpen),
    accessKey: 'accounts',
    items: [
      { component: CNavItem, name: 'Cash Book',     to: '/franchise/accounts/cash-book',     icon: ic(BookOpen),        accessKey: 'accounts_cashbook' },
      { component: CNavItem, name: 'Bank Book',     to: '/franchise/accounts/bank-book',     icon: ic(Landmark),        accessKey: 'accounts_bankbook' },
      { component: CNavItem, name: 'Day Book',      to: '/franchise/accounts/day-book',      icon: ic(CalendarDays),    accessKey: 'accounts_daybook'  },
      { component: CNavItem, name: 'Receipts',      to: '/franchise/accounts/receipts',      icon: ic(ArrowDownCircle), accessKey: 'accounts_receipts' },
      { component: CNavItem, name: 'Payments',      to: '/franchise/accounts/payments',      icon: ic(ArrowUpCircle),   accessKey: 'accounts_payments' },
      { component: CNavItem, name: 'Expenses',      to: '/franchise/accounts/expenses',      icon: ic(TrendingDown),    accessKey: 'accounts_expenses' },
      { component: CNavItem, name: 'Income',        to: '/franchise/accounts/income',        icon: ic(TrendingUp),      accessKey: 'accounts_income'   },
      { component: CNavItem, name: 'Journal',       to: '/franchise/accounts/journal',       icon: ic(FileText),        accessKey: 'accounts_journal'  },
      { component: CNavItem, name: 'Ledger',        to: '/franchise/accounts/ledger',        icon: ic(BookMarked),      accessKey: 'accounts_ledger'   },
      { component: CNavItem, name: 'Trial Balance', to: '/franchise/accounts/trial-balance', icon: ic(Scale),           accessKey: 'accounts_trial'    },
      { component: CNavItem, name: 'Profit & Loss', to: '/franchise/accounts/profit-loss',   icon: ic(BarChart2),       accessKey: 'accounts_pl'       },
      { component: CNavItem, name: 'Balance Sheet', to: '/franchise/accounts/balance-sheet', icon: ic(LayoutTemplate),  accessKey: 'accounts_bs'       },
    ],
  },

  /* 14 ── Reports (group) ── */
  {
    component: CNavGroup,
    name: 'Reports',
    to: '/franchise/reports',
    icon: ic(BarChart2),
    accessKey: 'reports',
    items: [
      { component: CNavItem, name: 'Sales Report',    to: '/franchise/reports/sales',    icon: ic(FileText), accessKey: 'reports_sales'    },
      { component: CNavItem, name: 'Purchase Report', to: '/franchise/reports/purchase', icon: ic(FileText), accessKey: 'reports_purchase' },
      { component: CNavItem, name: 'Stock Report',    to: '/franchise/reports/stock',    icon: ic(FileText), accessKey: 'reports_stock'    },
      { component: CNavItem, name: 'Expiry Report',   to: '/franchise/reports/expiry',   icon: ic(FileText), accessKey: 'reports_expiry'   },
    ],
  },

  /* 15 ── CRM & Loyalty ── */
  {
    component: CNavItem,
    name: 'CRM & Loyalty',
    to: '/franchise/customers/CUS001/loyalty',
    icon: ic(Star),
    accessKey: 'customers_loyalty',
  },

  /* 16 ── Staff & Users ── */
  {
    component: CNavGroup,
    name: 'Staff & Users',
    to: '/franchise/staff',
    icon: ic(UserCheck),
    accessKey: 'staff',
    items: [
      { component: CNavItem, name: 'Staff List',          to: '/franchise/staff',             icon: ic(List),        accessKey: 'staff_list'   },
      { component: CNavItem, name: 'Menu Access Control', to: '/franchise/staff/menu-access', icon: ic(ShieldCheck), accessKey: 'staff_access' },
    ],
  },

  /* 17 ── Settings ── */
  {
    component: CNavItem,
    name: 'Settings',
    to: '/franchise/settings',
    icon: ic(Settings),
    accessKey: 'settings',
  },

  /* 18 ── Audit Logs ── */
  {
    component: CNavItem,
    name: 'Audit Logs',
    to: '/franchise/audit',
    icon: ic(ShieldCheck),
    accessKey: 'audit_logs',
  },
]

const useNav = () => franchiseNav

export default useNav
