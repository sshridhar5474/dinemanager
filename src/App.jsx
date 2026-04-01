import { useEffect, useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Toast from "./components/Toast";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Tables from "./pages/Tables";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );

  useEffect(() => {
    const clearToast = () => setToast("");
    window.addEventListener("clear-toast", clearToast);
    return () => window.removeEventListener("clear-toast", clearToast);
  }, []);

  const handleLogin = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    const keysToRemove = [
      "isAuthenticated",
      "staff",
      "inventory",
      "orders",
      "usage",
      "busyHours",
      "placedOrders"
    ];

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    setIsAuthenticated(false);
    setPage("dashboard");
    setToast("");
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Sidebar setPage={setPage} />

      <div className="main">
        <Header onLogout={handleLogout} />

        {page === "dashboard" && <Dashboard setPage={setPage} />}
        {page === "staff" && <Staff />}
        {page === "inventory" && <Inventory setToast={setToast} />}
        {page === "orders" && <Orders setToast={setToast} />}
        {page === "tables" && <Tables setToast={setToast} />}
      </div>

      <Toast message={toast} />
    </div>
  );
}