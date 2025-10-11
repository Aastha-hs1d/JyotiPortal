import { themes } from "../theme";
import clickSound from "../assets/sounds/click.wav";
import hoverSound from "../assets/sounds/hover.wav";
import { useSound } from "../hooks/useSound";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // 👈 new import

const Navbar = ({ themeName, setThemeName }) => {
  const playClick = useSound(clickSound, 0.3);
  const playHover = useSound(hoverSound, 0.15);

  const location = useLocation();

  const pageTitles = {
    "/": "Dashboard",
    "/students": "Student Management",
    "/fees": "Fees Overview",
    "/notes": "Notes",
    "/test-planner": "Test Planner",
    "/announcements": "Announcements",
    "/settings": "Settings",
  };

  const currentTitle = pageTitles[location.pathname] || "";

  return (
    <div className="w-full bg-white shadow-sm flex justify-between items-center px-6 py-3">
      {/* 🔮 animated page title */}
      <div className="relative h-[28px] flex items-center max-w-[280px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.h2
            key={currentTitle}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="text-xl font-semibold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {currentTitle || ""}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* right side (theme + logout) */}
      <div className="flex items-center gap-6">
        {/* Theme Swatches */}
        <div className="flex gap-3">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => {
                playClick();
                setThemeName(key);
              }}
              onMouseEnter={playHover}
              title={theme.name}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-300 transform cursor-pointer ${
                themeName === key
                  ? "scale-125 border-[var(--color-primary-light)] shadow-md"
                  : "border-gray-300 hover:scale-110 hover:opacity-90"
              }`}
              style={{
                backgroundColor: theme.primary,
              }}
            ></button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={playClick}
          onMouseEnter={playHover}
          className="text-white px-4 py-1.5 rounded-lg transition-all duration-300 transform cursor-pointer hover:scale-105 hover:opacity-90"
          style={{
            backgroundColor: "var(--color-primary)",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
