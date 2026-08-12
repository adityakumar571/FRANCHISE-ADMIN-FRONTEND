/* eslint-disable prettier/prettier */
import React from 'react'

export default function MiniStatCard({
    label,
    value,
    icon: Icon,
    color = '#042954',
}) {

    return (
        <div
            className="
            bg-white
            rounded-xl
            border border-slate-200
            p-3
            flex flex-col
            items-center
            gap-1.5
            shadow-sm
            hover:shadow-md
            hover:-translate-y-1
            transition-all duration-300
            text-center
        "
        >

            {/* ICON */}
            <div
                className="
                w-8 h-8
                rounded-lg
                flex items-center justify-center
            "
                style={{
                    background: `${color}15`,
                }}
            >
                <Icon
                    className="w-4 h-4"
                    style={{ color }}
                />
            </div>

            {/* VALUE */}
            <p className="
                text-xl
                font-black
                text-slate-800
                leading-none
                tabular-nums
            ">
                {value}
            </p>

            {/* LABEL */}
            <p className="
                text-[10px]
                font-medium
                text-slate-400
                leading-tight
            ">
                {label}
            </p>

        </div>
    )
}