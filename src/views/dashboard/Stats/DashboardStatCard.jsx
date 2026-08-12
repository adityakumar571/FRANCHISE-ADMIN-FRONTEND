/* eslint-disable prettier/prettier */
import React from 'react'

export default function DashboardStatCard({
    title,
    value,
    icon: Icon,
    color = '#042954',
    badge,
    sub,
    progress = 70,
    prefix = '',
    suffix = '',
}) {

    return (
        <div
            className="
                bg-white
                border border-slate-200
                rounded-2xl
                p-3
                shadow-sm
                hover:shadow-lg
                hover:-translate-y-1
                transition-all duration-300
                h-[180px]
                flex flex-col justify-between
            "
        >

            {/* ═════ HEADER ═════ */}
            <div className="flex items-start justify-between gap-3">

                {/* LEFT */}
                <div className="flex-1 min-w-0">

                    {/* TITLE */}
                    <p
                        className="
                              text-[14px]
                 font-bold
                text-slate-700
                leading-tight
                            mb-2
                        "
                    >
                        {title}
                    </p>

                    {/* VALUE */}
                    <h3
                        className="
        text-[18px]
        font-black
        font-medium
        text-slate-700
    "
                    >
                        {prefix}

                        {
                            typeof value === 'number'
                                ? value.toLocaleString('en-IN')
                                : value
                        }

                        {suffix}
                    </h3>

                </div>

                {/* ICON */}
                <div
                    className="
                        w-11
                        h-11
                        rounded-2xl
                        flex
                        items-center
                        justify-center
                        shadow-sm
                        flex-shrink-0
                    "
                    style={{
                        background: color,
                    }}
                >
                    <Icon className="w-5 h-5 text-white" />
                </div>

            </div>

            {/* ═════ CONTENT ═════ */}
            <div className="mt-4">

                {/* BADGE */}
                {badge && (
                    <div
                        className="
                            text-[11px]
                            font-bold
                            leading-relaxed
                            mb-1.5
                        "
                        style={{ color }}
                    >
                        {badge}
                    </div>
                )}

                {/* SUBTEXT */}
                {sub && (
                    <div
                        className="
                            text-[11px]
                            text-slate-400
                            leading-relaxed
                            mb-3
                        "
                    >
                        {sub}
                    </div>
                )}

                {/* PROGRESS */}
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">

                    <div
                        className="
                            h-full
                            rounded-full
                            transition-all
                            duration-700
                        "
                        style={{
                            width: `${progress}%`,
                            background: color,
                        }}
                    />

                </div>

            </div>

        </div>
    )
}