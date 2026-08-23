/* eslint-disable prettier/prettier */
/* ─── Shared Mock Data for all Customer screens ─── */

export const CUSTOMERS = [
  { id: 'CUS001', name: 'Rahul Sharma',  phone: '9912345678', email: 'rahul@email.com',  dob: '15 Mar 1990', gender: 'Male',   address: '132, Sector 15, Near City Mall, Lucknow, UP - 226010', bloodGroup: 'O+ve', status: 'Active',   memberSince: '12 Jan 2023', memberTier: 'Gold',     totalOrders: 24, totalPurchase: 45630.50, totalPaid: 44380.50, totalDue: 1250.00, avgOrderValue: 1901.27, totalSavings: 3250.60, carecoins: 2450, loyaltyPoints: 24560, walletBalance: 1250.00, lastPurchase: '20 May 2025', totalRatings: 4 },
  { id: 'CUS002', name: 'Priya Singh',   phone: '9823456789', email: 'priya@email.com',  dob: '22 Jul 1992', gender: 'Female', address: '45, Gomti Nagar, Lucknow',                              bloodGroup: 'A+ve', status: 'Active',   memberSince: '05 Mar 2023', memberTier: 'Silver',   totalOrders: 18, totalPurchase: 28450.00, totalPaid: 28450.00, totalDue: 0,       avgOrderValue: 1580.55, totalSavings: 1200.00, carecoins: 1200, loyaltyPoints: 12400, walletBalance: 500.00,  lastPurchase: '19 May 2025', totalRatings: 5 },
  { id: 'CUS003', name: 'Amit Kumar',    phone: '9734567890', email: 'amit@email.com',   dob: '10 Nov 1985', gender: 'Male',   address: '7, Indira Nagar, Lucknow',                              bloodGroup: 'B+ve', status: 'Active',   memberSince: '20 Jun 2023', memberTier: 'Silver',   totalOrders: 12, totalPurchase: 15600.00, totalPaid: 15600.00, totalDue: 0,       avgOrderValue: 1300.00, totalSavings: 780.00,  carecoins: 780,  loyaltyPoints: 8200,  walletBalance: 0,       lastPurchase: '18 May 2025', totalRatings: 3 },
  { id: 'CUS004', name: 'Neha Verma',    phone: '9645678901', email: 'neha@email.com',   dob: '05 Jan 1995', gender: 'Female', address: '88, Hazratganj, Lucknow',                               bloodGroup: 'AB+ve',status: 'Active',   memberSince: '14 Sep 2023', memberTier: 'Regular',  totalOrders: 8,  totalPurchase: 9850.00,  totalPaid: 9850.00,  totalDue: 0,       avgOrderValue: 1231.25, totalSavings: 450.00,  carecoins: 450,  loyaltyPoints: 5100,  walletBalance: 0,       lastPurchase: '17 May 2025', totalRatings: 2 },
  { id: 'CUS005', name: 'Vikram Patel',  phone: '9556789012', email: 'vikram@email.com', dob: '18 Sep 1988', gender: 'Male',   address: '33, Aliganj, Lucknow',                                  bloodGroup: 'O-ve', status: 'Active',   memberSince: '01 Jan 2022', memberTier: 'Platinum', totalOrders: 45, totalPurchase: 82000.00, totalPaid: 82000.00, totalDue: 0,       avgOrderValue: 1822.22, totalSavings: 6200.00, carecoins: 5800, loyaltyPoints: 58000, walletBalance: 3200.00, lastPurchase: '16 May 2025', totalRatings: 5 },
  { id: 'CUS006', name: 'Sunita Devi',   phone: '9467890123', email: 'sunita@email.com', dob: '30 Apr 1978', gender: 'Female', address: '5, Rajajipuram, Lucknow',                               bloodGroup: 'A-ve', status: 'Inactive', memberSince: '10 Nov 2023', memberTier: 'Regular',  totalOrders: 5,  totalPurchase: 3200.00,  totalPaid: 3200.00,  totalDue: 0,       avgOrderValue: 640.00,  totalSavings: 120.00,  carecoins: 120,  loyaltyPoints: 1200,  walletBalance: 0,       lastPurchase: '10 May 2025', totalRatings: 1 },
  { id: 'CUS007', name: 'Deepak Singh',  phone: '9378901234', email: '',                 dob: '12 Jun 1982', gender: 'Male',   address: '',                                                      bloodGroup: '',     status: 'Active',   memberSince: '25 Jan 2024', memberTier: 'Regular',  totalOrders: 3,  totalPurchase: 1850.00,  totalPaid: 1850.00,  totalDue: 0,       avgOrderValue: 616.67,  totalSavings: 85.00,   carecoins: 85,   loyaltyPoints: 850,   walletBalance: 0,       lastPurchase: '05 May 2025', totalRatings: 0 },
  { id: 'CUS008', name: 'Kavita Joshi',  phone: '9001234567', email: 'kavita@email.com', dob: '20 Dec 1990', gender: 'Female', address: '22, Mahanagar, Lucknow',                                bloodGroup: 'B-ve', status: 'Active',   memberSince: '08 Apr 2023', memberTier: 'Silver',   totalOrders: 15, totalPurchase: 19360.00, totalPaid: 18980.00, totalDue: 380.00,  avgOrderValue: 1290.67, totalSavings: 980.00,  carecoins: 980,  loyaltyPoints: 9800,  walletBalance: 200.00,  lastPurchase: '01 May 2025', totalRatings: 4 },
]

