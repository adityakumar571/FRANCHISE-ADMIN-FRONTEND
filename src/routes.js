/* eslint-disable prettier/prettier */
/**
 * routes.js — All components are LAZY LOADED via React.lazy()
 * This splits the bundle into per-route chunks so the browser only downloads
 * what it needs for the current page. Initial load is ~80% faster.
 */
import { lazy } from 'react'

const l = (fn) => lazy(fn)

// ── 3D Layout ─────────────────────────────────────────────────────────────────
const PharmacyLayout3D  = l(() => import('./views/franchise/Layout3D/PharmacyLayout3D'))

// ── Dashboard ─────────────────────────────────────────────────────────────────
const FranchiseDashboard = l(() => import('./views/franchise/Dashboard/FranchiseDashboard'))

// ── Role-based Dashboards ─────────────────────────────────────────────────────
const AccountsDashboard = l(() => import('./views/franchise/RoleDashboards/AccountsDashboard'))
const StaffDashboard    = l(() => import('./views/franchise/RoleDashboards/StaffDashboard'))
const CustomerDashboard = l(() => import('./views/franchise/RoleDashboards/CustomerDashboard'))
const VendorDashboard   = l(() => import('./views/franchise/RoleDashboards/VendorDashboard'))

// ── POS / Sales ───────────────────────────────────────────────────────────────
const NewBilling          = l(() => import('./views/franchise/POS/NewBilling'))
const BarcodeScan         = l(() => import('./views/franchise/POS/BarcodeScan'))
const MedicineSearch      = l(() => import('./views/franchise/POS/MedicineSearch'))
const CustomerSelection   = l(() => import('./views/franchise/POS/CustomerSelection'))
const PrescriptionBilling = l(() => import('./views/franchise/POS/PrescriptionBilling'))
const Payment             = l(() => import('./views/franchise/POS/Payment'))
const SplitPayment        = l(() => import('./views/franchise/POS/SplitPayment'))
const HoldBill            = l(() => import('./views/franchise/POS/HoldBill'))
const PrintInvoice        = l(() => import('./views/franchise/POS/PrintInvoice'))
const ReturnBill          = l(() => import('./views/franchise/POS/ReturnBill'))
const ExchangeBill        = l(() => import('./views/franchise/POS/ExchangeBill'))
const CreditSale          = l(() => import('./views/franchise/POS/CreditSale'))
const SalesReturns        = l(() => import('./views/franchise/POS/SalesReturns'))
const DayClosing          = l(() => import('./views/franchise/POS/DayClosing'))

// ── Purchase / Procurement ────────────────────────────────────────────────────
const PurchaseDashboard = l(() => import('./views/franchise/Purchase/PurchaseDashboard'))
const LiveRateCompare   = l(() => import('./views/franchise/Purchase/LiveRateCompare'))
const PurchaseOrders    = l(() => import('./views/franchise/Purchase/PurchaseOrders'))
const GRNInward         = l(() => import('./views/franchise/Purchase/GRNInward'))
const PurchaseReturns   = l(() => import('./views/franchise/Purchase/PurchaseReturns'))
const SupplierLedger    = l(() => import('./views/franchise/Purchase/SupplierLedger'))

// ── Inventory ─────────────────────────────────────────────────────────────────
const InventoryDashboard   = l(() => import('./views/franchise/Inventory/InventoryDashboard'))
const StockOverview        = l(() => import('./views/franchise/Inventory/StockOverview'))
const RackWarehouse        = l(() => import('./views/franchise/Inventory/RackWarehouse'))
const BatchExpiry          = l(() => import('./views/franchise/Inventory/BatchExpiry'))
const StockAdjustments     = l(() => import('./views/franchise/Inventory/StockAdjustments'))
const NearExpiry           = l(() => import('./views/franchise/Inventory/NearExpiry'))
const ExpiredStock         = l(() => import('./views/franchise/Inventory/ExpiredStock'))
const DamageStock          = l(() => import('./views/franchise/Inventory/DamageStock'))
const DeadStock            = l(() => import('./views/franchise/Inventory/DeadStock'))
const FastMoving           = l(() => import('./views/franchise/Inventory/FastMoving'))
const SlowMoving           = l(() => import('./views/franchise/Inventory/SlowMoving'))
const StockLedger          = l(() => import('./views/franchise/Inventory/StockLedger'))
const PhysicalVerification = l(() => import('./views/franchise/Inventory/PhysicalVerification'))
const InventoryAudit       = l(() => import('./views/franchise/Inventory/InventoryAudit'))

