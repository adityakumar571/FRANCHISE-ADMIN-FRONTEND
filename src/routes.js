/* eslint-disable prettier/prettier */
// ── 3D Layout ─────────────────────────────────────────────────────────────────
import PharmacyLayout3D from './views/franchise/Layout3D/PharmacyLayout3D'

// ── Dashboard ─────────────────────────────────────────────────────────────────
import FranchiseDashboard from './views/franchise/Dashboard/FranchiseDashboard'

// ── Role-based Dashboards ─────────────────────────────────────────────────────
import AccountsDashboard from './views/franchise/RoleDashboards/AccountsDashboard'
import StaffDashboard    from './views/franchise/RoleDashboards/StaffDashboard'
import CustomerDashboard from './views/franchise/RoleDashboards/CustomerDashboard'
import VendorDashboard   from './views/franchise/RoleDashboards/VendorDashboard'

// ── POS / Sales ───────────────────────────────────────────────────────────────
import NewBilling          from './views/franchise/POS/NewBilling'
import BarcodeScan         from './views/franchise/POS/BarcodeScan'
import MedicineSearch      from './views/franchise/POS/MedicineSearch'
import CustomerSelection   from './views/franchise/POS/CustomerSelection'
import PrescriptionBilling from './views/franchise/POS/PrescriptionBilling'
import Payment             from './views/franchise/POS/Payment'
import SplitPayment        from './views/franchise/POS/SplitPayment'
import HoldBill            from './views/franchise/POS/HoldBill'
import PrintInvoice        from './views/franchise/POS/PrintInvoice'
import ReturnBill          from './views/franchise/POS/ReturnBill'
import ExchangeBill        from './views/franchise/POS/ExchangeBill'
import CreditSale          from './views/franchise/POS/CreditSale'
import SalesReturns        from './views/franchise/POS/SalesReturns'
import DayClosing          from './views/franchise/POS/DayClosing'

// ── Purchase / Procurement ────────────────────────────────────────────────────
import PurchaseDashboard from './views/franchise/Purchase/PurchaseDashboard'
import LiveRateCompare   from './views/franchise/Purchase/LiveRateCompare'
import PurchaseOrders    from './views/franchise/Purchase/PurchaseOrders'
import GRNInward         from './views/franchise/Purchase/GRNInward'
import PurchaseReturns   from './views/franchise/Purchase/PurchaseReturns'
import SupplierLedger    from './views/franchise/Purchase/SupplierLedger'

// ── Inventory ─────────────────────────────────────────────────────────────────
import InventoryDashboard   from './views/franchise/Inventory/InventoryDashboard'
import StockOverview        from './views/franchise/Inventory/StockOverview'
import RackWarehouse        from './views/franchise/Inventory/RackWarehouse'
import BatchExpiry          from './views/franchise/Inventory/BatchExpiry'
import StockAdjustments     from './views/franchise/Inventory/StockAdjustments'
import NearExpiry           from './views/franchise/Inventory/NearExpiry'
import ExpiredStock         from './views/franchise/Inventory/ExpiredStock'
import DamageStock          from './views/franchise/Inventory/DamageStock'
import DeadStock            from './views/franchise/Inventory/DeadStock'
import FastMoving           from './views/franchise/Inventory/FastMoving'
import SlowMoving           from './views/franchise/Inventory/SlowMoving'
import StockLedger          from './views/franchise/Inventory/StockLedger'
import PhysicalVerification from './views/franchise/Inventory/PhysicalVerification'
import InventoryAudit       from './views/franchise/Inventory/InventoryAudit'

// ── Live Wholesale Rates ──────────────────────────────────────────────────────
import LiveRatesDashboard from './views/franchise/LiveRates/LiveRatesDashboard'
import CompareSuppliers   from './views/franchise/LiveRates/CompareSuppliers'
import SupplierStock      from './views/franchise/LiveRates/SupplierStock'
import SchemeComparison   from './views/franchise/LiveRates/SchemeComparison'
import BestDeal           from './views/franchise/LiveRates/BestDeal'
import PurchaseCart       from './views/franchise/LiveRates/PurchaseCart'
import PlaceOrder         from './views/franchise/LiveRates/PlaceOrder'
import OrderTracking      from './views/franchise/LiveRates/OrderTracking'
import PriceHistory       from './views/franchise/LiveRates/PriceHistory'
import SupplierRating     from './views/franchise/LiveRates/SupplierRating'

