/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, {
  useState,
  useRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useContext,
} from 'react'
import { Modal, Button, message } from 'antd'

import BasicInformation from './enrolmentModal/BasicInformation'
import SchoolInformation from './enrolmentModal/SchoolInformation'
import ConcessionAndTransport from './enrolmentModal/ConcessionAndTransport'
import { postRequest, putRequest } from '../Helpers'
import { SessionContext } from '../Context/Seesion'

const EnrollmentFormModal = forwardRef(
  ({ isModalOpen, setIsModalOpen, modalData, setModalData, onSuccess }, ref) => {

    const [activeTab, setActiveTab] = useState('basic')
    const TAB_ORDER = ['basic', 'school', 'other']
    const { currentSession } = useContext(SessionContext)
    const [submitting, setSubmitting] = useState(false)

    // ✅ TRACK DATA FROM ALL TABS
    const [basicData, setBasicData] = useState(null)
    const [schoolData, setSchoolData] = useState(null)
    const [concessionData, setConcessionData] = useState(null)

    const basicRef = useRef()
    const schoolRef = useRef()
    const concessionRef = useRef()

    /* ================= EXPOSE OPEN/CLOSE ================= */
    useImperativeHandle(ref, () => ({
      openModal: () => setIsModalOpen(true),
      closeModal: () => handleClose(),
    }))

    const handleClose = () => {
      setIsModalOpen(false)
      setModalData(null)
      setBasicData(null)
      setSchoolData(null)
      setConcessionData(null)
      setActiveTab('basic')
    }

    /* ================= TAB VALIDATION ================= */
    const goToTab = (nextTab) => {
      const currentIndex = TAB_ORDER.indexOf(activeTab)
      const nextIndex = TAB_ORDER.indexOf(nextTab)

      // ✅ Backward movement always allowed
      if (nextIndex < currentIndex) {
        setActiveTab(nextTab)
        return
      }

      // ❌ Forward movement → validate current tab
      const validators = {
        basic: basicRef,
        school: schoolRef,
        other: concessionRef,
      }

      const res = validators[activeTab]?.current?.submitForm()

      if (!res?.valid) {
        message.error('Please fill all required fields before proceeding')
        return
      }

      setActiveTab(nextTab)
    }

    /* ================= FINAL SUBMIT ================= */
    const handleSubmit = async () => {
      try {

        setSubmitting(true) 

        const basic = basicRef.current?.submitForm()
        const school = schoolRef.current?.submitForm()
        const concession = concessionRef.current?.submitForm()


        if (!basic?.valid || !school?.valid || !concession?.valid) {
          message.error('Please fill all required fields before proceeding')
          setSubmitting(false)
          return
        }

        if (!currentSession?._id) {
          message.error('Session not available')
          setSubmitting(false)
          return
        }

        const finalData = {
          ...basic.data,
          ...school.data,
          ...concession.data,
          session: currentSession._id,
        }


        let apiRes
        if (modalData?._id) {
          // EDIT MODE
          const res = await putRequest({
            url: `studentEnrollment/${modalData._id}`,
            cred: finalData,
          })
          apiRes = res?.data
        } else {
          // ADD MODE
          const res = await postRequest({
            url: 'studentEnrollment',
            cred: finalData,
          })
          apiRes = res?.data
        }

        if (apiRes?.success) {
          message.success(
            apiRes?.message ||
            (modalData?._id
              ? 'Student updated successfully'
              : 'Student enrolled successfully')
          )

          onSuccess?.()
          setTimeout(() => handleClose(), 300)
        }
        else {
          message.error(apiRes?.message || 'Operation failed')
        }
      } catch (err) {
        console.error('❌ Enrollment Error', err)
        message.error(err?.response?.data?.message || 'Something went wrong')
      } finally {
        setSubmitting(false) 
      }

    }

    /* ================= SESSION VALIDATION ================= */
    useEffect(() => {
      if (isModalOpen && !currentSession?._id) {
        message.warning('Session is loading, please wait...')
      }
    }, [isModalOpen, currentSession])

    const handleSave = () => {
      let res
      let successMessage = 'Data saved successfully'

      if (activeTab === 'basic') {
        res = basicRef.current?.submitForm()
        successMessage = 'Basic information saved'
      }
      else if (activeTab === 'school') {
        res = schoolRef.current?.submitForm()
        successMessage = 'School details saved'
      }
      else if (activeTab === 'other') {
        res = concessionRef.current?.submitForm()
        successMessage = 'Other details saved'
      }

      if (!res?.valid) {
        message.error('Please complete required fields before saving')
        return
      }

      message.success(successMessage)
    }



    return (
      <Modal
        // title="Student Enrollment Form"
        title={modalData ? 'Edit Student Enrollment Form' : 'Student Enrollment Form'}
        open={isModalOpen}
        onCancel={handleClose}
        footer={null}
        width={1000}
        className="max-h-[720px] overflow-y-auto"
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #dee2e6',
            marginBottom: 12,
          }}
        >
          <ul className="nav nav-tabs" style={{ borderBottom: 'none' }}>
            {[
              ['basic', 'Basic Information'],
              ['school', 'School Information'],
              ['other', 'Other Information'],
            ].map(([key, label]) => (
              <li className="nav-item" key={key}>
                <button
                  type="button"
                  className={`nav-link !text-[#0c3b73] ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}
                  style={{ fontSize: 13 }}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <div style={{ fontSize: 13 }}>
            <strong>Session:</strong>{' '}
            {currentSession ? (
              <span style={{ color: '#0c3b73' }}>{currentSession.sessionName}</span>
            ) : (
              <span style={{ color: 'red' }}>Not Available</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: activeTab === 'basic' ? 'block' : 'none' }}>
          <BasicInformation
            ref={basicRef}
            modalData={modalData}
            onChange={setBasicData} // ✅ COLLECT DATA
          />
        </div>

        <div style={{ display: activeTab === 'school' ? 'block' : 'none' }}>
          <SchoolInformation
            ref={schoolRef}
            modalData={modalData}
            basicData={basicData} // ✅ PASS BASIC DATA
            onChange={setSchoolData}
          />
        </div>

        <div style={{ display: activeTab === 'other' ? 'block' : 'none' }}>
          <ConcessionAndTransport
            ref={concessionRef}
            modalData={modalData}
            onChange={setConcessionData}
          />
        </div>

        {/* Footer */}
        <div className="text-end mt-4">
          <Button
            type="primary"
            className="!bg-[#0c3b73] mx-2 "
            onClick={handleSave}
          >
            Save
          </Button>
          {activeTab === 'other' ? (
            <Button type="primary" className="!bg-[#0c3b73] text-white" onClick={handleSubmit} loading={submitting}
              disabled={submitting}
            >
             {modalData ? 'Update' : 'Submit'}
            </Button>
          ) : (
            <Button
              type="primary"
              className="!bg-[#0c3b73]"
              onClick={() =>
                goToTab(
                  activeTab === 'basic' ? 'school' : activeTab === 'school' ? 'other' : 'other'
                )
              }
            >
              Next
            </Button>
          )}

        </div>
      </Modal>
    )
  }
)

export default EnrollmentFormModal