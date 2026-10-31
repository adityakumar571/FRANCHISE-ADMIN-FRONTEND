/* eslint-disable prettier/prettier */

import { useState, useEffect, useRef } from 'react'
import { RotateCcw, Plus, Trash2, Save } from 'lucide-react'
import { Select, Spin, Empty, Badge, Input, Table, Button } from 'antd'
import toast from 'react-hot-toast'

import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { getRequest, postRequest } from '../../../Helpers'

const EMPTY_ITEM = {
  medicineId: '',
  medicineName: '',
  batchNo: '',
  batchId: '',
  qty: 1,
  ptr: '',
  mrp: '',
  reason: 'damaged',
  note: '',
  availableBatches: [],
}

const cellInputClass =
  'box-border h-[30px] rounded-[5px] border border-gray-200 bg-[#fafafa] px-[7px] text-[12px] outline-none transition focus:border-blue-400 focus:bg-white'

// ======================================================
// MEDICINE SEARCH COMPONENT
// ======================================================

function MedicineCell({ value, item, onSelect }) {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const timerRef = useRef(null)

  // SEARCH MEDICINE API
  const handleSearch = (searchValue) => {
    setSearchText(searchValue)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    if (searchValue.trim().length < 2) {
      setMedicines([])
      setLoading(false)
      return
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true)

      try {
        const res = await getRequest(
          `/franchise/medicines?search=${encodeURIComponent(searchValue)}&limit=10`
        )

        setMedicines(
          res.data?.data?.medicines || []
        )
      } catch (err) {
        console.error('Search error:', err)
        setMedicines([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  // SELECT MEDICINE
  const handleSelect = (medicineId) => {
    const med = medicines.find(
      (medicine) => medicine._id === medicineId
    )

    if (!med) return

    const activeBatches = (med.batches || []).filter(
      (batch) =>
        batch.isActive &&
        (batch.availableQty || batch.quantity) > 0
    )

    onSelect({
      medicineId: med._id,
      medicineName: med.name,
      availableBatches: activeBatches,
      batchNo: '',
      batchId: '',
    })

    setSearchText('')
    setMedicines([])
  }

  // ANT DESIGN DROPDOWN OPTIONS
  const options = medicines.map((med) => {
    const activeBatches = (med.batches || []).filter(
      (batch) =>
        batch.isActive &&
        (batch.availableQty || batch.quantity) > 0
    )

    return {
      value: med._id,

      label: (
        <div className="flex w-full items-center justify-between gap-3 py-1">

          <div className="min-w-0">

            <div className="truncate text-[13px] font-semibold text-gray-900">
              {med.name}
            </div>

            <div className="mt-0.5 text-[11px] text-gray-400">
              {med.company || 'N/A'} · Stock: {med.currentStock}
            </div>

          </div>

          <Badge
            count={activeBatches.length}
            color={
              activeBatches.length > 0
                ? '#10b981'
                : '#ef4444'
            }
            className="shrink-0"
            style={{
              fontSize: 10,
              fontWeight: 600,
            }}
          />

        </div>
      ),
    }
  })

  const selectedMedicine = item?.medicineName || ''

  return (
    <Select
      showSearch
      allowClear
      value={item?.medicineName || undefined}
      searchValue={searchText}
      onSearch={handleSearch}
      onSelect={handleSelect}
      onClear={() => {
        setSearchText('')
        setMedicines([])
        onSelect({ ...EMPTY_ITEM })
      }}
      placeholder="Search medicine..."
      options={options}
      loading={loading}
      filterOption={false}
      notFoundContent={
        loading ? (
          <div className="py-5 text-center">
            <Spin size="small" />
          </div>
        ) : searchText.trim().length > 0 ? (
          <Empty
            description="No medicines found"
            className="my-5"
          />
        ) : (
          <Empty
            description="Type to search..."
            className="my-5"
          />
        )
      }
      className="med-select-table"
      size="large"
      optionLabelProp="label"
      maxTagTextLength={30}
      popupMatchSelectWidth={false}
      style={{
        width: '100%',
        minWidth: 0,
        fontSize: 13,
        height: 38,
      }}
    />
  )
}

// ======================================================
// PURCHASE RETURNS COMPONENT
// ======================================================

const PurchaseReturns = () => {
  const [tab, setTab] = useState('list')

  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [items, setItems] = useState([
    { ...EMPTY_ITEM },
  ])

  // ======================================================
  // FETCH PURCHASE RETURNS
  // ======================================================

  const fetchReturns = async () => {
    setLoading(true)

    try {
      const res = await getRequest(
        '/franchise/purchase/returns'
      )

      setReturns(
        res.data?.data?.returns || []
      )
    } catch {
      toast.error('Failed to load purchase returns')
    } finally {
      setLoading(false)
    }
  }

  // ======================================================
  // FETCH SUPPLIERS
  // ======================================================

  useEffect(() => {
    fetchReturns()
  }, [])

  // ======================================================
  // ITEM FUNCTIONS
  // ======================================================

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { ...EMPTY_ITEM },
    ])
  }

  const delItem = (index) => {
    setItems((prev) =>
      prev.filter((_, idx) => idx !== index)
    )
  }

  const setItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
            ...item,
            [field]: value,
          }
          : item
      )
    )
  }

  const setMedForRow = (index, medData) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
            ...item,
            ...medData,
            batchNo: '',
            batchId: '',
          }
          : item
      )
    )
  }

  // ======================================================
  // SAVE PURCHASE RETURN
  // ======================================================

  const handleSave = async (event) => {
    event.preventDefault()

    const validItems = items.filter(
      (item) =>
        item.medicineName &&
        item.medicineId
    )

    if (!validItems.length) {
      toast.error(
        'Add at least one medicine to return'
      )
      return
    }

    const invalidItems = validItems.filter(
      (item) =>
        !item.qty ||
        item.qty < 1 ||
        !item.batchNo
    )

    if (invalidItems.length > 0) {
      toast.error(
        'All items must have: valid quantity (> 0) AND selected batch'
      )
      return
    }

    // Get supplier from first batch
    const firstBatch = validItems[0]?.availableBatches?.find(
      (b) => b.batchNo === validItems[0].batchNo
    )
    const supplierName = firstBatch?.supplierName || 'Unknown Supplier'

    setSaving(true)

    try {
      await postRequest({
        url: '/franchise/purchase/returns',

        cred: {
          supplier: supplierName,

          items: validItems.map((item) => ({
            medicineId: item.medicineId,
            medicineName: item.medicineName,
            batchNo: item.batchNo,
            batchId: item.batchId || '',
            qty: Number(item.qty),
            ptr: Number(item.ptr || 0),
            mrp: Number(item.mrp || 0),
            reason: item.reason,
            note: item.note || '',
          })),
        },
      })

      toast.success(
        '✅ Purchase return submitted successfully'
      )

      setTab('list')
      setItems([{ ...EMPTY_ITEM }])

      fetchReturns()
    } catch (err) {
      console.error(
        'Return submission error:',
        err
      )

      toast.error(
        err?.response?.data?.message ||
        'Failed to submit return'
      )
    } finally {
      setSaving(false)
    }
  }

  // ======================================================
  // TABLE COLUMNS
  // ======================================================

  const columns = [
    {
      title: 'Return No.',
      key: 'returnNo',

      render: (value) => (
        <span className="font-bold text-amber-600">
          {value}
        </span>
      ),
    },

    // {
    //   title: 'GRN Ref.',
    //   key: 'grnRef',
    // },

    {
      title: 'Supplier',
      key: 'supplier',
    },

    {
      title: 'Reason',
      key: 'reason',
    },

    {
      title: 'Items',
      key: 'items',
      align: 'center',
    },

    {
      title: 'Date',
      key: 'date',
    },

    {
      title: 'Status',
      key: 'status',

      render: (value) => (
        <StatusBadge status={value} />
      ),
    },
  ]

  // ======================================================
  // UI
  // ======================================================

  return (
    <div>

      <PageHeader
        icon={RotateCcw}
        title="Purchase Returns"
        subtitle="Return damaged, incorrect or expired stock to suppliers"
        color="#d97706"
      >
        <button
          onClick={() =>
            setTab(
              tab === 'list'
                ? 'new'
                : 'list'
            )
          }
          className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-0 px-4 py-2 text-[13px] font-semibold ${tab === 'new'
            ? 'bg-gray-200 text-gray-700'
            : 'bg-[#0c3b73] text-white'
            }`}
        >
          {tab === 'new' ? (
            '← Back to List'
          ) : (
            <>
              <Plus size={14} />
              New Return
            </>
          )}
        </button>
      </PageHeader>

      {/* PURCHASE RETURN LIST */}

      {tab === 'list' ? (

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

          <div className="overflow-x-auto">

            <table className="w-full border-collapse">

              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">

                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`whitespace-nowrap px-[14px] py-[10px] text-[12px] font-semibold text-gray-700 ${column.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                        }`}
                    >
                      {column.title}
                    </th>
                  ))}

                </tr>
              </thead>

              <tbody>

                {loading ? (

                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={index}>

                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className="px-[14px] py-[10px]"
                          >
                            <div className="h-[13px] rounded bg-gray-100" />
                          </td>
                        ))}

                      </tr>
                    ))

                ) : returns.length === 0 ? (

                  <tr>
                    <td
                      colSpan={columns.length}
                      className="p-10 text-center text-gray-400"
                    >
                      No purchase returns found
                    </td>
                  </tr>

                ) : (

                  returns.map((row, index) => (
                    <tr
                      key={row._id || index}
                      className="hover:bg-[#fafafa]"
                    >

                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-[14px] py-[10px] align-middle text-gray-700 ${column.align === 'center'
                            ? 'text-center'
                            : ''
                            }`}
                        >
                          {column.render
                            ? column.render(
                              row[column.key],
                              row,
                              index
                            )
                            : row[column.key] ?? '—'}
                        </td>
                      ))}

                    </tr>
                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          {/* NEW PURCHASE RETURN FORM */}
          <h3 className="mb-5 mt-0 text-[15px] font-bold">
            New Purchase Return
          </h3>

          <form onSubmit={handleSave}>

            {/* MEDICINE TABLE */}

            <div className="mb-4">
              <Table
                dataSource={items.map((item, idx) => ({
                  ...item,
                  key: idx,
                }))}
                columns={[
                  {
                    title: 'Medicine *',
                    dataIndex: 'medicineId',
                    key: 'medicine',
                    width: 200,
                    render: (_, record, index) => (
                      <MedicineCell
                        value={record.medicineId}
                        item={record}
                        onSelect={(medicine) =>
                          setMedForRow(index, medicine)
                        }
                      />
                    ),
                  },
                  {
                    title: 'Batch No.',
                    dataIndex: 'batchNo',
                    key: 'batch',
                    width: 150,
                    render: (_, record, index) => {
                      if (
                        record.availableBatches?.length >
                        0
                      ) {
                        return (
                          <Select
                            value={
                              record.batchNo ||
                              undefined
                            }
                            onChange={(value) => {
                              const selectedBatch =
                                record.availableBatches.find(
                                  (batch) =>
                                    batch.batchNo ===
                                    value
                                )

                              setItem(
                                index,
                                'batchNo',
                                value
                              )

                              setItem(
                                index,
                                'batchId',
                                selectedBatch?._id ||
                                ''
                              )

                              setItem(
                                index,
                                'mrp',
                                selectedBatch?.mrp ||
                                record.mrp
                              )

                              setItem(
                                index,
                                'ptr',
                                selectedBatch?.purchasePrice ||
                                record.ptr
                              )
                            }}
                            placeholder="Select..."
                            size="medium"
                            style={{ width: '100%' }}
                            options={record.availableBatches.map(
                              (batch) => {
                                const daysLeft =
                                  Math.ceil(
                                    (new Date(
                                      batch.expiryDate
                                    ) -
                                      new Date()) /
                                    (1000 * 60 * 60 * 24)
                                  )

                                const expirySoon =
                                  daysLeft < 30 &&
                                  daysLeft >= 0

                                return {
                                  value: batch.batchNo,
                                  label: `${batch.batchNo} (${batch.availableQty || batch.quantity}) ${expirySoon ? '⚠️ Soon' : ''}`,
                                }
                              }
                            )}
                            popupMatchSelectWidth={
                              false
                            }
                          />
                        )
                      } else {
                        return (
                          <span className="text-gray-400">
                            No batches
                          </span>
                        )
                      }
                    },
                  },
                  {
                    title: 'Qty *',
                    dataIndex: 'qty',
                    key: 'qty',
                    width: 80,
                    render: (_, record, index) => (
                      <Input
                        type="number"
                        min={1}
                        value={record.qty}
                        onChange={(event) =>
                          setItem(
                            index,
                            'qty',
                            event.target.value
                          )
                        }
                        size="small"
                        style={{ width: '100%' }}
                      />
                    ),
                  },
                  {
                    title: 'PTR (₹)',
                    dataIndex: 'ptr',
                    key: 'ptr',
                    width: 90,
                    render: (_, record, index) => (
                      <Input
                        type="number"
                        step="0.01"
                        value={record.ptr}
                        onChange={(event) =>
                          setItem(
                            index,
                            'ptr',
                            event.target.value
                          )
                        }
                        placeholder="0.00"
                        size="small"
                        style={{ width: '100%' }}
                      />
                    ),
                  },
                  {
                    title: 'MRP (₹)',
                    dataIndex: 'mrp',
                    key: 'mrp',
                    width: 90,
                    render: (_, record, index) => (
                      <Input
                        type="number"
                        step="0.01"
                        value={record.mrp}
                        onChange={(event) =>
                          setItem(
                            index,
                            'mrp',
                            event.target.value
                          )
                        }
                        placeholder="0.00"
                        size="small"
                        style={{ width: '100%' }}
                      />
                    ),
                  },
                  {
                    title: 'Reason *',
                    dataIndex: 'reason',
                    key: 'reason',
                    width: 120,
                    render: (_, record, index) => (
                      <Select
                        value={record.reason}
                        onChange={(value) =>
                          setItem(index, 'reason', value)
                        }
                        size="small"
                        style={{ width: '100%' }}
                        options={[
                          {
                            value: 'damaged',
                            label: 'Damaged',
                          },
                          {
                            value: 'expired',
                            label: 'Expired',
                          },
                          {
                            value: 'near_expiry',
                            label: 'Near Expiry',
                          },
                          {
                            value: 'incorrect',
                            label: 'Incorrect',
                          },
                          {
                            value: 'quality',
                            label: 'Quality Issue',
                          },
                          {
                            value: 'other',
                            label: 'Other',
                          },
                        ]}
                        popupMatchSelectWidth={
                          false
                        }
                      />
                    ),
                  },
                  {
                    title: 'Note',
                    dataIndex: 'note',
                    key: 'note',
                    width: 140,
                    render: (_, record, index) => (
                      <Input
                        value={record.note || ''}
                        onChange={(event) =>
                          setItem(
                            index,
                            'note',
                            event.target.value
                          )
                        }
                        placeholder="Optional"
                        size="small"
                        style={{ width: '100%' }}
                      />
                    ),
                  },
                  {
                    title: 'Action',
                    key: 'action',
                    width: 50,
                    render: (_, record, index) => (
                      items.length > 1 && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          onClick={() =>
                            delItem(index)
                          }
                          icon={
                            <Trash2 size={14} />
                          }
                        />
                      )
                    ),
                  },
                ]}
                pagination={false}
                size="small"
                bordered
                scroll={{ x: 1000 }}
                style={{
                  fontSize: 13,
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
            </div>

            {/* ADD ITEM */}

            <button
              type="button"
              onClick={addItem}
              className="mb-4 flex cursor-pointer items-center gap-1 rounded-md border border-[#d9780640] bg-[#d9780610] px-3 py-[5px] text-[12px] font-semibold text-amber-600"
            >
              <Plus size={13} />
              Add Item
            </button>

            {/* ACTION BUTTONS */}

            <div className="flex justify-end gap-[10px]">

              <button
                type="button"
                onClick={() => setTab('list')}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-[9px] text-[13px] font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-0 px-[22px] py-[9px] text-[13px] font-bold text-white ${saving
                  ? 'bg-amber-200'
                  : 'bg-amber-600'
                  }`}
              >
                <Save size={14} />

                {saving
                  ? 'Submitting...'
                  : 'Submit Return'}
              </button>

            </div>

          </form>
        </div>
      )}
    </div>
  )
}

export default PurchaseReturns