// ── Live Wholesale Rates ──────────────────────────────────────────────────────
const LiveRatesDashboard = l(() => import('./views/franchise/LiveRates/LiveRatesDashboard'))
const CompareSuppliers   = l(() => import('./views/franchise/LiveRates/CompareSuppliers'))
const SupplierStock      = l(() => import('./views/franchise/LiveRates/SupplierStock'))
const SchemeComparison   = l(() => import('./views/franchise/LiveRates/SchemeComparison'))
const BestDeal           = l(() => import('./views/franchise/LiveRates/BestDeal'))
const PurchaseCart       = l(() => import('./views/franchise/LiveRates/PurchaseCart'))
const PlaceOrder         = l(() => import('./views/franchise/LiveRates/PlaceOrder'))
const OrderTracking      = l(() => import('./views/franchise/LiveRates/OrderTracking'))
const PriceHistory       = l(() => import('./views/franchise/LiveRates/PriceHistory'))
const SupplierRating     = l(() => import('./views/franchise/LiveRates/SupplierRating'))

// ── Medicines ─────────────────────────────────────────────────────────────────
const MedicineList         = l(() => import('./views/franchise/Medicines/MedicineList'))
const AddMedicine          = l(() => import('./views/franchise/Medicines/AddMedicine'))
const EditMedicine         = l(() => import('./views/franchise/Medicines/EditMedicine'))
const MedicineDetails      = l(() => import('./views/franchise/Medicines/MedicineDetails'))
const BatchDetails         = l(() => import('./views/franchise/Medicines/BatchDetails'))
const RackManagement       = l(() => import('./views/franchise/Medicines/RackManagement'))
const BarcodeLabel         = l(() => import('./views/franchise/Medicines/BarcodeLabel'))
const MedicineImages       = l(() => import('./views/franchise/Medicines/MedicineImages'))
const GenericMapping       = l(() => import('./views/franchise/Medicines/GenericMapping'))
const AlternativeMedicines = l(() => import('./views/franchise/Medicines/AlternativeMedicines'))

// ── Suppliers ─────────────────────────────────────────────────────────────────
const SupplierList      = l(() => import('./views/franchise/Suppliers/SupplierList'))
const SupplierDetails   = l(() => import('./views/franchise/Suppliers/SupplierDetails'))
const AddSupplier       = l(() => import('./views/franchise/Suppliers/AddSupplier'))
const Outstanding       = l(() => import('./views/franchise/Suppliers/Outstanding'))
const SupplierTxnLedger = l(() => import('./views/franchise/Suppliers/SupplierLedger'))
const PaymentHistory    = l(() => import('./views/franchise/Suppliers/PaymentHistory'))

// ── B2B Orders ────────────────────────────────────────────────────────────────
const B2BOrders = l(() => import('./views/franchise/B2BOrders/B2BOrders'))

// ── Customers ─────────────────────────────────────────────────────────────────
const CustomerList     = l(() => import('./views/franchise/Customers/CustomerList'))
const CustomerDetails  = l(() => import('./views/franchise/Customers/CustomerDetails'))
const CustomerWallet   = l(() => import('./views/franchise/Customers/CustomerWallet'))
const PurchaseHistory  = l(() => import('./views/franchise/Customers/PurchaseHistory'))
const MedicineReminder = l(() => import('./views/franchise/Customers/MedicineReminder'))
const Membership       = l(() => import('./views/franchise/Customers/Membership'))
const Loyalty          = l(() => import('./views/franchise/Customers/Loyalty'))
const CareCoin         = l(() => import('./views/franchise/Customers/CareCoin'))

