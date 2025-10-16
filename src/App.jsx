import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// ✅ PAGES
import DashboardPage from "./pages/DashboardPage";
import StudentsPage from "./pages/StudentsPage";
import FeesPage from "./pages/FeesPage";
import NotesPage from "./pages/NotesPage";
import TestPlannerPage from "./pages/TestPlannerPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import SettingsPage from "./pages/SettingsPage";
import AttendancePage from "./pages/AttendancePage";
import LoginPage from "./pages/LoginPage";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "./hooks/useAuth";

// ✅ THEMES
import { themes } from "./theme";

function App() {
  const [themeName, setThemeName] = useState(
    localStorage.getItem("theme") || "emerald"
  );
  const theme = themes[themeName];

  useEffect(() => {
    localStorage.setItem("theme", themeName);
  }, [themeName]);

  return (
    <Router>
      <div
        style={{
          "--color-primary": theme.primary,
          "--color-primary-light": theme.primaryLight,
          "--color-border": theme.border,
          "--color-bg": theme.bg,
          backgroundColor: "var(--color-bg)",
        }}
        className="min-h-screen transition-all duration-300"
      >
        <Toaster position="top-right" reverseOrder={false} />

        <Routes>
          {/* 🔒 Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout themeName={themeName} setThemeName={setThemeName} />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="fees" element={<FeesPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="test-planner" element={<TestPlannerPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="attendance" element={<AttendancePage />} />
          </Route>

          {/* 🪪 Public Routes */}
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
