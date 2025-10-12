import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ✅ COMPONENTS (lowercase filenames)
import Sidebar from "./components/sidebar";
import Navbar from "./components/navbar";
import Layout from "./components/Layout";

// ✅ THEMES
import { themes } from "./theme";

// ✅ PAGES (PascalCase filenames)
import DashboardPage from "./pages/DashboardPage";
import StudentsPage from "./pages/StudentsPage";
import FeesPage from "./pages/FeesPage";
import NotesPage from "./pages/NotesPage";
import TestPlannerPage from "./pages/TestPlannerPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import SettingsPage from "./pages/SettingsPage";
import AttendancePage from "./pages/AttendancePage";

function App() {
  // theme state
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
      >
        <Routes>
          <Route
            element={
              <Layout themeName={themeName} setThemeName={setThemeName} />
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/fees" element={<FeesPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/test-planner" element={<TestPlannerPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
