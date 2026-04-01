import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import useLocalStorage from "../hooks/useLocalStorage";
import { staffData } from "../data/staffData";
import { inventoryData } from "../data/inventoryData";

const expectedCompletionSeconds = 35;

export default function Dashboard({ setPage }) {
  const [time, setTime] = useState(new Date());
  const [staff] = useLocalStorage("staff", staffData);
  const [inventory] = useLocalStorage("inventory", inventoryData);
  const [usage] = useLocalStorage("usage", {});
  const [orders] = useLocalStorage("orders", []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalStaff = staff.length;
  const presentToday = staff.filter((member) => member.present).length;
  const lowStock = inventory.filter(
    (item) => item.quantity > 0 && item.quantity < item.threshold
  );
  const outOfStock = inventory.filter((item) => item.quantity <= 0).length;

  const placedOrders = JSON.parse(localStorage.getItem("placedOrders") || "0");

  const completedDurations = useMemo(() => {
    return orders
      .filter((order) => order.completedAt && order.createdAt)
      .map((order) => {
        const start = new Date(order.createdAt).getTime();
        const end = new Date(order.completedAt).getTime();
        return Math.round((end - start) / 1000);
      });
  }, [orders]);

  const averageCompletionTime = completedDurations.length
    ? Math.round(
        completedDurations.reduce((sum, value) => sum + value, 0) /
          completedDurations.length
      )
    : 0;

  const avgHealthy =
    averageCompletionTime > 0 && averageCompletionTime <= expectedCompletionSeconds;

  const busyHoursRaw = JSON.parse(localStorage.getItem("busyHours") || "{}");

  const busyChartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const hour = index + 11;
      const labelHour = hour > 12 ? hour - 12 : hour;
      const suffix = hour >= 12 ? "PM" : "AM";

      return {
        time: `${labelHour}:00 ${suffix}`,
        orders: busyHoursRaw[hour] || 0
      };
    });
  }, [orders]);

  const topUsedIngredients = Object.entries(usage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const remainingOrders = orders.filter(
    (order) =>
      order.status === "Pending" ||
      order.status === "Preparing" ||
      order.status === "Ready"
  ).length;

  const completedLive = orders.filter(
    (order) => order.status === "Completed"
  ).length;

  return (
    <div>
      <div className="dashboard-header">
        <h2 className="section-title">Operations Overview</h2>
        <span>{time.toLocaleString()}</span>
      </div>

      <div className="cards dashboard-click-cards">
        <div
          className="card clickable-card centered-card"
          onClick={() => setPage("staff")}
        >
          <p>Staff Present</p>
          <h2>{presentToday}/{totalStaff}</h2>
        </div>

        <div
          className="card clickable-card centered-card"
          onClick={() => setPage("inventory")}
        >
          <p>Low / Out of Stock</p>
          <h2>{lowStock.length + outOfStock}</h2>
        </div>

        <div
          className="card clickable-card centered-card"
          onClick={() => setPage("orders")}
        >
          <p>Placed Orders</p>
          <h2>{placedOrders}</h2>
        </div>

        <div
          className="card clickable-card centered-card"
          onClick={() => setPage("orders")}
        >
          <p>Completed / Remaining</p>
          <h2>{completedLive}/{remainingOrders}</h2>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Inventory Alerts</h3>
          {lowStock.slice(0, 5).map((item) => (
            <div key={item.id} className="alert">
              {item.name} is low at {item.quantity}
            </div>
          ))}
          {outOfStock > 0 && (
            <div className="alert critical-alert">
              {outOfStock} ingredient{outOfStock > 1 ? "s are" : " is"} out of stock
            </div>
          )}
          {lowStock.length === 0 && outOfStock === 0 && (
            <div className="empty-state">No immediate inventory risks detected.</div>
          )}
        </div>

        <div className="card">
          <h3>Average Completion Time</h3>
          <div className={`avg-time-badge ${avgHealthy ? "good" : "warning"}`}>
            {averageCompletionTime > 0 ? `${averageCompletionTime}s` : "No completed orders yet"}
          </div>
          <p className="subtle-note">
            Target threshold: {expectedCompletionSeconds}s or below
          </p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Ingredient Usage Snapshot</h3>
          {topUsedIngredients.length > 0 ? (
            <div className="mini-stats">
              {topUsedIngredients.map(([name, count]) => (
                <div key={name} className="mini-stat">
                  <span>{name}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Usage data will appear after orders are created.</div>
          )}
        </div>

        <div className="card">
          <h3>Order Flow Snapshot</h3>
          <div className="mini-stats">
            <div className="mini-stat">
              <span>Placed</span>
              <strong>{placedOrders}</strong>
            </div>
            <div className="mini-stat">
              <span>Completed</span>
              <strong>{completedLive}</strong>
            </div>
            <div className="mini-stat">
              <span>Remaining</span>
              <strong>{remainingOrders}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card chart-card">
        <h3>Restaurant Load by Hour</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={busyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}