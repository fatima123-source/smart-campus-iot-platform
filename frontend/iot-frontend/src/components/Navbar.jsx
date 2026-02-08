import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";


export default function Navbar({ collapsed, setCollapsed }) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "☰" },
    { path: "/data", label: "Données", icon: "◉" },
    { path: "/objects", label: "Objets", icon: "▦" },
    { path: "/events", label: "Événement et Notifications", icon: "🔔" },
    { path: "/actions", label: "Actions et Commandes", icon: "⚡" }
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>


      <div className="sidebar-header">
        <span className="brand">Smart Campus</span>
        <button
          className="toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "➤" : "◀"}
        </button>
      </div>

      {/* NAV */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="avatar"></div>
        {!collapsed && (
          <div>
            <strong>Smart Campus</strong>
            <span className="version">v1.0.0 · 2026</span>
          </div>
        )}
      </div>

    </aside>
  );
}
