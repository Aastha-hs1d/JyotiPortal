import { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [fees, setFees] = useState([]);

  // 🧾 Load stored data
  useEffect(() => {
    setStudents(JSON.parse(localStorage.getItem("students")) || []);
    setFees(JSON.parse(localStorage.getItem("fees")) || []);
    setAttendance(JSON.parse(localStorage.getItem("attendance")) || {});
  }, []);

  // 💾 Auto-save everything
  useEffect(
    () => localStorage.setItem("students", JSON.stringify(students)),
    [students]
  );
  useEffect(() => localStorage.setItem("fees", JSON.stringify(fees)), [fees]);
  useEffect(
    () => localStorage.setItem("attendance", JSON.stringify(attendance)),
    [attendance]
  );

  // 💰 Smarter monthly fee generator with carry-forward logic
  const generateMonthlyFees = (
    selectedMonth = new Date().toISOString().slice(0, 7)
  ) => {
    setFees((prevFees) => {
      const updatedFees = [...prevFees];

      students.forEach((student) => {
        const admissionDate = new Date(student.joinDate);
        const [year, month] = selectedMonth.split("-").map(Number);
        const selectedMonthDate = new Date(year, month - 1, 1);

        // 🛑 Skip months before admission
        if (
          selectedMonthDate <
          new Date(admissionDate.getFullYear(), admissionDate.getMonth(), 1)
        ) {
          return;
        }

        // find or create student record
        let studentFee = updatedFees.find((f) => f.id === student.id);
        if (!studentFee) {
          studentFee = { id: student.id, records: [] };
          updatedFees.push(studentFee);
        }

        const hasRecord = studentFee.records.some(
          (r) => r.month === selectedMonth
        );

        if (!hasRecord) {
          // Find previous month’s record for carry-forward
          const prevMonthDate = new Date(year, month - 2, 1);
          const prevMonth = `${prevMonthDate.getFullYear()}-${String(
            prevMonthDate.getMonth() + 1
          ).padStart(2, "0")}`;
          const prevRecord = studentFee.records.find(
            (r) => r.month === prevMonth
          );

          const prevRemaining =
            prevRecord &&
            prevRecord.monthlyFee +
              (prevRecord.carryForward || 0) -
              (prevRecord.amountPaid || 0) >
              0
              ? prevRecord.monthlyFee +
                (prevRecord.carryForward || 0) -
                (prevRecord.amountPaid || 0)
              : 0;

          const dueStr = `${selectedMonth}-${String(
            admissionDate.getDate()
          ).padStart(2, "0")}`;

          studentFee.records.push({
            month: selectedMonth,
            dueDate: dueStr,
            monthlyFee: student.monthlyFee,
            carryForward: prevRemaining,
            amountPaid: 0,
            paidDate: null,
            paid: false,
          });
        } else {
          // 🧩 Recalculate carry forward dynamically if previous month was updated
          const record = studentFee.records.find(
            (r) => r.month === selectedMonth
          );
          const prevMonthDate = new Date(year, month - 2, 1);
          const prevMonth = `${prevMonthDate.getFullYear()}-${String(
            prevMonthDate.getMonth() + 1
          ).padStart(2, "0")}`;
          const prevRecord = studentFee.records.find(
            (r) => r.month === prevMonth
          );

          if (prevRecord) {
            const prevRemaining =
              prevRecord.monthlyFee +
              (prevRecord.carryForward || 0) -
              (prevRecord.amountPaid || 0);
            record.carryForward = prevRemaining > 0 ? prevRemaining : 0;
          }
        }
      });

      return updatedFees;
    });
  };

  // 🧮 Update a specific student's fee record
  const updateFeeRecord = (studentId, month, newData) => {
    setFees((prev) =>
      prev.map((f) =>
        f.id === studentId
          ? {
              ...f,
              records: f.records.map((r) =>
                r.month === month ? { ...r, ...newData } : r
              ),
            }
          : f
      )
    );
  };

  // ✅ Toggle paid/unpaid (simple click handler)
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

  const value = {
    students,
    setStudents,
    attendance,
    setAttendance,
    fees,
    setFees,
    generateMonthlyFees,
    toggleFeeStatus,
    updateFeeRecord, // 🔧 new helper for modal updates
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
