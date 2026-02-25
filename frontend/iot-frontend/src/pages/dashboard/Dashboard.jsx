import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { FaChartBar, FaCube, FaCog, FaBook, FaBars } from "react-icons/fa";
import "./Dashboard.css";

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [alertsCount] = useState(3); // exemple pour badge notifications

  return (
    <div className={`dashboard-container ${collapsed ? "collapsed" : ""}`}>
      
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="dashboard-title">{!collapsed && "Smart Campus"}</h2>
          <FaBars
            className="collapse-icon"
            onClick={() => setCollapsed(!collapsed)}
          />
        </div>

        <Link to="/events" className="dashboard-link">
          <FaChartBar className="icon" />
          {!collapsed && <>Événements {alertsCount > 0 && <span className="badge">{alertsCount}</span>}</>}
        </Link>

        <Link to="/objects" className="dashboard-link">
          <FaCube className="icon" />
          {!collapsed && "Données objets"}
        </Link>

        <Link to="/actions" className="dashboard-link">
          <FaCog className="icon" />
          {!collapsed && "Actions & Commandes"}
        </Link>

        <Link to="/api-docs" className="dashboard-link">
          <FaBook className="icon" />
          {!collapsed && "API Documentation"}
        </Link>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}