import { useState } from "react";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

const NotesPage = () => {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);

  const handleUpload = (e) => {
    e.preventDefault();

    if (!subject.trim() || !file) {
      toast.error("Please enter a subject and select a file!");
      return;
    }

    setLoading(true);

    // simulate upload delay
    setTimeout(() => {
      setLoading(false);
      setSubject("");
      setFile(null);
      toast.success("Note uploaded successfully!");
    }, 800);
  };

  return (
    <div className="p-6">
      {/* 🌀 Global Loader */}
      <Loader show={loading} text="Uploading note..." />

      {/* Header */}
      <p className="text-gray-600 mt-2 mb-6">
        Upload, manage, and organize notes or study resources for your students.
      </p>

      {/* Upload Section */}
      <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Upload New Note
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Subject</label>
            <input
              type="text"
              placeholder="e.g. Mathematics, Physics..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Upload File
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:opacity-90"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[var(--color-primary)] hover:opacity-90 hover:scale-[1.02]"
            } text-white px-4 py-2 rounded-lg transform transition-all duration-200`}
          >
            {loading ? "Uploading..." : "Upload Note"}
          </button>
        </form>
      </div>

      {/* Notes List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Available Notes
        </h2>

        {/* Empty state for now */}
        <div className="p-6 bg-white border border-gray-100 rounded-xl text-gray-500 text-center">
          <p>No notes have been uploaded yet.</p>
          <p className="text-sm mt-1">
            Once uploaded, your notes will appear here for quick access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
