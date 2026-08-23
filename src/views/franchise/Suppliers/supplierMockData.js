/* eslint-disable prettier/prettier */

export const SUPPLIERS = [
  { id: 'SUP001', name: 'Medico Agency',            phone: '9081234567', email: 'medico@gmail.com',         city: 'Lucknow',   outstanding: 2345230.00, status: 'Active',   gstNo: '09AAACM1234K1Z5', dl: 'UP-LKO-DL-001', creditLimit: 5000000 },
  { id: 'SUP002', name: 'Life Care Distributors',   phone: '9045678901', email: 'lifecare@gmail.com',       city: 'Kanpur',    outstanding: 1512480.00, status: 'Active',   gstNo: '09AAACL5678M1Z3', dl: 'UP-KNP-DL-002', creditLimit: 3000000 },
  { id: 'SUP003', name: 'Apollo Pharma',             phone: '9034567890', email: 'apollo@pharma.com',        city: 'Varanasi',  outstanding: 3471500.00, status: 'Active',   gstNo: '09AAACA9012N1Z1', dl: 'UP-VNS-DL-003', creditLimit: 8000000 },
  { id: 'SUP004', name: 'Sunrise Pharmaceuticals',  phone: '9023456789', email: 'sunrise@pharma.com',       city: 'Noida',     outstanding: 1481230.00, status: 'Active',   gstNo: '09AAACS3456O1Z9', dl: 'UP-NOI-DL-004', creditLimit: 2000000 },
  { id: 'SUP005', name: 'Healthline Distributors',  phone: '9012345678', email: 'healthline@gmail.com',     city: 'Agra',      outstanding: 2586790.00, status: 'Active',   gstNo: '09AAACH7890P1Z7', dl: 'UP-AGR-DL-005', creditLimit: 4000000 },
  { id: 'SUP006', name: 'GSK Distributors',          phone: '9099887766', email: 'gsk@distributor.com',      city: 'Mumbai',    outstanding: 2987640.00, status: 'Active',   gstNo: '27AAACG1234Q1Z5', dl: 'MH-MUM-DL-006', creditLimit: 6000000 },
  { id: 'SUP007', name: 'Alkem Laboratories',       phone: '9088776655', email: 'alkem@labs.com',           city: 'Allahabad', outstanding: 1486130.00, status: 'Active',   gstNo: '09AAACA5678R1Z3', dl: 'UP-ALD-DL-007', creditLimit: 3500000 },
  { id: 'SUP008', name: 'Zydus Healthcare',         phone: '9077665544', email: 'zydus@healthcare.com',     city: 'Delhi',     outstanding: 590000.00,  status: 'Inactive', gstNo: '07AAACZ9012S1Z1', dl: 'DL-001-DL-008', creditLimit: 1000000 },
  { id: 'SUP009', name: 'MedKind Pharma',           phone: '9066554433', email: 'medkind@pharma.com',       city: 'Jaipur',    outstanding: 2083190.00, status: 'Active',   gstNo: '08AAACM3456T1Z9', dl: 'RJ-JAI-DL-009', creditLimit: 4000000 },
  { id: 'SUP010', name: 'Intas Pharmaceuticals',    phone: '9055443322', email: 'intas@pharma.com',         city: 'Pune',      outstanding: 3145000.00, status: 'Active',   gstNo: '27AAACI7890U1Z7', dl: 'MH-PUN-DL-010', creditLimit: 7000000 },
]

export const CONTACTS = [
  { name: 'Amit Kumar',    designation: 'Sales Manager',       phone: '9312345678', email: 'amit@medicoagency.com' },
  { name: 'Vashu Singh',   designation: 'Account Manager',     phone: '9323456789', email: 'vashu@medicoagency.com' },
  { name: 'Rohit Sharma',  designation: 'Delivery Incharge',   phone: '9234567890', email: 'rohit@medicoagency.com' },
]

