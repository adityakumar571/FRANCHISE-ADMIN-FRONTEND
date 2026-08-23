/* eslint-disable prettier/prettier */
/* ── Shared Mock Data for Live Wholesale Rates ── */

export const MEDICINES = [
  { id: 'm1', name: 'Paracetamol 650mg Tablet', strength: '650mg', pack: '10x15', lowestPrice: 11.30, highestPrice: 15.50, avgPrice: 12.50, trend: '+4.2%', up: true  },
  { id: 'm2', name: 'Crocin Advance',           strength: '500mg', pack: '10x10', lowestPrice: 12.80, highestPrice: 16.20, avgPrice: 14.10, trend: '+0.5%', up: true  },
  { id: 'm3', name: 'Azithral 500',             strength: '500mg', pack: '10x3',  lowestPrice: 36.00, highestPrice: 42.00, avgPrice: 40.10, trend: '+1.4%', up: true  },
  { id: 'm4', name: 'Amoxicillin 500 Capsule',  strength: '500mg', pack: '10x10', lowestPrice: 28.40, highestPrice: 36.50, avgPrice: 32.50, trend: '-0.8%', up: false },
  { id: 'm5', name: 'Pantop DSR Capsule',       strength: '40mg',  pack: '10x10', lowestPrice: 90.00, highestPrice: 105.00,avgPrice: 97.50, trend: '+1.5%', up: true  },
]

export const SUPPLIERS = [
  { id: 's1', name: 'Medico Agency',           discount: '12%', scheme: 'Buy 10 Get 1', priceMRP: 15.00, yourPrice: 12.50, stock: 'In Stock', delivery: '1 Day',  rating: 4.8 },
  { id: 's2', name: 'Life Care Distributors',  discount: '10%', scheme: 'Buy 5 Get 1',  priceMRP: 13.60, yourPrice: 13.60, stock: 'In Stock', delivery: '2 Days', rating: 4.4 },
  { id: 's3', name: 'Apollo Pharma',           discount: '8%',  scheme: null,           priceMRP: 14.26, yourPrice: 14.26, stock: 'In Stock', delivery: '1 Day',  rating: 4.2 },
  { id: 's4', name: 'Sunrise Pharmaceuticals', discount: '6%',  scheme: null,           priceMRP: 16.00, yourPrice: 14.50, stock: 'In Stock', delivery: '3 Days', rating: 3.9 },
  { id: 's5', name: 'Healthline Distributors', discount: '5%',  scheme: 'Flat 5% Off',  priceMRP: 16.20, yourPrice: 15.29, stock: 'In Stock', delivery: '2 Days', rating: 3.7 },
]

export const SCHEMES = [
  { supplier: 'Medico Agency',           discount: '12%', scheme: 'Buy 10 Get 1', freeItems: '1 Strip',  target: null,      validity: '31 May 2025', netPrice: 12.29 },
  { supplier: 'Life Care Distributors',  discount: '10%', scheme: 'Buy 5 Get 2',  freeItems: '3 Strips', target: '₹25,000', validity: '15 Jun 2025', netPrice: 13.48 },
  { supplier: 'Apollo Pharma',           discount: '8%',  scheme: 'Buy 6 Get 1',  freeItems: 'No Target',target: null,      validity: '30 May 2025', netPrice: 13.48 },
  { supplier: 'Sunrise Pharmaceuticals', discount: '8%',  scheme: 'Buy 10 Get 2', freeItems: '2 Strips', target: null,      validity: '20 May 2025', netPrice: 14.05 },
  { supplier: 'Healthline Distributors', discount: '5%',  scheme: 'Flat 5% Off',  freeItems: 'No Target',target: null,      validity: '30 May 2025', netPrice: 14.26 },
]

export const CART_ITEMS = [
  { name: 'Paracetamol 650mg Tablet', pack: '10x15', qty: 50, price: 15.95, discount: 12, amount: 680.00  },
  { name: 'Azithral 500 Tablet',      pack: '10x3',  qty: 30, price: 43.00, discount: 10, amount: 1161.80 },
  { name: 'Amoxicillin 500 Capsule',  pack: '10x10', qty: 10, price: 28.00, discount: 12, amount: 492.80  },
]

export const ORDERS = [
  { id: 'PO-2025-5862', supplier: 'Medico Agency',          date: '20 May 2025', items: 3, total: 3000.00, discount: 300.00,  amount: 2700.00, status: 'In Transit' },
  { id: 'PO-2025-5841', supplier: 'Life Care Distributors', date: '18 May 2025', items: 5, total: 5600.00, discount: 450.00,  amount: 5150.00, status: 'Delivered'  },
  { id: 'PO-2025-5820', supplier: 'Apollo Pharma',          date: '15 May 2025', items: 2, total: 1200.00, discount: 120.00,  amount: 1080.00, status: 'Pending'    },
  { id: 'PO-2025-5801', supplier: 'Sunrise Pharmaceuticals',date: '10 May 2025', items: 8, total: 8900.00, discount: 700.00,  amount: 8200.00, status: 'Delivered'  },
]

export const PRICE_HISTORY = [
  { month: 'Nov 2024', price: 11.80 },
  { month: 'Dec 2024', price: 12.10 },
  { month: 'Jan 2025', price: 11.90 },
  { month: 'Feb 2025', price: 12.30 },
  { month: 'Mar 2025', price: 12.80 },
  { month: 'Apr 2025', price: 13.20 },
  { month: 'May 2025', price: 13.19 },
]

export const SUPPLIER_RATINGS = [
  { supplier: 'Medico Agency',           rating: 4.8, onTime: '96%', quality: '4.7', service: '4.8', returns: '170'  },
  { supplier: 'Life Care Distributors',  rating: 4.4, onTime: '90%', quality: '4.4', service: '4.3', returns: '90'   },
  { supplier: 'Apollo Pharma',           rating: 4.2, onTime: '88%', quality: '4.1', service: '4.2', returns: '120'  },
  { supplier: 'Sunrise Pharmaceuticals', rating: 3.9, onTime: '82%', quality: '3.8', service: '4.0', returns: '80'   },
  { supplier: 'Healthline Distributors', rating: 3.7, onTime: '78%', quality: '3.6', service: '3.8', returns: '60'   },
]
