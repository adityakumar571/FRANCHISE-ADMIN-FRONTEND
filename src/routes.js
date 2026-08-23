/* eslint-disable prettier/prettier */
// ── Dashboard ─────────────────────────────────────────────────────────────────
import FranchiseDashboard from './views/franchise/Dashboard/FranchiseDashboard'

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
import SupplierList from './views/franchise/Suppliers/SupplierList'

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
  { path: '/franchise/dashboard', element: FranchiseDashboard },
  { path: '/dashboard',           element: FranchiseDashboard },

  /* ── POS / Sales ── */
  { path: '/franchise/pos',                      element: NewBilling          },
  { path: '/franchise/pos/billing',              element: NewBilling          },
  { path: '/franchise/pos/barcode-scan',         element: BarcodeScan         },
  { path: '/franchise/pos/medicine-search',      element: MedicineSearch      },
  { path: '/franchise/pos/customer-selection',   element: CustomerSelection   },
  { path: '/franchise/pos/prescription-billing', element: PrescriptionBilling },
  { path: '/franchise/pos/payment',              element: Payment             },
  { path: '/franchise/pos/split-payment',        element: SplitPayment        },
  { path: '/franchise/pos/hold-bill',            element: HoldBill            },
  { path: '/franchise/pos/print-invoice',        element: PrintInvoice        },
  { path: '/franchise/pos/return-bill',          element: ReturnBill          },
  { path: '/franchise/pos/exchange-bill',        element: ExchangeBill        },
  { path: '/franchise/pos/credit-sale',          element: CreditSale          },
  { path: '/franchise/pos/returns',              element: SalesReturns        },
  { path: '/franchise/pos/day-closing',          element: DayClosing          },

  /* ── Purchase / Procurement ── */
  { path: '/franchise/purchase',                  element: PurchaseDashboard },
  { path: '/franchise/purchase/dashboard',        element: PurchaseDashboard },
  { path: '/franchise/purchase/live-rate',        element: LiveRateCompare   },
  { path: '/franchise/purchase/orders',           element: PurchaseOrders    },
  { path: '/franchise/purchase/grn',              element: GRNInward         },
  { path: '/franchise/purchase/returns',          element: PurchaseReturns   },
  { path: '/franchise/purchase/supplier-ledger',  element: SupplierLedger    },

  /* ── Inventory ── */
  { path: '/franchise/inventory',               element: InventoryDashboard   },
  { path: '/franchise/inventory/dashboard',      element: InventoryDashboard   },
  { path: '/franchise/inventory/stock',          element: StockOverview        },
  { path: '/franchise/inventory/rack',           element: RackWarehouse        },
  { path: '/franchise/inventory/batch-expiry',   element: BatchExpiry          },
  { path: '/franchise/inventory/adjustments',    element: StockAdjustments     },
  { path: '/franchise/inventory/near-expiry',    element: NearExpiry           },
  { path: '/franchise/inventory/expired',        element: ExpiredStock         },
  { path: '/franchise/inventory/damage',         element: DamageStock          },
  { path: '/franchise/inventory/dead',           element: DeadStock            },
  { path: '/franchise/inventory/fast-moving',    element: FastMoving           },
  { path: '/franchise/inventory/slow-moving',    element: SlowMoving           },
  { path: '/franchise/inventory/ledger',         element: StockLedger          },
  { path: '/franchise/inventory/verification',   element: PhysicalVerification },
  { path: '/franchise/inventory/audit',          element: InventoryAudit       },

  /* ── Live Wholesale Rates ── */
  { path: '/franchise/live-rates',                      element: LiveRatesDashboard },
  { path: '/franchise/live-rates/compare-suppliers',    element: CompareSuppliers   },
  { path: '/franchise/live-rates/supplier-stock',       element: SupplierStock      },
  { path: '/franchise/live-rates/scheme-comparison',    element: SchemeComparison   },
  { path: '/franchise/live-rates/best-deal',            element: BestDeal           },
  { path: '/franchise/live-rates/purchase-cart',        element: PurchaseCart       },
  { path: '/franchise/live-rates/place-order',          element: PlaceOrder         },
  { path: '/franchise/live-rates/order-tracking',       element: OrderTracking      },
  { path: '/franchise/live-rates/price-history',        element: PriceHistory       },
  { path: '/franchise/live-rates/supplier-rating',      element: SupplierRating     },

  /* ── Medicines ── */
  { path: '/franchise/medicines',                          element: MedicineList         },
  { path: '/franchise/medicines/add',                      element: AddMedicine          },
  { path: '/franchise/medicines/:id',                      element: MedicineDetails      },
  { path: '/franchise/medicines/:id/edit',                 element: EditMedicine         },
  { path: '/franchise/medicines/:id/batches',              element: BatchDetails         },
  { path: '/franchise/medicines/:id/barcode',              element: BarcodeLabel         },
  { path: '/franchise/medicines/:id/images',               element: MedicineImages       },
  { path: '/franchise/medicines/:id/generic',              element: GenericMapping       },
  { path: '/franchise/medicines/:id/alternatives',         element: AlternativeMedicines },
  { path: '/franchise/medicines/racks',                    element: RackManagement       },

  /* ── Suppliers ── */
  { path: '/franchise/suppliers', element: SupplierList },

  /* ── B2B Orders ── */
  { path: '/franchise/b2b-orders', element: B2BOrders },

  /* ── Customers ── */
  { path: '/franchise/customers',                  element: CustomerList     },
  { path: '/franchise/customers/:id',              element: CustomerDetails  },
  { path: '/franchise/customers/:id/wallet',       element: CustomerWallet   },
  { path: '/franchise/customers/:id/history',      element: PurchaseHistory  },
  { path: '/franchise/customers/:id/reminders',    element: MedicineReminder },
  { path: '/franchise/customers/:id/membership',   element: Membership       },
  { path: '/franchise/customers/:id/loyalty',      element: Loyalty          },
  { path: '/franchise/customers/:id/carecoin',     element: CareCoin         },

  /* ── Accounts ── */
  { path: '/franchise/accounts',                element: CashBook     },
  { path: '/franchise/accounts/cash-book',      element: CashBook     },
  { path: '/franchise/accounts/bank-book',      element: BankBook     },
  { path: '/franchise/accounts/day-book',       element: DayBook      },
  { path: '/franchise/accounts/receipts',       element: Receipts     },
  { path: '/franchise/accounts/payments',       element: Payments     },
  { path: '/franchise/accounts/expenses',       element: Expenses     },
  { path: '/franchise/accounts/income',         element: Income       },
  { path: '/franchise/accounts/journal',        element: Journal      },
  { path: '/franchise/accounts/ledger',         element: Ledger       },
  { path: '/franchise/accounts/trial-balance',  element: TrialBalance },
  { path: '/franchise/accounts/profit-loss',    element: ProfitLoss   },
  { path: '/franchise/accounts/balance-sheet',  element: BalanceSheet },

  /* ── Staff ── */
  { path: '/franchise/staff', element: StaffUsers },

  /* ── Reports ── */
  { path: '/franchise/reports',          element: SalesReport    },
  { path: '/franchise/reports/sales',    element: SalesReport    },
  { path: '/franchise/reports/purchase', element: PurchaseReport },
  { path: '/franchise/reports/stock',    element: StockReport    },
  { path: '/franchise/reports/expiry',   element: ExpiryReport   },

  /* ── Notifications ── */
  { path: '/franchise/notifications', element: Notifications },

  /* ── Audit Logs ── */
  { path: '/franchise/audit', element: AuditLogs },

  /* ── Settings ── */
  { path: '/franchise/settings', element: FranchiseSettings },

  /* ── Help & Support ── */
  { path: '/franchise/support', element: HelpSupport },
]

export default routes
