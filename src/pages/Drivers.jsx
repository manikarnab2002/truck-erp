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

      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>Total Registered</span>
            <Users size={18} color="#1e293b" />
          </div>
          <div style={styles.cardValue}>{drivers.length}</div>
          <p style={styles.cardSub}>Active Fleet Operators</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>Currently On Duty</span>
            <ShieldCheck size={18} color="#10b981" />
          </div>
          <div style={styles.cardValue}>
            {drivers.filter((d) => d.status === 'On Duty').length}
          </div>
          <p style={{ ...styles.cardSub, color: '#10b981' }}>Active Driving Shifts</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>Available Drivers</span>
            <Truck size={18} color="#3b82f6" />
          </div>
          <div style={styles.cardValue}>
            {drivers.filter((d) => d.status === 'Available').length}
          </div>
          <p style={{ ...styles.cardSub, color: '#3b82f6' }}>Ready for Trip Assignment</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>License Alerts</span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={styles.cardValue}>
            {drivers.filter((d) => d.status === 'Expired License').length}
          </div>
          <p style={{ ...styles.cardSub, color: '#ef4444' }}>Requires Immediate Renewal</p>
        </div>
      </div>

      <div style={styles.filterCard}>
        <div style={styles.searchBox}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search Driver ID, Name, License No, Truck..."
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
            <option value="On Duty">On Duty</option>
            <option value="Available">Available</option>
            <option value="On Leave">On Leave</option>
            <option value="Expired License">Expired License</option>
          </select>
        </div>
      </div>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Driver ID</th>
              <th style={styles.th}>Full Name</th>
              <th style={styles.th}>Contact Number</th>
              <th style={styles.th}>License No</th>
              <th style={styles.th}>License Expiry</th>
              <th style={styles.th}>Experience</th>
              <th style={styles.th}>Assigned Truck</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver) => {
                const statusBadge = getStatusBadge(driver.status);
                return (
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
                    <td style={styles.td}>{driver.licenseExpiry}</td>
                    <td style={styles.td}>{driver.experience}</td>
                    <td style={styles.td}>
                      <strong style={{ color: driver.assignedTruck === 'Unassigned' ? '#94a3b8' : '#0f172a' }}>
                        {driver.assignedTruck}
                      </strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: statusBadge.bg,
                        color: statusBadge.text,
                      }}>
                        {statusBadge.icon}
                        <span>{driver.status}</span>
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    color: '#64748b',
  },
  cardValue: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '8px 0 4px 0',
  },
  cardSub: {
    fontSize: '12px',
    color: '#64748b',
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