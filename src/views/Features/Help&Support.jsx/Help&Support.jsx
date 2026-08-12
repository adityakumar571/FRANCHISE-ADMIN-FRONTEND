import React, { useEffect, useState, useContext } from 'react'

import {
    Search,
    Eye,
    AlertTriangle,
    Ticket,
} from 'lucide-react'

import { Empty, Pagination, Tooltip } from 'antd'

import dayjs from 'dayjs'

import toast from 'react-hot-toast'
import { deleteRequest, getRequest } from '../../../Helpers'
import Loader from '../../../components/Loading/Loader'
import { AppContext } from '../../../Context/AppContext'



const AdminSupportList = () => {

    const { tenantDetails } = useContext(AppContext)

    const [supports, setSupports] = useState([])

    const [loading, setLoading] = useState(false)

    const [searchTerm, setSearchTerm] = useState('')

    const [page, setPage] = useState(1)

    const [limit, setLimit] = useState(10)

    const [total, setTotal] = useState(0)

    const [status, setStatus] = useState('')

    const [updateStatus, setUpdateStatus] = useState(false)

    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const [selectedItem, setSelectedItem] = useState(null)
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [tempFromDate, setTempFromDate] = useState('')
    const [tempToDate, setTempToDate] = useState('')
    // ==========================================
    // TABLE COLUMNS
    // ==========================================

    const ALL_COLUMNS = [
        {
            key: 'ticketNo',
            label: 'Issue No.',
            width: 100,
        },
        {
            key: 'title',
            label: 'Title',
            width: 150,
        },

        {
            key: 'description',
            label: 'Description',
            width: 160,
        },

        // {
        //     key: 'schoolName',
        //     label: 'School',
        //     width: 200,
        // },

        {
            key: 'route',
            label: 'Page Name',
            width: 200,
        },
        {
            key: 'status',
            label: 'Status',
            width: 120,
        },
        {
            key: 'attachment',
            label: 'Attachment',
            width: 120,
        },
        {
            key: 'adminReply',
            label: 'Remarks',
            width: 200,
        },

        {
            key: 'createdAt',
            label: 'Created At',
            width: 150,
        },
    ]

    // ==========================================
    // FETCH SUPPORTS
    // ==========================================

    useEffect(() => {

        fetchSupports()

    }, [page, limit, updateStatus, searchTerm,])

    window.refreshSupportList = () => {
        setUpdateStatus(prev => !prev)
    }
    // ==========================================
    // FETCH FUNCTION
    // ==========================================

    const fetchSupports = async () => {

        try {

            setLoading(true)

            const queryParams = {
                page,
                limit,
                search: searchTerm,
            }

            // schoolId query mein pass karo taaki backend filter kar sake
            if (tenantDetails?._id) {
                queryParams.schoolId = tenantDetails._id
            }

            if (status) {
                queryParams.status = status
            }

            if (fromDate) {
                queryParams.fromDate = fromDate
            }

            if (toDate) {
                queryParams.toDate = toDate
            }

            if (status) {
                queryParams.status = status
            }

            const query =
                new URLSearchParams(queryParams).toString()

            const res = await getRequest(
                `support/all?${query}`
            )

            const responseData = res?.data?.data

            const formattedSupports =
                (responseData?.supports || []).map((item) => ({
                    ...item,

                    schoolName:
                        item?.schoolId?.schoolName || '-',

                    createdAt:
                        dayjs(item.createdAt)
                            .format('DD-MM-YYYY'),
                }))

            setSupports(formattedSupports)

            setTotal(responseData?.totalSupports || 0)

        } catch (error) {

            console.log(error)

            toast.error("Failed to fetch supports")

        } finally {

            setLoading(false)
        }
    }

    // ==========================================
    // DELETE SUPPORT
    // ==========================================

    // const handleDelete = async () => {

    //     try {

    //         await deleteRequest(
    //             `support/delete/${selectedItem?._id}`
    //         )

    //         toast.success("Support deleted successfully")

    //         setUpdateStatus((prev) => !prev)

    //     } catch (error) {

    //         console.log(error)

    //         toast.error("Delete failed")

    //     } finally {

    //         setShowDeleteModal(false)

    //         setSelectedItem(null)
    //     }
    // }

    return (
        <div className="min-h-screen">

            {/* ==========================================
          DELETE MODAL
      ========================================== */}

            {/* {
                showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

                        <div className="bg-white p-6 max-w-md w-full rounded-lg">

                            <div className="flex items-center mb-4">

                                <AlertTriangle
                                    className="w-6 h-6 text-red-500 mr-3"
                                />

                                <h3 className="text-lg font-semibold">
                                    Confirm Delete
                                </h3>

                            </div>

                            <p className="mb-6">

                                Are you sure you want to delete
                                this support ticket?

                            </p>

                            <div className="flex justify-end gap-3">

                                <button
                                    onClick={() =>
                                        setShowDeleteModal(false)
                                    }
                                    className="px-4 py-2 border rounded"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleDelete}
                                    className="px-6 py-2 bg-red-600 text-white rounded"
                                >
                                    Delete
                                </button>

                            </div>
                        </div>
                    </div>
                )
            } */}

            {/* ==========================================
          HEADER
      ========================================== */}
            {/* ==========================================
    PAGE HEADER
========================================== */}

            <div className="bg-white border border-blue-100 rounded-xl px-4 py-3 mb-4">

                <div className="flex items-center justify-between flex-wrap gap-3">

                    <div>

                        <h1 className="text-xl font-semibold flex items-center gap-2 text-gray-800 mb-1">

                            <Ticket
                                className="text-[#e24028]"
                                size={28}
                            />

                            Support

                        </h1>

                        <p className="text-sm text-gray-500 mb-0">
                            Manage all support
                        </p>

                    </div>

                </div>

            </div>

            {/* ==========================================
    FILTER SECTION
========================================== */}

            <div className="bg-white rounded border p-4 mb-4">

                {/* FILTER HEADER */}

                <div className="flex items-center gap-2 mb-3">

                    <Search
                        className="w-5 h-5 text-[#0c3b73]"
                    />

                    <h3 className="text-lg font-semibold text-gray-700 mb-0">
                        Filters & Search
                    </h3>

                </div>

                {/* FILTER ROW */}

                <div className="flex flex-col lg:flex-row lg:items-end gap-3">

                    {/* SEARCH */}

                    <div className="w-full lg:max-w-sm">

                        <label className="block text-xs font-medium mb-1 tracking-wide">
                            SEARCH
                        </label>

                        <div className="relative">

                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                            />

                            <input
                                type="text"
                                placeholder="Search title or description..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setPage(1)
                                }}
                                className="
            pl-9 pr-4 py-2 w-full border rounded-lg text-sm
            focus:ring-2 focus:ring-blue-200 focus:outline-none
          "
                            />

                        </div>

                    </div>

                    {/* STATUS */}

                    <div>

                        <label className="block text-xs font-medium mb-1 tracking-wide">
                            STATUS
                        </label>

                        <select
                            className="
          border rounded-lg px-3 py-2 text-sm min-w-[180px]
          focus:ring-2 focus:ring-blue-200 focus:outline-none
        "
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value)
                            }}
                        >

                            <option value="">
                                All Status
                            </option>

                            <option value="OPEN">
                                OPEN
                            </option>

                            <option value="IN_PROGRESS">
                                IN_PROGRESS
                            </option>

                            <option value="RESOLVED">
                                RESOLVED
                            </option>

                            <option value="CLOSED">
                                CLOSED
                            </option>

                        </select>

                    </div>


                    {/* FROM DATE */}

                    <div>

                        <label className="block text-xs font-medium mb-1 tracking-wide">
                            FROM DATE
                        </label>

                        <input
                            type="date"
                            value={tempFromDate}
                            onChange={(e) => {
                                setTempFromDate(e.target.value)
                            }}
                            className="
            border rounded-lg px-3 py-2 text-sm
            focus:ring-2 focus:ring-blue-200 focus:outline-none
        "
                        />

                    </div>

                    {/* TO DATE */}

                    <div>

                        <label className="block text-xs font-medium mb-1 tracking-wide">
                            TO DATE
                        </label>

                        <input
                            type="date"
                            value={tempToDate}
                            onChange={(e) => {
                                setTempToDate(e.target.value)
                            }}
                            className="
            border rounded-lg px-3 py-2 text-sm
            focus:ring-2 focus:ring-blue-200 focus:outline-none
        "
                        />

                    </div>



                    {/* Apply BUTTON */}
                    <button
                        onClick={() => {

                            setFromDate(tempFromDate)

                            setToDate(tempToDate)

                            setPage(1)

                            setUpdateStatus(prev => !prev)
                        }}
                        className="
        px-5 py-2 bg-[#042954] text-white rounded-md text-sm
        hover:bg-[#042954] transition
    "
                    >
                        Apply
                    </button>
                    <button
                        onClick={() => {

                            setSearchTerm('')

                            setStatus('')

                            setFromDate('')

                            setToDate('')

                            setTempFromDate('')

                            setTempToDate('')

                            setPage(1)

                            setUpdateStatus(prev => !prev)
                        }}
                        className="
        px-5 py-2 bg-gray-200 text-gray-700 rounded-md text-sm
        hover:bg-gray-300 transition
      "
                    >
                        Clear
                    </button>

                </div>

            </div>

            {/* ==========================================
          TABLE
      ========================================== */}

            <div className="relative bg-white border border-gray-200 rounded-lg overflow-x-auto">

                {/* LOADER */}

                {
                    loading && (
                        <div className="absolute inset-0 z-30 bg-white/70 flex flex-col items-center justify-center">

                            <Loader />

                            Loading Support List....

                        </div>
                    )
                }
                <div className="border border-blue-100 rounded-lg bg-white">

                    {/* TABLE SCROLL */}
                    <div className="relative overflow-x-auto">
                    <table className="min-w-max border-collapse w-full table-fixed">

                        {/* ======================================
              TABLE HEAD
          ====================================== */}

                        <thead className="bg-gray-200 text-gray-700">

                            <tr>

                                {/* SR NO */}

                                <th
                                    className="sticky left-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center whitespace-nowrap"
                                    style={{ width: 80, minWidth: 80 }}
                                >
                                    Sr. No.
                                </th>
                                {/* ACTIONS */}



                                {/* DYNAMIC COLUMNS */}

                                {
                                    ALL_COLUMNS.map((col) => (

                                        <th
                                            key={col.key}
                                            className="px-3 py-2 text-sm text-center bg-gray-200"
                                            style={{
                                                width: col.width,
                                                minWidth: col.width,
                                                maxWidth: col.width,
                                            }}
                                        >

                                            {col.label}

                                        </th>
                                    ))
                                }

                                {/* ACTIONS */}

                                {/* <th
                                className="sticky right-0 z-20 bg-gray-200 px-3 py-2 text-sm text-center"
                                style={{ minWidth: 120 }}
                            >
                                Actions
                            </th> */}

                            </tr>

                        </thead>

                        {/* ======================================
              TABLE BODY
          ====================================== */}
                        <tbody>

                            {
                                !loading && supports.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan={ALL_COLUMNS.length + 1}
                                        >

                                            <div className="flex items-center justify-center py-10 text-gray-500">

                                                <div>

                                                    No Support Record Found

                                                    <Empty />

                                                </div>

                                            </div>

                                        </td>

                                    </tr>

                                ) : (

                                    supports.map((item, rowIndex) => (

                                        <tr
                                            key={item._id}
                                            className=" hover:bg-gray-50"
                                        >

                                            {/* SR NO */}

                                            <td
                                                className="sticky left-0 z-10 bg-white px-3 py-2 text-sm text-center whitespace-nowrap"
                                                style={{
                                                    width: 80,
                                                    minWidth: 80,
                                                    maxWidth: 80,
                                                }}
                                            >

                                                {(page - 1) * limit + rowIndex + 1}

                                            </td>

                                            {/* DYNAMIC CELLS */}

                                            {
                                                ALL_COLUMNS.map((col) => (

                                                    <td
                                                        key={col.key}
                                                        className="px-3 py-2 text-sm text-center bg-white cursor-pointer"
                                                        style={{
                                                            width: col.width,
                                                            minWidth: col.width,
                                                            maxWidth: col.width,
                                                        }}
                                                    >

                                                        <Tooltip title={item[col.key]}>

                                                            <div className="truncate">

                                                                {
                                                                    col.key === "attachment" ? (

                                                                        item?.attachment ? (

                                                                            <a
                                                                                href={item?.attachment}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                            >
                                                                                <img
                                                                                    src={item?.attachment}
                                                                                    alt="attachment"
                                                                                    className="
            w-12
            h-12
            object-cover
            rounded-lg
            border
            cursor-pointer
            mx-auto
          "
                                                                                />
                                                                            </a>

                                                                        ) : "-"

                                                                    ) : col.key === "status" ? (

                                                                        <span
                                                                            className={`px-3 py-1 rounded-full text-xs font-semibold
        ${item.status === "OPEN"
                                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                                    : item.status === "RESOLVED"
                                                                                        ? "bg-green-100 text-green-700"
                                                                                        : item.status === "CLOSED"
                                                                                            ? "bg-red-100 text-red-700"
                                                                                            : "bg-blue-100 text-blue-700"
                                                                                }
      `}
                                                                        >
                                                                            {item[col.key]}
                                                                        </span>

                                                                    ) : (

                                                                        item[col.key] || '-'

                                                                    )
                                                                }

                                                            </div>

                                                        </Tooltip>

                                                    </td>
                                                ))
                                            }

                                        </tr>
                                    ))
                                )
                            }

                        </tbody>

                    </table>
                </div>
                </div>
              <div className="border-t border-slate-200 px-4 py-3 flex justify-end">

        <Pagination
            current={page}
            pageSize={limit}
            total={total}
            showSizeChanger
            pageSizeOptions={['5', '10', '20', '50']}
            onChange={setPage}
            onShowSizeChange={(c, s) => {
                setLimit(s)
                setPage(1)
            }}
        />

    </div>
            </div>

            {/* ==========================================
          PAGINATION
      ========================================== */}



        </div>
    )
}

export default AdminSupportList