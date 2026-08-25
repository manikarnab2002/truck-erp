import React, { useEffect, useState } from 'react';
import AddFuelModal from '../components/AddFuelModal';
import { 
  Fuel as FuelIcon, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Gauge, 
  TrendingUp, 
  MoreVertical 
} from 'lucide-react';

export default function Fuel() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadFuelLogs();
  }, []);

  const loadFuelLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/fuel');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load fuel logs.');
      setFuelLogs(data);
    } catch (error) {
      console.error('Load fuel logs error:', error);
      alert('Unable to load fuel logs. Please check your backend and MongoDB connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFuelLog = async (newLog) => {
    const response = await fetch('http://localhost:5000/api/fuel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    });
    const result = await response.json();

    if (!response.ok) {
      alert(result.message || 'Failed to add fuel log.');
      return false;
    }

    setFuelLogs((prev) => [result.data, ...prev]);
    return true;
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/fuel/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to delete fuel log.');
      setFuelLogs((prev) => prev.filter((log) => log.id !== id));
    } catch (error) {
      console.error('Delete fuel log error:', error);
      alert(error.message || 'Unable to delete fuel log.');
    }
  };

  const filteredLogs = fuelLogs.filter((log) => {
    return (
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.truckNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.station.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Fuel Logs & Consumption</h1>
          <p style={styles.subtitle}>Track diesel fill-ups, fuel efficiency, and station expenses.</p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Add Fuel Log</span>
        </button>
      </div>

      <AddFuelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddFuelLog={handleAddFuelLog}
      />

      <div style={styles.filterCard}>
        <div style={styles.searchBox}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search Log ID, Truck Reg, Driver, Station..."
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
              <th style={styles.th}>Log ID</th>
              <th style={styles.th}>Truck Reg No</th>
              <th style={styles.th}>Quantity (Liters)</th>
              <th style={styles.th}>Total Cost</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ ...styles.td, textAlign: 'center' }}>Loading fuel logs...</td></tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} style={styles.tr}>
                  <td style={styles.td}><strong>{log.id}</strong></td>
                  <td style={styles.td}>{log.truckNo}</td>
                  <td style={styles.td}>{log.liters}</td>
                  <td style={styles.td}><strong>{log.totalCost}</strong></td>
                  <td style={styles.td}>{log.date}</td>
                  <td style={styles.td}>
                    <button
                      style={{ ...styles.actionBtn, color: '#ef4444', fontWeight: '600' }}
                      onClick={() => handleDelete(log.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#64748b', padding: '24px' }}>
                  No matching fuel logs found.
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
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '22px', color: '#0f172a', fontWeight: '700' },
  subtitle: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1e293b', color: '#ffffff', padding: '10px 16px', borderRadius: '6px', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b' },
  cardValue: { fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: '8px 0 4px 0' },
  cardSub: { fontSize: '12px', color: '#64748b' },
  filterCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', flex: 1 },
  searchInput: { border: 'none', outline: 'none', backgroundColor: 'transparent', width: '100%', fontSize: '13px' },
  tableCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
  th: { padding: '10px 12px', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px', color: '#334155' },
  badge: { display: 'inline-block', backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' },
};