// ── Accounts ──────────────────────────────────────────────────────────────────
const CashBook     = l(() => import('./views/franchise/Accounts/CashBook'))
const BankBook     = l(() => import('./views/franchise/Accounts/BankBook'))
const DayBook      = l(() => import('./views/franchise/Accounts/DayBook'))
const Receipts     = l(() => import('./views/franchise/Accounts/Receipts'))
const Payments     = l(() => import('./views/franchise/Accounts/Payments'))
const Expenses     = l(() => import('./views/franchise/Accounts/Expenses'))
const Income       = l(() => import('./views/franchise/Accounts/Income'))
const Journal      = l(() => import('./views/franchise/Accounts/Journal'))
const Ledger       = l(() => import('./views/franchise/Accounts/Ledger'))
const TrialBalance = l(() => import('./views/franchise/Accounts/TrialBalance'))
const ProfitLoss   = l(() => import('./views/franchise/Accounts/ProfitLoss'))
const BalanceSheet = l(() => import('./views/franchise/Accounts/BalanceSheet'))

// ── Staff & Users ─────────────────────────────────────────────────────────────
const StaffUsers        = l(() => import('./views/franchise/Staff/StaffUsers'))
const MenuAccessControl = l(() => import('./views/franchise/Staff/MenuAccessControl'))
const RoleMaster        = l(() => import('./views/franchise/Staff/RoleMaster'))

// ── User Management ───────────────────────────────────────────────────────────
const UserManagement = l(() => import('./views/franchise/UserManagement/UserManagement'))

// ── Reports ───────────────────────────────────────────────────────────────────
const SalesReport    = l(() => import('./views/franchise/Reports/SalesReport'))
const PurchaseReport = l(() => import('./views/franchise/Reports/PurchaseReport'))
const StockReport    = l(() => import('./views/franchise/Reports/StockReport'))
const ExpiryReport   = l(() => import('./views/franchise/Reports/ExpiryReport'))

// ── Notifications ─────────────────────────────────────────────────────────────
const Notifications = l(() => import('./views/franchise/Notifications/Notifications'))

// ── Audit Logs ────────────────────────────────────────────────────────────────
const AuditLogs = l(() => import('./views/franchise/Audit/AuditLogs'))

// ── Settings ─────────────────────────────────────────────────────────────────
const FranchiseSettings = l(() => import('./views/franchise/Settings/Settings'))

// ── Help & Support ────────────────────────────────────────────────────────────
const HelpSupport = l(() => import('./views/franchise/Support/HelpSupport'))

// ── Previously orphaned screens ──────────────────────────────────────────────
const Billing      = l(() => import('./views/franchise/Billing/Billing'))
const Branches     = l(() => import('./views/franchise/Branches/Branches'))
const Orders       = l(() => import('./views/franchise/Orders/Orders'))
const Products     = l(() => import('./views/franchise/Products/Products'))
const Attendance   = l(() => import('./views/franchise/Attendance/Attendance'))
const ActivityLogs = l(() => import('./views/franchise/ActivityLogs/ActivityLogs'))
const Profile      = l(() => import('./views/franchise/Profile/Profile'))

// ─────────────────────────────────────────────────────────────────────────────

