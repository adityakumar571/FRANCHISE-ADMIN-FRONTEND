/* eslint-disable prettier/prettier */
import React from 'react'

export default function AttendanceCard({
    present,
    absent,
    holiday,
}) {

    return (
        <div className="
      bg-white
      rounded-2xl
      border border-slate-200
      p-5
      shadow-sm
    ">

            <h2 className="text-sm font-bold text-slate-800 mb-5">
                Today's Attendance
            </h2>

            <div className="space-y-3">

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        Present
                    </span>

                    <span className="font-bold text-green-700">
                        {present}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        Absent
                    </span>

                    <span className="font-bold text-red-700">
                        {absent}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        Holiday
                    </span>

                    <span className="font-bold text-slate-700">
                        {holiday}
                    </span>
                </div>

            </div>
        </div>
    )
}