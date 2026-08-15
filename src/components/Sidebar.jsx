import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const menuItems = [
    { path: '/Dashboard', label: '📊 Overview' },
    { path: '/Fleet', label: '🚚 Fleet Status' },
    { path: '/Maintenance', label: '🔧 Repairs & Service' },
    { path: '/Drivers', label: '👨‍✈️ Drivers' },
    { path: '/Fuel', label: '⛽ Fuel Logs' },
    // { path: '/Logout', label: '🚪 Logout' },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <h2>TruckERP</h2>
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.link,
              backgroundColor: isActive ? '#1a73e8' : 'transparent',
              color: isActive ? '#ffffff' : '#b0bec5',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#1e293b',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },

  logo: {
    padding: '20px',
    textAlign: 'center',
    borderBottom: '1px solid #334155',
  },

  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 8px',
    gap: '8px',
  },

  link: {
    padding: '12px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
};