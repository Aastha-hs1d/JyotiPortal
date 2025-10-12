import { useEffect, useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import Papa from "papaparse";
import { saveAs } from "file-saver";

const FeesPage = () => {
  const { students, fees, generateMonthlyFees, updateFeeRecord } = useData();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [amountInput, setAmountInput] = useState("");
  const [paidOnInput, setPaidOnInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [expandedStudent, setExpandedStudent] = useState(null);

  useEffect(() => {
    // only generate once when students exist and month changes
    if (students.length > 0) {
      generateMonthlyFees(month);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, students.length]);

  // get record helper
  const getRecord = (id) => {
    const studentFee = fees.find((f) => f.id === id);
    if (!studentFee) return null;
    return studentFee.records.find((r) => r.month === month);
  };

  // open modal
  const openPaymentModal = (student) => {
    setSelectedStudent(student);
    const rec = getRecord(student.id);
    setAmountInput(rec?.amountPaid || "");
    setPaidOnInput(rec?.paidDate || "");
    setNoteInput(rec?.paymentNote || "");
    setShowModal(true);
  };

  // save payment info
  const savePayment = () => {
    if (!selectedStudent) return;
    const rec = getRecord(selectedStudent.id);
    const carryForward = rec?.carryForward || 0;
    const totalDue = selectedStudent.monthlyFee + carryForward;
    const amount = parseFloat(amountInput || 0);
    const paidDate = paidOnInput || new Date().toISOString().split("T")[0];
    const dueDate = new Date(rec.dueDate);

    let paidStatus = false;
    if (amount >= totalDue) paidStatus = true;

    updateFeeRecord(selectedStudent.id, month, {
      amountPaid: amount,
      paidDate,
      paid: paidStatus,
      paymentNote: noteInput,
    });

    setShowModal(false);
    setSelectedStudent(null);
    setAmountInput("");
    setPaidOnInput("");
    setNoteInput("");
  };

  // export CSV
  const exportReport = () => {
    const rows = filteredStudents
      .map((s) => {
        const rec = getRecord(s.id);
        if (!rec) return null;
        const carryForward = rec.carryForward || 0;
        const totalDue = s.monthlyFee + carryForward;
        const paid = rec.amountPaid || 0;
        const remaining = Math.max(totalDue - paid, 0);

        const dueDate = rec.dueDate || "—";
        const paidDate = rec.paidDate || "—";

        let status = "Pending";
        if (paid >= totalDue) {
          status = new Date(paidDate) > new Date(dueDate) ? "Late" : "Paid";
        } else if (paid > 0 && paid < totalDue) {
          status = "Partial";
        } else if (new Date() > new Date(dueDate)) {
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
          "Due Date": dueDate,
          "Paid On": paidDate,
          Status: status,
        };
      })
      .filter(Boolean);

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Fees_Report_${month}.csv`);
  };

  // filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const rec = getRecord(s.id);
      if (!rec) return false;

      if (
        searchQuery &&
        !s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;

      if (filterGrade !== "all" && s.grade !== filterGrade) return false;

      const totalDue = s.monthlyFee + (rec.carryForward || 0);
      const paid = rec.amountPaid || 0;
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

      if (
        (statusFilter === "paid" && status !== "Paid") ||
        (statusFilter === "partial" && status !== "Partial") ||
        (statusFilter === "late" && status !== "Late") ||
        (statusFilter === "pending" && status !== "Pending")
      )
        return false;

      return true;
    });
  }, [students, fees, month, searchQuery, filterGrade, statusFilter]);

  // summary
  const summary = useMemo(() => {
    let totalExpected = 0,
      totalCollected = 0,
      totalRemaining = 0;
    students.forEach((s) => {
      const rec = getRecord(s.id);
      if (!rec) return;
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
      <p className="text-gray-600 mb-6">
        Track payments, due dates, and monthly histories with ease.
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

        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[200px] focus:ring-2 focus:ring-[var(--color-primary-light)]"
        />

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
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 hover:scale-[1.02] transition-all"
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
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length ? (
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
                  <>
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
                          remaining > 0 ? "text-red-600" : "text-green-600"
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
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                        <button
                          onClick={() => openPaymentModal(s)}
                          className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all"
                        >
                          Mark Paid
                        </button>

                        <button
                          onClick={() =>
                            setExpandedStudent(
                              expandedStudent === s.id ? null : s.id
                            )
                          }
                          className="text-blue-600 text-xs font-medium underline hover:text-blue-800 transition-all cursor-pointer"
                        >
                          {expandedStudent === s.id
                            ? "Hide History"
                            : "View History"}
                        </button>
                      </td>
                    </tr>

                    {expandedStudent === s.id && (
                      <tr className="bg-gray-50 transition-all">
                        <td colSpan="11" className="px-8 py-4">
                          <table className="w-full text-sm border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                              <tr>
                                <th className="px-4 py-2">Month</th>
                                <th className="px-4 py-2">Due Date</th>
                                <th className="px-4 py-2">Paid On</th>
                                <th className="px-4 py-2">Amount Paid</th>
                                <th className="px-4 py-2">Carry Forward</th>
                                <th className="px-4 py-2">Note</th>
                                <th className="px-4 py-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fees
                                .find((f) => f.id === s.id)
                                ?.records.sort(
                                  (a, b) =>
                                    new Date(b.month + "-01") -
                                    new Date(a.month + "-01")
                                )
                                .map((r) => {
                                  const totalDue =
                                    s.monthlyFee + (r.carryForward || 0);
                                  const paid = r.amountPaid || 0;
                                  const dueDate = new Date(r.dueDate);
                                  const paidDate = r.paidDate
                                    ? new Date(r.paidDate)
                                    : null;

                                  let st = "Pending";
                                  if (paid >= totalDue) {
                                    st = paidDate > dueDate ? "Late" : "Paid";
                                  } else if (paid > 0 && paid < totalDue) {
                                    st = "Partial";
                                  } else if (new Date() > dueDate) {
                                    st = "Late";
                                  }

                                  return (
                                    <tr
                                      key={r.month}
                                      className="border-t border-gray-200"
                                    >
                                      <td className="px-4 py-2">{r.month}</td>
                                      <td className="px-4 py-2">{r.dueDate}</td>
                                      <td className="px-4 py-2">
                                        {r.paidDate || "—"}
                                      </td>
                                      <td className="px-4 py-2">
                                        ₹{r.amountPaid || 0}
                                      </td>
                                      <td className="px-4 py-2">
                                        ₹{r.carryForward || 0}
                                      </td>
                                      <td className="px-4 py-2">
                                        {r.paymentNote || "—"}
                                      </td>
                                      <td
                                        className={`px-4 py-2 font-medium ${
                                          st === "Paid"
                                            ? "text-green-600"
                                            : st === "Late"
                                            ? "text-red-600"
                                            : st === "Partial"
                                            ? "text-yellow-600"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {st}
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" className="text-center text-gray-500 py-6">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-md animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Mark Payment for {selectedStudent?.name}
            </h2>
            <label className="text-sm text-gray-600 mb-1 block">
              Amount Paid
            </label>
            <input
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="Enter amount"
              className="border border-gray-300 rounded-lg w-full px-3 py-2 mb-4 focus:ring-2 focus:ring-[var(--color-primary-light)]"
            />
            <label className="text-sm text-gray-600 mb-1 block">Paid On</label>
            <input
              type="date"
              value={paidOnInput}
              onChange={(e) => setPaidOnInput(e.target.value)}
              className="border border-gray-300 rounded-lg w-full px-3 py-2 mb-4 focus:ring-2 focus:ring-[var(--color-primary-light)]"
            />
            <label className="text-sm text-gray-600 mb-1 block">
              Payment Method
            </label>
            <select
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="border border-gray-300 rounded-lg w-full px-3 py-2 mb-4 focus:ring-2 focus:ring-[var(--color-primary-light)]"
            >
              <option value="">Select Method</option>
              <option value="Cash">Cash</option>
              <option value="Paytm">Paytm</option>
              <option value="Other">Other</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={savePayment}
                className="px-4 py-2 rounded-lg text-white hover:opacity-90 cursor-pointer transition-all"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesPage;
