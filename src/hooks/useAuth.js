// src/hooks/useAuth.js
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token; // true if token exists, false if not
};
