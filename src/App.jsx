import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";
import Navbar from "./components/navbar";
import Dashboard from "./components/dashboard";
import { themes } from "./theme";

function App() {
  // Load saved theme or default to emerald
  const [themeName, setThemeName] = useState(
    localStorage.getItem("theme") || "emerald"
  );

  const theme = themes[themeName];

  useEffect(() => {
    localStorage.setItem("theme", themeName);
  }, [themeName]);

  return (
    <div
      className="flex min-h-screen"
      style={{
        "--color-primary": theme.primary,
        "--color-primary-light": theme.primaryLight,
        "--color-border": theme.border,
        "--color-bg": theme.bg,
        backgroundColor: "var(--color-bg)",
      }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar themeName={themeName} setThemeName={setThemeName} />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
