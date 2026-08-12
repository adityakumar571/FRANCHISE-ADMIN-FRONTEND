/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react'
import { Modal, Select, Input, DatePicker, Row, Col } from 'antd'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { getRequest, postRequest, putRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'

const { Option } = Select

/* ================= INSTALLMENT CONFIG ================= */

const INSTALLMENT_PERIODS = {
  MONTHLY: [
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
    'JANUARY',
    'FEBRUARY',
    'MARCH',
  ],
  QUARTERLY: ['APR-JUN', 'JUL-SEP', 'OCT-DEC', 'JAN-MAR'],
  CUSTOM_10: [
    'APRIL',
    'MAY-JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
    'JANUARY',
    'FEB-MARCH',
  ],
}
const getDueDateFromPeriod = (period, index) => {
  const year = dayjs().year()
  // const year = currentSession?.sessionName
  //   ? Number(currentSession.sessionName.split('-')[0])
  //   : dayjs().year()

  // MONTHLY
  if (period === 'APRIL') return dayjs(`${year}-04-15`)
  if (period === 'MAY') return dayjs(`${year}-05-15`)
  if (period === 'JUNE') return dayjs(`${year}-06-15`)
  if (period === 'JULY') return dayjs(`${year}-07-15`)
  if (period === 'AUGUST') return dayjs(`${year}-08-15`)
  if (period === 'SEPTEMBER') return dayjs(`${year}-09-15`)
  if (period === 'OCTOBER') return dayjs(`${year}-10-15`)
  if (period === 'NOVEMBER') return dayjs(`${year}-11-15`)
  if (period === 'DECEMBER') return dayjs(`${year}-12-15`)
  if (period === 'JANUARY') return dayjs(`${year + 1}-01-15`)
  if (period === 'FEBRUARY') return dayjs(`${year + 1}-02-15`)
  if (period === 'MARCH') return dayjs(`${year + 1}-03-15`)

  // QUARTERLY
  if (period === 'APR-JUN') return dayjs(`${year}-06-15`)
  if (period === 'JUL-SEP') return dayjs(`${year}-09-15`)
  if (period === 'OCT-DEC') return dayjs(`${year}-12-15`)
  if (period === 'JAN-MAR') return dayjs(`${year + 1}-03-15`)

  // CUSTOM GROUPS
  if (period === 'MAY-JUNE') return dayjs(`${year}-06-15`)
  if (period === 'FEB-MARCH') return dayjs(`${year + 1}-03-15`)

  // fallback
  return dayjs().add(index + 1, 'month')
}

const FeeStructureModal = ({ open, onClose, refresh, editData }) => {
  const { currentSession, loading: sessionLoading } = useContext(SessionContext)
  const [installmentTypes, setInstallmentTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [streams, setStreams] = useState([])

  const [formData, setFormData] = useState({
    sessionId: '',
    classId: '',
    streamId: null,
    feeHeadName: 'Tuition Fees',
    installmentType: '',
    totalAmount: '',
    remark: '',
    installments: [],
  })
  /* ================= FETCH INSTALLMENT TYPES ================= */
  useEffect(() => {
    // First ensure all 3 types exist in DB, then fetch all
    postRequest({ url: 'installment-type/seed', cred: {} })
      .catch(() => {}) // silent — seed is idempotent, ignore errors
      .finally(() => {
        getRequest('installment-type/active')
          .then((res) => {
            setInstallmentTypes(res?.data?.data || [])
          })
          .catch(() => {
            toast.error('Failed to load installment types')
          })
      })
  }, [])

  /* ================= FETCH CLASSES ================= */
  useEffect(() => {
    if (!currentSession?._id) return

    // console.log('📥 Loading classes with filters')

    const url = `classes?isPagination=false&session=${currentSession._id}`

    getRequest(url)
      .then((res) => {
        // console.log('✅ Raw classes response:', res.data.data)

        const classArray = res?.data?.data?.classes || []
        setClasses(classArray)

        // console.log('✅ Classes array set:', classArray)
      })
      .catch((err) => {
        console.error('❌ Class fetch error:', err)
      })
  }, [currentSession])

  /* ================= FETCH STREAMS ================= */

  useEffect(() => {
    if (!formData.classId) {
      setStreams([])
      return
    }

    const cls = classes.find((c) => c._id === formData.classId)

    if (!cls?.isSenior) {
      setStreams([])
      return
    }

    getRequest(`streams?classId=${formData.classId}&isPagination=false`)
      .then((res) => {
        setStreams(res?.data?.data?.streams || [])
      })
      .catch(() => toast.error('Failed to load streams'))
  }, [formData.classId, classes])

  /* ================= AUTO SESSION ================= */
  useEffect(() => {
    if (currentSession?._id) {
      setFormData((p) => ({ ...p, sessionId: currentSession._id }))
      // console.log('✅ Auto Session Set:', currentSession)
    }
  }, [currentSession])

  /* ================= EDIT MODE AUTO FILL ================= */
  useEffect(() => {
    if (!editData?.feeStructure || !installmentTypes.length) return

    const fs = editData.feeStructure

    const matchedType = installmentTypes.find(
      (t) => t._id === (fs.installmentType?._id || fs.installmentType),
    )

    setFormData({
      sessionId: fs.sessionId?._id || fs.sessionId,
      classId: fs.classId?._id || fs.classId,
      streamId: fs.streamId?._id || fs.streamId || null,
      feeHeadName: 'Tuition Fees',
      installmentType: matchedType?._id || '', // ✅ now works
      totalAmount: fs.totalAmount || '',
      remark: fs.remark || '',
      installments: (editData.installments || []).map((i) => ({
        _id: i._id,
        period: i.period,
        amount: Number(i.amount),
        dueDate: dayjs(i.dueDate).format('YYYY-MM-DD'),
      })),
    })
  }, [editData, installmentTypes])

  /* ================= CHECK SENIOR CLASS ================= */
  // const isSenior = () => {
  //   const cls = classes.find((c) => c._id === formData.classId)
  //   const num = Number(cls?.name?.match(/\d+/)?.[0])
  //   return num >= 9 && num <= 12
  // }

  const selectedClass = classes.find((c) => c._id === formData.classId)
  const isSenior = selectedClass?.isSenior || false

  /* ================= INSTALLMENT GENERATOR ================= */
  // const handleInstallmentType = (type) => {
  //   // if (editData) {
  //   //   setFormData((p) => ({ ...p, installmentType: type }))
  //   //   return
  //   // }

  //   if (!formData.totalAmount) {
  //     toast.error('Please enter total amount first')
  //     return
  //   }

  //   // 🔎 Find selected installment type object
  // const selectedType = installmentTypes.find((t) => t._id === typeId)

  // if (!selectedType) {
  //   toast.error('Invalid installment type')
  //   return
  // }

  // // ⚠ IMPORTANT:
  // // Make sure API me field ka naam kya hai:
  // // name / type / installmentName
  // const typeName = selectedType.name?.toUpperCase()

  //   const periods = INSTALLMENT_PERIODS[type] || []
  //   const total = Number(formData.totalAmount)

  //   const baseAmount = Math.floor((total / periods.length) * 100) / 100
  //   let remaining = total

  //   const installments = periods.map((p, i) => {
  //     const amount = i === periods.length - 1 ? Number(remaining.toFixed(2)) : baseAmount

  //     remaining -= amount

  //     return {
  //       period: p,
  //       amount,
  //       dueDate: getDueDateFromPeriod(p, i).format('YYYY-MM-DD'),
  //     }
  //   })

  //   setFormData((p) => ({
  //     ...p,
  //     installmentType: type,
  //     installments,
  //   }))
  // }

  const handleInstallmentType = (typeId) => {
    if (!formData.totalAmount) {
      toast.error('Please enter total amount first')
      return
    }

    // 🔎 Find selected type from API list
    const selectedType = installmentTypes.find((t) => t._id === typeId)

    if (!selectedType) {
      toast.error('Invalid installment type')
      return
    }

    // ⚠ IMPORTANT: API field check karo
    // agar field ka naam "name" hai to ye sahi hai
    const typeName = selectedType.name?.toUpperCase()

    // 👉 Ab periods typeName ke basis par aayenge
    const periods = INSTALLMENT_PERIODS[typeName] || []

    if (!periods.length) {
      toast.error('Periods not configured for this type')
      return
    }

    const total = Number(formData.totalAmount)
    const baseAmount = Math.floor((total / periods.length) * 100) / 100
    let remaining = total

    const installments = periods.map((p, i) => {
      const amount = i === periods.length - 1 ? Number(remaining.toFixed(2)) : baseAmount

      remaining -= amount

      return {
        period: p,
        amount,
        dueDate: getDueDateFromPeriod(p, i).format('YYYY-MM-DD'),
      }
    })

    setFormData((prev) => ({
      ...prev,
      installmentType: typeId, // ✅ ID save hoga backend ke liye
      installments,
    }))
  }

  /* ================= AUTO UPDATE INSTALLMENTS ON AMOUNT CHANGE ================= */
  useEffect(() => {
    if (!formData.totalAmount) return
    if (!formData.installmentType) return
    if (!formData.installments.length) return

    const total = Number(formData.totalAmount)
    const count = formData.installments.length

    const baseAmount = Math.floor((total / count) * 100) / 100
    let remaining = total

    const updated = formData.installments.map((ins, index) => {
      const amount = index === count - 1 ? Number(remaining.toFixed(2)) : baseAmount

      remaining -= amount

      return {
        ...ins, // period & dueDate SAME
        amount, // ✅ ONLY amount updated
      }
    })

    setFormData((p) => ({
      ...p,
      installments: updated,
    }))
  }, [formData.totalAmount])
  /* ================= EDIT MODE AUTO FILL (DEBUG) ================= */
  // useEffect(() => {
  //   if (!editData?.feeStructure) return

  //   const fs = editData.feeStructure

  //   console.log('🟡 RAW editData:', editData)
  //   console.log('🟢 feeStructure:', fs)
  //   console.log('🔵 installments:', editData.installments)

  //   setFormData({
  //     sessionId: fs.sessionId?._id || fs.sessionId,
  //     classId: fs.classId?._id || fs.classId,
  //     streamId: fs.streamId?._id || fs.streamId || null,
  //     feeHeadName: 'Tuition Fees', // 🔒 FIXED

  //     installmentType: fs.installmentType || '',
  //     totalAmount: fs.totalAmount || '',
  //     remark: fs.remark || '',
  //     installments: (editData.installments || []).map((i) => ({
  //       _id: i._id,
  //       period: i.period,
  //       amount: Number(i.amount),
  //       dueDate: dayjs(i.dueDate).format('YYYY-MM-DD'),
  //     })),
  //   })
  // }, [editData])

  /* ================= UPDATE INSTALLMENT ================= */
  const updateInstallment = (index, key, value) => {
    const updated = [...formData.installments]
    updated[index][key] = key === 'amount' ? Number(value) : value
    setFormData((p) => ({ ...p, installments: updated }))
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    // ── 1. Session & Class ──
    if (!formData.sessionId || !formData.classId) {
      toast.error('Session & Class required')
      return
    }

    // ── 2. Senior class → stream required ──
    if (isSenior && !formData.streamId) {
      toast.error('Stream is required for senior class')
      return
    }

    // ── 3. Total amount must be a positive number ──
    const totalAmount = Number(formData.totalAmount)
    if (!formData.totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      toast.error('Total amount must be greater than 0')
      return
    }

    // ── 4. Installment type selected ──
    if (!formData.installmentType) {
      toast.error('Please select installment type')
      return
    }

    // ── 5. Installments generated ──
    if (!formData.installments.length) {
      toast.error('Installments not generated')
      return
    }

    // ── 6. Each installment: amount > 0 ──
    const hasInvalidAmount = formData.installments.some(
      (i) => !i.amount || isNaN(Number(i.amount)) || Number(i.amount) <= 0,
    )
    if (hasInvalidAmount) {
      toast.error('Each installment amount must be greater than 0')
      return
    }

    // ── 7. Each installment: dueDate required ──
    const hasMissingDate = formData.installments.some((i) => !i.dueDate)
    if (hasMissingDate) {
      toast.error('Due date is required for all installments')
      return
    }

    // ── 8. Installment sum must match totalAmount ──
    const installmentSum = formData.installments.reduce((sum, i) => sum + Number(i.amount || 0), 0)
    if (Number(installmentSum.toFixed(2)) !== Number(totalAmount.toFixed(2))) {
      toast.error(
        `Installment total (₹${installmentSum.toFixed(2)}) does not match total amount (₹${totalAmount.toFixed(2)})`,
      )
      return
    }

    setLoading(true)
    try {
      if (editData) {
        // ✅ FIXED PUT
        await putRequest({
          url: `fee-structures/${editData.feeStructure._id}`,
          cred: formData,
        })
      } else {
        await postRequest({
          url: 'fee-structures',
          cred: formData,
        })
      }

      toast.success(
        editData
          ? 'Updated Academic Tuition Fees Successfully'
          : 'Created Academic Tuition FeesSuccessfully',
      )
      refresh()
      onClose()
    } catch (err) {
      console.error('❌ API Error:', err)
      toast.error(err?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }
  // const recalculateInstallments = () => {
  //   if (!formData.installments.length || !formData.totalAmount) {
  //     toast.error('No installments to recalculate')
  //     return
  //   }

  //   const total = Number(formData.totalAmount)
  //   const count = formData.installments.length

  //   const baseAmount = Math.floor((total / count) * 100) / 100
  //   let remaining = total

  //   const updated = formData.installments.map((ins, index) => {
  //     const amount = index === count - 1 ? Number(remaining.toFixed(2)) : baseAmount

  //     remaining -= amount

  //     return {
  //       ...ins, // ✅ period & dueDate safe
  //       amount, // ✅ only amount updated
  //     }
  //   })

  //   setFormData((p) => ({
  //     ...p,
  //     installments: updated,
  //   }))

  //   toast.success('Installments recalculated')
  // }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      title={editData ? 'Edit Academic Tuition Fees' : 'Add Academic Tuition Fees'}
      okText={editData ? 'Update' : 'Save'}
      okButtonProps={{
        className: 'px-4 py-2 border rounded',
        style: { backgroundColor: '#0c3b73', color: '#fff' },
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          Class <span className="text-red-500">*</span>
          <Select
            placeholder="Select Class"
            value={formData.classId || undefined}
            className="w-100"
            onChange={(v) => {
              const cls = classes.find((c) => c._id === v)

              setFormData((p) => ({
                ...p,
                classId: v,
                streamId: cls?.isSenior ? p.streamId : null,
              }))
            }}
          >
            {classes.map((c) => (
              <Option key={c._id} value={c._id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Col>

        {isSenior && (
          <Col span={12}>
            <label className="mt-2">
              Stream <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder="Select Stream"
              value={formData.streamId}
              className="w-100"
              onChange={(v) => setFormData((p) => ({ ...p, streamId: v }))}
            >
              {streams.map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Col>
        )}

        <Col span={12}>
          <label className="mt-2">
            Total Amount<span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter total amount"
            type="number"
            value={formData.totalAmount}
            onChange={(e) => setFormData((p) => ({ ...p, totalAmount: e.target.value }))}
          />
        </Col>

        <Col span={12}>
          <label className="mt-2">
            Installment Type<span className="text-red-500">*</span>
          </label>
          <Select
            placeholder="Select installment type"
            value={formData.installmentType || undefined}
            disabled={!formData.totalAmount}
            onChange={handleInstallmentType}
            className="w-100"
          >
            {installmentTypes.map((type) => (
              <Option key={type._id} value={type._id}>
                {type.name}
              </Option>
            ))}
          </Select>
        </Col>
        {/* 👉 Remark beside Installment Type when Stream is NOT shown */}
        {!isSenior && (
          <Col span={12}>
            <label className="mt-2">Remark</label>
            <Input.TextArea
              placeholder="Enter remark (optional)"
              value={formData.remark}
              rows={2}
              onChange={(e) => setFormData((p) => ({ ...p, remark: e.target.value }))}
            />
          </Col>
        )}
      </Row>
      {/* {formData.installments.length > 0 && (
        <Row className="mt-2 mb-1">
          <Col span={24} style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={recalculateInstallments}
              className="px-4 py-1 text-xs border rounded bg-gray-100 hover:bg-gray-200"
            >
              🔄 Refresh
            </button>
          </Col>
        </Row>
      )} */}

      {formData.installments.length > 0 && (
        <Row gutter={16} className="mt-2  font-semibold text-gray-600">
          <Col span={8}>Installment / Month</Col>
          <Col span={8}>Amount</Col>
          <Col span={8}>Due Date</Col>
        </Row>
      )}

      {formData.installments.map((ins, i) => (
        <Row gutter={16} key={i}>
          <Col span={8} className="mt-2">
            <Input value={ins.period} disabled />
          </Col>
          <Col span={8} className="mt-2">
            <Input
              placeholder="Amount"
              type="number"
              value={ins.amount}
              onChange={(e) => updateInstallment(i, 'amount', e.target.value)}
            />
          </Col>
          <Col span={8} className="mt-2">
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="DD/MM/YYYY"
              value={ins.dueDate ? dayjs(ins.dueDate) : null}
              style={{ width: '100%' }}
              onChange={(d) => updateInstallment(i, 'dueDate', d ? d.format('YYYY-MM-DD') : null)}
            />
          </Col>
        </Row>
      ))}

      {/* <label className="mt-2">Remark</label>
      <Input.TextArea
        placeholder="Enter remark (optional)"
        value={formData.remark}
        rows={2}
        onChange={(e) => setFormData((p) => ({ ...p, remark: e.target.value }))}
      /> */}
    </Modal>
  )
}

export default FeeStructureModal