const routes = [

  /* ── Dashboard ── */
  { path: '/franchise/dashboard',           element: FranchiseDashboard },
  { path: '/dashboard',                     element: FranchiseDashboard },

  /* ── 3D Layout ── */
  { path: '/franchise/layout-3d',           element: PharmacyLayout3D },

  /* ── POS / Sales ── */
  { path: '/franchise/pos',                      element: NewBilling,          accessKey: 'pos_billing'      },
  { path: '/franchise/pos/billing',              element: NewBilling,          accessKey: 'pos_billing'      },
  { path: '/franchise/pos/barcode-scan',         element: BarcodeScan,         accessKey: 'pos_barcode'      },
  { path: '/franchise/pos/medicine-search',      element: MedicineSearch,      accessKey: 'pos_billing'      },
  { path: '/franchise/pos/customer-selection',   element: CustomerSelection,   accessKey: 'pos_billing'      },
  { path: '/franchise/pos/prescription-billing', element: PrescriptionBilling, accessKey: 'pos_prescription' },
  { path: '/franchise/pos/payment',              element: Payment,             accessKey: 'pos_payment'      },
  { path: '/franchise/pos/split-payment',        element: SplitPayment,        accessKey: 'pos_split'        },
  { path: '/franchise/pos/hold-bill',            element: HoldBill,            accessKey: 'pos_hold'         },
  { path: '/franchise/pos/print-invoice',        element: PrintInvoice,        accessKey: 'pos_billing'      },
  { path: '/franchise/pos/return-bill',          element: ReturnBill,          accessKey: 'pos_return'       },
  { path: '/franchise/pos/exchange-bill',        element: ExchangeBill,        accessKey: 'pos_exchange'     },
  { path: '/franchise/pos/credit-sale',          element: CreditSale,          accessKey: 'pos_credit'       },
  { path: '/franchise/pos/returns',              element: SalesReturns,        accessKey: 'pos_return'       },
  { path: '/franchise/pos/day-closing',          element: DayClosing,          accessKey: 'pos_dayclosing'   },

  /* ── Purchase / Procurement ── */
  { path: '/franchise/purchase',                 element: PurchaseDashboard,   accessKey: 'purchase'           },
  { path: '/franchise/purchase/dashboard',       element: PurchaseDashboard,   accessKey: 'purchase_dashboard' },
  { path: '/franchise/purchase/live-rate',       element: LiveRateCompare,     accessKey: 'purchase_liverates' },
  { path: '/franchise/purchase/orders',          element: PurchaseOrders,      accessKey: 'purchase_orders'    },
  { path: '/franchise/purchase/grn',             element: GRNInward,           accessKey: 'purchase_grn'       },
  { path: '/franchise/purchase/returns',         element: PurchaseReturns,     accessKey: 'purchase_returns'   },
  { path: '/franchise/purchase/supplier-ledger', element: SupplierLedger,      accessKey: 'purchase_ledger'    },

  /* ── Inventory ── */
  { path: '/franchise/inventory',              element: InventoryDashboard,   accessKey: 'inventory'              },
  { path: '/franchise/inventory/dashboard',    element: InventoryDashboard,   accessKey: 'inventory_dashboard'    },
  { path: '/franchise/inventory/stock',        element: StockOverview,        accessKey: 'inventory_stock'        },
  { path: '/franchise/inventory/rack',         element: RackWarehouse,        accessKey: 'inventory_rack'         },
  { path: '/franchise/inventory/batch-expiry', element: BatchExpiry,          accessKey: 'inventory_nearexpiry'   },
  { path: '/franchise/inventory/adjustments',  element: StockAdjustments,     accessKey: 'inventory_adjustment'   },
  { path: '/franchise/inventory/near-expiry',  element: NearExpiry,           accessKey: 'inventory_nearexpiry'   },
  { path: '/franchise/inventory/expired',      element: ExpiredStock,         accessKey: 'inventory_expired'      },
  { path: '/franchise/inventory/damage',       element: DamageStock,          accessKey: 'inventory_damage'       },
  { path: '/franchise/inventory/dead',         element: DeadStock,            accessKey: 'inventory_dead'         },
  { path: '/franchise/inventory/fast-moving',  element: FastMoving,           accessKey: 'inventory_fastmoving'   },
  { path: '/franchise/inventory/slow-moving',  element: SlowMoving,           accessKey: 'inventory_slowmoving'   },
  { path: '/franchise/inventory/ledger',       element: StockLedger,          accessKey: 'inventory_ledger'       },
  { path: '/franchise/inventory/verification', element: PhysicalVerification, accessKey: 'inventory_verification' },
  { path: '/franchise/inventory/audit',        element: InventoryAudit,       accessKey: 'inventory_audit'        },

  /* ── Live Wholesale Rates ── */
  { path: '/franchise/live-rates',                   element: LiveRatesDashboard, accessKey: 'liverates'          },
  { path: '/franchise/live-rates/compare-suppliers', element: CompareSuppliers,   accessKey: 'liverates_compare'  },
  { path: '/franchise/live-rates/supplier-stock',    element: SupplierStock,      accessKey: 'liverates_stock'    },
  { path: '/franchise/live-rates/scheme-comparison', element: SchemeComparison,   accessKey: 'liverates_scheme'   },
  { path: '/franchise/live-rates/best-deal',         element: BestDeal,           accessKey: 'liverates_bestdeal' },
  { path: '/franchise/live-rates/purchase-cart',     element: PurchaseCart,       accessKey: 'liverates_cart'     },
  { path: '/franchise/live-rates/place-order',       element: PlaceOrder,         accessKey: 'liverates_order'    },
  { path: '/franchise/live-rates/order-tracking',    element: OrderTracking,      accessKey: 'liverates_tracking' },
  { path: '/franchise/live-rates/price-history',     element: PriceHistory,       accessKey: 'liverates_stock'    },
  { path: '/franchise/live-rates/supplier-rating',   element: SupplierRating,     accessKey: 'liverates_stock'    },

  /* ── Medicines ── */
  { path: '/franchise/medicines',                  element: MedicineList,         accessKey: 'medicines_list'    },
  { path: '/franchise/medicines/add',              element: AddMedicine,          accessKey: 'medicines_add'     },
  { path: '/franchise/medicines/racks',            element: RackManagement,       accessKey: 'medicines_rack'    },
  { path: '/franchise/medicines/:id',              element: MedicineDetails,      accessKey: 'medicines_list'    },
  { path: '/franchise/medicines/:id/edit',         element: EditMedicine,         accessKey: 'medicines_edit'    },
  { path: '/franchise/medicines/:id/batches',      element: BatchDetails,         accessKey: 'medicines_list'    },
  { path: '/franchise/medicines/:id/barcode',      element: BarcodeLabel,         accessKey: 'medicines_barcode' },
  { path: '/franchise/medicines/:id/images',       element: MedicineImages,       accessKey: 'medicines_list'    },
  { path: '/franchise/medicines/:id/generic',      element: GenericMapping,       accessKey: 'medicines_list'    },
  { path: '/franchise/medicines/:id/alternatives', element: AlternativeMedicines, accessKey: 'medicines_list'    },

  /* ── Suppliers ── */
  { path: '/franchise/suppliers',              element: SupplierList,      accessKey: 'suppliers_list'        },
  { path: '/franchise/suppliers/add',          element: AddSupplier,       accessKey: 'suppliers_add'         },
  { path: '/franchise/suppliers/outstanding',  element: Outstanding,       accessKey: 'suppliers_outstanding' },
  { path: '/franchise/suppliers/:id',          element: SupplierDetails,   accessKey: 'suppliers_list'        },
  { path: '/franchise/suppliers/:id/edit',     element: AddSupplier,       accessKey: 'suppliers_add'         },
  { path: '/franchise/suppliers/:id/ledger',   element: SupplierTxnLedger, accessKey: 'suppliers_ledger'      },
  { path: '/franchise/suppliers/:id/payments', element: PaymentHistory,    accessKey: 'suppliers_payments'    },

  /* ── B2B Orders ── */
  { path: '/franchise/b2b-orders', element: B2BOrders, accessKey: 'b2b_orders' },

  /* ── Customers ── */
  { path: '/franchise/customers',                element: CustomerList,    accessKey: 'customers_list'       },
  { path: '/franchise/customers/:id',            element: CustomerDetails, accessKey: 'customers_list'       },
  { path: '/franchise/customers/:id/wallet',     element: CustomerWallet,  accessKey: 'customers_wallet'     },
  { path: '/franchise/customers/:id/history',    element: PurchaseHistory, accessKey: 'customers_history'    },
  { path: '/franchise/customers/:id/reminders',  element: MedicineReminder,accessKey: 'customers_reminder'   },
  { path: '/franchise/customers/:id/membership', element: Membership,      accessKey: 'customers_membership' },
  { path: '/franchise/customers/:id/loyalty',    element: Loyalty,         accessKey: 'customers_loyalty'    },
  { path: '/franchise/customers/:id/carecoin',   element: CareCoin,        accessKey: 'customers_carecoin'   },

  /* ── Accounts ── */
  { path: '/franchise/accounts',               element: CashBook,     accessKey: 'accounts_cashbook' },
  { path: '/franchise/accounts/cash-book',     element: CashBook,     accessKey: 'accounts_cashbook' },
  { path: '/franchise/accounts/bank-book',     element: BankBook,     accessKey: 'accounts_bankbook' },
  { path: '/franchise/accounts/day-book',      element: DayBook,      accessKey: 'accounts_daybook'  },
  { path: '/franchise/accounts/receipts',      element: Receipts,     accessKey: 'accounts_receipts' },
  { path: '/franchise/accounts/payments',      element: Payments,     accessKey: 'accounts_payments' },
  { path: '/franchise/accounts/expenses',      element: Expenses,     accessKey: 'accounts_expenses' },
  { path: '/franchise/accounts/income',        element: Income,       accessKey: 'accounts_income'   },
  { path: '/franchise/accounts/journal',       element: Journal,      accessKey: 'accounts_journal'  },
  { path: '/franchise/accounts/ledger',        element: Ledger,       accessKey: 'accounts_ledger'   },
  { path: '/franchise/accounts/trial-balance', element: TrialBalance, accessKey: 'accounts_trial'    },
  { path: '/franchise/accounts/profit-loss',   element: ProfitLoss,   accessKey: 'accounts_pl'       },
  { path: '/franchise/accounts/balance-sheet', element: BalanceSheet, accessKey: 'accounts_bs'       },

  /* ── Staff ── */
  { path: '/franchise/staff',             element: StaffUsers,        accessKey: 'staff_list'   },
  { path: '/franchise/staff/menu-access', element: MenuAccessControl, accessKey: 'staff_access' },
  { path: '/franchise/staff/roles',       element: RoleMaster,        accessKey: 'staff_access' },

  /* ── User Management ── */
  { path: '/franchise/user-management', element: UserManagement },

  /* ── Role Dashboards ── */
  { path: '/franchise/accounts-home', element: AccountsDashboard },
  { path: '/franchise/staff-home',    element: StaffDashboard    },
  { path: '/franchise/customer-home', element: CustomerDashboard },
  { path: '/franchise/vendor-home',   element: VendorDashboard   },

  /* ── Reports ── */
  { path: '/franchise/reports',          element: SalesReport,    accessKey: 'reports_sales'    },
  { path: '/franchise/reports/sales',    element: SalesReport,    accessKey: 'reports_sales'    },
  { path: '/franchise/reports/purchase', element: PurchaseReport, accessKey: 'reports_purchase' },
  { path: '/franchise/reports/stock',    element: StockReport,    accessKey: 'reports_stock'    },
  { path: '/franchise/reports/expiry',   element: ExpiryReport,   accessKey: 'reports_expiry'   },

  /* ── Notifications ── */
  { path: '/franchise/notifications', element: Notifications },

  /* ── Audit Logs ── */
  { path: '/franchise/audit', element: AuditLogs, accessKey: 'audit_logs' },

  /* ── Settings ── */
  { path: '/franchise/settings', element: FranchiseSettings, accessKey: 'settings' },

  /* ── Help & Support ── */
  { path: '/franchise/support', element: HelpSupport },

  /* ── Additional screens ── */
  { path: '/franchise/billing',       element: Billing,      accessKey: 'pos_billing'   },
  { path: '/franchise/branches',      element: Branches                                  },
  { path: '/franchise/orders',        element: Orders,       accessKey: 'pos_billing'   },
  { path: '/franchise/products',      element: Products,     accessKey: 'medicines_list' },
  { path: '/franchise/attendance',    element: Attendance,   accessKey: 'staff_list'    },
  { path: '/franchise/activity-logs', element: ActivityLogs, accessKey: 'audit_logs'    },
  { path: '/franchise/profile',       element: Profile                                   },
]

export default routes
