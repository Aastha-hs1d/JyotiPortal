const SettingsPage = () => {
  return (
    <div className="p-6">
      {/* Page Header */}

      <p className="text-gray-600 mt-2 mb-6">
        Manage app preferences, sound, and display options.
      </p>

      {/* Preferences Section */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Preferences
        </h2>

        <div className="space-y-4">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Enable Sound Effects</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[var(--color-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700">
              Enable Dark Mode (coming soon)
            </span>
            <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
              <input type="checkbox" disabled className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>

          {/* Default Theme Dropdown */}
          <div>
            <label className="block text-gray-700 mb-2">Default Theme</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 w-60 focus:ring-2 focus:ring-[var(--color-primary-light)] focus:outline-none">
              <option>Emerald 🌿</option>
              <option>Purple 💜</option>
              <option>Amber ☀️</option>
              <option>Teal 🌊</option>
              <option>Gray 🩶</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Account</h2>

        <div className="space-y-4">
          {/* Update Password */}
          <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 hover:scale-[1.02] transform transition-all duration-200">
            Change Password
          </button>

          {/* Delete Account */}
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:opacity-90 hover:scale-[1.02] transform transition-all duration-200">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
