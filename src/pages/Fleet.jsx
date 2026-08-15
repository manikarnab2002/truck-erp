import React, { useState } from 'react';
import AddTruckModal from '../components/AddTruckModal';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Truck, 
  AlertCircle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

const initialFleetData = [
  { id: 'TRK-101', regNo: 'WB-19-AX-4021', model: 'Tata Signa 5530.S', type: 'Trailer', driver: 'Rajesh Kumar', mileage: '142,500 km', lastService: '2026-07-15', status: 'Active' },
  { id: 'TRK-102', regNo: 'WB-23-C-8812', model: 'Ashok Leyland 2820', type: 'Haulage', driver: 'Suresh Raina', mileage: '98,200 km', lastService: '2026-08-01', status: 'In Service' },
  { id: 'TRK-103', regNo: 'MH-12-Q-5510', model: 'BharatBenz 3523R', type: 'Tipper', driver: 'Amit Singh', mileage: '210,000 km', lastService: '2026-06-20', status: 'Active' },
  { id: 'TRK-104', regNo: 'DL-01-AB-9001', model: 'Mahindra Blazo X', type: 'Container', driver: 'Vikas Verma', mileage: '65,400 km', lastService: '2026-08-10', status: 'Idle' },
  { id: 'TRK-105', regNo: 'KA-04-E-1122', model: 'Tata Prima 4928.S', type: 'Trailer', driver: 'Dinesh Karthik', mileage: '185,900 km', lastService: '2026-05-12', status: 'Breakdown' },
  { id: 'TRK-106', regNo: 'WB-02-KL-3344', model: 'Eicher Pro 6028', type: 'Haulage', driver: 'Manoj Tiwari', mileage: '45,100 km', lastService: '2026-07-28', status: 'Active' },
];

export default function Fleet() {
  const [fleetList, setFleetList] = useState(initialFleetData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTruck = (newTruck) => {
    setFleetList((prev) => [newTruck, ...prev]);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return { bg: '#dcfce7', text: '#15803d', icon: <CheckCircle2 size={12} /> };
      case 'In Service':
        return { bg: '#fef3c7', text: '#b45309', icon: <Clock size={12} /> };
      case 'Idle':
        return { bg: '#f1f5f9', text: '#475569', icon: <Truck size={12} /> };
      case 'Breakdown':
        return { bg: '#fee2e2', text: '#b91c1c', icon: <AlertCircle size={12} /> };
      default:
        return { bg: '#f1f5f9', text: '#475569', icon: null };
    }
  };

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

        <div style={styles.filterGroup}>
          <Filter size={16} color="#64748b" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="In Service">In Service</option>
            <option value="Idle">Idle</option>
            <option value="Breakdown">Breakdown</option>
          </select>
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
              <th style={styles.th}>Assigned Driver</th>
              <th style={styles.th}>Mileage</th>
              <th style={styles.th}>Last Service</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredFleet.length > 0 ? (
              filteredFleet.map((truck) => {
                const badge = getStatusBadge(truck.status);
                return (
                  <tr key={truck.id} style={styles.tr}>
                    <td style={styles.td}><strong>{truck.id}</strong></td>
                    <td style={styles.td}>{truck.regNo}</td>
                    <td style={styles.td}>{truck.model}</td>
                    <td style={styles.td}>{truck.type}</td>
                    <td style={styles.td}>{truck.driver || 'Unassigned'}</td>
                    <td style={styles.td}>{truck.mileage}</td>
                    <td style={styles.td}>{truck.lastService || 'N/A'}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: badge.bg,
                        color: badge.text,
                      }}>
                        {badge.icon}
                        <span>{truck.status}</span>
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.actionBtn}>
                        <MoreVertical size={16} color="#64748b" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ ...styles.td, textAlign: 'center', color: '#64748b', padding: '24px' }}>
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
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    color: '#334155',
    outline: 'none',
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
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
  },
};