// ── Medicines ─────────────────────────────────────────────────────────────────
import MedicineList        from './views/franchise/Medicines/MedicineList'
import AddMedicine         from './views/franchise/Medicines/AddMedicine'
import EditMedicine        from './views/franchise/Medicines/EditMedicine'
import MedicineDetails     from './views/franchise/Medicines/MedicineDetails'
import BatchDetails        from './views/franchise/Medicines/BatchDetails'
import RackManagement      from './views/franchise/Medicines/RackManagement'
import BarcodeLabel        from './views/franchise/Medicines/BarcodeLabel'
import MedicineImages      from './views/franchise/Medicines/MedicineImages'
import GenericMapping      from './views/franchise/Medicines/GenericMapping'
import AlternativeMedicines from './views/franchise/Medicines/AlternativeMedicines'

// ── Suppliers ─────────────────────────────────────────────────────────────────
import SupplierList       from './views/franchise/Suppliers/SupplierList'
import SupplierDetails    from './views/franchise/Suppliers/SupplierDetails'
import AddSupplier        from './views/franchise/Suppliers/AddSupplier'
import Outstanding        from './views/franchise/Suppliers/Outstanding'
import SupplierTxnLedger  from './views/franchise/Suppliers/SupplierLedger'
import PaymentHistory     from './views/franchise/Suppliers/PaymentHistory'

// ── B2B Orders ────────────────────────────────────────────────────────────────
import B2BOrders from './views/franchise/B2BOrders/B2BOrders'

// ── Customers ─────────────────────────────────────────────────────────────────
import CustomerList      from './views/franchise/Customers/CustomerList'
import CustomerDetails   from './views/franchise/Customers/CustomerDetails'
import CustomerWallet    from './views/franchise/Customers/CustomerWallet'
import PurchaseHistory   from './views/franchise/Customers/PurchaseHistory'
import MedicineReminder  from './views/franchise/Customers/MedicineReminder'
import Membership        from './views/franchise/Customers/Membership'
import Loyalty           from './views/franchise/Customers/Loyalty'
import CareCoin          from './views/franchise/Customers/CareCoin'

// ── Accounts ──────────────────────────────────────────────────────────────────
import CashBook     from './views/franchise/Accounts/CashBook'
import BankBook     from './views/franchise/Accounts/BankBook'
import DayBook      from './views/franchise/Accounts/DayBook'
import Receipts     from './views/franchise/Accounts/Receipts'
import Payments     from './views/franchise/Accounts/Payments'
import Expenses     from './views/franchise/Accounts/Expenses'
import Income       from './views/franchise/Accounts/Income'
import Journal      from './views/franchise/Accounts/Journal'
import Ledger       from './views/franchise/Accounts/Ledger'
import TrialBalance from './views/franchise/Accounts/TrialBalance'
import ProfitLoss   from './views/franchise/Accounts/ProfitLoss'
import BalanceSheet from './views/franchise/Accounts/BalanceSheet'

// ── Staff & Users ─────────────────────────────────────────────────────────────
import StaffUsers from './views/franchise/Staff/StaffUsers'
import MenuAccessControl from './views/franchise/Staff/MenuAccessControl'

// ── User Management ───────────────────────────────────────────────────────────
import UserManagement from './views/franchise/UserManagement/UserManagement'

// ── Reports ───────────────────────────────────────────────────────────────────
import SalesReport    from './views/franchise/Reports/SalesReport'
import PurchaseReport from './views/franchise/Reports/PurchaseReport'
import StockReport    from './views/franchise/Reports/StockReport'
import ExpiryReport   from './views/franchise/Reports/ExpiryReport'

// ── Notifications ─────────────────────────────────────────────────────────────
import Notifications from './views/franchise/Notifications/Notifications'

// ── Audit Logs ────────────────────────────────────────────────────────────────
import AuditLogs from './views/franchise/Audit/AuditLogs'

// ── Settings ─────────────────────────────────────────────────────────────────
import FranchiseSettings from './views/franchise/Settings/Settings'

