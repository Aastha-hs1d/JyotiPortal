const StudentsPage = () => {
  return (
    <div className="p-6">
      {/* Header */}

      <p className="text-gray-600 mt-2 mb-6">
        Add, view, and manage student details, admissions, and fee status.
      </p>

      {/* Add New Student */}
      <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Add New Student
        </h2>

        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Aditi Sharma"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
            />
          </div>

          {/* Class */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Class</label>
            <input
              type="text"
              placeholder="e.g. 8th Grade"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
            />
          </div>

          {/* Admission Date */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Admission Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-3">
            <button
              type="submit"
              className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 hover:scale-[1.02] transform transition-all duration-200"
            >
              Add Student
            </button>
          </div>
        </form>
      </div>

      {/* Student Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Class</th>
              <th className="px-6 py-3">Admission Date</th>
              <th className="px-6 py-3">Fees Paid</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Placeholder student (for now) */}
            <tr className="border-b hover:bg-gray-50 transition">
              <td className="px-6 py-4 font-medium">Aditi Sharma</td>
              <td className="px-6 py-4">8th Grade</td>
              <td className="px-6 py-4">2024-04-12</td>
              <td className="px-6 py-4 text-green-600 font-medium">Yes</td>
              <td className="px-6 py-4 text-right">
                <button className="text-blue-600 hover:underline">Edit</button>
                <button className="text-red-500 ml-3 hover:underline">
                  Remove
                </button>
              </td>
            </tr>

            {/* Empty State */}
            <tr>
              <td colSpan="5" className="text-center text-gray-500 py-6">
                No students added yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsPage;
