import { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { Search } from "lucide-react";

const StudentsPage = () => {
  const { students, setStudents } = useData();

  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    joinDate: "",
    monthlyFee: "",
    phone: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [sortOption, setSortOption] = useState("none");
  const [sortOrder, setSortOrder] = useState("asc"); // ⬅️ NEW
  const [filterGrade, setFilterGrade] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 📋 Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ➕ Add or Update student
  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, grade, joinDate, monthlyFee, phone } = formData;

    if (!name || !grade || !joinDate || !monthlyFee || !phone)
      return alert("Please fill all fields!");

    if (editingId) {
      const updated = students.map((s) =>
        s.id === editingId
          ? { ...s, ...formData, monthlyFee: parseFloat(monthlyFee) }
          : s
      );
      setStudents(updated);
      setEditingId(null);
    } else {
      const newStudent = {
        id: Date.now(),
        name: name.trim(),
        grade,
        joinDate,
        monthlyFee: parseFloat(monthlyFee),
        phone,
        feesPaid: false,
        attendance: {},
      };
      setStudents([...students, newStudent]);
    }

    setFormData({
      name: "",
      grade: "",
      joinDate: "",
      monthlyFee: "",
      phone: "",
    });
  };

  // ✏️ Edit
  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      grade: student.grade,
      joinDate: student.joinDate,
      monthlyFee: student.monthlyFee,
      phone: student.phone || "",
    });
    setEditingId(student.id);
  };

  // 🗑️ Remove
  const handleRemove = (id) => {
    if (confirm("Are you sure you want to remove this student?")) {
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  // 🔍 Filter, Search, and Sort logic
  const filteredAndSorted = useMemo(() => {
    let data = [...students];

    // Filter by Grade
    if (filterGrade !== "all") {
      data = data.filter((s) => s.grade === filterGrade);
    }

    // Search by Name
    if (searchQuery.trim() !== "") {
      data = data.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort (unified + asc/desc)
    if (sortOption !== "none") {
      data.sort((a, b) => {
        let comparison = 0;

        if (sortOption === "name") {
          comparison = a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          });
        }

        if (sortOption === "grade") {
          const getGradeValue = (grade) => {
            if (!grade) return 9999;
            if (/nursery/i.test(grade)) return 0;
            if (/kg/i.test(grade)) return 1;
            const match = grade.match(/\d+/);
            return match ? parseInt(match[0]) : 9999;
          };
          comparison = getGradeValue(a.grade) - getGradeValue(b.grade);
        }

        if (sortOption === "joinDate") {
          comparison = new Date(a.joinDate) - new Date(b.joinDate);
        }

        return sortOrder === "desc" ? -comparison : comparison;
      });
    }

    return data;
  }, [students, sortOption, sortOrder, filterGrade, searchQuery]);

  const uniqueGrades = [...new Set(students.map((s) => s.grade))];
  const totalDisplayed = filteredAndSorted.length;

  return (
    <div className="p-6">
      <p className="text-gray-600 mt-2 mb-6">
        Add, view, and manage student details, admissions, and fee status.
      </p>

      {/* Add/Edit Form */}
      <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          {editingId ? "Edit Student" : "Add New Student"}
          {editingId && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md">
              Editing mode
            </span>
          )}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              placeholder="e.g. Aditi Sharma"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Class</label>
            <input
              name="grade"
              type="text"
              placeholder="e.g. 8th Grade"
              value={formData.grade}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Monthly Fee (₹)
            </label>
            <input
              name="monthlyFee"
              type="number"
              placeholder="e.g. 1500"
              value={formData.monthlyFee}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Admission Date
            </label>
            <input
              name="joinDate"
              type="date"
              value={formData.joinDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all"
            />
          </div>

          <div className="md:col-span-5 flex gap-3">
            <button
              type="submit"
              className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg cursor-pointer hover:opacity-90 hover:scale-[1.02] transform transition-all duration-200"
            >
              {editingId ? "Save Changes" : "Add Student"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: "",
                    grade: "",
                    joinDate: "",
                    monthlyFee: "",
                    phone: "",
                  });
                  setEditingId(null);
                }}
                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg cursor-pointer hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search + Filter + Sort */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        {/* Search */}
        <div className="relative flex items-center w-full sm:w-auto">
          <Search className="absolute left-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm w-full sm:w-64 focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all"
          />
        </div>

        {/* Sort + Filter */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort by */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:border-gray-400 focus:ring-2 focus:ring-[var(--color-primary-light)]"
            >
              <option value="none">None</option>
              <option value="name">Name</option>
              <option value="grade">Class</option>
              <option value="joinDate">Join Date</option>
            </select>
          </div>

          {/* Asc / Desc */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Order:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:border-gray-400 focus:ring-2 focus:ring-[var(--color-primary-light)]"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Filter by Grade */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Filter by Grade:</span>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:border-gray-400 focus:ring-2 focus:ring-[var(--color-primary-light)]"
            >
              <option value="all">All</option>
              {uniqueGrades.map((g, idx) => (
                <option key={idx} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Count */}
        <div className="text-sm font-medium text-gray-600">
          Showing{" "}
          <span className="text-[var(--color-primary)]">{totalDisplayed}</span>{" "}
          {totalDisplayed === 1 ? "student" : "students"}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Class</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Monthly Fee</th>
              <th className="px-6 py-3">Admission Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.length > 0 ? (
              filteredAndSorted.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium">{s.name}</td>
                  <td className="px-6 py-4">{s.grade}</td>
                  <td className="px-6 py-4">{s.phone}</td>
                  <td className="px-6 py-4">₹{s.monthlyFee}</td>
                  <td className="px-6 py-4">{s.joinDate}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-blue-600 hover:underline cursor-pointer"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 ml-4 hover:underline cursor-pointer"
                      onClick={() => handleRemove(s.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
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

export default StudentsPage;
