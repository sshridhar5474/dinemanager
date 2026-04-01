import { useEffect, useMemo, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { menuData } from "../data/menuData";
import { inventoryData } from "../data/inventoryData";

const statusDurations = {
  Pending: 5000,
  Preparing: 10000,
  Ready: 6000,
  Completed: 5000
};

const tableNumbers = [1, 2, 3, 4, 5];

export default function Orders({ setToast }) {
  const [orders, setOrders] = useLocalStorage("orders", []);
  const [inventory, setInventory] = useLocalStorage("inventory", inventoryData);
  const [selectedTable, setSelectedTable] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) => {
        const currentTime = Date.now();

        return prev
          .map((order) => {
            const elapsed =
              currentTime - new Date(order.statusStartedAt).getTime();
            const duration = statusDurations[order.status];

            if (elapsed < duration) return order;

            if (order.status === "Pending") {
              return {
                ...order,
                status: "Preparing",
                statusStartedAt: new Date().toISOString()
              };
            }

            if (order.status === "Preparing") {
              return {
                ...order,
                status: "Ready",
                statusStartedAt: new Date().toISOString()
              };
            }

            if (order.status === "Ready") {
              const completedAt = new Date().toISOString();
              return {
                ...order,
                status: "Completed",
                statusStartedAt: completedAt,
                completedAt
              };
            }

            if (order.status === "Completed") {
              return null;
            }

            return order;
          })
          .filter(Boolean);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setOrders]);

  const canFulfillMenuItem = (menuItem) => {
    return menuItem.ingredients.every((ingredientName) => {
      const ingredient = inventory.find((item) => item.name === ingredientName);
      return ingredient && ingredient.quantity > 0;
    });
  };

  const createOrder = (menuItem) => {
    if (!selectedTable) {
      setToast("Select a table before placing an order");
      return;
    }

    if (!canFulfillMenuItem(menuItem)) {
      setToast(`${menuItem.name} is unavailable due to stock`);
      return;
    }

    const existingOrderNums = orders.map((order) => {
      const num = order.orderNumber?.split("-")[1];
      return Number(num || 0);
    });

    const nextNumber = String(Math.max(0, ...existingOrderNums) + 1).padStart(4, "0");
    const now = new Date();

    const newOrder = {
      id: Date.now(),
      orderNumber: `ORD-${nextNumber}`,
      tableNumber: selectedTable,
      name: menuItem.name,
      price: menuItem.price,
      status: "Pending",
      time: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),
      createdAt: now.toISOString(),
      statusStartedAt: now.toISOString(),
      completedAt: null
    };

    setOrders((prev) => [newOrder, ...prev]);

    setInventory((prev) =>
      prev.map((item) => {
        if (menuItem.ingredients.includes(item.name)) {
          return { ...item, quantity: Math.max(item.quantity - 1, 0) };
        }
        return item;
      })
    );

    const currentHour = now.getHours();
    const busyHours = JSON.parse(localStorage.getItem("busyHours") || "{}");
    busyHours[currentHour] = (busyHours[currentHour] || 0) + 1;
    localStorage.setItem("busyHours", JSON.stringify(busyHours));

    const usage = JSON.parse(localStorage.getItem("usage") || "{}");
    menuItem.ingredients.forEach((ingredient) => {
      usage[ingredient] = (usage[ingredient] || 0) + 1;
    });
    localStorage.setItem("usage", JSON.stringify(usage));

    const placedOrders = JSON.parse(localStorage.getItem("placedOrders") || "0");
    localStorage.setItem("placedOrders", JSON.stringify(placedOrders + 1));

    setToast(`Created ${newOrder.orderNumber} for Table ${selectedTable}`);
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter((order) => order.status === "Completed").length;
    const remaining = orders.filter(
      (order) =>
        order.status === "Pending" ||
        order.status === "Preparing" ||
        order.status === "Ready"
    ).length;

    return { total, completed, remaining };
  }, [orders]);

  return (
    <div>
      <div className="dashboard-header">
        <h2 className="section-title">Order Flow</h2>
        <span>Live kitchen simulation with timed progression</span>
      </div>

      <div className="cards order-stats">
        <div
          className="card clickable-card centered-card"
          onClick={() =>
            document.getElementById("pending-column")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <p>Placed Orders</p>
          <h2>{stats.total}</h2>
        </div>

        <div
          className="card clickable-card centered-card"
          onClick={() =>
            document.getElementById("completed-column")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <p>Completed</p>
          <h2>{stats.completed}</h2>
        </div>

        <div
          className="card clickable-card centered-card"
          onClick={() =>
            document.getElementById("preparing-column")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <p>Remaining</p>
          <h2>{stats.remaining}</h2>
        </div>
      </div>

      <div className="card">
        <h3>Select Table</h3>
        <div className="pill-group">
          {tableNumbers.map((table) => (
            <span
              key={table}
              className={`pill ${selectedTable === table ? "active" : ""}`}
              onClick={() => setSelectedTable(table)}
            >
              Table {table}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Quick Order Menu</h3>
        <div className="compact-menu-grid">
          {menuData.map((menuItem) => {
            const active = canFulfillMenuItem(menuItem);

            return (
              <button
                key={menuItem.id}
                className={`menu-chip-card ${active ? "" : "disabled"}`}
                onClick={() => createOrder(menuItem)}
                disabled={!active}
                title={active ? menuItem.ingredients.join(", ") : "Unavailable"}
              >
                {menuItem.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="kanban fixed-kanban">
        <div className="kanban-column" id="pending-column">
          <h4>Pending</h4>
          <div className="kanban-scroll">
            {orders
              .filter((order) => order.status === "Pending")
              .map((order) => (
                <div key={order.id} className="order-card">
                  <strong>{order.orderNumber}</strong>
                  <p>{order.name}</p>
                  <span>Table {order.tableNumber}</span>
                  <span>{order.time}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="kanban-column" id="preparing-column">
          <h4>Preparing</h4>
          <div className="kanban-scroll">
            {orders
              .filter((order) => order.status === "Preparing")
              .map((order) => (
                <div key={order.id} className="order-card">
                  <strong>{order.orderNumber}</strong>
                  <p>{order.name}</p>
                  <span>Table {order.tableNumber}</span>
                  <span>{order.time}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="kanban-column" id="ready-column">
          <h4>Ready</h4>
          <div className="kanban-scroll">
            {orders
              .filter((order) => order.status === "Ready")
              .map((order) => (
                <div key={order.id} className="order-card">
                  <strong>{order.orderNumber}</strong>
                  <p>{order.name}</p>
                  <span>Table {order.tableNumber}</span>
                  <span>{order.time}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="kanban-column" id="completed-column">
          <h4>Completed</h4>
          <div className="kanban-scroll">
            {orders
              .filter((order) => order.status === "Completed")
              .map((order) => (
                <div key={order.id} className="order-card">
                  <strong>{order.orderNumber}</strong>
                  <p>{order.name}</p>
                  <span>Table {order.tableNumber}</span>
                  <span>{order.time}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}