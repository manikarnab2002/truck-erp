import React, { useState } from 'react';
import AddDriverModal from '../components/AddDriverModal';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  ShieldCheck, 
  AlertTriangle, 
  Truck, 
  MoreVertical 
} from 'lucide-react';

const initialDrivers = [
  { id: 'DRV-101', name: 'Rajesh Kumar', phone: '+91 98765 43210', licenseNo: 'WB-0420180012', licenseExpiry: '2028-05-20', assignedTruck: 'WB-19-AX-4021', experience: '8 Yrs', status: 'On Duty' },
  { id: 'DRV-102', name: 'Suresh Raina', phone: '+91 98123 45678', licenseNo: 'WB-1120190054', licenseExpiry: '2026-09-15', assignedTruck: 'WB-23-C-8812', experience: '5 Yrs', status: 'On Leave' },
  { id: 'DRV-103', name: 'Amit Singh', phone: '+91 97654 32109', licenseNo: 'MH-1220150089', licenseExpiry: '2027-11-10', assignedTruck: 'MH-12-Q-5510', experience: '12 Yrs', status: 'On Duty' },
  { id: 'DRV-104', name: 'Vikas Verma', phone: '+91 99887 76655', licenseNo: 'DL-0120200033', licenseExpiry: '2026-08-30', assignedTruck: 'DL-01-AB-9001', experience: '4 Yrs', status: 'Available' },
  { id: 'DRV-105', name: 'Dinesh Karthik', phone: '+91 98989 89898', licenseNo: 'KA-0420170077', licenseExpiry: '2025-12-01', assignedTruck: 'Unassigned', experience: '10 Yrs', status: 'Expired License' },
];

export default function Drivers() {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddDriver = (newDriver) => {
    setDrivers((prev) => [newDriver, ...prev]);
  };

  const handleDelete = (id) => {
    setDrivers((prev) => prev.filter((driver) => driver.id !== id));
  };

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch = 
      driver.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.assignedTruck.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || driver.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'On Duty':
        return { bg: '#dcfce7', text: '#15803d', icon: <ShieldCheck size={12} /> };
      case 'Available':
        return { bg: '#dbeafe', text: '#1e40af', icon: <Truck size={12} /> };
      case 'On Leave':
        return { bg: '#fef3c7', text: '#b45309', icon: null };
      case 'Expired License':
        return { bg: '#fee2e2', text: '#b91c1c', icon: <AlertTriangle size={12} /> };
      default:
        return { bg: '#f1f5f9', text: '#475569', icon: null };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Driver Directory</h1>
          <p style={styles.subtitle}>Manage driver profiles, heavy vehicle licenses, and truck assignments.</p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Add New Driver</span>
        </button>
      </div>

      <AddDriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddDriver={handleAddDriver}
      />

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Driver ID</th>
              <th style={styles.th}>Full Name</th>
              <th style={styles.th}>Contact Number</th>
              <th style={styles.th}>License No</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver) => (
                <tr key={driver.id} style={styles.tr}>
                  <td style={styles.td}><strong>{driver.id}</strong></td>
                  <td style={styles.td}>{driver.name}</td>
                  <td style={styles.td}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={12} color="#64748b" />
                      {driver.phone}
                    </span>
                  </td>
                  <td style={styles.td}>{driver.licenseNo}</td>
                  <td style={styles.td}>
                    <button
                      style={{ ...styles.actionBtn, color: '#ef4444', fontWeight: '600' }}
                      onClick={() => handleDelete(driver.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#64748b', padding: '24px' }}>
                  No matching driver records found.
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