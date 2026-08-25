import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Search } from 'lucide-react';
import LogoutModal from './LogoutModal';

export default function Header() {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Clear session tokens or storage if applicable
    localStorage.removeItem('authToken');
    sessionStorage.clear();

    // 2. Redirect user to login route
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.searchBox}>
        
      </div>

      <div style={styles.profileArea}>
       

        <button
          style={styles.logoutTrigger}
          onClick={() => setIsLogoutOpen(true)}
          title="Logout"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
}

const styles = {
  header: {
    height: '60px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8fafc',
    // border: '1px solid #e2e8f0',
    // borderRadius: '6px',
    padding: '6px 12px',
    width: '280px',
  },
  input: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    width: '100%',
  },
  profileArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '13px',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
  },
  logoutTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fee2e2',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};