/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useState } from 'react'
import { Modal, Select, Input, DatePicker, Row, Col } from 'antd'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { getRequest, postRequest, putRequest } from '../../../../../Helpers'
import { SessionContext } from '../../../../../Context/Seesion'

const { Option } = Select

// const PERIODS = [
//   'APRIL',
//   'MAY',
//   'JUNE',
//   'JULY',
//   'AUGUST',
//   'SEPTEMBER',
//   'OCTOBER',
//   'NOVEMBER',
//   'DECEMBER',
//   'JANUARY',
//   'FEBRUARY',
//   'MARCH',
// ]


// const convertToQuarter = (month) => {
//   const map = {
//     APRIL: 'APR-JUN',
//     MAY: 'APR-JUN',
//     JUNE: 'APR-JUN',

//     JULY: 'JUL-SEP',
//     AUGUST: 'JUL-SEP',
//     SEPTEMBER: 'JUL-SEP',

//     OCTOBER: 'OCT-DEC',
//     NOVEMBER: 'OCT-DEC',
//     DECEMBER: 'OCT-DEC',

//     JANUARY: 'JAN-MAR',
//     FEBRUARY: 'JAN-MAR',
//     MARCH: 'JAN-MAR',
//   }

//   return map[month] || month
// }

const INSTALLMENT_PERIODS = {
  MONTHLY: [
    'APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER',
    'OCTOBER','NOVEMBER','DECEMBER',
    'JANUARY','FEBRUARY','MARCH',
  ],
  QUARTERLY: ['APR-JUN', 'JUL-SEP', 'OCT-DEC', 'JAN-MAR'],
  CUSTOM_10: [
    'APRIL','MAY-JUNE','JULY','AUGUST','SEPTEMBER',
    'OCTOBER','NOVEMBER','DECEMBER',
    'JANUARY','FEB-MARCH',
  ],
}

