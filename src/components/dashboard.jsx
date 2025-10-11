const Dashboard = () => {
  return (
    <div className="p-6 grid grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-gray-600 font-medium">Total Students</h3>
        <p className="text-3xl font-bold mt-2">42</p>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-gray-600 font-medium">Fees Collected</h3>
        <p className="text-3xl font-bold mt-2">₹12,000</p>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-gray-600 font-medium">Pending Payments</h3>
        <p className="text-3xl font-bold mt-2 text-red-600">3</p>
      </div>
    </div>
  );
};

export default Dashboard;