// ── Help & Support ────────────────────────────────────────────────────────────
import HelpSupport from './views/franchise/Support/HelpSupport'

// ─────────────────────────────────────────────────────────────────────────────

const routes = [

  /* ── Dashboard ── */
  { path: '/franchise/dashboard',           element: FranchiseDashboard },
  { path: '/dashboard',                     element: FranchiseDashboard },

  /* ── 3D Layout ── */
  { path: '/franchise/layout-3d',           element: PharmacyLayout3D },

  /* ── POS / Sales ── */
  { path: '/franchise/pos',                    element: NewBilling,       accessKey: 'pos_billing' },
  { path: '/franchise/pos/billing',            element: NewBilling,       accessKey: 'pos_billing' },
  { path: '/franchise/pos/barcode-scan',       element: BarcodeScan,      accessKey: 'pos_barcode' },
  { path: '/franchise/pos/medicine-search',    element: MedicineSearch,   accessKey: 'pos_billing' },
  { path: '/franchise/pos/customer-selection', element: CustomerSelection, accessKey: 'pos_billing' },
  { path: '/franchise/pos/prescription-billing', element: PrescriptionBilling, accessKey: 'pos_prescription' },
  { path: '/franchise/pos/payment',              element: Payment,              accessKey: 'pos_payment'      },
  { path: '/franchise/pos/split-payment',        element: SplitPayment,         accessKey: 'pos_split'        },
  { path: '/franchise/pos/hold-bill',            element: HoldBill,             accessKey: 'pos_hold'         },
  { path: '/franchise/pos/print-invoice',        element: PrintInvoice,         accessKey: 'pos_billing'      },
  { path: '/franchise/pos/return-bill',          element: ReturnBill,           accessKey: 'pos_return'       },
  { path: '/franchise/pos/exchange-bill',        element: ExchangeBill,         accessKey: 'pos_exchange'     },
  { path: '/franchise/pos/credit-sale',          element: CreditSale,           accessKey: 'pos_credit'       },
  { path: '/franchise/pos/returns',              element: SalesReturns,         accessKey: 'pos_return'       },
  { path: '/franchise/pos/day-closing',          element: DayClosing,           accessKey: 'pos_dayclosing'   },

  /* ── Purchase / Procurement ── */
  { path: '/franchise/purchase',                  element: PurchaseDashboard, accessKey: 'purchase'           },
  { path: '/franchise/purchase/dashboard',        element: PurchaseDashboard, accessKey: 'purchase_dashboard' },
  { path: '/franchise/purchase/live-rate',        element: LiveRateCompare,   accessKey: 'purchase_liverates' },
  { path: '/franchise/purchase/orders',           element: PurchaseOrders,    accessKey: 'purchase_orders'    },
  { path: '/franchise/purchase/grn',              element: GRNInward,         accessKey: 'purchase_grn'       },
  { path: '/franchise/purchase/returns',          element: PurchaseReturns,   accessKey: 'purchase_returns'   },
  { path: '/franchise/purchase/supplier-ledger',  element: SupplierLedger,    accessKey: 'purchase_ledger'    },

  /* ── Inventory ── */
  { path: '/franchise/inventory',               element: InventoryDashboard,   accessKey: 'inventory'               },
  { path: '/franchise/inventory/dashboard',     element: InventoryDashboard,   accessKey: 'inventory_dashboard'     },
  { path: '/franchise/inventory/stock',         element: StockOverview,        accessKey: 'inventory_stock'         },
  { path: '/franchise/inventory/rack',          element: RackWarehouse,        accessKey: 'inventory_rack'          },
  { path: '/franchise/inventory/batch-expiry',  element: BatchExpiry,          accessKey: 'inventory_nearexpiry'    },
  { path: '/franchise/inventory/adjustments',   element: StockAdjustments,     accessKey: 'inventory_adjustment'    },
  { path: '/franchise/inventory/near-expiry',   element: NearExpiry,           accessKey: 'inventory_nearexpiry'    },
  { path: '/franchise/inventory/expired',       element: ExpiredStock,         accessKey: 'inventory_expired'       },
  { path: '/franchise/inventory/damage',        element: DamageStock,          accessKey: 'inventory_damage'        },
  { path: '/franchise/inventory/dead',          element: DeadStock,            accessKey: 'inventory_dead'          },
  { path: '/franchise/inventory/fast-moving',   element: FastMoving,           accessKey: 'inventory_fastmoving'    },
  { path: '/franchise/inventory/slow-moving',   element: SlowMoving,           accessKey: 'inventory_slowmoving'    },
  { path: '/franchise/inventory/ledger',        element: StockLedger,          accessKey: 'inventory_ledger'        },
  { path: '/franchise/inventory/verification',  element: PhysicalVerification, accessKey: 'inventory_verification'  },
  { path: '/franchise/inventory/audit',         element: InventoryAudit,       accessKey: 'inventory_audit'         },

  /* ── Live Wholesale Rates ── */
  { path: '/franchise/live-rates',                      element: LiveRatesDashboard, accessKey: 'liverates'           },
  { path: '/franchise/live-rates/compare-suppliers',    element: CompareSuppliers,   accessKey: 'liverates_compare'   },
  { path: '/franchise/live-rates/supplier-stock',       element: SupplierStock,      accessKey: 'liverates_stock'     },
  { path: '/franchise/live-rates/scheme-comparison',    element: SchemeComparison,   accessKey: 'liverates_scheme'    },
  { path: '/franchise/live-rates/best-deal',            element: BestDeal,           accessKey: 'liverates_bestdeal'  },
  { path: '/franchise/live-rates/purchase-cart',        element: PurchaseCart,       accessKey: 'liverates_cart'      },
  { path: '/franchise/live-rates/place-order',          element: PlaceOrder,         accessKey: 'liverates_order'     },
  { path: '/franchise/live-rates/order-tracking',       element: OrderTracking,      accessKey: 'liverates_tracking'  },
  { path: '/franchise/live-rates/price-history',        element: PriceHistory,       accessKey: 'liverates_stock'     },
  { path: '/franchise/live-rates/supplier-rating',      element: SupplierRating,     accessKey: 'liverates_stock'     },

  /* ── Medicines ── */
  { path: '/franchise/medicines',                   element: MedicineList,         accessKey: 'medicines_list'    },
  { path: '/franchise/medicines/add',               element: AddMedicine,          accessKey: 'medicines_add'     },
  { path: '/franchise/medicines/:id',               element: MedicineDetails,      accessKey: 'medicines_list'    },
  { path: '/franchise/medicines/:id/edit',          element: EditMedicine,         accessKey: 'medicines_edit'    },
  { path: '/franchise/medicines/:id/batches',       element: BatchDetails,         accessKey: 'medicines_list'    },
  { path: '/franchise/medicines/:id/barcode',       element: BarcodeLabel,         accessKey: 'medicines_barcode' },
  { path: '/franchise/medicines/:id/images',        element: MedicineImages,       accessKey: 'medicines_list'    },
  { path: '/franchise/medicines/:id/generic',       element: GenericMapping,       accessKey: 'medicines_list'    },
  { path: '/franchise/medicines/:id/alternatives',  element: AlternativeMedicines, accessKey: 'medicines_list'    },
  { path: '/franchise/medicines/racks',             element: RackManagement,       accessKey: 'medicines_rack'    },

  /* ── Suppliers ── */
  { path: '/franchise/suppliers',              element: SupplierList,     accessKey: 'suppliers_list'        },
  { path: '/franchise/suppliers/add',          element: AddSupplier,      accessKey: 'suppliers_add'         },
  { path: '/franchise/suppliers/outstanding',  element: Outstanding,      accessKey: 'suppliers_outstanding' },
  { path: '/franchise/suppliers/:id',          element: SupplierDetails,  accessKey: 'suppliers_list'        },
  { path: '/franchise/suppliers/:id/edit',     element: AddSupplier,      accessKey: 'suppliers_add'         },
  { path: '/franchise/suppliers/:id/ledger',   element: SupplierTxnLedger,accessKey: 'suppliers_ledger'      },
  { path: '/franchise/suppliers/:id/payments', element: PaymentHistory,   accessKey: 'suppliers_payments'    },

  /* ── B2B Orders ── */
  { path: '/franchise/b2b-orders', element: B2BOrders, accessKey: 'b2b_orders' },

  /* ── Customers ── */
  { path: '/franchise/customers',                  element: CustomerList,    accessKey: 'customers_list'       },
  { path: '/franchise/customers/:id',              element: CustomerDetails, accessKey: 'customers_list'       },
  { path: '/franchise/customers/:id/wallet',       element: CustomerWallet,  accessKey: 'customers_wallet'     },
  { path: '/franchise/customers/:id/history',      element: PurchaseHistory, accessKey: 'customers_history'    },
  { path: '/franchise/customers/:id/reminders',    element: MedicineReminder,accessKey: 'customers_reminder'   },
  { path: '/franchise/customers/:id/membership',   element: Membership,      accessKey: 'customers_membership' },
  { path: '/franchise/customers/:id/loyalty',      element: Loyalty,         accessKey: 'customers_loyalty'    },
  { path: '/franchise/customers/:id/carecoin',     element: CareCoin,        accessKey: 'customers_carecoin'   },

  /* ── Accounts ── */
  { path: '/franchise/accounts',               element: CashBook,    accessKey: 'accounts_cashbook' },
  { path: '/franchise/accounts/cash-book',     element: CashBook,    accessKey: 'accounts_cashbook' },
  { path: '/franchise/accounts/bank-book',     element: BankBook,    accessKey: 'accounts_bankbook' },
  { path: '/franchise/accounts/day-book',      element: DayBook,     accessKey: 'accounts_daybook'  },
  { path: '/franchise/accounts/receipts',      element: Receipts,    accessKey: 'accounts_receipts' },
  { path: '/franchise/accounts/payments',      element: Payments,    accessKey: 'accounts_payments' },
  { path: '/franchise/accounts/expenses',      element: Expenses,    accessKey: 'accounts_expenses' },
  { path: '/franchise/accounts/income',        element: Income,      accessKey: 'accounts_income'   },
  { path: '/franchise/accounts/journal',       element: Journal,     accessKey: 'accounts_journal'  },
  { path: '/franchise/accounts/ledger',        element: Ledger,      accessKey: 'accounts_ledger'   },
  { path: '/franchise/accounts/trial-balance', element: TrialBalance,accessKey: 'accounts_trial'    },
  { path: '/franchise/accounts/profit-loss',   element: ProfitLoss,  accessKey: 'accounts_pl'       },
  { path: '/franchise/accounts/balance-sheet', element: BalanceSheet,accessKey: 'accounts_bs'       },

  /* ── Staff ── */
  { path: '/franchise/staff',             element: StaffUsers,        accessKey: 'staff_list'   },
  { path: '/franchise/staff/menu-access', element: MenuAccessControl, accessKey: 'staff_access' },

  /* ── User Management ── */
  { path: '/franchise/user-management', element: UserManagement },

  /* ── Role Dashboards ── */
  { path: '/franchise/accounts-home', element: AccountsDashboard },
  { path: '/franchise/staff-home',    element: StaffDashboard    },
  { path: '/franchise/customer-home', element: CustomerDashboard },
  { path: '/franchise/vendor-home',   element: VendorDashboard   },

  /* ── Reports ── */
  { path: '/franchise/reports',          element: SalesReport,   accessKey: 'reports_sales'    },
  { path: '/franchise/reports/sales',    element: SalesReport,   accessKey: 'reports_sales'    },
  { path: '/franchise/reports/purchase', element: PurchaseReport,accessKey: 'reports_purchase' },
  { path: '/franchise/reports/stock',    element: StockReport,   accessKey: 'reports_stock'    },
  { path: '/franchise/reports/expiry',   element: ExpiryReport,  accessKey: 'reports_expiry'   },

  /* ── Notifications ── */
  { path: '/franchise/notifications', element: Notifications },

  /* ── Audit Logs ── */
  { path: '/franchise/audit', element: AuditLogs, accessKey: 'audit_logs' },

  /* ── Settings ── */
  { path: '/franchise/settings', element: FranchiseSettings, accessKey: 'settings' },

  /* ── Help & Support ── */
  { path: '/franchise/support', element: HelpSupport },
]

export default routes
