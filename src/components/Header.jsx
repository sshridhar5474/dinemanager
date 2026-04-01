export default function Header({ onLogout }) {
  return (
    <div className="header">
      <div>
        <h1>Restaurant Operations</h1>
        <p>Manage staff, inventory, orders, and tables</p>
      </div>

      <div className="header-actions">
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}