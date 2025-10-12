import { useState, useEffect, useMemo } from "react";
import { Megaphone, Plus, Trash2, Send, Edit, Bell } from "lucide-react";

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [schedule, setSchedule] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");
  const [notification, setNotification] = useState(null);

  // 🧾 Load announcements
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("announcements")) || [];
    setAnnouncements(stored);
  }, []);

  // 💾 Save to localStorage
  const saveToStorage = (data) => {
    localStorage.setItem("announcements", JSON.stringify(data));
  };

  // ➕ Create or Edit Announcement
  const handleSave = () => {
    if (!message.trim()) {
      alert("Message cannot be empty!");
      return;
    }

    if (editingAnnouncement) {
      // ✏️ Update existing announcement
      const updated = announcements.map((a) =>
        a.id === editingAnnouncement.id
          ? {
              ...a,
              title: title.trim() || "Announcement",
              message: message.trim(),
              schedule: schedule || a.schedule,
              status: a.status === "Broadcasted" ? "Broadcasted" : "Scheduled",
            }
          : a
      );
      setAnnouncements(updated);
      saveToStorage(updated);
      setEditingAnnouncement(null);
    } else {
      // ➕ Create new announcement
      const newAnnouncement = {
        id: Date.now(),
        title: title.trim() || "Announcement",
        message: message.trim(),
        schedule: schedule || new Date().toISOString().slice(0, 16),
        status: "Scheduled",
        createdAt: new Date().toISOString(),
      };
      const updated = [newAnnouncement, ...announcements];
      setAnnouncements(updated);
      saveToStorage(updated);
    }

    setShowModal(false);
    setTitle("");
    setMessage("");
    setSchedule("");
  };

  // 🗑️ Delete
  const handleDelete = (id) => {
    if (confirm("Delete this announcement?")) {
      const updated = announcements.filter((a) => a.id !== id);
      setAnnouncements(updated);
      saveToStorage(updated);
    }
  };

  // 📣 Dummy broadcast
  const handleBroadcast = (a) => {
    alert(
      `📢 Broadcasting to WhatsApp:\n\n"${a.title}"\n\n${a.message}\n\n(This will be automated via backend later.)`
    );
    const updated = announcements.map((x) =>
      x.id === a.id ? { ...x, status: "Broadcasted" } : x
    );
    setAnnouncements(updated);
    saveToStorage(updated);
  };

  // ✏️ Open Edit Modal
  const handleEdit = (a) => {
    if (a.status === "Broadcasted") return; // disable edit for broadcasted
    setEditingAnnouncement(a);
    setTitle(a.title);
    setMessage(a.message);
    setSchedule(a.schedule);
    setShowModal(true);
  };

  // 🧠 Sorting + Filtering
  const filteredAndSorted = useMemo(() => {
    let data = [...announcements];
    if (filterStatus !== "all") {
      data = data.filter((a) => a.status === filterStatus);
    }

    data.sort((a, b) => {
      if (sortOption === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOption === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOption === "scheduled")
        return new Date(a.schedule) - new Date(b.schedule);
      return 0;
    });

    return data;
  }, [announcements, sortOption, filterStatus]);

  // 🕒 Upcoming Reminder
  const upcoming = useMemo(
    () =>
      announcements.find(
        (a) => new Date(a.schedule) > new Date() && a.status !== "Broadcasted"
      ),
    [announcements]
  );

  // 🔔 Bell Notification for due scheduled messages
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      announcements.forEach((a) => {
        const scheduledTime = new Date(a.schedule);
        const timeDiff = scheduledTime - now;

        if (
          timeDiff <= 0 &&
          a.status === "Scheduled" &&
          !notification // avoid spamming
        ) {
          setNotification(a);
          // auto dismiss after 8s
          setTimeout(() => setNotification(null), 8000);
        }
      });
    }, 30000); // check every 30 seconds

    return () => clearInterval(interval);
  }, [announcements, notification]);

  return (
    <div className="p-6 space-y-8 relative">
      <p className="text-gray-600">
        Post or broadcast announcements to your students easily ✨
      </p>

      {/* 🔔 Notification Bell Popup */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-white border border-yellow-300 shadow-xl rounded-xl p-4 w-72 animate-fade-in">
          <div className="flex items-start gap-3">
            <Bell className="text-yellow-500 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-gray-800">
                {notification.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Scheduled time has arrived!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Reminder */}
      {upcoming && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          ⏰ Upcoming: <strong>{upcoming.title}</strong> on{" "}
          {new Date(upcoming.schedule).toLocaleString()}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <Megaphone size={18} className="text-[var(--color-primary)]" />
          Announcements
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 cursor-pointer focus:ring-2 focus:ring-[var(--color-primary-light)]"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="scheduled">By Schedule</option>
            </select>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 cursor-pointer focus:ring-2 focus:ring-[var(--color-primary-light)]"
            >
              <option value="all">All</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Broadcasted">Broadcasted</option>
            </select>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
          >
            <Plus size={16} />
            Create Announcement
          </button>
        </div>
      </div>

      {/* Announcements List */}
      {filteredAndSorted.length > 0 ? (
        <div className="space-y-4">
          {filteredAndSorted.map((a) => (
            <div
              key={a.id}
              className={`border-l-4 ${
                a.status === "Broadcasted"
                  ? "border-green-500"
                  : "border-yellow-400"
              } bg-white border border-gray-100 rounded-xl shadow-sm p-5 hover:shadow-md hover:scale-[1.01] transition-all duration-300`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {a.title}
                  </h3>
                  <p className="text-gray-600 mt-2 whitespace-pre-wrap">
                    {a.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-3">
                    🕒 {new Date(a.schedule).toLocaleString()} •{" "}
                    <span
                      className={`font-medium ${
                        a.status === "Broadcasted"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {a.status}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleBroadcast(a)}
                    className="text-green-600 hover:scale-110 transition-all cursor-pointer"
                    title="Broadcast to WhatsApp"
                  >
                    <Send size={20} />
                  </button>

                  {/* Disable Edit if Broadcasted */}
                  <button
                    onClick={() => handleEdit(a)}
                    className={`transition-all ${
                      a.status === "Broadcasted"
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:scale-110 cursor-pointer"
                    }`}
                    title={
                      a.status === "Broadcasted"
                        ? "Cannot edit broadcasted message"
                        : "Edit"
                    }
                    disabled={a.status === "Broadcasted"}
                  >
                    <Edit size={20} />
                  </button>

                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-500 hover:scale-110 transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 bg-white border border-gray-100 rounded-xl text-gray-500 text-center">
          <p>No announcements yet.</p>
          <p className="text-sm mt-1">
            Click “Create Announcement” to start broadcasting updates.
          </p>
        </div>
      )}

      {/* Modal (Create / Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editingAnnouncement
                ? "Edit Announcement"
                : "Create Announcement"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Class Rescheduled"
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your announcement message..."
                  rows="4"
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)] resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Schedule (optional)
                </label>
                <input
                  type="datetime-local"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAnnouncement(null);
                  setTitle("");
                  setMessage("");
                  setSchedule("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all cursor-pointer"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {editingAnnouncement ? "Save Changes" : "Save Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
