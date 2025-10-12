import { useEffect, useState, useMemo } from "react";
import { useData } from "../context/DataContext"; // ✅ new import
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardPage = () => {
  const { students, fees } = useData();
  const [attendanceHistory] = useState(
    JSON.parse(localStorage.getItem("attendanceHistory")) || {}
  );

  const today = new Date();
  const monthKey = today.toISOString().slice(0, 7);

  // ─────────────────────────────────────────
  // 📊 compute real analytics
  const liveStats = useMemo(() => {
    // Attendance %
    let total = 0,
      present = 0;
    students.forEach((s) => {
      const records = attendanceHistory[s.id] || [];
      const monthRecords = records.filter((r) => r.date.startsWith(monthKey));
      total += monthRecords.length;
      present += monthRecords.filter((r) => r.present).length;
    });
    const attendancePercent =
      total > 0 ? Math.round((present / total) * 100) : 0;

    // Fees %
    let totalExpected = 0,
      totalCollected = 0;
    fees.forEach((f) => {
      const monthRecord = f.records.find((r) => r.month === monthKey);
      if (monthRecord) {
        const expected =
          (monthRecord.monthlyFee || 0) + (monthRecord.carryForward || 0);
        totalExpected += expected;
        totalCollected += monthRecord.amountPaid || 0;
      }
    });
    const feesPercent =
      totalExpected > 0
        ? Math.round((totalCollected / totalExpected) * 100)
        : 0;

    // New admissions
    const newAdmissions = students.filter((s) => {
      const d = new Date(s.joinDate);
      return (
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    }).length;

    return {
      attendancePercent,
      feesPercent,
      newAdmissions,
      totalCollected,
      totalExpected,
    };
  }, [students, fees, attendanceHistory, monthKey]);

  // ─────────────────────────────────────────
  // circular animated counters (kept from your original)
  const [stats, setStats] = useState({
    feesPaid: 0,
    attendance: 0,
    admissions: 0,
  });
  const [animatedStats, setAnimatedStats] = useState({
    feesPaid: 0,
    attendance: 0,
    admissions: 0,
  });

  // update live target values
  useEffect(() => {
    setStats({
      feesPaid: liveStats.feesPercent,
      attendance: liveStats.attendancePercent,
      admissions: Math.min(liveStats.newAdmissions * 10, 100), // same scaling
    });
  }, [liveStats]);

  // animate numbers smoothly (your existing logic)
  useEffect(() => {
    const duration = 1200;
    const step = 15;
    const steps = Math.floor(duration / step);
    let current = { feesPaid: 0, attendance: 0, admissions: 0 };

    const timer = setInterval(() => {
      current = {
        feesPaid: Math.min(
          stats.feesPaid,
          current.feesPaid + stats.feesPaid / steps
        ),
        attendance: Math.min(
          stats.attendance,
          current.attendance + stats.attendance / steps
        ),
        admissions: Math.min(
          stats.admissions,
          current.admissions + stats.admissions / steps
        ),
      };
      setAnimatedStats({
        feesPaid: Math.round(current.feesPaid),
        attendance: Math.round(current.attendance),
        admissions: Math.round(current.admissions),
      });

      if (
        current.feesPaid >= stats.feesPaid &&
        current.attendance >= stats.attendance &&
        current.admissions >= stats.admissions
      )
        clearInterval(timer);
    }, step);

    return () => clearInterval(timer);
  }, [stats]);

  // ─────────────────────────────────────────
  // donut chart values (now live)
  const feeData = useMemo(() => {
    const paid = liveStats.totalCollected;
    const pending = Math.max(liveStats.totalExpected - paid, 0);
    const late = 0; // placeholder; can compute via dueDate vs paidDate later
    return [
      { name: "Paid", value: paid, students: students.length },
      { name: "Pending", value: pending, students: students.length },
      { name: "Late", value: late, students: 0 },
    ];
  }, [liveStats, students]);

  const COLORS = ["#10B981", "#FACC15", "#EF4444"];
  const totalFees = feeData.reduce((a, b) => a + b.value, 0);

  // your total counter animation kept as-is
  const [displayedTotal, setDisplayedTotal] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const stepTime = 15;
    const steps = duration / stepTime;
    const increment = totalFees / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= totalFees) {
        start = totalFees;
        clearInterval(timer);
      }
      setDisplayedTotal(Math.floor(start));
    }, stepTime);

    return () => clearInterval(timer);
  }, [totalFees]);

  const [activeIndex, setActiveIndex] = useState(null);
  const onEnter = (_, i) => setActiveIndex(i);
  const onLeave = () => setActiveIndex(null);

  // ─────────────────────────────────────────
  // CircleProgress component unchanged
  const CircleProgress = ({ label, value }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.04] transition-all duration-300 cursor-pointer">
        <svg className="w-28 h-28 mb-3" viewBox="0 0 100 100">
          <circle
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          <circle
            stroke="var(--color-primary)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{
              transition: "stroke-dashoffset 0.8s ease-out",
            }}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-2xl font-semibold fill-gray-700"
          >
            {value}%
          </text>
        </svg>
        <p className="text-gray-700 font-medium mt-1">{label}</p>
      </div>
    );
  };

  // ─────────────────────────────────────────
  // Render (identical styling)
  return (
    <div className="p-6">
      <p className="text-gray-600 mt-2 mb-6">
        Overview of Jyoti Academy’s monthly progress ✨
      </p>

      {/* Circular metrics with animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <CircleProgress label="Fees Paid" value={animatedStats.feesPaid} />
        <CircleProgress label="Attendance" value={animatedStats.attendance} />
        <CircleProgress
          label="New Admissions"
          value={animatedStats.admissions}
        />
      </div>

      {/* Fees Breakdown Donut Chart */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Fees Breakdown
        </h2>
        <p className="text-gray-600 mb-6">
          A quick look at this month’s fee collection status 💰
        </p>

        <div className="relative w-full h-80 flex justify-center items-center">
          <ResponsiveContainer width="90%" height="100%">
            <PieChart>
              <Pie
                data={feeData}
                cx="54%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={1000}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                {feeData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i]}
                    stroke="white"
                    strokeWidth={3}
                    style={{
                      transformOrigin: "center",
                      transform: activeIndex === i ? "scale(1.06)" : "scale(1)",
                      transition:
                        "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, n, p) => [
                  `₹${v.toLocaleString()} — ${p.payload.students} students`,
                  n,
                ]}
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                }}
              />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ right: 15, fontSize: 14 }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-gray-500 text-sm">Total</span>
            <span className="text-3xl font-extrabold text-gray-800">
              ₹{displayedTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <h2 className="text-gray-500 text-sm font-medium mb-1">
            Total Students
          </h2>
          <p className="text-4xl font-bold text-gray-800">{students.length}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <h2 className="text-gray-500 text-sm font-medium mb-1">
            Fees Collected
          </h2>
          <p className="text-4xl font-bold text-green-600">
            ₹{liveStats.totalCollected.toLocaleString()}
          </p>
        </div>
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <h2 className="text-gray-500 text-sm font-medium mb-1">
            Pending Fees
          </h2>
          <p className="text-4xl font-bold text-red-500">
            ₹
            {Math.max(
              liveStats.totalExpected - liveStats.totalCollected,
              0
            ).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        🌸 You’re doing amazing — one student at a time. 🌸
      </div>
    </div>
  );
};

export default DashboardPage;
