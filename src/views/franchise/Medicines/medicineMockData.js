/* eslint-disable prettier/prettier */
/* ── Shared Mock Data for Medicine Master screens ── */

export const MEDICINES = [
  { _id: 'm1', name: 'Paracetamol 650mg Tablet', salt: 'Paracetamol 650mg',    brand: 'Crocin',     category: 'Analgesic',    formulation: 'Tablet',    company: 'GSK',         mrp: 15.00, hsn: '3004',  gst: 12, unit: 'Tablet', packSize: '1x15', stock: 1250, reorderLevel: 100, isActive: true,  purchasePrice: 9.80,  barcode: '8901234567890' },
  { _id: 'm2', name: 'Amoxicillin 500 Capsule',  salt: 'Amoxicillin 500mg',    brand: 'Amoxil',     category: 'Antibiotic',   formulation: 'Capsule',   company: 'Cipla',       mrp: 35.50, hsn: '3004',  gst: 12, unit: 'Capsule',packSize: '1x10', stock: 600,  reorderLevel: 50,  isActive: true,  purchasePrice: 21.00, barcode: '8901234567891' },
  { _id: 'm3', name: 'Crocin Advance Tablet',    salt: 'Paracetamol 500mg',    brand: 'Crocin Adv', category: 'Analgesic',    formulation: 'Tablet',    company: 'GSK',         mrp: 16.20, hsn: '3004',  gst: 12, unit: 'Tablet', packSize: '1x10', stock: 980,  reorderLevel: 100, isActive: true,  purchasePrice: 10.00, barcode: '8901234567892' },
  { _id: 'm4', name: 'Metformin 500mg Tablet',   salt: 'Metformin 500mg',      brand: 'Glycomet',   category: 'Antidiabetic', formulation: 'Tablet',    company: 'USV',         mrp: 4.50,  hsn: '3004',  gst: 12, unit: 'Tablet', packSize: '1x10', stock: 320,  reorderLevel: 50,  isActive: true,  purchasePrice: 2.80,  barcode: '8901234567893' },
  { _id: 'm5', name: 'Calpol 650 Tablet',        salt: 'Paracetamol 650mg',    brand: 'Calpol',     category: 'Analgesic',    formulation: 'Tablet',    company: 'GSK',         mrp: 13.00, hsn: '3004',  gst: 12, unit: 'Tablet', packSize: '1x15', stock: 420,  reorderLevel: 80,  isActive: false, purchasePrice: 8.00,  barcode: '8901234567894' },
  { _id: 'm6', name: 'Pantoprazole 40mg Tablet', salt: 'Pantoprazole 40mg',    brand: 'Pantop',     category: 'GI',           formulation: 'Tablet',    company: 'Sun Pharma',  mrp: 28.00, hsn: '3004',  gst: 12, unit: 'Tablet', packSize: '1x15', stock: 540,  reorderLevel: 60,  isActive: true,  purchasePrice: 16.00, barcode: '8901234567895' },
  { _id: 'm7', name: 'Azithral 500 Tablet',      salt: 'Azithromycin 500mg',   brand: 'Azithral',   category: 'Antibiotic',   formulation: 'Tablet',    company: 'Alembic',     mrp: 85.00, hsn: '3004',  gst: 12, unit: 'Tablet', packSize: '1x3',  stock: 145,  reorderLevel: 30,  isActive: true,  purchasePrice: 52.00, barcode: '8901234567896' },
  { _id: 'm8', name: 'Pyrigesic 650 Tablet',     salt: 'Paracetamol 650mg',    brand: 'Pyrigesic',  category: 'Analgesic',    formulation: 'Tablet',    company: 'Abbott',      mrp: 15.80, hsn: '3004',  gst: 12, unit: 'Tablet', packSize: '1x15', stock: 280,  reorderLevel: 60,  isActive: true,  purchasePrice: 9.50,  barcode: '8901234567897' },
  { _id: 'm9', name: 'Novamox 500 Capsule',      salt: 'Amoxicillin 500mg',    brand: 'Novamox',    category: 'Antibiotic',   formulation: 'Capsule',   company: 'Cipla',       mrp: 34.00, hsn: '3004',  gst: 12, unit: 'Capsule',packSize: '1x10', stock: 0,    reorderLevel: 50,  isActive: false, purchasePrice: 20.00, barcode: '8901234567898' },
  { _id: 'm10',name: 'Atorfit 10 Tablet',        salt: 'Atorvastatin 10mg',    brand: 'Atorfit',    category: 'Cardiac',      formulation: 'Tablet',    company: 'Eris Pharma', mrp: 18.60, hsn: '3004',  gst: 12, unit: 'Tablet', packSize: '1x10', stock: 400,  reorderLevel: 40,  isActive: true,  purchasePrice: 11.00, barcode: '8901234567899' },
]

