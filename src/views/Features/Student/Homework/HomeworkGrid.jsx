/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { BookOpen, Calendar, Clock } from 'lucide-react'
// Badge config — type ke hisaab se color
const TYPE_CONFIG = {
  ASSIGNMENT: 'bg-blue-50 text-blue-800',
  PROJECT: 'bg-amber-50 text-amber-800',
  HOMEWORK: 'bg-green-50 text-green-800',
}

function isOverdue(dueDate) {
  return new Date(dueDate) < new Date()
}

export default function HomeworkGrid({ homeworks, formatDate }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {homeworks.map((hw) => {
        const overdue = isOverdue(hw.dueDate)
        const badgeStyle = TYPE_CONFIG[hw.homeworkType] ?? TYPE_CONFIG.ASSIGNMENT

        return (
          <div
            key={hw._id}
            className="bg-white border border-gray-100 hover:border-gray-300 transition-colors rounded-xl p-4 flex flex-col justify-between gap-3"
          >
            {/* TOP */}
            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-1 leading-snug">
                {hw.title}
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{hw.description}</p>
            </div>

            {/* MIDDLE */}
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 max-w-[55%]">
                <BookOpen size={13} className="shrink-0" />
                <span className="truncate">{hw.subjectId?.name}</span>
              </span>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${badgeStyle}`}>
                {hw.homeworkType}
              </span>
            </div>

            {/* FOOTER */}
            <div className="flex justify-between items-center border-t border-gray-100 pt-2.5">
              <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <Calendar size={12} className="shrink-0" />
                <span className="text-gray-700 font-medium">{formatDate(hw.assignDate)}</span>
              </span>

              <span
                className={`flex items-center gap-1.5 text-[11px] font-medium ${overdue ? 'text-red-700' : 'text-gray-400'}`}
              >
                <Clock size={12} className="shrink-0" />
                {new Date(hw.dueDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
