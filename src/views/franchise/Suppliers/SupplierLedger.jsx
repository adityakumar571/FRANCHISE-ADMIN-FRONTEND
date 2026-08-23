/* eslint-disable prettier/prettier */
/**
 * Screen 61 — Supplier Ledger
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BookMarked, ArrowLeft, Download, Filter } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { SUPPLIERS, SUPPLIER_LEDGER } from './supplierMockData'

const Th = ({ c, align = 'left' }) => <th style={{ padding: '9px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

export default function SupplierLedger() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const sup       = SUPPLIERS.find(s => s.id === id) || SUPPLIERS[0]
  const [from, setFrom] = useState('2025-01-09')
  const [to, setTo]     = useState('2025-05-20')

  const totalDebit    = SUPPLIER_LEDGER.reduce((s,r) => s + (r.debit || 0), 0)
  const totalCredit   = SUPPLIER_LEDGER.reduce((s,r) => s + (r.credit || 0), 0)
  const openingBal    = 125000.00
  const currentBal    = SUPPLIER_LEDGER[SUPPLIER_LEDGER.length - 1]?.balance || 0

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={BookMarked} title="Supplier Ledger" subtitle="Detailed ledger of supplier transactions" color="#7c3aed">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, outline: 'none' }} />
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, background: '#fff', cursor: 'pointer' }}><Download size={12} /> Export</button>
        </div>
        <button onClick={() => navigate('/franchise/suppliers')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <ArrowLeft size={13} /> Back
        </button>
      </PageHeader>

      {/* Supplier Card */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#d97706', flexShrink: 0 }}>
          {sup.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{sup.name}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>{sup.id}</p>
        </div>
        {[
          { label: 'Opening Balance', value: `₹${openingBal.toLocaleString('en-IN',{minimumFractionDigits:2})}`, color: '#0c3b73' },
          { label: 'Total Purchase',  value: `₹${totalCredit.toLocaleString('en-IN',{minimumFractionDigits:2})}`, color: '#7c3aed' },
          { label: 'Total Payments',  value: `₹${totalDebit.toLocaleString('en-IN',{minimumFractionDigits:2})}`,  color: '#16a34a' },
          { label: 'Current Balance', value: `₹${currentBal.toLocaleString('en-IN',{minimumFractionDigits:2})}`, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} style={{ padding: '10px 20px', background: '#f9fafb', borderRadius: 10, textAlign: 'center', minWidth: 130 }}>
            <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Ledger Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th c="Date" /><Th c="Ref. No." /><Th c="Type" /><Th c="Particulars" />
              <Th c="Debit (₹)" align="right" /><Th c="Credit (₹)" align="right" /><Th c="Balance (₹)" align="right" />
            </tr></thead>
            <tbody>
              {SUPPLIER_LEDGER.map((r, i) => (
                <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.date}</Td>
                  <Td><span style={{ fontFamily: 'monospace', fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>{r.refNo}</span></Td>
                  <Td>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: r.type.includes('Payment')?'#dcfce7':r.type.includes('Opening')?'#e0e7ff':'#fffbeb', color: r.type.includes('Payment')?'#16a34a':r.type.includes('Opening')?'#0c3b73':'#d97706' }}>
                      {r.type}
                    </span>
                  </Td>
                  <Td style={{ color: '#6b7280', fontSize: 12 }}>{r.particulars}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600, color: r.debit ? '#dc2626' : '#9ca3af' }}>
                    {r.debit ? `₹${r.debit.toLocaleString('en-IN',{minimumFractionDigits:2})}` : '—'}
                  </Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600, color: r.credit ? '#16a34a' : '#9ca3af' }}>
                    {r.credit ? `₹${r.credit.toLocaleString('en-IN',{minimumFractionDigits:2})}` : '—'}
                  </Td>
                  <Td style={{ textAlign: 'right', fontWeight: 700, color: '#0c3b73' }}>
                    ₹{r.balance.toLocaleString('en-IN',{minimumFractionDigits:2})}
                  </Td>
                </tr>
              ))}
              <tr style={{ background: '#f9fafb', borderTop: '2px solid #0c3b73' }}>
                <Td style={{ fontWeight: 800 }} colSpan={4}>Total</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>₹{totalDebit.toLocaleString('en-IN',{minimumFractionDigits:2})}</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>₹{totalCredit.toLocaleString('en-IN',{minimumFractionDigits:2})}</Td>
                <Td style={{ textAlign: 'right', fontWeight: 800, color: '#0c3b73' }}>₹{currentBal.toLocaleString('en-IN',{minimumFractionDigits:2})}</Td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
