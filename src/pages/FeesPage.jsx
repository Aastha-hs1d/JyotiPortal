import { useEffect, useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import Papa from "papaparse";
import { saveAs } from "file-saver";

const FeesPage = () => {
  const { students, fees, generateMonthlyFees, setFees } = useData();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const exportReport = () => {
    const rows = filteredStudents
      .map((s) => {
        const rec = getRecord(s.id);
        if (!rec) return null;
        const carryForward = rec.carryForward || 0;
        const totalDue = s.monthlyFee + carryForward;
        const paid = rec.amountPaid || 0;
        const remaining = Math.max(totalDue - paid, 0);

        const dueDate = new Date(rec.dueDate);
        const paidDate = rec.paidDate ? new Date(rec.paidDate) : null;

        let status = "Pending";
        if (paid >= totalDue) {
          status = paidDate > dueDate ? "Late" : "Paid";
        } else if (paid > 0 && paid < totalDue) {
          status = "Partial";
        } else if (new Date() > dueDate) {
          status = "Late";
        }

        return {
          Name: s.name,
          Grade: s.grade,
          "Monthly Fee": s.monthlyFee,
          "Carry Forward": carryForward,
          "Total Due": totalDue,
          "Amount Paid": paid,
          Remaining: remaining,
          "Due Date": rec.dueDate,
          "Paid On": rec.paidDate || "—",
          Status: status,
        };
      })
      .filter(Boolean);

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const fileName = `Fees_Report_${month}.csv`;
    saveAs(blob, fileName);
  };

  // Ensure current month record exists
  useEffect(() => {
    generateMonthlyFees();
  }, [students]);

  // Get record for a specific student
  const getRecord = (id) => {
    const record = fees.find((f) => f.id === id);
    if (!record) return null;
    return record.records.find((r) => r.month === month);
  };

  // Toggle payment
  const toggleFeeStatus = (studentId, month) => {
    const todayStr = new Date().toISOString().split("T")[0];
    setFees((prev) =>
      prev.map((f) =>
        f.id === studentId
          ? {
              ...f,
              records: f.records.map((r) =>
                r.month === month
                  ? {
                      ...r,
                      paid: !r.paid,
                      paidDate: !r.paid ? todayStr : null,
                    }
                  : r
              ),
            }
          : f
      )
    );
  };

  // Compute filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const rec = getRecord(s.id);
      if (!rec) return false;

      // Filter by name
      if (
        searchQuery &&
        !s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;

      // Filter by grade
      if (filterGrade !== "all" && s.grade !== filterGrade) return false;

      // Compute status for filtering
      const dueDate = new Date(rec.dueDate);
      const paidDate = rec.paidDate ? new Date(rec.paidDate) : null;
      const totalDue = s.monthlyFee + (rec.carryForward || 0);
      const paidAmount = rec.amountPaid || 0;

      let status = "Pending";
      if (paidAmount >= totalDue) {
        status = paidDate > dueDate ? "Late" : "Paid";
      } else if (paidAmount > 0 && paidAmount < totalDue) {
        status = "Partial";
      } else if (new Date() > dueDate) {
        status = "Late";
      }

      // Apply status filter
      if (
        (statusFilter === "paid" && status !== "Paid") ||
        (statusFilter === "partial" && status !== "Partial") ||
        (statusFilter === "late" && status !== "Late") ||
        (statusFilter === "pending" && status !== "Pending")
      ) {
        return false;
      }

      return true;
    });
  }, [students, fees, month, searchQuery, filterGrade, statusFilter]);

  // Calculate summary
  const summary = useMemo(() => {
    let totalExpected = 0;
    let totalCollected = 0;
    let totalRemaining = 0;
    const today = new Date();

    students.forEach((s) => {
      const rec = getRecord(s.id);
      if (!rec) return;
      const dueDate = new Date(rec.dueDate);
      if (dueDate < new Date(s.joinDate)) return; // skip months before admission

      const carryForward = rec.carryForward || 0;
      const totalDue = s.monthlyFee + carryForward;
      const paid = rec.amountPaid || 0;
      const remaining = Math.max(totalDue - paid, 0);

      totalExpected += totalDue;
      totalCollected += paid;
      totalRemaining += remaining;
    });

    return { totalExpected, totalCollected, totalRemaining };
  }, [students, fees, month]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Fees Management
      </h1>
      <p className="text-gray-600 mb-6">
        Review monthly fee history, track due balances, and manage carry-forward
        payments.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Month */}
        <div className="flex items-center gap-2">
          <label className="text-gray-700 font-medium">Month:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)]"
          />
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[200px] focus:ring-2 focus:ring-[var(--color-primary-light)]"
        />

        {/* Grade */}
        <div className="flex items-center gap-2">
          <label className="text-gray-700 font-medium">Grade:</label>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)]"
          >
            <option value="all">All Grades</option>
            {[...new Set(students.map((s) => s.grade))].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-gray-700 font-medium">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)]"
          >
            <option value="all">All</option>
            <option value="paid">Paid in Full</option>
            <option value="partial">Partial Payment</option>
            <option value="late">Late Payment</option>
            <option value="pending">Pending / Not Paid</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end mb-6">
        <button
          onClick={exportReport}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 hover:scale-[1.02] transform transition-all duration-200"
        >
          Download Report (CSV)
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Class</th>
              <th className="px-6 py-3">Monthly Fee</th>
              <th className="px-6 py-3">Carry Forward</th>
              <th className="px-6 py-3">Total Due</th>
              <th className="px-6 py-3">Amount Paid</th>
              <th className="px-6 py-3">Remaining</th>
              <th className="px-6 py-3">Due Date</th>
              <th className="px-6 py-3">Paid On</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s) => {
                const rec = getRecord(s.id);
                if (!rec) return null;

                const carryForward = rec.carryForward || 0;
                const totalDue = s.monthlyFee + carryForward;
                const paid = rec.amountPaid || 0;
                const remaining = Math.max(totalDue - paid, 0);
                const dueDate = new Date(rec.dueDate);
                const paidDate = rec.paidDate ? new Date(rec.paidDate) : null;

                let status = "Pending";
                if (paid >= totalDue) {
                  status = paidDate > dueDate ? "Late" : "Paid";
                } else if (paid > 0 && paid < totalDue) {
                  status = "Partial";
                } else if (new Date() > dueDate) {
                  status = "Late";
                }

                return (
                  <tr
                    key={s.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium">{s.name}</td>
                    <td className="px-6 py-4">{s.grade}</td>
                    <td className="px-6 py-4">₹{s.monthlyFee}</td>
                    <td className="px-6 py-4 text-yellow-600">
                      ₹{carryForward}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      ₹{totalDue}
                    </td>
                    <td className="px-6 py-4">₹{paid}</td>
                    <td
                      className={`px-6 py-4 font-medium ${
                        remaining > 0
                          ? "text-red-600 font-semibold"
                          : "text-green-600 font-semibold"
                      }`}
                    >
                      ₹{remaining}
                    </td>
                    <td className="px-6 py-4">{rec.dueDate}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {rec.paidDate || "—"}
                    </td>
                    <td
                      className={`px-6 py-4 text-center font-semibold ${
                        status === "Paid"
                          ? "text-green-600"
                          : status === "Late"
                          ? "text-red-600"
                          : status === "Partial"
                          ? "text-yellow-600"
                          : "text-gray-500"
                      }`}
                    >
                      {status}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleFeeStatus(s.id, month)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                          rec.paid
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {rec.paid ? "Undo" : "Mark Paid"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" className="text-center text-gray-500 py-6">
                  No students found for this selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Bar */}
      <div className="flex justify-between items-center text-sm text-gray-700 bg-gray-50 p-4 mt-6 rounded-lg shadow-sm border border-gray-100">
        <p>
          <strong>Total Expected:</strong> ₹
          {summary.totalExpected.toLocaleString()}
        </p>
        <p className="text-green-700 font-medium">
          <strong>Total Collected:</strong> ₹
          {summary.totalCollected.toLocaleString()}
        </p>
        <p className="text-red-600 font-medium">
          <strong>Total Remaining:</strong> ₹
          {summary.totalRemaining.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default FeesPage;
