/* eslint-disable prettier/prettier */
/* ── Shared Mock Data for all Accounts screens ── */

export const CASH_BOOK = [
  { date: '03/05/2025', voucher: 'CR-2025-001', particulars: 'Cash Sales',          cashIn: 12600.00, cashOut: null,     balance: 37880.00 },
  { date: '05/05/2025', voucher: 'CR-2025-002', particulars: 'Customer Advance',    cashIn: 5000.00,  cashOut: null,     balance: 42880.00 },
  { date: '08/05/2025', voucher: 'CP-2025-001', particulars: 'Purchase Payment',    cashIn: null,     cashOut: 15100.00, balance: 27780.00 },
  { date: '10/05/2025', voucher: 'CR-2025-003', particulars: 'Cash Sales',          cashIn: 8900.00,  cashOut: null,     balance: 36680.00 },
  { date: '12/05/2025', voucher: 'CP-2025-002', particulars: 'Rent Payment',        cashIn: null,     cashOut: 12000.00, balance: 24680.00 },
  { date: '15/05/2025', voucher: 'CP-2025-003', particulars: 'Electricity Bill',    cashIn: null,     cashOut: 1280.00,  balance: 23400.00 },
  { date: '18/05/2025', voucher: 'CP-2025-004', particulars: 'Round Off',           cashIn: null,     cashOut: 0.03,     balance: 23399.97 },
]

export const BANK_BOOK = [
  { date: '03/05/2025', voucher: 'BK-2025-001', particulars: 'Cash Deposit',        deposit: 20000.00, withdrawal: null,     balance: 1350480.00 },
  { date: '08/05/2025', voucher: 'BK-2025-002', particulars: 'Online Payment',      deposit: 38480.00, withdrawal: null,     balance: 1388960.00 },
  { date: '12/05/2025', voucher: 'BP-2025-001', particulars: 'Supplier Payment',    deposit: null,     withdrawal: 49600.00, balance: 1339360.00 },
  { date: '15/05/2025', voucher: 'BP-2025-002', particulars: 'Rent Payment',        deposit: null,     withdrawal: 50000.00, balance: 1289360.00 },
  { date: '18/05/2025', voucher: 'BK-2025-003', particulars: 'Bank Charges',        deposit: null,     withdrawal: 500.00,   balance: 1288860.00 },
  { date: '20/05/2025', voucher: 'BK-2025-004', particulars: 'Interest Received',   deposit: 550.00,   withdrawal: null,     balance: 1289410.00 },
]

export const DAY_BOOK = [
  { date: '20/05/2025', voucher: 'CR-2025-100', particulars: 'Cash Sales',          debit: null,      credit: 24670.00  },
  { date: '20/05/2025', voucher: 'BK-2025-050', particulars: 'Online Payment',      debit: null,      credit: 15650.00  },
  { date: '20/05/2025', voucher: 'PU-2025-031', particulars: 'Purchase',            debit: 56550.00,  credit: null      },
  { date: '20/05/2025', voucher: 'RC-2025-020', particulars: 'Receipts',            debit: null,      credit: 1740300.00},
  { date: '20/05/2025', voucher: 'PY-2025-015', particulars: 'Payments',            debit: 1250000.00,credit: null      },
  { date: '20/05/2025', voucher: 'JV-2025-005', particulars: 'Journal Entries',     debit: null,      credit: 22400.00  },
]

export const RECEIPTS = [
  { date: '20/05/2025', voucher: 'RC-2025-001', particulars: 'Cash Sales',        mode: 'Cash', amount: 12450.00 },
  { date: '20/05/2025', voucher: 'RC-2025-002', particulars: 'Customer Advance',  mode: 'Cash', amount: 29050.00 },
  { date: '18/05/2025', voucher: 'RC-2025-003', particulars: 'Online Sales',      mode: 'Bank', amount: 26000.00 },
  { date: '18/05/2025', voucher: 'RC-2025-004', particulars: 'Customer Payment',  mode: 'Bank', amount: 78400.00 },
  { date: '17/05/2025', voucher: 'RC-2025-005', particulars: 'Interest Received', mode: 'Bank', amount: 1380.00  },
  { date: '17/05/2025', voucher: 'RC-2025-006', particulars: 'Misc. Receipt',     mode: 'Cash', amount: 2560.00  },
]

export const PAYMENTS = [
  { date: '20/05/2025', voucher: 'PY-2025-001', particulars: 'Supplier Payment',   mode: 'Bank', amount: 45600.00 },
  { date: '19/05/2025', voucher: 'PY-2025-002', particulars: 'Rent',               mode: 'Cash', amount: 12000.00 },
  { date: '18/05/2025', voucher: 'PY-2025-003', particulars: 'Staff Salary',       mode: 'Bank', amount: 38500.00 },
  { date: '17/05/2025', voucher: 'PY-2025-004', particulars: 'Electricity Bill',   mode: 'Cash', amount: 1280.00  },
  { date: '16/05/2025', voucher: 'PY-2025-005', particulars: 'Transport',          mode: 'Cash', amount: 800.00   },
  { date: '15/05/2025', voucher: 'PY-2025-006', particulars: 'Misc. Expense',      mode: 'Cash', amount: 950.00   },
]

