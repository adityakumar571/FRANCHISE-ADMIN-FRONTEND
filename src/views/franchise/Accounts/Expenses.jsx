/* eslint-disable prettier/prettier */
/**
 * Screen 89 — Expenses
 */
import { useState } from 'react'
import { TrendingDown, Download, Filter, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { EXPENSES_LIST, EXPENSE_CATEGORIES } from './accountsMockData'

const Th = ({ c, align = 'left' }) => (
  <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: align, whiteSpace: 'nowrap' }}>{c}</th>
)
const Td = ({ children, style = {} }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>
)

export default function Expenses() {
  const total = EXPENSES_LIST.reduce((s, e) => s + e.amount, 0)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader icon={TrendingDown} title="Expenses" subtitle="All expense transactions" color="#dc2626">
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#0c3b73', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          <Plus size={13} /> Add Expense
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}><Filter size={12} /> Filter</button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}><Download size={12} /> Export</button>
      </PageHeader>

      {/* Total Card */}
      <div style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', borderRadius: 14, padding: '20px 24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 1 }}>Total Expenses</p>
          <p style={{ margin: '6px 0 0', fontSize: 34, fontWeight: 900, letterSpacing: -1 }}>₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        <TrendingDown size={48} style={{ opacity: 0.3 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Categories */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>Top Expense Categories</p>

          {/* Donut */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: 120, height: 120 }}>
                {EXPENSE_CATEGORIES.reduce((acc, c) => {
                  acc.els.push(
                    <circle key={c.label} cx="18" cy="18" r="15.9155" fill="transparent"
                      stroke={c.color} strokeWidth="3.5"
                      strokeDasharray={`${c.value} ${100 - c.value}`}
                      strokeDashoffset={`-${acc.off}`} />
                  )
                  acc.off += c.value
                  return acc
                }, { els: [], off: 0 }).els}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>100%</span>
              </div>
            </div>
          </div>

          {EXPENSE_CATEGORIES.map(c => (
            <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f9fafb', fontSize: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }} />
                {c.label}
              </span>
              <span style={{ fontWeight: 700, color: c.color }}>{c.value}%</span>
            </div>
          ))}
        </div>

        {/* Expense List */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Expense List</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <Th c="Date" /><Th c="Particulars" /><Th c="Category" /><Th c="Amount (₹)" align="right" />
              </tr></thead>
              <tbody>
                {EXPENSES_LIST.map((e, i) => (
                  <tr key={i} onMouseEnter={ev => ev.currentTarget.style.background = '#fafafa'} onMouseLeave={ev => ev.currentTarget.style.background = ''}>
                    <Td style={{ color: '#6b7280', fontSize: 12 }}>{e.date}</Td>
                    <Td style={{ fontWeight: 600 }}>{e.particulars}</Td>
                    <Td>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>{e.category}</span>
                    </Td>
                    <Td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>₹ {e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                  </tr>
                ))}
                <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                  <Td style={{ fontWeight: 800 }} colSpan={3}>Total</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626', fontSize: 15 }}>₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
