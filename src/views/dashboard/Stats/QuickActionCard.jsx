/* eslint-disable prettier/prettier */
import React from 'react'

export default function QuickActionCard({
    label,
    icon: Icon,
    path,
    navigate,
    color = '#042954',
}) {

    return (
        <button
            onClick={() => navigate(path)}
            className="
                flex flex-col
                items-center
                gap-2
                py-3
                px-2
                bg-white
                rounded-xl
                border border-slate-200
                shadow-sm
                hover:shadow-md
                hover:-translate-y-1
                active:scale-95
                transition-all duration-300
                group
            "
        >

            {/* ICON */}
            <div
                className="
                    w-9 h-9
                    rounded-xl
                    flex items-center justify-center
                    transition-all duration-300
                    group-hover:scale-110
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

            {/* LABEL */}
            <span className="
                text-[13px]
                 font-bold
                text-slate-700
                leading-tight
                text-center
            ">
                {label}
            </span>

        </button>
    )
}