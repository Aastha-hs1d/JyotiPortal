const FeesPage = () => {
  return (
    <div className="p-6">
      <p className="text-gray-600 mt-2 mb-6">
        Track fee payments, pending dues, and payment history for each student.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Students */}
        <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm font-medium">Total Students</h2>
          <p className="text-3xl font-bold text-gray-800 mt-2">42</p>
        </div>

        {/* Fees Collected */}
        <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm font-medium">Fees Collected</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">₹12,000</p>
        </div>

        {/* Pending Payments */}
        <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm font-medium">
            Pending Payments
          </h2>
          <p className="text-3xl font-bold text-red-500 mt-2">3</p>
        </div>
      </div>

      {/* Placeholder for upcoming table */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Recent Transactions
        </h2>
        <div className="p-5 bg-white border border-gray-100 rounded-xl text-gray-500">
          <p>No recent fee records available yet.</p>
        </div>
      </div>
    </div>
  );
};

export default FeesPage;
