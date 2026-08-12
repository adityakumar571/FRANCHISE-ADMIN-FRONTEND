import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function StudentAttendanceModal({
  student,
  attendance,
  year,
  month,
  onClose
}) {
  const [viewMonth, setViewMonth] = useState(month);
  const [viewYear, setViewYear] = useState(year);

  if (!student) return null;

  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName = new Date(viewYear, viewMonth).toLocaleString("default", {
    month: "long"
  });

  const changeMonth = (dir) => {
    if (dir === "prev") {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    } else {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    }
  };

  const getStatusColor = (status) => {
    if (status === "P") return "bg-emerald-500 text-white";
    if (status === "A") return "bg-rose-500 text-white";
    if (status === "H") return "bg-sky-500 text-white";
    return "bg-gray-100 text-gray-500";
  };

  

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white max-w-2xl w-full rounded-lg p-6 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        {/* Student Info */}
        <h2 className="text-sm font-semibold text-gray-800">
          {student.name}
        </h2>
        <p className="text-sm text-gray-600">
          Roll: {student.roll} | Class: {student.class} | Father's Name: Mr. {student.father}
        </p>

        {/* Month Header */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <button
            onClick={() => changeMonth("prev")}
            className="p-2 rounded-lg bg-gray-100"
          >
            <ChevronLeft />
          </button>

          <h3 className="font-semibold text-sm text-gray-700">
            {monthName} {viewYear}
          </h3>

          <button
            onClick={() => changeMonth("next")}
            className="p-2 rounded-lg  bg-gray-100"
          >
            <ChevronRight />
          </button>
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="text-xs font-semibold text-gray-500">
              {d}
            </div>
          ))}

          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1;
            const key = `${student.id}-${viewYear}-${viewMonth}-${day}`;
            const status = attendance[key];

            return (
              <div
                key={day}
                className={`h-10 flex items-center justify-center rounded-lg text-sm font-bold ${getStatusColor(status)}`}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex  gap-4 mt-6 text-gray-700 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded"></span> Present
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-rose-500 rounded"></span> Absent
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-sky-500 rounded"></span> Holiday
          </span>
        </div>
      </div>
    </div>
  );
}
