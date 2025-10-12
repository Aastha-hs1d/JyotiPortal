import { useEffect, useState } from "react";
import { useData } from "../context/DataContext";
import {
  ChevronDown,
  ChevronUp,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Papa from "papaparse";
import { saveAs } from "file-saver";

const AttendancePage = () => {
  const { students, attendance, setAttendance } = useData();

  const today = new Date().toISOString().split("T")[0];
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState(
    JSON.parse(localStorage.getItem("attendanceHistory")) || {}
  );

  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 🕒 Reset daily checklist if date changed
  useEffect(() => {
    const lastDate = localStorage.getItem("attendanceLastDate");
    if (lastDate !== today) {
      setAttendance({});
      localStorage.setItem("attendanceLastDate", today);
    }
  }, [today, setAttendance]);

  // 💾 Auto-save attendance + history
  useEffect(() => {
    localStorage.setItem("attendance", JSON.stringify(attendance));
    localStorage.setItem(
      "attendanceHistory",
      JSON.stringify(attendanceHistory)
    );
  }, [attendance, attendanceHistory]);

  // ✅ Toggle today's attendance (checkbox)
  const toggleAttendance = (studentId) => {
    setAttendance((prev) => {
      const updated = { ...prev, [studentId]: !prev[studentId] };

      setAttendanceHistory((prevHist) => {
        const copy = { ...prevHist };
        if (!copy[studentId]) copy[studentId] = [];
        const existing = copy[studentId].find((r) => r.date === today);
        if (existing) existing.present = updated[studentId];
        else copy[studentId].push({ date: today, present: updated[studentId] });
        return copy;
      });

      return updated;
    });
  };

  const toggleDateAttendance = (studentId, date) => {
    setAttendanceHistory((prevHist) => {
      const copy = structuredClone(prevHist || {}); // safer deep copy
      if (!copy[studentId]) copy[studentId] = [];

      // find exact record
      const idx = copy[studentId].findIndex((r) => r.date === date);
      if (idx === -1) {
        // ⭕ no record yet → mark present
        copy[studentId].push({ date, present: true });
      } else if (copy[studentId][idx].present === true) {
        // ✅ was present → mark absent
        copy[studentId][idx].present = false;
      } else if (copy[studentId][idx].present === false) {
        // ❌ was absent → remove (clear)
        copy[studentId].splice(idx, 1);
      }

      return copy;
    });
  };

  // 🔽 Batch filter
  const uniqueBatches = ["all", ...new Set(students.map((s) => s.batch))];
  const filteredStudents =
    selectedBatch === "all"
      ? students
      : students.filter((s) => s.batch === selectedBatch);

  // 🧮 Export CSV
  const exportAttendanceCSV = () => {
    const month = today.slice(0, 7);
    const rows = students.map((s) => {
      const records = attendanceHistory[s.id] || [];
      const monthRecords = records.filter((r) => r.date.startsWith(month));
      const totalDays = monthRecords.length;
      const daysPresent = monthRecords.filter((r) => r.present).length;
      const percent =
        totalDays > 0
          ? ((daysPresent / totalDays) * 100).toFixed(1) + "%"
          : "—";

      return {
        Name: s.name,
        Class: s.grade,
        Batch: s.batch || "—",
        "Days Present": daysPresent,
        "Total Days": totalDays,
        "Attendance %": percent,
      };
    });

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Attendance_Report_${month}.csv`);
  };

  // 📆 Generate all days for a specific month
  const getMonthDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return d.toISOString().split("T")[0];
    });
  };

  // 🕹️ Month navigation
  const changeMonth = (offset) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + offset);
      return newMonth;
    });
  };

  const monthDays = getMonthDays(currentMonth);
  const monthLabel = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // ───────────────────────────────────────────────
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Attendance Tracker
          </h2>
          <p className="text-gray-600">
            Click on any day to toggle attendance (🟩→🟥→⚪). Current day:{" "}
            <strong>{today}</strong>
          </p>
        </div>
        <button
          onClick={exportAttendanceCSV}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 hover:scale-[1.02] transition-all"
        >
          <Download size={16} /> Download Report (CSV)
        </button>
      </div>

      {/* Batch filter */}
      <div className="flex items-center gap-3 mb-6">
        <label className="text-gray-700 font-medium">Batch:</label>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)]"
        >
          {uniqueBatches.map((b, idx) => (
            <option key={idx} value={b}>
              {b === "all" ? "All Batches" : b || "—"}
            </option>
          ))}
        </select>
      </div>
      {/* Quick Mark Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => {
            const confirmMark = confirm(
              `Mark all students in ${
                selectedBatch === "all" ? "ALL batches" : selectedBatch
              } as PRESENT?`
            );
            if (!confirmMark) return;
            const target =
              selectedBatch === "all"
                ? students
                : students.filter((s) => s.batch === selectedBatch);

            setAttendance((prev) => {
              const updated = { ...prev };
              target.forEach((s) => {
                updated[s.id] = true;
              });
              return updated;
            });

            setAttendanceHistory((prevHist) => {
              const copy = structuredClone(prevHist || {});
              target.forEach((s) => {
                if (!copy[s.id]) copy[s.id] = [];
                const existing = copy[s.id].find((r) => r.date === today);
                if (existing) existing.present = true;
                else copy[s.id].push({ date: today, present: true });
              });
              return copy;
            });
          }}
          className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:scale-105 transition-all"
        >
          Mark All Present
        </button>

        <button
          onClick={() => {
            const confirmMark = confirm(
              `Mark all students in ${
                selectedBatch === "all" ? "ALL batches" : selectedBatch
              } as ABSENT?`
            );
            if (!confirmMark) return;
            const target =
              selectedBatch === "all"
                ? students
                : students.filter((s) => s.batch === selectedBatch);

            setAttendance((prev) => {
              const updated = { ...prev };
              target.forEach((s) => {
                updated[s.id] = false;
              });
              return updated;
            });

            setAttendanceHistory((prevHist) => {
              const copy = structuredClone(prevHist || {});
              target.forEach((s) => {
                if (!copy[s.id]) copy[s.id] = [];
                const existing = copy[s.id].find((r) => r.date === today);
                if (existing) existing.present = false;
                else copy[s.id].push({ date: today, present: false });
              });
              return copy;
            });
          }}
          className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:scale-105 transition-all"
        >
          Mark All Absent
        </button>

        <button
          onClick={() => {
            const confirmClear = confirm(
              `Clear all attendance for ${
                selectedBatch === "all" ? "ALL batches" : selectedBatch
              } today?`
            );
            if (!confirmClear) return;
            const target =
              selectedBatch === "all"
                ? students
                : students.filter((s) => s.batch === selectedBatch);

            setAttendance((prev) => {
              const updated = { ...prev };
              target.forEach((s) => delete updated[s.id]);
              return updated;
            });

            setAttendanceHistory((prevHist) => {
              const copy = structuredClone(prevHist || {});
              target.forEach((s) => {
                if (copy[s.id]) {
                  copy[s.id] = copy[s.id].filter((r) => r.date !== today);
                }
              });
              return copy;
            });
          }}
          className="bg-gray-400 text-white px-3 py-1.5 rounded-lg hover:scale-105 transition-all"
        >
          Clear All
        </button>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Class</th>
              <th className="px-6 py-3">Batch</th>
              <th className="px-6 py-3 text-center">Present</th>
              <th className="px-6 py-3 text-right">History</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s) => {
                const history = attendanceHistory[s.id] || [];

                return (
                  <>
                    <tr
                      key={s.id}
                      className="border-b hover:bg-gray-50 transition-all"
                    >
                      <td className="px-6 py-4 font-medium">{s.name}</td>
                      <td className="px-6 py-4">{s.grade}</td>
                      <td className="px-6 py-4">{s.batch || "—"}</td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={attendance[s.id] || false}
                          onChange={() => toggleAttendance(s.id)}
                          className="w-5 h-5 accent-[var(--color-primary)]"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="text-blue-600 text-sm font-medium hover:underline"
                          onClick={() =>
                            setExpandedStudent(
                              expandedStudent === s.id ? null : s.id
                            )
                          }
                        >
                          {expandedStudent === s.id ? (
                            <span className="flex items-center justify-end gap-1">
                              Hide <ChevronUp size={14} />
                            </span>
                          ) : (
                            <span className="flex items-center justify-end gap-1">
                              View <ChevronDown size={14} />
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>

                    {expandedStudent === s.id && (
                      <tr className="bg-gray-50">
                        <td colSpan="5" className="px-8 py-4">
                          <div>
                            {/* Month navigation */}
                            <div className="flex justify-between items-center mb-3">
                              <button
                                onClick={() => changeMonth(-1)}
                                className="p-2 hover:bg-gray-200 rounded-full"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <p className="text-sm font-medium text-gray-700">
                                {monthLabel}
                              </p>
                              <button
                                onClick={() => changeMonth(1)}
                                className="p-2 hover:bg-gray-200 rounded-full"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-10 sm:grid-cols-15 gap-1">
                              {getMonthDays(currentMonth).map((day) => {
                                const record = history.find(
                                  (r) => r.date === day
                                );
                                const status = record
                                  ? record.present
                                    ? "present"
                                    : "absent"
                                  : "none";
                                return (
                                  <div
                                    key={day}
                                    title={day}
                                    onClick={() =>
                                      toggleDateAttendance(s.id, day)
                                    }
                                    className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-medium cursor-pointer transition-all duration-200 hover:scale-105 ${
                                      status === "present"
                                        ? "bg-green-500 text-white"
                                        : status === "absent"
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-200 text-gray-400"
                                    }`}
                                  >
                                    {new Date(day).getDate()}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-6">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center text-sm text-gray-700 bg-gray-50 p-4 mt-6 rounded-lg shadow-sm border border-gray-100">
        <p>
          <strong>Total Students:</strong> {filteredStudents.length}
        </p>
        <p className="text-green-700 font-medium">
          <strong>Present:</strong>{" "}
          {filteredStudents.filter((s) => attendance[s.id]).length}
        </p>
        <p className="text-red-600 font-medium">
          <strong>Absent:</strong>{" "}
          {filteredStudents.filter((s) => !attendance[s.id]).length}
        </p>
      </div>
    </div>
  );
};

export default AttendancePage;
