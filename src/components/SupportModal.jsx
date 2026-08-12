import React, { useState } from 'react'

import {
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CButton,
    CForm,
    CFormInput,
    CFormTextarea,
    CRow,
    CCol,
    CSpinner,
} from '@coreui/react'

import {
    fileUpload,
    postRequest,
} from '../Helpers'
import {
    Mail,
    Phone,
} from 'lucide-react'
// ==========================================
// TOAST
// ==========================================

import toast from 'react-hot-toast'


const SupportModal = ({
    visible,
    setVisible,
    tenantDetails,
    onSuccess,
}) => {

    // ==========================================
    // Loading States
    // ==========================================

    const [loading, setLoading] = useState(false)

    const [uploading, setUploading] = useState(false)

    // ==========================================
    // Form State
    // ==========================================

    const [formData, setFormData] = useState({
        title: '',

        description: '',
        attachment: '',
    })

    // ==========================================
    // Handle Input Change
    // ==========================================

    const handleChange = (e) => {

        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // ==========================================
    // Handle File Upload
    // ==========================================

    const handleFileUpload = (e) => {

        const file = e.target.files[0]

        if (!file) return

        // ======================================
        // Allowed File Types
        // ======================================

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/pdf',
        ]

        if (!allowedTypes.includes(file.type)) {

            toast.error(
                'Only JPG, JPEG, PNG and PDF files are allowed!'
            )

            e.target.value = ''

            return
        }

        // ======================================
        // FormData
        // ======================================

        const formDataFile = new FormData()

        formDataFile.append('file', file)

        // ======================================
        // Upload Start
        // ======================================

        setUploading(true)

        // ======================================
        // Upload API
        // ======================================

        fileUpload({
            url: 'upload/uploadImage',
            cred: formDataFile,
        })

            .then((res) => {

                const uploadedFileUrl =
                    res?.data?.data?.imageUrl

                if (uploadedFileUrl) {

                    setFormData((prev) => ({
                        ...prev,
                        attachment: uploadedFileUrl,
                    }))

                    toast.success("File uploaded successfully")
                }
            })

            .catch((err) => {

                console.log("Upload Error:", err)

                toast.error("File upload failed")
            })

            .finally(() => {

                setUploading(false)
            })
    }

    // ==========================================
    // Submit Support Ticket
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault()

        try {

            setLoading(true)

            // ======================================
            // Validation
            // ======================================

            if (!formData.title || !formData.description) {

                toast.error(
                    "Title and description are required"
                )

                return
            }

            // ======================================
            // Payload
            // ======================================

            const payload = {
                schoolId: tenantDetails?._id,
                route: window.location.pathname,

                title: formData.title,
                description: formData.description,
                attachment: formData.attachment,
            }

            // ======================================
            // Create Support API
            // ======================================

            const response = await postRequest({
                url: "support/create",
                cred: payload,
            })

            // ======================================
            // Success Toast
            // ======================================

            toast.success(
                response?.data?.message ||
                "Support ticket submitted successfully"
            )
            window.refreshSupportList?.()            // ======================================
            // Reset Form
            // ======================================

            setFormData({
                title: '',
                description: '',
                attachment: '',
            })

            // ======================================
            // Close Modal
            // ======================================

            setVisible(false)

        } catch (error) {

            console.log(error)

            toast.error(
                error?.response?.data?.message ||
                "Something went wrong"
            )

        } finally {

            setLoading(false)
        }
    }

    return (
        <CModal
            visible={visible}
            onClose={() => setVisible(false)}
            alignment="center"
            size="lg"
        >

            {/* ======================================
                HEADER
            ====================================== */}

            <CModalHeader closeButton>

                <CModalTitle>
                    Create Support Ticket
                </CModalTitle>

            </CModalHeader>

            {/* ======================================
                BODY
            ====================================== */}

            <CModalBody>

                <CForm onSubmit={handleSubmit}>

                    <CRow>

                        {/* TITLE */}
                        <CCol md={12} className="mb-3">

                            <CFormInput
                                label="Title"
                                placeholder="Enter support title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />

                        </CCol>

                        {/* DESCRIPTION */}
                        <CCol md={12} className="mb-3">

                            <CFormTextarea
                                label="Description"
                                placeholder="Describe your issue"
                                rows={5}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />

                        </CCol>

                        {/* FILE UPLOAD */}
                        <CCol md={12} className="mb-3">

                            <label className="form-label">
                                Attachment (Image / PDF)
                            </label>

                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileUpload}
                                className="form-control"
                            />

                            {/* Upload Loader */}
                            {
                                uploading && (
                                    <div className="mt-2 text-primary">
                                        Uploading file...
                                    </div>
                                )
                            }

                            {/* Preview */}
                            {
                                formData.attachment && (
                                    <div className="mt-3">

                                        {/* IMAGE PREVIEW */}
                                        {
                                            formData.attachment.match(
                                                /\.(jpeg|jpg|png|gif|webp)$/i
                                            ) ? (

                                                <img
                                                    src={formData.attachment}
                                                    alt="preview"
                                                    style={{
                                                        width: "150px",
                                                        height: "150px",
                                                        objectFit: "cover",
                                                        borderRadius: "10px",
                                                        border: "1px solid #ddd",
                                                    }}
                                                />

                                            ) : (

                                                /* PDF PREVIEW */
                                                <a
                                                    href={formData.attachment}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    View Uploaded PDF
                                                </a>
                                            )
                                        }

                                    </div>
                                )
                            }

                        </CCol>

                    </CRow>

                    {/* ======================================
                        FOOTER
                    ====================================== */}

                    <CModalFooter className="d-flex justify-content-between align-items-center flex-wrap gap-2">

                        {/* LEFT SIDE : GMAIL + CALL */}
                        <div className="d-flex align-items-center gap-2">

                            {/* GMAIL BUTTON */}
                            <a
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=cloudxsupport@gmail.com"
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-light border d-flex align-items-center gap-2 px-3"
                                style={{
                                    borderRadius: "10px",
                                    textDecoration: "none",
                                    fontWeight: "600",
                                }}
                            >
                                <Mail size={18} />
                                Gmail
                            </a>

                            {/* CALL BUTTON */}
                            <a
                                href="tel:+919450563916"
                                className="btn btn-light border d-flex align-items-center gap-2 px-3"
                                style={{
                                    borderRadius: "10px",
                                    textDecoration: "none",
                                    fontWeight: "600",
                                }}
                            >
                                <Phone size={18} />
                                Call
                            </a>

                        </div>

                        {/* RIGHT SIDE BUTTONS */}
                        <div className="d-flex align-items-center gap-2">

                            {/* CANCEL BUTTON */}
                            <CButton
                                color="secondary"
                                onClick={() => setVisible(false)}
                                disabled={loading || uploading}
                            >
                                Cancel
                            </CButton>

                            {/* SUBMIT BUTTON */}
                            <CButton
                                type="submit"
                                color="primary"
                                disabled={loading || uploading}
                            >
                                {
                                    loading ? (
                                        <>
                                            <CSpinner
                                                size="sm"
                                                className="me-2"
                                            />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Ticket"
                                    )
                                }
                            </CButton>

                        </div>

                    </CModalFooter>

                </CForm>

            </CModalBody>
        </CModal>
    )
}

export default SupportModal