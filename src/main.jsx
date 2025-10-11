import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// 🧠 add this line
import { DataProvider } from "./context/DataContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 🧩 wrap your entire app in the DataProvider */}
    <DataProvider>
      <App />
    </DataProvider>
  </StrictMode>
);
