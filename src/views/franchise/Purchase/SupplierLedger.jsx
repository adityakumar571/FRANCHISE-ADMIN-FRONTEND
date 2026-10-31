
/* eslint-disable prettier/prettier */

import { useState, useEffect, useCallback } from 'react'

import {
  BookOpen,
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
  Download,
  RefreshCw,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'

import toast from 'react-hot-toast'

import PageHeader from '../components/PageHeader'

import { getRequest } from '../../../Helpers'

// Helpers
const getPayload = (res) => res?.data?.data ?? res?.data ?? res ?? {}

const formatDate = (value) => {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const Th = ({ c, align = 'left' }) => (
  <th
    style={{
      padding: '9px 12px',
      fontSize: 11,
      color: '#6b7280',
      fontWeight: 700,
      textTransform: 'uppercase',
      background: '#f9fafb',
      borderBottom: '1px solid #e5e7eb',
      textAlign: align,
      whiteSpace: 'nowrap',
    }}
  >
    {c}
  </th>
)

const Td = ({ children, style = {} }) => (
  <td
    style={{
      padding: '10px 12px',
      fontSize: 13,
      color: '#374151',
      borderBottom: '1px solid #f3f4f6',
      ...style,
    }}
  >
    {children}
  </td>
)

export default function SupplierLedger() {
  const [suppliers, setSuppliers] = useState([])
  const [summary, setSummary] = useState({})
  const [selected, setSelected] = useState(null)
  const [ledger, setLedger] = useState([])

  const [loading, setLoading] = useState(true)
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Load suppliers
  const fetchSuppliers = useCallback(async () => {
    setLoading(true)

    try {
      const res = await getRequest(
        '/franchise/purchase/supplier-ledger?page=1&limit=100'
      )

      const payload = getPayload(res)

      const supplierList = Array.isArray(payload?.suppliers)
        ? payload.suppliers
        : []

      setSuppliers(supplierList)
      setSummary(payload?.summary || {})

      console.log('Loaded suppliers:', supplierList)
      console.log('Supplier summary:', payload?.summary)
    } catch (err) {
      console.error('Failed to load suppliers:', err)
      toast.error('Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }, [refreshKey])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  // Load selected supplier ledger
  const loadLedger = useCallback(async (supplierName) => {
    setLedgerLoading(true)

    try {
      const res = await getRequest(
        `/franchise/purchase/supplier-ledger?supplierId=${encodeURIComponent(
          supplierName
        )}`
      )

      const payload = getPayload(res)

      setLedger(
        Array.isArray(payload?.ledger) ? payload.ledger : []
      )

      console.log('Loaded supplier ledger:', payload?.ledger)
    } catch (err) {
      console.error('Failed to load ledger:', err)
      toast.error('Failed to load ledger')
    } finally {
      setLedgerLoading(false)
    }
  }, [])

  const handleSelect = (supplierName) => {
    if (supplierName === selected) {
      setSelected(null)
      setLedger([])
      return
    }

    setSelected(supplierName)
    loadLedger(supplierName)
  }

  // Transaction columns
  const txnCols = [
    { title: 'Date', key: 'date' },

    {
      title: 'Type',
      key: 'type',
      render: (value) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            textTransform: 'capitalize',
          }}
        >
          {value === 'purchase' || value === 'Purchase' ? (
            <ArrowDownCircle size={12} color="#e11d48" />
          ) : (
            <ArrowUpCircle size={12} color="#16a34a" />
          )}
          {value || '—'}
        </span>
      ),
    },

    { title: 'Reference', key: 'refNo' },

    {
      title: 'Debit (₹)',
      key: 'debit',
      align: 'right',
      render: (value) =>
        Number(value || 0) > 0 ? (
          <span style={{ color: '#e11d48', fontWeight: 600 }}>
            {formatMoney(value)}
          </span>
        ) : '—',
    },

    {
      title: 'Credit (₹)',
      key: 'credit',
      align: 'right',
      render: (value) =>
        Number(value || 0) > 0 ? (
          <span style={{ color: '#16a34a', fontWeight: 600 }}>
            {formatMoney(value)}
          </span>
        ) : '—',
    },

    {
      title: 'Balance (₹)',
      key: 'balance',
      align: 'right',
      render: (value) => (
        <span style={{ fontWeight: 700 }}>
          {formatMoney(value)}
        </span>
      ),
    },
  ]

  // Export
  const handleExport = () => {
    if (!suppliers.length) {
      toast.error('No supplier data available')
      return
    }

    const headers = [
      'Supplier',
      'Total Purchase',
      'Total Returns',
      'Outstanding',
      'GRN Count',
      'Return Count',
      'Last Transaction',
    ]

    const rows = suppliers.map((item) => [
      item.supplier,
      item.totalPurchase,
      item.totalReturns,
      item.outstanding,
      item.grnCount,
      item.returnCount,
      formatDate(item.lastTxn),
    ])

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'supplier-ledger.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div
      style={{
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {/* Header */}
      <PageHeader
        icon={BookOpen}
        title="Supplier Ledger"
        subtitle="Outstanding dues and transaction history per supplier"
        color="#0891b2"
      >
        <button
          onClick={() => setRefreshKey((key) => key + 1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: '#fff',
            color: '#374151',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </PageHeader>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          {
            label: 'Total Outstanding',
            value: formatMoney(summary.totalOutstanding),
            color: '#e11d48',
          },
          {
            label: 'Total Purchase',
            value: formatMoney(summary.totalPurchase),
            color: '#0891b2',
          },
          {
            label: 'Total Returns',
            value: formatMoney(summary.totalReturns),
            color: '#16a34a',
          },
          {
            label: 'Suppliers',
            value: summary.totalSuppliers || 0,
            color: '#0c3b73',
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: '#fff',
              borderRadius: 10,
              padding: '16px 20px',
              border: `1px solid ${item.color}30`,
              borderLeft: `4px solid ${item.color}`,
              minWidth: 160,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: '#9ca3af',
                margin: '0 0 4px',
              }}
            >
              {item.label}
            </p>

            <p
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
                color: '#111827',
              }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Supplier List */}
      {loading ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 10,
            padding: 30,
            textAlign: 'center',
            color: '#9ca3af',
          }}
        >
          Loading suppliers...
        </div>
      ) : (
        <div
          style={{
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 950,
              }}
            >
              <thead>
                <tr>
                  <Th c="Supplier" />
                  <Th c="Total Purchase" align="right" />
                  <Th c="Total Returns" align="right" />
                  <Th c="Outstanding" align="right" />
                  <Th c="GRN Count" align="center" />
                  <Th c="Return Count" align="center" />
                  <Th c="Last Transaction" />
                  <Th c="Status" align="center" />
                  <Th c="Action" align="center" />
                </tr>
              </thead>

              <tbody>
                {suppliers.map((s, index) => {
                  const supplierName = s.supplier
                  const outstanding = Number(s.outstanding || 0)

                  return (
                    <tr
                      key={supplierName || index}
                      style={{
                        background:
                          supplierName === selected ? '#eff6ff' : '#fff',
                      }}
                    >
                      <Td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: '#0c3b73',
                          }}
                        >
                          {supplierName || '—'}
                        </span>
                      </Td>

                      <Td style={{ textAlign: 'right' }}>
                        {formatMoney(s.totalPurchase)}
                      </Td>

                      <Td
                        style={{
                          textAlign: 'right',
                          color: '#16a34a',
                        }}
                      >
                        {formatMoney(s.totalReturns)}
                      </Td>

                      <Td
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          color: outstanding > 0 ? '#e11d48' : '#16a34a',
                        }}
                      >
                        {formatMoney(s.outstanding)}
                      </Td>

                      <Td style={{ textAlign: 'center' }}>
                        {s.grnCount ?? 0}
                      </Td>

                      <Td style={{ textAlign: 'center' }}>
                        {s.returnCount ?? 0}
                      </Td>

                      {/* Last transaction */}
                      <Td style={{ whiteSpace: 'nowrap' }}>
                        {formatDate(s.lastTxn)}
                      </Td>

                      <Td style={{ textAlign: 'center' }}>
                        {outstanding > 0 ? (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#e11d48',
                              background: '#fff1f2',
                              padding: '3px 9px',
                              borderRadius: 20,
                            }}
                          >
                            DUE
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#16a34a',
                              background: '#f0fdf4',
                              padding: '3px 9px',
                              borderRadius: 20,
                            }}
                          >
                            CLEAR
                          </span>
                        )}
                      </Td>

                      <Td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleSelect(supplierName)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '5px 10px',
                            borderRadius: 6,
                            border: '1px solid #e5e7eb',
                            background: '#fff',
                            color: '#0c3b73',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Eye size={13} />
                          {selected === supplierName ? 'Hide' : 'View'}
                        </button>
                      </Td>
                    </tr>
                  )
                })}

                {suppliers.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: 35,
                        textAlign: 'center',
                        color: '#9ca3af',
                      }}
                    >
                      <AlertCircle
                        size={28}
                        style={{ margin: '0 auto 10px' }}
                      />
                      No supplier ledger data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Supplier Transactions */}
      {selected && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                margin: 0,
                color: '#111827',
              }}
            >
              Transactions — {selected}
            </h3>

            <button
              onClick={handleExport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 12px',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                background: '#f9fafb',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                color: '#374151',
              }}
            >
              <Download size={12} /> Export
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 750,
              }}
            >
              <thead>
                <tr>
                  {txnCols.map((column) => (
                    <Th
                      key={column.key}
                      c={column.title}
                      align={column.align}
                    />
                  ))}
                </tr>
              </thead>

              <tbody>
                {ledgerLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: 30,
                        textAlign: 'center',
                        color: '#9ca3af',
                      }}
                    >
                      Loading transactions...
                    </td>
                  </tr>
                ) : ledger.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: 32,
                        textAlign: 'center',
                        color: '#9ca3af',
                      }}
                    >
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  ledger.map((row, index) => (
                    <tr key={row._id || row.refNo || index}>
                      {txnCols.map((column) => {
                        let value = row[column.key]

                        if (column.key === 'date') {
                          value = formatDate(
                            row.date ||
                            row.createdAt ||
                            row.transactionDate
                          )
                        }

                        return (
                          <Td
                            key={column.key}
                            style={{
                              textAlign: column.align || 'left',
                            }}
                          >
                            {column.render
                              ? column.render(value)
                              : value || '—'}
                          </Td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
