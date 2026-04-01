export default function Sidebar({ setPage }) {
  return (
    <div className="sidebar">
      <h2>DineManager</h2>

      <nav>
        <p onClick={() => setPage("dashboard")}>Dashboard</p>
        <p onClick={() => setPage("staff")}>Staff</p>
        <p onClick={() => setPage("inventory")}>Inventory</p>
        <p onClick={() => setPage("orders")}>Orders</p>
        <p onClick={() => setPage("tables")}>Table Management</p>
      </nav>
    </div>
  );
}