export const BATCHES = [
  { batch: 'CR08023',  mfgDate: '10-06-2024', expDate: '12-10-2026', stock: 380, purchasePrice: 9.80,  mrp: 15.00, supplier: 'Medico Agency',          status: 'Active'       },
  { batch: 'CR07541',  mfgDate: '10-01-2024', expDate: '10-01-2027', stock: 680, purchasePrice: 9.40,  mrp: 14.50, supplier: 'Sunrise Pharmaceuticals', status: 'Active'       },
  { batch: 'CR09011',  mfgDate: '15-09-2024', expDate: '15-09-2026', stock: 0,   purchasePrice: 10.00, mrp: 16.00, supplier: 'Life Care Distributors',  status: 'Out of Stock' },
  { batch: 'CR06831',  mfgDate: '01-06-2023', expDate: '01-11-2025', stock: 150, purchasePrice: 8.50,  mrp: 13.00, supplier: 'Pharma Distributors',     status: 'Expiring Soon'},
  { batch: 'CR05400',  mfgDate: '20-05-2022', expDate: '20-10-2024', stock: 40,  purchasePrice: 8.00,  mrp: 12.50, supplier: 'Medico Agency',           status: 'Expired'      },
]

export const RACKS = [
  { warehouse: 'Aarogya Medical Store', shelf: 'A-01', name: 'A-01', capacity: 200, currentItems: 145, status: 'Active' },
  { warehouse: 'Aarogya Medical Store', shelf: 'A-02', name: 'A-02', capacity: 200, currentItems: 188, status: 'Active' },
  { warehouse: 'Aarogya Medical Store', shelf: 'A-03', name: 'A-03', capacity: 200, currentItems: 200, status: 'Active' },
  { warehouse: 'Aarogya Medical Store', shelf: 'A-04', name: 'A-04', capacity: 200, currentItems: 120, status: 'Active' },
  { warehouse: 'Aarogya Medical Store', shelf: 'B-01', name: 'B-01', capacity: 300, currentItems: 98,  status: 'Active' },
  { warehouse: 'Aarogya Medical Store', shelf: 'C-01', name: 'C-01', capacity: 150, currentItems: 150, status: 'Active' },
  { warehouse: 'Aarogya Medical Store', shelf: 'D-01', name: 'D-01', capacity: 100, currentItems: 0,   status: 'Active' },
]

export const GENERIC_BRANDS = [
  { brand: 'Crocin 650 Tablet',    formulation: 'Tablet', strength: '650mg', mrp: 15.00 },
  { brand: 'Dolo 650 Tablet',      formulation: 'Tablet', strength: '650mg', mrp: 14.50 },
  { brand: 'Calpol 650 Tablet',    formulation: 'Tablet', strength: '650mg', mrp: 13.00 },
  { brand: 'Tylenol 650 Tablet',   formulation: 'Tablet', strength: '650mg', mrp: 16.20 },
  { brand: 'Pyrigesic 650 Tablet', formulation: 'Tablet', strength: '650mg', mrp: 15.80 },
  { brand: 'Pyrigesic 650 Tablet', formulation: 'Tablet', strength: '650mg', mrp: 15.80 },
]

export const ALTERNATIVES = [
  { name: 'C-rocin 650 Tablet',    salt: 'Paracetamol 650mg', company: 'GSK',      mrp: 15.00, stock: 1250 },
  { name: 'Dolo-650 Tablet',       salt: 'Paracetamol 650mg', company: 'Micro Labs',mrp: 14.50, stock: 860 },
  { name: 'Calpol 650 Tablet',     salt: 'Paracetamol 650mg', company: 'GSK',      mrp: 13.00, stock: 420 },
  { name: 'Pyrigesic 650 Tablet',  salt: 'Paracetamol 650mg', company: 'Abbott',   mrp: 15.80, stock: 280 },
  { name: 'Novamox 500 Capsule',   salt: 'Paracetamol 650mg', company: 'Cipla',    mrp: 13.80, stock: 0   },
  { name: 'Nocin-650 Tablet',      salt: 'Paracetamol 650mg', company: 'Emdee',    mrp: 15.40, stock: 160 },
]

export const CATEGORIES  = ['All Categories', 'Analgesic', 'Antibiotic', 'Antidiabetic', 'Cardiac', 'GI', 'Vitamin', 'Antifungal']
export const FORMULATIONS = ['All Formulations', 'Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops']
export const COMPANIES    = ['All Companies', 'GSK', 'Cipla', 'Sun Pharma', 'Alembic', 'Abbott', 'USV', 'Eris Pharma']