export const ORDERS = [
  { id: 'INV-2025-0896', date: '20 May 2025', items: 5, amount: 1645.50, discount: 82.28,  paid: 1645.50, due: 0,      status: 'Paid'    },
  { id: 'INV-2025-0876', date: '15 May 2025', items: 6, amount: 2350.00, discount: 117.50, paid: 2350.00, due: 0,      status: 'Paid'    },
  { id: 'INV-2025-0845', date: '10 May 2025', items: 3, amount: 1230.75, discount: 61.54,  paid: 1230.75, due: 0,      status: 'Paid'    },
  { id: 'INV-2025-0812', date: '06 May 2025', items: 7, amount: 2120.00, discount: 106.00, paid: 1500.00, due: 620.00, status: 'Partial' },
  { id: 'INV-2025-0780', date: '01 May 2025', items: 4, amount: 1450.00, discount: 72.50,  paid: 1450.00, due: 0,      status: 'Paid'    },
  { id: 'INV-2025-0741', date: '27 Apr 2025', items: 2, amount: 980.40,  discount: 0,      paid: 980.40,  due: 0,      status: 'Paid'    },
  { id: 'INV-2025-0731', date: '23 Apr 2025', items: 8, amount: 3380.88, discount: 169.04, paid: 3380.88, due: 0,      status: 'Paid'    },
]

export const TRANSACTIONS = [
  { date: '20 May 2025', desc: 'Order Payment (INV-2025-0896)', type: 'Debit',  amount: -1645.50, balance: 1250.00 },
  { date: '18 May 2025', desc: 'Added by Admin',                type: 'Credit', amount:  2000.00, balance: 2895.50 },
  { date: '15 May 2025', desc: 'Order Payment (INV-2025-0876)', type: 'Debit',  amount: -2350.00, balance:  895.50 },
  { date: '12 May 2025', desc: 'Cashback Received',             type: 'Credit', amount:   160.00, balance: 3245.50 },
  { date: '10 May 2025', desc: 'Order Payment (INV-2025-0845)', type: 'Debit',  amount: -3120.00, balance: 3085.50 },
  { date: '07 May 2025', desc: 'Added by Admin',                type: 'Credit', amount:  3000.00, balance: 6205.50 },
]

