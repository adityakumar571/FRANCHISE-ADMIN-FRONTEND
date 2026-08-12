import * as React from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { getRequest } from "../../Helpers";

/* ---------------- CUSTOM DAY ---------------- */
function ServerDay(props) {
  const { attendance = {}, day, outsideCurrentMonth, ...other } = props;
  const status = attendance[day.date()];

  const getBgColor = () => {
    if (status === "P") return "#d1fae5";
    if (status === "A") return "#fee2e2";
    if (status === "H") return "#e0f2fe";
    return "transparent";
  };

  const getTextColor = () => {
    if (status === "P") return "#065f46";
    if (status === "A") return "#7f1d1d";
    if (status === "H") return "#075985";
    return "#374151";
  };

  return (
    <PickersDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      sx={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        fontSize: "14px",
        backgroundColor: getBgColor(),
        color: getTextColor(),
        fontWeight: status ? 600 : 400,
        "&:hover": {
          backgroundColor: getBgColor(),
        },
      }}
    />
  );
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function DateCalendarServerRequest({
  onClose,
  student,
  year,
  month,
  sessionId,
  classId,
  sectionId,
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [attendance, setAttendance] = React.useState({});

  /* ---------- FETCH STUDENT MONTHLY ATTENDANCE ---------- */
  const fetchAttendance = async (date) => {
    setIsLoading(true);
    try {
      const res = await getRequest(
        `attendance/monthly-student-calendar?month=${date.month() + 1}&year=${date.year()}&sessionId=${sessionId}&classId=${classId}&sectionId=${sectionId}&studentId=${student.studentId}`
      );

      const list = res.data?.data?.attendance || [];
      const map = {};

      list.forEach((d) => {
        if (d.status) {
          map[d.day] = d.status;
        }
      });

      setAttendance(map);
    } catch (err) {
      console.error("Calendar attendance error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- INITIAL LOAD ---------- */
  React.useEffect(() => {
    fetchAttendance(dayjs(new Date(year, month)));
  }, [student, year, month]);

  /* ---------- MONTH CHANGE ---------- */
  const handleMonthChange = (date) => {
    setAttendance({});
    fetchAttendance(date);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-lg p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        {/* Student Info */}
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-800">
            {student.name}
          </h2>
          <p className="text-sm text-gray-600">
            Roll No.: {student.roll} | Class: {student.className} {student.sectionName} | Father: Mr. {student.father}
          </p>
        </div>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
           value={null}  
            loading={isLoading}
            onMonthChange={handleMonthChange}
            renderLoading={() => <DayCalendarSkeleton />}
            slots={{ day: ServerDay }}
            slotProps={{ day: { attendance } }}
            sx={{
              width: "100%",
              "& .MuiDayCalendar-weekContainer": {
                justifyContent: "center",
              },
            }}
          />
        </LocalizationProvider>

        {/* Legend */}
        <div className="flex justify-center gap-4 text-sm mt-2">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span> Present
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span> Absent
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-sky-500 rounded-full"></span> Holiday
          </span>
        </div>
      </div>
    </div>
  );
}
