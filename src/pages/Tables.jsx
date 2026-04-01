import { useMemo, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const tableNumbers = [1, 2, 3, 4, 5];

export default function Tables({ setToast }) {
  const [orders, setOrders] = useLocalStorage("orders", []);
  const [selectedTable, setSelectedTable] = useState(null);

  const tables = useMemo(() => {
    return tableNumbers.map((tableNumber) => {
      const tableOrders = orders.filter((order) => order.tableNumber === tableNumber);
      const total = tableOrders.reduce((sum, order) => sum + (order.price || 0), 0);

      return {
        tableNumber,
        items: tableOrders,
        total,
        activeCount: tableOrders.filter(
          (order) =>
            order.status === "Pending" ||
            order.status === "Preparing" ||
            order.status === "Ready"
        ).length,
        completedCount: tableOrders.filter((order) => order.status === "Completed").length
      };
    });
  }, [orders]);

  const activeTable = tables.find((table) => table.tableNumber === selectedTable);

  const generateBill = () => {
    if (!activeTable || activeTable.items.length === 0) {
      setToast("No bill available for this table");
      return;
    }

    const remainingOrders = orders.filter(
      (order) => order.tableNumber !== activeTable.tableNumber
    );

    setOrders(remainingOrders);
    setSelectedTable(null);
    setToast(`Bill generated for Table ${activeTable.tableNumber}`);
  };

  return (
    <div>
      <div className="dashboard-header">
        <h2 className="section-title">Table Management</h2>
        <span>Live table billing and order summary</span>
      </div>

      <div className="cards">
        <div className="card centered-card">
          <p>Total Tables</p>
          <h2>{tableNumbers.length}</h2>
        </div>
        <div className="card centered-card">
          <p>Occupied Tables</p>
          <h2>{tables.filter((table) => table.items.length > 0).length}</h2>
        </div>
        <div className="card centered-card">
          <p>Open Bills</p>
          <h2>
            $
            {tables.reduce((sum, table) => sum + table.total, 0)}
          </h2>
        </div>
      </div>

      <div className="table-management-grid">
        {tables.map((table) => (
          <div
            key={table.tableNumber}
            className="table-bill-card clickable-card fixed-table-card"
            onClick={() => setSelectedTable(table.tableNumber)}
          >
            <div className="table-bill-header">
              <strong>Table {table.tableNumber}</strong>
              <span>${table.total}</span>
            </div>

            <div className="table-summary-stack">
              <div className="table-summary-line">
                <span>Total Items</span>
                <strong>{table.items.length}</strong>
              </div>
              <div className="table-summary-line">
                <span>Active Orders</span>
                <strong>{table.activeCount}</strong>
              </div>
              <div className="table-summary-line">
                <span>Completed</span>
                <strong>{table.completedCount}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeTable && (
        <div className="modal-overlay" onClick={() => setSelectedTable(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Table {activeTable.tableNumber}</h3>
                <p>Live order details and billing</p>
              </div>
              <button onClick={() => setSelectedTable(null)}>Close</button>
            </div>

            <div className="modal-body scroll-area">
              {activeTable.items.length > 0 ? (
                activeTable.items.map((item) => (
                  <div key={item.id} className="modal-order-row">
                    <div>
                      <strong>{item.orderNumber}</strong>
                      <p>{item.name}</p>
                    </div>
                    <div className="modal-order-meta">
                      <span>{item.status}</span>
                      <span>${item.price}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No orders for this table.</div>
              )}
            </div>

            <div className="modal-footer">
              <div className="bill-total">Total Bill: ${activeTable.total}</div>
              <button onClick={generateBill}>Generate Bill</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}