export const EXPENSES_LIST = [
  { date: '20/05/2025', particulars: 'Rent',            amount: 12000.00, category: 'Rent' },
  { date: '19/05/2025', particulars: 'Staff Salary',    amount: 38500.00, category: 'Salary' },
  { date: '18/05/2025', particulars: 'Electricity Bill',amount: 1280.00,  category: 'Utilities' },
  { date: '17/05/2025', particulars: 'Transport',       amount: 800.00,   category: 'Transport' },
  { date: '16/05/2025', particulars: 'Telephone',       amount: 1100.00,  category: 'Utilities' },
  { date: '15/05/2025', particulars: 'Stationery',      amount: 430.00,   category: 'Office' },
  { date: '14/05/2025', particulars: 'Miscellaneous',   amount: 9110.00,  category: 'Other' },
]

export const INCOME_LIST = [
  { date: '20/05/2025', particulars: 'Sales Income',      amount: 585320.00, category: 'Sales' },
  { date: '18/05/2025', particulars: 'Other Income',      amount: 15970.00,  category: 'Other' },
  { date: '15/05/2025', particulars: 'Discount Received', amount: 12540.00,  category: 'Discount' },
  { date: '12/05/2025', particulars: 'Interest Received', amount: 6340.00,   category: 'Interest' },
]

export const JOURNAL_ENTRIES = [
  { date: '20/05/2025', jvNo: 'JV-2025-001', particulars: 'Depreciation',      debit: 2500.00, credit: 2500.00 },
  { date: '18/05/2025', jvNo: 'JV-2025-002', particulars: 'Interest Accrued',  debit: 1100.00, credit: 1100.00 },
  { date: '15/05/2025', jvNo: 'JV-2025-003', particulars: 'Stock Adjustment',  debit: 3460.00, credit: 3460.00 },
  { date: '12/05/2025', jvNo: 'JV-2025-004', particulars: 'Advance Adjustment',debit: 5000.00, credit: 5000.00 },
  { date: '10/05/2025', jvNo: 'JV-2025-005', particulars: 'Rounding Off',      debit: 10.00,   credit: 10.00   },
  { date: '08/05/2025', jvNo: 'JV-2025-006', particulars: 'Payment Received',  debit: 7460.00, credit: 7460.00 },
  { date: '05/05/2025', jvNo: 'JV-2025-007', particulars: 'Sales Invoice',     debit: 12000.00,credit: 12000.00},
]

export const LEDGER_ENTRIES = [
  { date: '01/04/2025', particular: 'Opening Balance',    debit: null,      credit: 12400.00, balance: 12400.00 },
  { date: '03/04/2025', particular: 'HV-30945-01',        debit: null,      credit: null,     balance: 12400.00 },
  { date: '10/04/2025', particular: 'Payment Received',   debit: null,      credit: 8000.00,  balance: 20400.00 },
  { date: '15/04/2025', particular: 'Sales Invoice',      debit: 6000.00,   credit: null,     balance: 14400.00 },
  { date: '20/04/2025', particular: 'Sales Invoice',      debit: null,      credit: 9000.00,  balance: 23400.00 },
  { date: '25/04/2025', particular: 'Payment Received',   debit: 7460.00,   credit: null,     balance: 15940.00 },
]

export const TRIAL_BALANCE = [
  { particulars: 'Cash in Hand',       debit: 41960.00,  credit: null       },
  { particulars: 'Bank Account',       debit: 217840.00, credit: null       },
  { particulars: 'Stock in Hand',      debit: 335680.00, credit: null       },
  { particulars: 'Debtors',            debit: 145230.00, credit: null       },
  { particulars: 'Furniture',          debit: 55800.00,  credit: null       },
  { particulars: 'Creditors',          debit: null,      credit: 129430.00  },
  { particulars: 'Capital Account',    debit: null,      credit: 4951000.00 },
  { particulars: 'Purchase Account',   debit: 1364230.00,credit: null       },
  { particulars: 'Sales Account',      debit: null,      credit: 1356830.00 },
  { particulars: 'Salary Expense',     debit: 88000.00,  credit: null       },
  { particulars: 'Rent Expense',       debit: 36000.00,  credit: null       },
  { particulars: 'Non Expense',        debit: 8100.00,   credit: null       },
  { particulars: 'Other Expenses',     debit: 10430.00,  credit: null       },
]

export const EXPENSE_CATEGORIES = [
  { label: 'Rent',        value: 30.1, color: '#0c3b73' },
  { label: 'Salary',      value: 26.4, color: '#7c3aed' },
  { label: 'Utilities',   value: 18.3, color: '#16a34a' },
  { label: 'Transport',   value: 4.6,  color: '#d97706' },
  { label: 'Others',      value: 20.6, color: '#9ca3af' },
]

export const INCOME_CATEGORIES = [
  { label: 'Sales',      value: 50.3, color: '#0c3b73' },
  { label: 'Online',     value: 28.6, color: '#7c3aed' },
  { label: 'Discount',   value: 15.7, color: '#16a34a' },
  { label: 'Interest',   value: 5.4,  color: '#d97706' },
]
