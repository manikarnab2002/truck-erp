import React, { useEffect, useState } from 'react';
import AddTruckModal from '../components/AddTruckModal';
import { exportCsv } from '../utils/exportCsv';
import { Search, Plus } from 'lucide-react';

async function readApiResponse(response) {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: `Server returned a non-JSON response (${response.status}).`,
      raw: text.slice(0, 200),
    };
  }
}

const normalizeTruck = (truck, index = 0) => {
  if (!truck || typeof truck !== 'object') return null;

  const id = String(
    truck.id ||
    truck._id?.toString?.() ||
    truck.truckNumber ||
    truck.regNo ||
    `truck-${index}`
  );

  return {
    ...truck,
    id,
    regNo: truck.regNo || truck.truckNumber || '',
    model: truck.model || '',
    type: truck.type || 'Trailer',
    date: truck.date || truck.registeredDate || '',
  };
};

export default function Fleet() {
  const [fleetList, setFleetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);

  useEffect(() => {
    loadTrucks();
  }, []);

  const loadTrucks = async () => {
    try {
      const response = await fetch('/api/trucks');
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.message || 'Failed to load trucks.');
      setFleetList(
        Array.isArray(data)
          ? data.map(normalizeTruck).filter(Boolean)
          : []
      );
    } catch (error) {
      console.error('Load trucks error:', error);
      alert('Unable to load trucks. Please check your backend and MongoDB connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTruck = async (newTruck) => {
    try {
      const method = editingTruck ? 'PUT' : 'POST';
      const url = editingTruck
        ? `/api/trucks?id=${encodeURIComponent(editingTruck.id)}`
        : '/api/trucks';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTruck),
      });

      const result = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(result.message || (editingTruck ? 'Failed to update truck.' : 'Failed to add truck.'));
        return false;
      }

      await loadTrucks();
      setEditingTruck(null);
      return true;
    } catch (error) {
      console.error('Save truck error:', error);
      alert(error.message || 'Unable to save truck.');
      return false;
    }
  };

  const openEditTruck = (truck) => {
    setEditingTruck(truck);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/trucks?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.message || 'Failed to delete truck.');
      setFleetList((prev) => prev.filter((truck) => truck.id !== id));
    } catch (error) {
      console.error('Delete truck error:', error);
      alert(error.message || 'Unable to delete truck.');
    }
  };

  const filteredFleet = fleetList.filter((truck) => {
    if (!truck) return false;

    return [truck.regNo, truck.model, truck.type, truck.id]
      .some((value) => String(value || '').toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleExportExcel = () => {
    const headers = ['Truck ID', 'Reg Number', 'Chassis Number', 'Vehicle Model', 'Type', 'Driver', 'Status'];
    const rows = filteredFleet.map((truck) => [
      truck.id,
      truck.regNo,
      truck.chassisNo,
      truck.model,
      truck.type,
      truck.driver,
      truck.status,
    ]);
    exportCsv(`Fleet_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Fleet Management</h1>
          <p style={styles.subtitle}>Track vehicle status and registration records.</p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Add New Truck</span>
        </button>
        <button style={styles.exportBtn} onClick={handleExportExcel}>
          Export Excel
        </button>
      </div>

      <AddTruckModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTruck(null);
        }}
        onAddTruck={handleAddTruck}
        initialData={editingTruck}
        mode={editingTruck ? 'edit' : 'add'}
      />


      <div style={styles.filterCard}>
        <div style={styles.searchBox}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by Truck ID, Reg No, Model, Type..."
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
              <th style={styles.th}>Chassis Number</th>
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
                  <td style={styles.td}>{truck.chassisNo || '-'}</td>
                  <td style={styles.td}>{truck.model}</td>
                  <td style={styles.td}>{truck.type}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        style={{ ...styles.actionBtn, color: '#2563eb', fontWeight: '600' }}
                        onClick={() => openEditTruck(truck)}
                      >
                        Edit
                      </button>
                      <button
                        style={{ ...styles.actionBtn, color: '#ef4444', fontWeight: '600' }}
                        onClick={() => handleDelete(truck.id)}
                      >
                        Delete
                      </button>
                    </div>
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
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#047857',
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