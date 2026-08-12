/* eslint-disable prettier/prettier */
import React from 'react'

export default function NoticeHomeWorkStatsCard({
    title,
    value,
    icon: Icon,
    color = '#042954',
    badge,
    sub,
    prefix = '',
}) {

    return (

        <div
            className="
                bg-white
                border border-slate-200
                rounded-2xl
                p-4
                shadow-sm
                hover:shadow-lg
                hover:-translate-y-1
                transition-all duration-300

                min-h-[150px]
                sm:min-h-[165px]

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
                            text-[13px]
                            sm:text-[14px]

                            font-bold
                            text-slate-700
                            leading-tight
                            mb-2

                            break-words
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

                    </h3>

                </div>

                {/* ICON */}
                <div
                    className="
                        w-10 h-10
                        sm:w-11 sm:h-11

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

                    <Icon
                        className="
                            w-4 h-4
                            sm:w-5 sm:h-5

                            text-white
                        "
                    />

                </div>

            </div>

            {/* ═════ CONTENT ═════ */}
            <div className="mt-4 min-w-0">

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
                            text-[10px]
                            sm:text-[11px]

                            text-slate-400
                            leading-relaxed

                            break-words
                        "
                    >
                        {sub}
                    </div>

                )}

            </div>

        </div>

    )
}