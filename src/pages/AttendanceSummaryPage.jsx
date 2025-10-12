import { useState, useMemo } from "react";
import { useData } from "../context/DataContext";

const AttendanceSummaryPage = () => {
  const { students, attendance } = useData();
  const [attendanceHistory] = useState(
    JSON.parse(localStorage.getItem("attendanceHistory")) || {}
  );
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [batchFilter, setBatchFilter] = useState("all");

  const filtered = useMemo(() => {
    return students.filter((s) =>
      batchFilter === "all" ? true : s.batch === batchFilter
    );
  }, [students, batchFilter]);

  const calculateStats = (studentId) => {
    const records = attendanceHistory[studentId] || [];
    const monthRecords = records.filter((r) => r.date.startsWith(month));
    const totalDays = monthRecords.length;
    const presentDays = monthRecords.filter((r) => r.present).length;
    const percentage =
      totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;
    return { totalDays, presentDays, percentage };
  };

  const uniqueBatches = ["all", ...new Set(students.map((s) => s.batch))];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Monthly Attendance Summary
      </h2>
      <p className="text-gray-600 mb-6">
        Review attendance percentages for {month}.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-gray-700 font-medium">Month:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-700 font-medium">Batch:</label>
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)]"
          >
            {uniqueBatches.map((b, idx) => (
              <option key={idx} value={b}>
                {b === "all" ? "All Batches" : b || "—"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Class</th>
              <th className="px-6 py-3">Batch</th>
              <th className="px-6 py-3 text-center">Present Days</th>
              <th className="px-6 py-3 text-center">Total Days</th>
              <th className="px-6 py-3 text-center">Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((s) => {
                const { totalDays, presentDays, percentage } = calculateStats(
                  s.id
                );
                const percentNum = parseFloat(percentage);
                const color =
                  percentNum >= 85
                    ? "text-green-600"
                    : percentNum >= 60
                    ? "text-yellow-600"
                    : "text-red-600";
                return (
                  <tr
                    key={s.id}
                    className={`border-b hover:bg-gray-50 transition-all ${
                      percentNum < 75 ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-medium">{s.name}</td>
                    <td className="px-6 py-4">{s.grade}</td>
                    <td className="px-6 py-4">{s.batch || "—"}</td>
                    <td className="px-6 py-4 text-center">{presentDays}</td>
                    <td className="px-6 py-4 text-center">{totalDays}</td>
                    <td
                      className={`px-6 py-4 text-center font-semibold ${color}`}
                    >
                      {percentage || "—"}%
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-6">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceSummaryPage;
