import { useEffect, useState } from "react";
import {
  Palette,
  Volume2,
  Bell,
  Download,
  Upload,
  Trash2,
  Info,
} from "lucide-react";
import { themes } from "../theme";
import clickSound from "../assets/sounds/click.wav";
import { useSound } from "../hooks/useSound";

const SettingsPage = () => {
  const [themeName, setThemeName] = useState(
    localStorage.getItem("theme") || "copper"
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [fontSize, setFontSize] = useState(
    localStorage.getItem("fontSize") || "medium"
  );
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("soundEnabled") !== "false"
  );

  const playClick = useSound(clickSound, 0.4);

  // 🧠 Utility: Apply theme (light/dark)
  const applyTheme = (key, isDark = darkMode) => {
    const t = themes[key];
    if (!t) return;

    if (isDark) {
      document.documentElement.style.setProperty(
        "--color-primary",
        t.darkAccent || t.primary
      );
      document.documentElement.style.setProperty(
        "--color-primary-light",
        t.darkAccent || t.primaryLight
      );
      document.documentElement.style.setProperty(
        "--color-border",
        t.darkBorder
      );
      document.documentElement.style.setProperty("--color-bg", t.darkBg);
      document.documentElement.style.setProperty("--color-accent", t.darkText);
      document.body.style.backgroundColor = t.darkBg;
      document.body.style.color = t.darkText;
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.style.setProperty("--color-primary", t.primary);
      document.documentElement.style.setProperty(
        "--color-primary-light",
        t.primaryLight
      );
      document.documentElement.style.setProperty("--color-border", t.border);
      document.documentElement.style.setProperty("--color-bg", t.bg);
      document.documentElement.style.setProperty(
        "--color-accent",
        t.accent || t.primary
      );
      document.body.style.backgroundColor = t.bg;
      document.body.style.color = t.accent || "#111827";
      document.documentElement.classList.remove("dark");
    }
  };

  // 🧩 Apply on mount + when toggled
  useEffect(() => {
    applyTheme(themeName, darkMode);
    localStorage.setItem("theme", themeName);
    localStorage.setItem("darkMode", darkMode);
  }, [themeName, darkMode]);

  // 🧩 Font size
  useEffect(() => {
    document.documentElement.style.fontSize =
      fontSize === "small" ? "14px" : fontSize === "large" ? "18px" : "16px";
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  // 🧩 Sound toggle
  const toggleSound = () => {
    const val = !soundEnabled;
    setSoundEnabled(val);
    localStorage.setItem("soundEnabled", val);
    if (val) playClick();
  };

  const handleClickSound = () => {
    if (soundEnabled) playClick();
  };

  // 🧾 Backup handling
  const handleExport = () => {
    handleClickSound();
    const data = {
      students: JSON.parse(localStorage.getItem("students")) || [],
      fees: JSON.parse(localStorage.getItem("fees")) || [],
      announcements: JSON.parse(localStorage.getItem("announcements")) || [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "jyoti_portal_backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.students)
          localStorage.setItem("students", JSON.stringify(data.students));
        if (data.fees) localStorage.setItem("fees", JSON.stringify(data.fees));
        if (data.announcements)
          localStorage.setItem(
            "announcements",
            JSON.stringify(data.announcements)
          );
        alert("✅ Backup imported. Refresh to see changes.");
      } catch {
        alert("⚠️ Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm("This will delete all local data. Continue?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="p-6 space-y-8 transition-all duration-300">
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Personalize your Jyoti Portal appearance and behavior ✨
      </p>

      {/* 🎨 THEME & DISPLAY */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-100 flex items-center gap-2">
          <Palette className="text-[var(--color-primary)]" size={18} /> Theme &
          Display
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Theme */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              App Theme
            </label>
            <select
              value={themeName}
              onChange={(e) => {
                handleClickSound();
                setThemeName(e.target.value);
              }}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              {Object.keys(themes).map((key) => (
                <option key={key} value={key}>
                  {themes[key].name}
                </option>
              ))}
            </select>
          </div>

          {/* Dark Mode */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Dark Mode
            </label>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => {
                  handleClickSound();
                  setDarkMode(!darkMode);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[var(--color-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          {/* Font Size */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Font Size
            </label>
            <select
              value={fontSize}
              onChange={(e) => {
                handleClickSound();
                setFontSize(e.target.value);
              }}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>

      {/* 🔊 SOUND & NOTIFICATIONS */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-100 flex items-center gap-2">
          <Volume2 className="text-[var(--color-primary)]" size={18} /> Sound &
          Notifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Sound Toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Enable Sounds
            </label>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={toggleSound}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[var(--color-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          {/* Popup Notifications */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Popup Notifications
            </label>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[var(--color-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          {/* Test Sound */}
          <div className="flex items-end">
            <button
              onClick={handleClickSound}
              className="bg-[var(--color-primary)] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 hover:scale-[1.03] transition-all duration-200 cursor-pointer w-full sm:w-auto"
            >
              Test Sound
            </button>
          </div>
        </div>
      </div>

      {/* 💾 DATA & BACKUP */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-100 flex items-center gap-2">
          <Download className="text-[var(--color-primary)]" size={18} /> Data &
          Backup
        </h2>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 hover:scale-[1.03] transition-all"
          >
            <Download size={16} /> Export Backup
          </button>

          <label className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all cursor-pointer">
            <Upload size={16} /> Import Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:opacity-90 hover:scale-[1.03] transition-all"
          >
            <Trash2 size={16} /> Reset All Data
          </button>
        </div>
      </div>

      {/* 👤 ABOUT */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-100 flex items-center gap-2">
          <Info className="text-[var(--color-primary)]" size={18} /> About &
          Credits
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          🌸 <strong>Jyoti Portal</strong> — built with love by{" "}
          <strong>Aastha</strong> for <strong>Jyoti Academy</strong>.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Version 1.0.0 — 2025
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