const AdditionalFeesModal = ({ open, onClose, refresh, editData }) => {
  const { currentSession } = useContext(SessionContext)
const getDueDateFromPeriod = (period) => {
  const sessionName = currentSession?.name || "2026-27"
  const startYear = Number(sessionName.split('-')[0])
  const endYear = startYear + 1

  if (period === 'APRIL') return dayjs(`${startYear}-04-15`)
  if (period === 'MAY') return dayjs(`${startYear}-05-15`)
  if (period === 'JUNE') return dayjs(`${startYear}-06-15`)
  if (period === 'JULY') return dayjs(`${startYear}-07-15`)
  if (period === 'AUGUST') return dayjs(`${startYear}-08-15`)
  if (period === 'SEPTEMBER') return dayjs(`${startYear}-09-15`)
  if (period === 'OCTOBER') return dayjs(`${startYear}-10-15`)
  if (period === 'NOVEMBER') return dayjs(`${startYear}-11-15`)
  if (period === 'DECEMBER') return dayjs(`${startYear}-12-15`)
  if (period === 'JANUARY') return dayjs(`${endYear}-01-15`)
  if (period === 'FEBRUARY') return dayjs(`${endYear}-02-15`)
  if (period === 'MARCH') return dayjs(`${endYear}-03-15`)

  // QUARTERLY
  if (period === 'APR-JUN') return dayjs(`${startYear}-06-15`)
  if (period === 'JUL-SEP') return dayjs(`${startYear}-09-15`)
  if (period === 'OCT-DEC') return dayjs(`${startYear}-12-15`)
  if (period === 'JAN-MAR') return dayjs(`${endYear}-03-15`)

  // CUSTOM
  if (period === 'MAY-JUNE') return dayjs(`${startYear}-06-15`)
  if (period === 'FEB-MARCH') return dayjs(`${endYear}-03-15`)

  return null
}

// const getSessionYearByPeriod = (period) => {
//   if (!period) return null

//   const monthMap = {
//     APRIL: 3,
//     MAY: 4,
//     JUNE: 5,
//     JULY: 6,
//     AUGUST: 7,
//     SEPTEMBER: 8,
//     OCTOBER: 9,
//     NOVEMBER: 10,
//     DECEMBER: 11,
//     JANUARY: 0,
//     FEBRUARY: 1,
//     MARCH: 2,
//   }

//   // 🔥 Fallback if session not loaded
//   const sessionName = currentSession?.name || "2026-27"

//   const startYear = Number(sessionName.split('-')[0])
//   const endYear = startYear + 1

//   const year =
//     ['JANUARY', 'FEBRUARY', 'MARCH'].includes(period)
//       ? endYear
//       : startYear

//   return dayjs(new Date(year, monthMap[period], 15))
// }

// const getSessionYearByPeriod = (period) => {
//   if (!period) return null

//   const monthMap = {
//     APRIL: 3,
//     MAY: 4,
//     JUNE: 5,
//     JULY: 6,
//     AUGUST: 7,
//     SEPTEMBER: 8,
//     OCTOBER: 9,
//     NOVEMBER: 10,
//     DECEMBER: 11,
//     JANUARY: 0,
//     FEBRUARY: 1,
//     MARCH: 2,
//   }

//   const sessionName = currentSession?.name || "2026-27"
//   const startYear = Number(sessionName.split('-')[0])
//   const endYear = startYear + 1

//   // 🔥 DASH HANDLE KARNE KE LIYE (APR-JUN, MAY-JUNE, etc.)
//   let firstMonth = period

//   if (period.includes('-')) {
//     firstMonth = period.split('-')[0]
//   }

//   const monthIndex = monthMap[firstMonth]

//   if (monthIndex === undefined) return null

//   const year =
//     ['JANUARY', 'FEBRUARY', 'MARCH'].includes(firstMonth)
//       ? endYear
//       : startYear

//   return dayjs().year(year).month(monthIndex).date(15)
// }

  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [streams, setStreams] = useState([])
const [installmentTypes, setInstallmentTypes] = useState([])
const [activeInstallmentType, setActiveInstallmentType] = useState(null)


const getPeriodsByInstallment = () => {
  if (!activeInstallmentType) return []

  const typeName = activeInstallmentType.name?.toUpperCase()

  return INSTALLMENT_PERIODS[typeName] || []
}

  useEffect(() => {
  getRequest('installment-type/active?isActive=true')
    .then((res) => {
      const types = res?.data?.data || []
      setInstallmentTypes(types)

      if (types.length > 0) {
        setActiveInstallmentType(types[0]) // assuming single active
      }
    })
    .catch(() => {
      toast.error('Failed to load installment types')
    })
}, [])

  const [formData, setFormData] = useState({
    sessionId: '',
    classId: null, // 🔥 default ALL
    streamId: null,
    feeName: '',
    feeType: 'ONE_TIME',
    period: '',
    amount: '',
    dueDate: null,
  })

  /* ================= FETCH CLASSES ================= */
  useEffect(() => {
    if (!currentSession?._id) return
    getRequest(`classes?isPagination=false&session=${currentSession._id}`).then((res) => {
      setClasses(res?.data?.data?.classes || [])
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
    }
  }, [currentSession])

  /* ================= EDIT MODE ================= */
  useEffect(() => {
    if (!editData) return

    setFormData({
      sessionId: editData.sessionId?._id || editData.sessionId,
      classId: editData.classId?._id || editData.classId,
      streamId: editData.streamId?._id || editData.streamId || null,
      feeName: editData.feeName || '',
      feeType: 'ONE_TIME',
      period: editData.period || '',
      amount: editData.amount || '',
      dueDate: editData.dueDate ? dayjs(editData.dueDate) : null,
    })
  }, [editData])

  /* ================= CHECK SENIOR ================= */

  const selectedClass = classes.find((c) => c._id === formData.classId)
  const isStreamAllowed = selectedClass?.isSenior || false

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    // ── 1. Session required ──
    if (!formData.sessionId) {
      toast.error('Session is required')
      return
    }

    // ── 2. Fee Name: required and not blank spaces ──
    if (!formData.feeName || !formData.feeName.trim()) {
      toast.error('Fee name is required')
      return
    }

    // ── 3. Amount must be a positive number ──
    const amount = Number(formData.amount)
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    // ── 4. Period required ──
    if (!formData.period) {
      toast.error('Period is required')
      return
    }

    // ── 5. Due date required ──
    if (!formData.dueDate) {
      toast.error('Due date is required')
      return
    }

    const payload = {
      sessionId: formData.sessionId,
      classId: formData.classId,
      streamId: formData.streamId,
      feeName: formData.feeName.trim(),
      feeType: 'ONE_TIME',
      period: formData.period,
      amount,
      dueDate: formData.dueDate.format('YYYY-MM-DD'),
    }

    setLoading(true)
    try {
      if (editData?._id) {
        await putRequest({
          url: `additional-fees/${editData._id}`,
          cred: payload,
        })
        toast.success('Fee Updated Successfully')
      } else {
        await postRequest({
          url: 'additional-fees',
          cred: payload,
        })
        toast.success('Fee Added Successfully')
      }

      refresh()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      title={editData ? 'Edit Additional Fee' : 'Add Additional Fee'}
      width={650}
      okText={editData ? 'Update' : 'Save'}
      okButtonProps={{
        className: 'px-4 py-2 border rounded',
        style: { backgroundColor: '#0c3b73', color: '#fff' },
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <label className="mt-2">
            Class<span className="text-red-500">*</span>
          </label>
          <Select
            placeholder="Select Class"
            value={formData.classId === null ? 'ALL' : formData.classId}
            className="w-100"
            onChange={(v) => {
              const value = v === 'ALL' ? null : v
              const cls = classes.find((c) => c._id === value)

              setFormData((p) => ({
                ...p,
                classId: value,
                streamId: cls?.isSenior ? p.streamId : null,
              }))
            }}
          >
            <Option value="ALL">All</Option>

            {classes.map((c) => (
              <Option key={c._id} value={c._id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Col>

        {isStreamAllowed && (
          <Col span={12}>
            Stream
            <Select
              value={formData.streamId}
              className="w-100"
              placeholder="Enter Stream"
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
            Fee Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.feeName}
            placeholder=" Fee Name"
            onChange={(e) => setFormData((p) => ({ ...p, feeName: e.target.value }))}
          />
        </Col>

        <Col span={12}>
          <label className="mt-2">
            Amount <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="Enter Amount"
            value={formData.amount}
            onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
          />
        </Col>

        <Col span={12}>
          <label className="mt-2">
            Period <span className="text-red-500">*</span>{' '}
          </label>
          <Select
            placeholder="Select the Period"
            value={formData.period || undefined}
            className="w-100"
            onChange={(v) => {
              const autoDate  = getDueDateFromPeriod(v)

              setFormData((p) => ({
                ...p,
                period: v,
                dueDate: autoDate, // ✅ THIS IS THE KEY
              }))
            }}
          >
            {getPeriodsByInstallment().map((p) => (
              <Option key={p} value={p}>
                {p}
              </Option>
            ))}
          </Select>
        </Col>

        <Col span={12}>
          <label className="mt-2">
            Due Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            className="w-100"
            format="DD/MM/YYYY"
            placeholder="Select the Date"
            value={formData.dueDate ? dayjs(formData.dueDate) : null}
            // value={formData.dueDate}
            // onChange={(d) =>
            //   setFormData((p) => ({
            //     ...p,
            //     dueDate: d,
            //   }))
            // }
             disabled
          />
        </Col>
      </Row>
    </Modal>
  )
}

export default AdditionalFeesModal
