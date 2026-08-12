/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'

function AnimatedNumber({ value, prefix = '' }) {
    const [display, setDisplay] = useState(0)
    const numeric = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value
    useEffect(() => {
        if (!numeric) return
        let start = 0
        const duration = 1200
        const increment = numeric / (duration / 16)
        const timer = setInterval(() => {
            start += increment
            if (start >= numeric) { setDisplay(numeric); clearInterval(timer) }
            else setDisplay(Math.floor(start))
        }, 16)
        return () => clearInterval(timer)
    }, [numeric])
    return <span>{prefix}{display.toLocaleString('en-IN')}</span>
}

function StatCard({ icon, label, value, prefix, badge, badgeType, bars }) {
    const badgeColors = {
        up: 'bg-[#f0fdf4] text-[#16a34a]',
        down: 'bg-[#fff1f2] text-[#dc2626]',
        neutral: 'bg-[#fffbeb] text-[#d97706]',
        blue: 'bg-[#eff4ff] text-[#2563eb]',
        purple: 'bg-[#f5f3ff] text-[#7c3aed]',
        pink: 'bg-[#fdf2f8] text-[#db2777]',
    }
    return (
        <div className="bg-white border border-[#e8e8e4] rounded-xl p-[18px_20px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] hover:-translate-y-[1px] transition-all duration-[180ms] cursor-default">
            <div className="flex items-start justify-between mb-[14px]">
                <div className="w-9 h-9 rounded-[9px] flex items-center justify-center" style={{ background: icon.bg }}>
                    {icon.el}
                </div>
                {badge && (
                    <span className={`text-[10px] font-medium px-2 py-[3px] rounded-full ${badgeColors[badgeType] || badgeColors.neutral}`}>
                        {badge}
                    </span>
                )}
            </div>
            <div className="text-[24px] font-semibold text-[#1a1a18] tracking-[-0.5px]">
                <AnimatedNumber value={value} prefix={prefix} />
            </div>
            <div className="text-[12px] text-[#9b9b94] mt-[3px]">{label}</div>
            {bars && (
                <div className="h-12 mt-[14px] flex items-end gap-[3px]">
                    {bars.map((h, i) => (
                        <div
                            key={i}
                            className="flex-1 rounded-t-[3px] transition-all duration-300"
                            style={{ height: `${h}%`, background: h > 60 ? icon.barHigh || '#bfdbfe' : '#f2f2ef' }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function StatCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-[14px]">
            {/* Total Members */}
            <StatCard
                icon={{
                    bg: '#eff4ff',
                    barHigh: '#bfdbfe',
                    el: (
                        <svg className="w-5 h-5 text-[#2563eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    ),
                }}
                label="Total Members"
                value={8971}
                badge="↑ 8.2%"
                badgeType="up"
                bars={[30, 45, 35, 55, 40, 60, 50, 65, 55, 70, 60, 75]}
            />
            {/* Total Collections */}
            <StatCard
                icon={{
                    bg: '#f0fdf4',
                    barHigh: '#bbf7d0',
                    el: (
                        <span className="text-[#16a34a] font-bold text-xs">₹</span>),
                }}
                label="Total Collections"
                prefix="Rs "
                value={44045}
                badge="↑ April 2026 -12.1%"
                badgeType="down"
                bars={[40, 55, 45, 70, 60, 80, 65, 75, 85, 70, 90, 80]}
            />
            {/* InRound OutBound Mail */}
            <StatCard
                icon={{
                    bg: '#fffbeb',
                    barHigh: '#fde68a',
                    el: (
                        <svg className="w-5 h-5 text-[#d97706]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                    ),
                }}
                label="InRound – OutBound Mail"
                value="11 / 4"
                badge="→ April 2026"
                badgeType="neutral"
                bars={[50, 40, 60, 45, 55, 35, 65, 50, 45, 60, 55, 50]}
            />
            {/* Pending Payments */}
            <StatCard
                icon={{
                    bg: '#fff1f2',
                    barHigh: '#fecaca',
                    el: (
                        <svg className="w-5 h-5 text-[#dc2626]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    ),
                }}
                label="Pending Payments"
                value={238}
                badge="↑ 3.4%"
                badgeType="up"
                bars={[60, 45, 70, 55, 40, 65, 50, 75, 45, 60, 55, 50]}
            />
            {/* Messages This Month */}
            <StatCard
                icon={{
                    bg: '#f5f3ff',
                    barHigh: '#ddd6fe',
                    el: (
                        <svg className="w-5 h-5 text-[#7c3aed]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    ),
                }}
                label="Messages This Month"
                value={84}
                bars={[35, 50, 40, 60, 45, 55, 65, 50, 70, 55, 60, 75]}
            />
            {/* Active Promotions */}
            <StatCard
                icon={{
                    bg: '#fdf2f8',
                    barHigh: '#fbcfe8',
                    el: (
                        <svg className="w-5 h-5 text-[#db2777]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    ),
                }}
                label="Active Promotions"
                value={19}
                bars={[45, 60, 50, 70, 55, 65, 75, 60, 80, 65, 70, 85]}
            />
        </div>
    )
}
