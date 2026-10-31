
import { useEffect, useMemo, useState } from 'react'
import { Modal, InputNumber, Button, Empty, Tag, Tooltip } from 'antd'
import {
  X,
  AlertCircle,
  CheckCircle2,
  Package,
  CalendarDays,
  IndianRupee,
  ShoppingCart,
  Clock,
  Info,
} from 'lucide-react'

const BatchSelectorModal = ({
  medicine,
  isOpen,
  onClose,
  onSelect,
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState(null)
  const [selectedQty, setSelectedQty] = useState(1)

  // Reset selection whenever modal opens or medicine changes
  useEffect(() => {
    if (isOpen) {
      setSelectedBatchId(null)
      setSelectedQty(1)
    }
  }, [isOpen, medicine])

  // Calculate batch information
  const getBatchInfo = (batch) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const expiry = new Date(batch.expiryDate)
    expiry.setHours(0, 0, 0, 0)

    const daysLeft = Math.ceil(
      (expiry - today) / (1000 * 60 * 60 * 24)
    )

    const qty = Number(
      batch.availableQty ?? batch.quantity ?? 0
    )

    return {
      daysLeft,
      qty,
      isExpired: daysLeft < 0,
      isExpiringSoon: daysLeft >= 0 && daysLeft <= 30,
    }
  }

  // Active batches sorted by earliest expiry
  const activeBatches = useMemo(() => {
    return (medicine?.batches || [])
      .filter((batch) => {
        const qty = Number(
          batch.availableQty ?? batch.quantity ?? 0
        )

        return batch.isActive && qty > 0
      })
      .sort(
        (a, b) =>
          new Date(a.expiryDate) - new Date(b.expiryDate)
      )
  }, [medicine])

  const selectedBatch = activeBatches.find(
    (batch) => batch._id === selectedBatchId
  )

  const selectedBatchInfo = selectedBatch
    ? getBatchInfo(selectedBatch)
    : null

  const maxQty = selectedBatchInfo?.qty || 0

  const handleBatchSelect = (batch) => {
    setSelectedBatchId(batch._id)
    setSelectedQty(1)
  }

  const handleSelect = () => {
    if (!selectedBatch || !selectedBatchInfo) return

    const qty = Number(selectedQty)

    if (
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > selectedBatchInfo.qty
    ) {
      return
    }

    onSelect({
      batch: selectedBatch,
      qty,
    })

    setSelectedBatchId(null)
    setSelectedQty(1)
  }

  const formatDate = (date) => {
    if (!date) return '—'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return '—'

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getExpiryTag = (info) => {
    if (info.isExpired) {
      return <Tag color="error">Expired</Tag>
    }

    if (info.isExpiringSoon) {
      return <Tag color="warning">{info.daysLeft} Days Left</Tag>
    }

    return <Tag color="success">{info.daysLeft} Days Left</Tag>
  }

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={650}
      closeIcon={<X size={18} />}
      destroyOnHidden
      title={
        <div className="flex items-center gap-3 pr-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Package size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-800">
              Select Medicine Batch
            </h3>
            <p className="truncate text-xs font-normal text-gray-500">
              {medicine?.name || 'Medicine'}
            </p>
          </div>
        </div>
      }
      styles={{
        body: {
          paddingTop: 1,
          paddingBottom: 1,
        },
      }}
    >
      <div className="space-y-4">

        {/* FIFO Information */}
        {/* <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
          <div className="mt-0.5 text-blue-600">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-blue-800">
              FIFO Method (First Expiry First Out)
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-700">
              Batches are automatically sorted by expiry date.
              The batch expiring earliest is recommended first.
            </p>
          </div>
        </div> */}

        {/* Batch Summary */}
        {/* <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-500">
              Available Batches
            </p>
            <p className="mt-1 text-xl font-bold text-gray-800">
              {activeBatches.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-500">
              Total Available Stock
            </p>
            <p className="mt-1 text-xl font-bold text-gray-800">
              {activeBatches.reduce(
                (total, batch) =>
                  total +
                  Number(batch.availableQty ?? batch.quantity ?? 0),
                0
              )}
            </p>
          </div>
        </div> */}

        {/* Batch List */}

        {/* Batch List */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">
              Available Batches
            </h2>

            {/* <span className="text-xs text-gray-500">
              {activeBatches.length} batches found
            </span> */}
          </div>

          {activeBatches.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 py-6">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No active batches available"
              />
            </div>
          ) : (
            <div className="custom-scrollbar max-h-[300px] space-y-2 pr-2">

              {activeBatches.map((batch, index) => {
                const info = getBatchInfo(batch)
                const isSelected = selectedBatchId === batch._id

                return (
                  <div
                    key={batch._id}
                    onClick={() => handleBatchSelect(batch)}
                    className={`cursor-pointer rounded-lg border p-2.5 transition-all duration-200 ${isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
                      }`}
                  >
                    {/* Batch Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${isSelected
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                          <Package size={14} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-xs font-bold text-gray-800">
                              Batch {batch.batchNo || 'N/A'}
                            </p>

                            {index === 0 && (
                              <Tag color="processing" className="!m-0 !text-[10px] !leading-4">
                                FIFO
                              </Tag>
                            )}
                          </div>

                          <p className="mt-0.5 text-[11px] text-gray-500">
                            Mfg: {formatDate(batch.purchaseDate)}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {getExpiryTag(info)}
                      </div>
                    </div>

                    {/* Batch Details */}
                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <CalendarDays size={12} />
                          Expiry
                        </div>
                        <p className="mt-0.5 text-xs font-semibold text-gray-800">
                          {formatDate(batch.expiryDate)}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Package size={12} />
                          Available
                        </div>
                        <p className="mt-0.5 text-xs font-semibold text-gray-800">
                          {info.qty} Units
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <IndianRupee size={12} />
                          MRP
                        </div>
                        <p className="mt-0.5 text-xs font-semibold text-gray-800">
                          ₹{batch.mrp ?? '—'}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <IndianRupee size={12} />
                          Purchase
                        </div>
                        <p className="mt-0.5 text-xs font-semibold text-gray-800">
                          ₹{batch.purchasePrice ?? '—'}
                        </p>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="mt-2 flex items-center gap-1.5 border-t border-blue-200 pt-1.5 text-[11px] font-semibold text-blue-600">
                        <CheckCircle2 size={13} />
                        Selected Batch
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quantity Selection */}
        {/* {selectedBatch && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-800">
                  Quantity to Sell
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Batch: {selectedBatch.batchNo}
                </p>
              </div>

              <Tag color="blue">
                {maxQty} Available
              </Tag>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <InputNumber
                min={1}
                max={maxQty}
                precision={0}
                value={selectedQty}
                onChange={(value) => setSelectedQty(value ?? 1)}
                className="w-full sm:w-40"
                size="large"
              />

              <span className="text-xs text-gray-500">
                Maximum {maxQty} units can be sold.
              </span>
            </div>
          </div>
        )} */}

        {/* Footer Actions */}
        {/* <div className="flex flex-col-reverse justify-end gap-2 border-t border-gray-200 pt-4 sm:flex-row">
          <Button
            size="large"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="primary"
            size="large"
            icon={<ShoppingCart size={16} />}
            disabled={
              !selectedBatch ||
              !Number.isInteger(Number(selectedQty)) ||
              Number(selectedQty) < 1 ||
              Number(selectedQty) > maxQty
            }
            onClick={handleSelect}
            className="w-full sm:w-auto"
          >
            Select & Continue
          </Button>
        </div> */}
      </div>
    </Modal>
  )
}

export default BatchSelectorModal
