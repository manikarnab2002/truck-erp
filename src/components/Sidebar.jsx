import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/Dashboard', label: '📊 Dashboard' },
    { path: '/Fleet', label: '🚚 Fleet Status' },
    { path: '/Maintenance', label: '🔧 Repairs & Service' },
    { path: '/Drivers', label: '👨‍✈️ Drivers' },
    { path: '/Fuel', label: '⛽ Fuel Logs' },
  ];

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="logo">
          <h2>TruckERP</h2>
        </div>

        <nav className="nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}