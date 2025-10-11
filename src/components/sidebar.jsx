import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  BookOpen,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import clickSound from "../assets/sounds/click.wav";
import hoverSound from "../assets/sounds/hover.wav";
import { useSound } from "../hooks/useSound";

const Sidebar = ({ collapsed, setCollapsed, themeName, setThemeName }) => {
  const location = useLocation();

  const playClick = useSound(clickSound, 0.3);
  const playHover = useSound(hoverSound, 0.15);

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/" },
    { name: "Students", icon: <Users size={20} />, path: "/students" },
    { name: "Fees", icon: <FileText size={20} />, path: "/fees" },
    { name: "Notes", icon: <BookOpen size={20} />, path: "/notes" },
    {
      name: "Test Planner",
      icon: <ClipboardList size={20} />,
      path: "/test-planner",
    },
    { name: "Announcements", icon: <Bell size={20} />, path: "/announcements" },
    { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ];

  return (
    <div
      className={`h-screen fixed top-0 left-0 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } text-white flex flex-col shadow-lg`}
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        {!collapsed && <h1 className="text-lg font-bold">Jyoti Academy</h1>}
        <button
          onClick={() => {
            playClick();
            setCollapsed(!collapsed);
          }}
          onMouseEnter={playHover}
          className="p-1 rounded transition-all duration-300 transform cursor-pointer hover:scale-110 hover:opacity-90"
          style={{ backgroundColor: "var(--color-primary-light)" }}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu */}
      <ul className="flex-1 mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li
              key={item.name}
              onMouseEnter={playHover}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:brightness-110 ${
                isActive ? "opacity-95" : "opacity-80"
              }`}
              style={{
                backgroundColor: isActive
                  ? "var(--color-primary-light)"
                  : "var(--color-primary)",
              }}
            >
              <Link
                to={item.path}
                onClick={playClick}
                className="flex items-center gap-3 w-full"
              >
                {item.icon}
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
