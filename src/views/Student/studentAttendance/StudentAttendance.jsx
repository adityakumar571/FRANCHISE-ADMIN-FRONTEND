import React, { useEffect, useState, useContext, useMemo, useCallback } from "react";

import dayjs from "dayjs";
import { Select, Spin, Calendar, Badge, Empty } from "antd";
import { getRequest } from "../../../Helpers";
import { AppContext } from "../../../Context/AppContext";
import { Calendar1 } from "lucide-react";
import Loader from "../../../components/Loading/Loader";

const { Option } = Select;

const StudentAttendance = () => {
  const { user } = useContext(AppContext);

  const studentId = user?.profile?._id;
  const sessionId = user?.profile?.session?._id;
  const classId = user?.profile?.currentClass?._id;
  const sectionId = user?.profile?.currentSection?._id;

  const [month, setMonth] = useState(dayjs().month() + 1);
  const [year, setYear] = useState(dayjs().year());
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);


  const handlePanelChange = (value) => {
    setMonth(value.month() + 1); // dayjs month is 0-based
    setYear(value.year());
  };
  const handleDateChange = (value) => {
    setMonth(value.month() + 1);
    setYear(value.year());
  };



  /* ================= FETCH ================= */
  const fetchReport = useCallback(async () => {
    if (!studentId || !sessionId || !classId || !sectionId) return;

    setLoading(true);
    try {
      const res = await getRequest(
        `attendance/monthly-student-calendar?month=${month}&year=${year}&sessionId=${sessionId}&classId=${classId}&sectionId=${sectionId}&studentId=${studentId}`
      );
      setAttendanceData(res?.data?.data?.attendance || []);
    } catch (err) {
      console.error("Attendance error", err);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  }, [month, year, studentId, sessionId, classId, sectionId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);


  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const present = attendanceData.filter(a => a.status === "P").length;
    const absent = attendanceData.filter(a => a.status === "A").length;
    const total = present + absent;

    return {
      present,
      absent,
      total,
      percentage: total ? Math.round((present / total) * 100) : 0
    };
  }, [attendanceData]);

  /* ================= CALENDAR CELL ================= */
  const dateCellRender = (value) => {
    // ❗ Agar current month ki date nahi hai → kuch render mat karo
    if (value.month() + 1 !== month || value.year() !== year) {
      return null;
    }

    const day = value.date();
    const record = attendanceData.find(a => a.day === day);

    if (!record || record.isFuture) return null;

    if (record.isSunday) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="px-2 py-1 rounded-md bg-gray-100 text-gray-500 text-xs font-medium">
            Sunday
          </div>
        </div>
      );
    }

    if (record.status === "P") {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium">
            Present
          </div>
        </div>
      );
    }

    if (record.status === "A") {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium">
            Absent
          </div>
        </div>
      );
    }

    return null;
  };


  return (
    <div className="min-h-screen ">
      <div className="mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl  border border-gray-100 px-6 py-3 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar1 className="text-red-600" />
                <h1 className="text-lg font-bold bg-gray-700 bg-clip-text text-transparent mb-0">
                  My Attendance
                </h1>
              </div>
              <p className="text-gray-500 mt-1 text-sm">Track your attendance record</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                title="Present Days"
                value={stats.present}

                gradient="from-[#0c3b73] to-[#0c3b73]"
                bgGradient="from-blue-50 to-blue-50"
              />
              <StatCard
                title="Absent Days"
                value={stats.absent}

                gradient="from-[#0c3b73] to-[#0c3b73]"
                bgGradient="from-blue-50 to-blue-50"
              />
            </div>

          </div>
        </div>




        {/* Calendar Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              {dayjs(`${year}-${month}-01`).format("MMMM YYYY")} Calendar
            </h2>
            <div className="flex flex-wrap gap-4 text-xs">
              <LegendItem color="bg-emerald-100 text-emerald-700" label="Present" />
              <LegendItem color="bg-red-100 text-red-700" label="Absent" />
              <LegendItem color="bg-gray-100 text-gray-500" label="Sunday" />

            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader />
              <p className="text-gray-500 mt-4">Loading attendance data...</p>
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="py-20">
              <Empty
                description={
                  <span className="text-gray-500">
                    No attendance data found for this period
                  </span>
                }
              />
            </div>
          ) : (
            <div className="attendance-calendar">
              <Calendar
                value={dayjs(`${year}-${month}-01`)}
                fullscreen={false}
                dateCellRender={dateCellRender}
                onPanelChange={handlePanelChange}
                onChange={handleDateChange}
              />
            </div>
          )}
        </div>


      </div>

      <style jsx>{`
        .attendance-calendar :global(.ant-picker-calendar-header) {
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }
        
        .attendance-calendar :global(.ant-picker-calendar-date) {
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .attendance-calendar :global(.ant-picker-calendar-date:hover) {
          background: #f8fafc;
        }
        
        .attendance-calendar :global(.ant-picker-cell-selected .ant-picker-calendar-date) {
          background: #eef2ff;
          border: 2px solid #4f46e5;
        }
      `}</style>
    </div>
  );
};

/* ================= STAT CARD ================= */
const StatCard = ({ title, value, icon, gradient, bgGradient, highlight }) => {
  return (
    <div className={`relative overflow-hidden rounded py-1 shadow-lg border border-gray-100 bg-gradient-to-br ${bgGradient} p-6 transition-all duration-300 hover:shadow-xl hover:scale-105`}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">

          {highlight && (
            <div className="px-2 py-1 rounded-full bg-white/50 backdrop-blur-sm">
              <span className="text-xs font-semibold text-gray-700">Key Metric</span>
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className={`text-lg font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1`}>
          {value}
        </p>
      </div>
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl`} />
    </div>
  );
};

/* ================= LEGEND ITEM ================= */
const LegendItem = ({ color, label }) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`px-2 py-1 rounded-md ${color} text-xs font-medium`}>
        {label}
      </div>
    </div>
  );
};

export default StudentAttendance;