export const SUPPLIER_LEDGER = [
  { date: '07/01/2025', refNo: 'INV-2025-001',  type: 'Opening Balance',       particulars: 'Opening Balance',              debit: null,      credit: 125000.00, balance: 125000.00  },
  { date: '12/02/2025', refNo: 'INV-2025-042',  type: 'Purchase Invoice',      particulars: 'Purchase of Medicines',        debit: null,      credit: 58750.00,  balance: 183750.00  },
  { date: '20/02/2025', refNo: 'PY-2025-021',   type: 'Payment',               particulars: 'Payment by NEFT',              debit: 50000.00,  credit: null,      balance: 133750.00  },
  { date: '05/03/2025', refNo: 'INV-2025-083',  type: 'Purchase Invoice',      particulars: 'Advance Adjustment',           debit: null,      credit: 125430.04, balance: 259180.04  },
  { date: '15/03/2025', refNo: 'PY-2025-045',   type: 'Payment',               particulars: 'Payment by NEFT',              debit: 1055000.00,credit: null,      balance: 1446780.04 },
  { date: '22/04/2025', refNo: 'INV-2025-124',  type: 'Purchase Invoice',      particulars: 'Purchase Invoice',             debit: null,      credit: 98750.00,  balance: 1545530.04 },
  { date: '10/05/2025', refNo: 'INV-2025-158',  type: 'Purchase Invoice',      particulars: 'Purchase Invoice',             debit: null,      credit: 150000.00, balance: 1695530.04 },
  { date: '18/05/2025', refNo: 'PY-2025-088',   type: 'Payment',               particulars: 'Payment Received',             debit: 7460.00,   credit: null,      balance: 1688070.04 },
]

export const PAYMENT_HISTORY = [
  { date: '03/05/2025', paymentNo: 'PAY-2501-901', mode: 'Cheque', txnRef: '123450',           amount: 122450.00, narration: 'Payment by cheque' },
  { date: '01/05/2025', paymentNo: 'PAY-2501-891', mode: 'NEFT',   txnRef: 'UTR12345678056',   amount: 1005500.00,narration: 'Payment by NEFT'   },
  { date: '28/04/2025', paymentNo: 'PAY-2504-801', mode: 'Cheque', txnRef: '885632',            amount: 70349.00,  narration: 'Payment by cheque' },
  { date: '25/04/2025', paymentNo: 'PAY-2504-798', mode: 'Cheque', txnRef: '34618',             amount: 75000.00,  narration: 'Old payment'       },
  { date: '15/04/2025', paymentNo: 'PAY-2504-723', mode: 'NEFT',   txnRef: '8705',              amount: 125000.00, narration: 'Old payment'       },
  { date: '10/04/2025', paymentNo: 'PAY-2504-712', mode: 'UPI',    txnRef: 'UPI88765432100',    amount: 50000.00,  narration: 'Old payment'       },
]

export const OUTSTANDING_LIST = [
  { name: 'Medico Agency',           totalPayable: 2345230.00, overdueAmt: 1245230.00, currentDue: 1000000.00, dueToday: 215000.00, dueWeek: 365780.00, status: 'Overdue' },
  { name: 'Life Care Distributors',  totalPayable: 1512480.00, overdueAmt: 0,          currentDue: 1512480.00, dueToday: 200000.00, dueWeek: 1450000.00,status: 'Due'     },
  { name: 'Apollo Pharma',           totalPayable: 3471500.00, overdueAmt: 1750000.00, currentDue: 1721500.00, dueToday: 0,         dueWeek: 400000.00, status: 'Overdue' },
  { name: 'Sunrise Pharmaceuticals', totalPayable: 1481230.00, overdueAmt: 481230.00,  currentDue: 1000000.00, dueToday: 100000.00, dueWeek: 460000.00, status: 'Overdue' },
  { name: 'Healthline Distributors', totalPayable: 2586790.00, overdueAmt: 0,          currentDue: 2586790.00, dueToday: 0,         dueWeek: 200000.00, status: 'Due'     },
  { name: 'GSK Distributors',        totalPayable: 2987640.00, overdueAmt: 1381640.00, currentDue: 1606000.00, dueToday: 0,         dueWeek: 250000.00, status: 'Due'     },
  { name: 'Alkem Laboratories',      totalPayable: 1486130.00, overdueAmt: 0,          currentDue: 1486130.00, dueToday: 0,         dueWeek: 100000.00, status: 'Due'     },
  { name: 'Zydus Healthcare',        totalPayable: 590000.00,  overdueAmt: 0,          currentDue: 590000.00,  dueToday: 0,         dueWeek: 45000.00,  status: 'Due'     },
  { name: 'MedKind Pharma',          totalPayable: 2083190.00, overdueAmt: 0,          currentDue: 2083190.00, dueToday: 0,         dueWeek: 145000.00, status: 'Due'     },
  { name: 'Intas Pharmaceuticals',   totalPayable: 3145000.00, overdueAmt: 0,          currentDue: 3145000.00, dueToday: 3145000.00,dueWeek: 100000.00, status: 'Due'     },
]
