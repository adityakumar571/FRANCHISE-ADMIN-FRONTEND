/* eslint-disable prettier/prettier */
/**
 * CustomerList — Franchise Customer Management
 * Add, view and manage customers with ledger support
 */
import { useState } from 'react'
import { Users, Plus, Eye, Edit2, Search, Phone, IndianRupee, UserCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

const MOCK_CUSTOMERS = [
  { id: 'C-001', name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@gmail.com', type: 'Regular', credit: '₹0', outstanding: '₹0', visits: 14, lastVisit: '22 Aug 2026', status: 'Active' },
  { id: 'C-002', name: 'Priya Mehta', phone: '9812345678', email: 'priya.m@gmail.com', type: 'Credit', credit: '₹5,000', outstanding: '₹1,250', visits: 28, lastVisit: '21 Aug 2026', status: 'Active' },
  { id: 'C-003', name: 'Suresh Patel', phone: '9900112233', email: '', type: 'Regular', credit: '₹0', outstanding: '₹0', visits: 5, lastVisit: '18 Aug 2026', status: 'Active' },
  { id: 'C-004', name: 'Anita Joshi', phone: '8877665544', email: 'anita@yahoo.com', type: 'Credit', credit: '₹10,000', outstanding: '₹3,800', visits: 42, lastVisit: '20 Aug 2026', status: 'Active' },
  { id: 'C-005', name: 'Vikram Singh', phone: '7766554433', email: '', type: 'Wholesale', credit: '₹25,000', outstanding: '₹8,500', visits: 8, lastVisit: '15 Aug 2026', status: 'Active' },
  { id: 'C-006', name: 'Sunita Devi', phone: '9988776655', email: '', type: 'Regular', credit: '₹0', outstanding: '₹0', visits: 3, lastVisit: '10 Aug 2026', status: 'Inactive' },
]

const CustomerFormModal = ({ customer, onClose, onSave }) => {
  const [form, setForm] = useState(customer || { name: '', phone: '', email: '', type: 'Regular', creditLimit: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 500, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{customer ? 'Edit Customer' : 'Add Customer'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Full Name *', key: 'name', placeholder: 'Customer full name' },
            { label: 'Phone Number *', key: 'phone', placeholder: '10-digit mobile number' },
            { label: 'Email', key: 'email', placeholder: 'Email address (optional)' },
            { label: 'Address', key: 'address', placeholder: 'Full address (optional)' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>
              <input
                value={form[key] || ''}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Customer Type</label>
            <select
              value={form.type}
              onChange={e => set('type', e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}
            >
              <option>Regular</option>
              <option>Credit</option>
              <option>Wholesale</option>
            </select>
          </div>

          {form.type !== 'Regular' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Credit Limit (₹)</label>
              <input
                value={form.creditLimit || ''}
                onChange={e => set('creditLimit', e.target.value)}
                placeholder="0"
                type="number"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}>Cancel</button>
          <button onClick={() => { onSave && onSave(form); onClose() }} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0c3b73', fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>
            {customer ? 'Update' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  )
}

const CustomerDetailModal = ({ customer, onClose }) => {
  if (!customer) return null
  const ledger = [
    { date: '22 Aug 2026', desc: 'Sale Invoice #SI-0048', debit: '₹850', credit: '', balance: '₹1,250' },
    { date: '20 Aug 2026', desc: 'Payment Received', debit: '', credit: '₹500', balance: '₹400' },
    { date: '18 Aug 2026', desc: 'Sale Invoice #SI-0041', debit: '₹400', credit: '', balance: '₹900' },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{customer.name}</h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9ca3af' }}>{customer.id} · {customer.type} Customer</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            ['Phone', customer.phone],
            ['Email', customer.email || 'N/A'],
            ['Total Visits', customer.visits],
            ['Last Visit', customer.lastVisit],
            ['Credit Limit', customer.credit],
            ['Outstanding', customer.outstanding],
          ].map(([label, val]) => (
            <div key={label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{label}</p>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: '#111827', fontWeight: 600 }}>{val}</p>
            </div>
          ))}
        </div>

        {customer.type !== 'Regular' && (
          <>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Ledger</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Date', 'Description', 'Debit', 'Credit', 'Balance'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb', fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ledger.map((l, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 10px', color: '#6b7280' }}>{l.date}</td>
                    <td style={{ padding: '8px 10px', color: '#374151' }}>{l.desc}</td>
                    <td style={{ padding: '8px 10px', color: '#dc2626', fontWeight: 600 }}>{l.debit}</td>
                    <td style={{ padding: '8px 10px', color: '#16a34a', fontWeight: 600 }}>{l.credit}</td>
                    <td style={{ padding: '8px 10px', color: '#111827', fontWeight: 700 }}>{l.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}>Close</button>
        </div>
      </div>
    </div>
  )
}

const CustomerList = () => {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [viewCustomer, setViewCustomer] = useState(null)
  const [editCustomer, setEditCustomer] = useState(null)
  const [filter, setFilter] = useState('All')

  const types = ['All', 'Regular', 'Credit', 'Wholesale']

  const filtered = MOCK_CUSTOMERS.filter(c =>
    (filter === 'All' || c.type === filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
  )

  const typeColor = { Regular: '#0c3b73', Credit: '#7c3aed', Wholesale: '#0891b2' }

  const columns = [
    { title: 'ID', key: 'id', width: 80, render: v => <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{v}</span> },
    {
      title: 'Customer', key: 'name', render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0c3b7318', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0c3b73', fontSize: 12 }}>
            {v[0]}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 13 }}>{v}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{row.phone}</p>
          </div>
        </div>
      )
    },
    {
      title: 'Type', key: 'type', render: v => (
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: typeColor[v] + '18', color: typeColor[v] }}>{v}</span>
      )
    },
    { title: 'Visits', key: 'visits', align: 'center', render: v => <span style={{ fontWeight: 700 }}>{v}</span> },
    { title: 'Outstanding', key: 'outstanding', align: 'right', render: v => <span style={{ color: v === '₹0' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{v}</span> },
    { title: 'Last Visit', key: 'lastVisit', render: v => <span style={{ fontSize: 12, color: '#6b7280' }}>{v}</span> },
    {
      title: 'Status', key: 'status', render: v => (
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: v === 'Active' ? '#dcfce7' : '#f3f4f6', color: v === 'Active' ? '#16a34a' : '#6b7280' }}>{v}</span>
      )
    },
    {
      title: 'Actions', key: '_a', render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setViewCustomer(row)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <Eye size={12} /> View
          </button>
          <button onClick={() => setEditCustomer(row)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <Edit2 size={12} />
          </button>
        </div>
      )
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader icon={Users} title="Customers" subtitle="Manage customer profiles and ledger accounts" color="#16a34a">
        <button onClick={() => setShowAdd(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#0c3b73', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#fff', fontWeight: 600 }}>
          <Plus size={14} /> Add Customer
        </button>
      </PageHeader>

      {/* Summary */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {[
          { label: 'Total Customers', value: MOCK_CUSTOMERS.length, color: '#0c3b73' },
          { label: 'Active', value: MOCK_CUSTOMERS.filter(c => c.status === 'Active').length, color: '#16a34a' },
          { label: 'Credit Accounts', value: MOCK_CUSTOMERS.filter(c => c.type === 'Credit').length, color: '#7c3aed' },
          { label: 'With Outstanding', value: MOCK_CUSTOMERS.filter(c => c.outstanding !== '₹0').length, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} style={{ flex: '1 1 140px', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '14px 18px' }}>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{s.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone…"
            style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: '7px 14px', borderRadius: 8, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              borderColor: filter === t ? '#0c3b73' : '#e5e7eb',
              background: filter === t ? '#0c3b73' : '#fff',
              color: filter === t ? '#fff' : '#374151',
            }}>{t}</button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} data={filtered} total={filtered.length} page={1} limit={20} />

      {showAdd && <CustomerFormModal onClose={() => setShowAdd(false)} />}
      {editCustomer && <CustomerFormModal customer={editCustomer} onClose={() => setEditCustomer(null)} />}
      {viewCustomer && <CustomerDetailModal customer={viewCustomer} onClose={() => setViewCustomer(null)} />}
    </div>
  )
}

export default CustomerList
