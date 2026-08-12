/* eslint-disable prettier/prettier */
import React from 'react'
import { IndianRupee } from 'lucide-react'

export default function FeeStatCard({
    title,
    value,
    color = '#2d6a4f',
    badge,
    sub,
    progress = 50,
}) {

    return (
        <div className="
      bg-white
      border border-slate-200
      rounded-2xl
      p-5
      shadow-sm
      hover:shadow-lg
      transition-all duration-300
      h-[180px]
      flex flex-col justify-between
    ">

            <div className="flex justify-between items-start">

                <div>
                    <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-2">
                        {title}
                    </p>

                    <h3 className="text-3xl font-black text-slate-800">
                        ₹{value}
                    </h3>
                </div>

                <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ background: color }}
                >
                    <IndianRupee className="w-5 h-5 text-white" />
                </div>
            </div>

            <div>

                {badge && (
                    <p
                        className="text-[11px] font-bold mb-1"
                        style={{ color }}
                    >
                        {badge}
                    </p>
                )}

                {sub && (
                    <p className="text-[11px] text-slate-400 mb-3">
                        {sub}
                    </p>
                )}

                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full"
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