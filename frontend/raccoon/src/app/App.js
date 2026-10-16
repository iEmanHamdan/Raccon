import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Auth Feature
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";

function AppContent() {
  const location = useLocation();

  // Pages without Sidebar and Topbar
  const isAuthPage =
    location.pathname === "/register" || location.pathname === "/login";

  return (
    <div>
      <main className={isAuthPage ? "" : "main-content"}>
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/register" replace />} />

          {/* Authentication */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
