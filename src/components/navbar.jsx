import { themes } from "../theme";
import clickSound from "../assets/sounds/click.wav";
import hoverSound from "../assets/sounds/hover.wav";
import { useSound } from "../hooks/useSound";

const Navbar = ({ themeName, setThemeName }) => {
  const playClick = useSound(clickSound, 0.3);
  const playHover = useSound(hoverSound, 0.15);

  return (
    <div className="w-full bg-white shadow-sm flex justify-between items-center px-6 py-3">
      <h2 className="text-xl font-semibold text-gray-700">Dashboard</h2>

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