export const REMINDERS = [
  { name: 'Metformin 500mg Tablet',     dose: '1-0-1 After Meal', start: '10 May 2025', nextDue: '22 May 2025', status: 'Upcoming',  overdue: false },
  { name: 'Telmisartan 40mg Tablet',    dose: '0-0-1 Morning',    start: '08 May 2025', nextDue: '21 May 2025', status: 'Upcoming',  overdue: false },
  { name: 'Atorvastatin 10mg Tablet',   dose: '0-0-1 Night',      start: '06 May 2025', nextDue: '20 May 2025', status: 'Overdue',   overdue: true  },
  { name: 'Vitamin D3 60K Capsule',     dose: '1 Capsule Weekly', start: '01 May 2025', nextDue: '08 May 2025', status: 'Completed', overdue: false },
  { name: 'Levothyroxine 50mcg Tablet', dose: '1-0-0 Morning',    start: '10 May 2025', nextDue: '17 May 2025', status: 'Overdue',   overdue: true  },
  { name: 'Multivitamin Tablet',        dose: '1-0-1 After Meal', start: '12 May 2025', nextDue: '24 May 2025', status: 'Upcoming',  overdue: false },
  { name: 'Calcium + D3 Tablet',        dose: '1-0-1 After Meal', start: '15 May 2025', nextDue: '25 May 2025', status: 'Upcoming',  overdue: false },
]

export const MEMBERSHIP_PLANS = [
  { name: 'Silver',   duration: '6 Months', discount: '5%',  fees: 299,  color: '#64748b', active: false },
  { name: 'Gold',     duration: '1 Year',   discount: '10%', fees: 499,  color: '#d97706', active: true  },
  { name: 'Platinum', duration: '2 Years',  discount: '15%', fees: 899,  color: '#7c3aed', active: false },
  { name: 'Diamond',  duration: '3 Years',  discount: '20%', fees: 1299, color: '#2563eb', active: false },
]

export const LOYALTY_HISTORY = [
  { date: '20 May 2025', desc: 'Purchase (₹100 Spent)', points: '+1,000', balance: 24560, type: 'earn'   },
  { date: '19 May 2025', desc: 'Referrals',             points: '+150',   balance: 23560, type: 'earn'   },
  { date: '18 May 2025', desc: 'Birthday Bonus',        points: '+80',    balance: 23410, type: 'earn'   },
  { date: '17 May 2025', desc: 'Feedback / Review',     points: '+50',    balance: 23330, type: 'earn'   },
  { date: '16 May 2025', desc: 'Medicine Reminder',     points: '+30',    balance: 23280, type: 'earn'   },
  { date: '10 May 2025', desc: '₹50 Discount Coupon',   points: '-500',   balance: 23250, type: 'redeem' },
  { date: '01 May 2025', desc: 'Free Delivery Redeemed',points: '-250',   balance: 23750, type: 'redeem' },
]

export const CARECOIN_TX = [
  { date: '20 May 2025', desc: 'Purchase (INV-2025-0896)', type: 'Earned',   coins: '+150', balance: 2450 },
  { date: '18 May 2025', desc: 'Membership Discount',      type: 'Redeemed', coins: '-200', balance: 2300 },
  { date: '15 May 2025', desc: 'Purchase (INV-2025-0876)', type: 'Earned',   coins: '+100', balance: 2500 },
  { date: '14 May 2025', desc: 'Cashback Bonus',           type: 'Earned',   coins: '+80',  balance: 2400 },
  { date: '12 May 2025', desc: 'Redemption - Discount',    type: 'Redeemed', coins: '-150', balance: 2320 },
]

export const TIER_COLORS = {
  Regular:  '#6b7280',
  Silver:   '#64748b',
  Gold:     '#d97706',
  Platinum: '#7c3aed',
  Diamond:  '#2563eb',
}

export const CATEGORIES = [
  { name: 'Pain Relief',   pct: 32, color: '#0c3b73' },
  { name: 'Antibiotics',   pct: 24, color: '#7c3aed' },
  { name: 'Vitamins',      pct: 18, color: '#16a34a' },
  { name: 'Diabetes Care', pct: 12, color: '#d97706' },
  { name: 'Others',        pct: 14, color: '#9ca3af' },
]
