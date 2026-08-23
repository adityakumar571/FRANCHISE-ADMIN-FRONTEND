/* eslint-disable prettier/prettier */
/**
 * routes.js — Franchise Portal — Complete Route Map
 *
 * All franchise modules wired up per SOW:
 * Dashboard · POS · Purchase · Inventory · Medicines · Suppliers
 * B2B Orders · Customers · Staff · Reports · Notifications · Audit · Settings · Support
 */

// ── Dashboard ─────────────────────────────────────────────────────────────────
import FranchiseDashboard from './views/franchise/Dashboard/FranchiseDashboard'

// ── POS / Sales ───────────────────────────────────────────────────────────────
import POSBilling   from './views/franchise/POS/POSBilling'
import SalesReturns from './views/franchise/POS/SalesReturns'
import DayClosing   from './views/franchise/POS/DayClosing'

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

// ── Medicines ─────────────────────────────────────────────────────────────────
import MedicineList from './views/franchise/Medicines/MedicineList'

// ── Suppliers ─────────────────────────────────────────────────────────────────
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
  { path: '/franchise/pos',             element: POSBilling },      // nav group parent → billing
  { path: '/franchise/pos/billing',     element: POSBilling },
  { path: '/franchise/pos/returns',     element: SalesReturns },
  { path: '/franchise/pos/day-closing', element: DayClosing },

  /* ── Purchase / Procurement ── */
  { path: '/franchise/purchase',                 element: PurchaseDashboard }, // nav group parent
  { path: '/franchise/purchase/dashboard',       element: PurchaseDashboard },
  { path: '/franchise/purchase/live-rate',       element: LiveRateCompare },
  { path: '/franchise/purchase/orders',          element: PurchaseOrders },
  { path: '/franchise/purchase/grn',             element: GRNInward },
  { path: '/franchise/purchase/returns',         element: PurchaseReturns },
  { path: '/franchise/purchase/supplier-ledger', element: SupplierLedger },

  /* ── Inventory ── */
  { path: '/franchise/inventory',                  element: InventoryDashboard },  // nav group parent → dashboard
  { path: '/franchise/inventory/dashboard',         element: InventoryDashboard },
  { path: '/franchise/inventory/stock',             element: StockOverview },
  { path: '/franchise/inventory/rack',              element: RackWarehouse },
  { path: '/franchise/inventory/batch-expiry',      element: BatchExpiry },
  { path: '/franchise/inventory/adjustments',       element: StockAdjustments },
  { path: '/franchise/inventory/near-expiry',       element: NearExpiry },
  { path: '/franchise/inventory/expired',           element: ExpiredStock },
  { path: '/franchise/inventory/damage',            element: DamageStock },
  { path: '/franchise/inventory/dead',              element: DeadStock },
  { path: '/franchise/inventory/fast-moving',       element: FastMoving },
  { path: '/franchise/inventory/slow-moving',       element: SlowMoving },
  { path: '/franchise/inventory/ledger',            element: StockLedger },
  { path: '/franchise/inventory/verification',      element: PhysicalVerification },
  { path: '/franchise/inventory/audit',             element: InventoryAudit },

  /* ── Medicines ── */
  { path: '/franchise/medicines', element: MedicineList },

  /* ── Suppliers ── */
  { path: '/franchise/suppliers', element: SupplierList },

  /* ── B2B Orders ── */
  { path: '/franchise/b2b-orders', element: B2BOrders },

  /* ── Customers ── */
  { path: '/franchise/customers',                          element: CustomerList     },
  { path: '/franchise/customers/:id',                      element: CustomerDetails  },
  { path: '/franchise/customers/:id/wallet',               element: CustomerWallet   },
  { path: '/franchise/customers/:id/history',              element: PurchaseHistory  },
  { path: '/franchise/customers/:id/reminders',            element: MedicineReminder },
  { path: '/franchise/customers/:id/membership',           element: Membership       },
  { path: '/franchise/customers/:id/loyalty',              element: Loyalty          },
  { path: '/franchise/customers/:id/carecoin',             element: CareCoin         },

  /* ── Staff ── */
  { path: '/franchise/staff', element: StaffUsers },

  /* ── Reports ── */
  { path: '/franchise/reports',          element: SalesReport },        // nav group parent → sales
  { path: '/franchise/reports/sales',    element: SalesReport },
  { path: '/franchise/reports/purchase', element: PurchaseReport },
  { path: '/franchise/reports/stock',    element: StockReport },
  { path: '/franchise/reports/expiry',   element: ExpiryReport },

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
