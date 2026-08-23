/* eslint-disable prettier/prettier */
/* ── Shared Mock Data for all POS screens ── */

export const MEDICINES = [
  { id: 'm1', name: 'Crocin 650 Tablet',        salt: 'Paracetamol 650mg',    company: 'GSK',        mrp: 16.00, stock: 125, batch: 'CR08023', exp: '12/2026', pack: '15 Strips', gst: 5  },
  { id: 'm2', name: 'Crocin 500 Tablet',         salt: 'Paracetamol 500mg',    company: 'GSK',        mrp: 14.00, stock: 80,  batch: 'CR07541', exp: '09/2026', pack: '15 Strips', gst: 5  },
  { id: 'm3', name: 'Crocin Cold & Flu Tablet',  salt: 'Paracetamol+others',   company: 'GSK',        mrp: 18.00, stock: 48,  batch: 'CF09012', exp: '06/2027', pack: '10 Strips', gst: 5  },
  { id: 'm4', name: 'Crocin Drops',              salt: 'Paracetamol 100mg/ml', company: 'GSK',        mrp: 50.00, stock: 22,  batch: 'CD06021', exp: '03/2027', pack: '15ml',       gst: 12 },
  { id: 'm5', name: 'Crocin Syrup',              salt: 'Paracetamol 250mg/5ml',company: 'GSK',        mrp: 95.00, stock: 32,  batch: 'CS11033', exp: '11/2026', pack: '60ml',       gst: 12 },
  { id: 'm6', name: 'Amoxicillin 500mg',         salt: 'Amoxicillin 500mg',    company: 'Cipla',      mrp: 8.00,  stock: 200, batch: 'AM2401',  exp: '10/2026', pack: '10 Caps',    gst: 12 },
  { id: 'm7', name: 'Metformin 500mg',           salt: 'Metformin 500mg',      company: 'Sun Pharma', mrp: 4.50,  stock: 320, batch: 'MF2388',  exp: '02/2027', pack: '10 Tabs',    gst: 5  },
  { id: 'm8', name: 'Atorvastatin 10mg',         salt: 'Atorvastatin 10mg',    company: 'Ranbaxy',    mrp: 6.00,  stock: 80,  batch: 'AT2377',  exp: '09/2026', pack: '10 Tabs',    gst: 12 },
  { id: 'm9', name: 'Azithral 500 Tablet',       salt: 'Azithromycin 500mg',   company: 'Alembic',    mrp: 85.00, stock: 45,  batch: 'AZ0901',  exp: '08/2027', pack: '3 Tabs',     gst: 12 },
  { id: 'm10',name: 'Pantoprazole 40mg',         salt: 'Pantoprazole 40mg',    company: 'Sun Pharma', mrp: 3.50,  stock: 600, batch: 'PAN2402', exp: '01/2028', pack: '10 Tabs',    gst: 5  },
]

export const CUSTOMERS = [
  { id: 'CUS001', name: 'Rahul Sharma', phone: '9912345678', orders: 12, totalPurchase: '₹1,45,650', due: '₹0',   credit: 1258.00 },
  { id: 'CUS002', name: 'Priya Verma',  phone: '9823456789', orders: 8,  totalPurchase: '₹2,80,000', due: '₹250', credit: 500.00  },
  { id: 'CUS003', name: 'Amit Kumar',   phone: '9734567890', orders: 5,  totalPurchase: '₹1,50,000', due: '₹0',   credit: 800.00  },
  { id: 'CUS004', name: 'Neha Singh',   phone: '9001234567', orders: 7,  totalPurchase: '₹2,30,000', due: '₹120', credit: 300.00  },
]

export const HOLD_BILLS = [
  { id: 'HB001', name: 'Rahul Sharma', items: 3, amount: 580.00, time: '10:38 AM', note: 'Fever Medicine Bill'   },
  { id: 'HB002', name: 'Priya Verma',  items: 5, amount: 750.00, time: '11:02 AM', note: "Nid's Medicine Bill"   },
  { id: 'HB003', name: 'Walk-In',      items: 2, amount: 320.00, time: '11:45 AM', note: 'Pain Relief Bill'      },
  { id: 'HB004', name: 'Amit Kumar',   items: 6, amount: 125.00, time: '12:15 PM', note: 'Diabetes Medicine Bill'},
]

export const RETURN_ITEMS = [
  { name: 'Crocin 650 Tablet',    batch: 'CR08023', qty: 2, mrp: 15.00, retQty: 1, retAmt: 15.00 },
  { name: 'Paracip 500 Capsule',  batch: 'PD09043', qty: 1, mrp: 20.00, retQty: 1, retAmt: 20.00 },
  { name: 'Dizle 650 Tablet',     batch: 'DL06031', qty: 4, mrp: 12.00, retQty: 0, retAmt: 0.00  },
]

export const PRESCRIPTION_MEDS = [
  { id: 'p1', name: 'Azithral 500 Tablet',    mrp: 85.00, stock: 45,  qty: 1, gst: 12 },
  { id: 'p2', name: 'Paracip 500mg Tablet',   mrp: 20.00, stock: 120, qty: 2, gst: 5  },
  { id: 'p3', name: 'Tab. IBS Tablet',        mrp: 15.00, stock: 188, qty: 2, gst: 5  },
  { id: 'p4', name: 'Vitamin D3 60K Capsule', mrp: 10.00, stock: 129, qty: 1, gst: 5  },
  { id: 'p5', name: 'LevoFlox 500 Capsule',   mrp: 18.00, stock: 125, qty: 1, gst: 12 },
  { id: 'p6', name: 'Laprol 400mg Tablet',    mrp: 12.50, stock: 90,  qty: 1, gst: 5  },
]
