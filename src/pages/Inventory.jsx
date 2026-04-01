import { useMemo, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { inventoryData } from "../data/inventoryData";
import { menuData } from "../data/menuData";

export default function Inventory({ setToast }) {
  const [inventory, setInventory] = useLocalStorage("inventory", inventoryData);
  const [filter, setFilter] = useState("All");

  const pills = ["All", "Low", "Healthy", "Out of Stock"];

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      if (filter === "Low") return item.quantity > 0 && item.quantity < item.threshold;
      if (filter === "Healthy") return item.quantity >= item.threshold;
      if (filter === "Out of Stock") return item.quantity <= 0;
      return true;
    });
  }, [inventory, filter]);

  const lowStockItems = inventory.filter(
    (item) => item.quantity > 0 && item.quantity < item.threshold
  ).length;

  const outOfStockItems = inventory.filter((item) => item.quantity <= 0).length;

  const inactiveMenuCount = menuData.filter((menuItem) =>
    menuItem.ingredients.some((ingredient) => {
      const matchedItem = inventory.find((stock) => stock.name === ingredient);
      return !matchedItem || matchedItem.quantity <= 0;
    })
  ).length;

  const restockItem = (id) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 10 } : item
      )
    );
    setToast("Ingredient restocked successfully");
  };

  return (
    <div>
      <div className="dashboard-header">
        <h2 className="section-title">Inventory Control</h2>
        <span>Track stock health across all ingredients</span>
      </div>

      <div className="cards">
        <div className="card">
          <p>Total Ingredients</p>
          <h2>{inventory.length}</h2>
        </div>
        <div className="card">
          <p>Low Stock</p>
          <h2>{lowStockItems}</h2>
        </div>
        <div className="card">
          <p>Inactive Menu Items</p>
          <h2>{inactiveMenuCount}</h2>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Inventory Filters</h3>
          <div className="pill-group">
            {pills.map((pill) => (
              <span
                key={pill}
                className={`pill ${filter === pill ? "active" : ""}`}
                onClick={() => setFilter(pill)}
              >
                {pill}
              </span>
            ))}
          </div>
          <div className="mini-stats">
            <div className="mini-stat">
              <span>Out of Stock</span>
              <strong>{outOfStockItems}</strong>
            </div>
            <div className="mini-stat">
              <span>Menu Disabled</span>
              <strong>{inactiveMenuCount}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Low Stock Alerts</h3>
          {inventory
            .filter((item) => item.quantity > 0 && item.quantity < item.threshold)
            .slice(0, 6)
            .map((item) => (
              <div key={item.id} className="alert">
                {item.name} is below threshold at {item.quantity}
              </div>
            ))}
          {inventory.filter((item) => item.quantity > 0 && item.quantity < item.threshold).length === 0 && (
            <div className="empty-state">All ingredients are currently healthy.</div>
          )}
        </div>
      </div>

      <div className="card table-card">
        <h3>Ingredient Inventory</h3>

        <div className="row header-row inventory-row">
          <span>Ingredient</span>
          <span>Quantity</span>
          <span>Threshold</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {filteredInventory.map((item) => {
          const status =
            item.quantity <= 0 ? "Out of Stock" : item.quantity < item.threshold ? "Low" : "Healthy";

          return (
            <div key={item.id} className="row inventory-row">
              <span>{item.name}</span>
              <span>{item.quantity}</span>
              <span>{item.threshold}</span>
              <span
                className={`inventory-status ${
                  status === "Healthy"
                    ? "healthy"
                    : status === "Low"
                    ? "low-text"
                    : "out-text"
                }`}
              >
                {status}
              </span>
              <button onClick={() => restockItem(item.id)}>Restock</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}