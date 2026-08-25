import React, { useEffect, useState } from 'react';
import AddTruckModal from '../components/AddTruckModal';
import { 
  Search, 
  Plus, 
  Truck, 
  AlertCircle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export default function Fleet() {
  const [fleetList, setFleetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTrucks();
  }, []);

  const loadTrucks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trucks');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load trucks.');
      setFleetList(data);
    } catch (error) {
      console.error('Load trucks error:', error);
      alert('Unable to load trucks. Please check your backend and MongoDB connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTruck = async (newTruck) => {
    const response = await fetch('http://localhost:5000/api/trucks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTruck),
    });
    const result = await response.json();

    if (!response.ok) {
      alert(result.message || 'Failed to add truck.');
      return false;
    }

    setFleetList((prev) => [result.data, ...prev]);
    return true;
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/trucks/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to delete truck.');
      setFleetList((prev) => prev.filter((truck) => truck.id !== id));
    } catch (error) {
      console.error('Delete truck error:', error);
      alert(error.message || 'Unable to delete truck.');
    }
  };

  const filteredFleet = fleetList.filter((truck) => {
    const matchesSearch = 
      truck.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || truck.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Fleet Management</h1>
          <p style={styles.subtitle}>Track vehicle status, assigned drivers, and maintenance records.</p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Add New Truck</span>
        </button>
      </div>

      <AddTruckModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTruck={handleAddTruck}
      />

      <div style={styles.filterCard}>
        <div style={styles.searchBox}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by Truck ID, Reg No, Driver, Model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Truck ID</th>
              <th style={styles.th}>Reg Number</th>
              <th style={styles.th}>Vehicle Model</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>Loading trucks...</td></tr>
            ) : filteredFleet.length > 0 ? (
              filteredFleet.map((truck) => (
                <tr key={truck.id} style={styles.tr}>
                  <td style={styles.td}><strong>{truck.id}</strong></td>
                  <td style={styles.td}>{truck.regNo}</td>
                  <td style={styles.td}>{truck.model}</td>
                  <td style={styles.td}>{truck.type}</td>
                  <td style={styles.td}>
                    <button
                      style={{ ...styles.actionBtn, color: '#ef4444', fontWeight: '600' }}
                      onClick={() => handleDelete(truck.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#64748b', padding: '24px' }}>
                  No matching trucks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '22px',
    color: '#0f172a',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '2px',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
  filterCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '8px 12px',
    flex: 1,
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    width: '100%',
    fontSize: '13px',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13px',
  },
  th: {
    padding: '10px 12px',
    borderBottom: '1px solid #e2e8f0',
    color: '#64748b',
    fontWeight: '600',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px',
    color: '#334155',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
  },
};