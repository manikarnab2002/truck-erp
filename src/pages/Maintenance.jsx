import React, { useState } from 'react';
import AddWorkOrderModal from '../components/AddWorkOrderModal';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  MoreVertical 
} from 'lucide-react';

const initialWorkOrders = [
  { id: 'WO-8041', truckNo: 'WB-19-AX-4021', serviceType: 'Engine Overhaul', mechanic: 'Amitabh Sen', priority: 'High', cost: '₹45,000', startDate: '2026-08-10', status: 'In Progress' },
  { id: 'WO-8042', truckNo: 'WB-23-C-8812', serviceType: 'Brake Pad Replacement', mechanic: 'Ramesh Das', priority: 'Medium', cost: '₹12,500', startDate: '2026-08-11', status: 'Queued' },
  { id: 'WO-8043', truckNo: 'MH-12-Q-5510', serviceType: 'Oil & Filter Change', mechanic: 'Sanjay Dutt', priority: 'Low', cost: '₹6,000', startDate: '2026-08-12', status: 'In Progress' },
  { id: 'WO-8044', truckNo: 'DL-01-AB-9001', serviceType: 'Tire Realignment', mechanic: 'Ramesh Das', priority: 'Low', cost: '₹4,500', startDate: '2026-08-08', status: 'Completed' },
  { id: 'WO-8045', truckNo: 'KA-04-E-1122', serviceType: 'Clutch Assembly Repair', mechanic: 'Amitabh Sen', priority: 'High', cost: '₹28,000', startDate: '2026-08-12', status: 'Pending Parts' },
];

export default function Maintenance() {
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddWorkOrder = (newOrder) => {
    setWorkOrders((prev) => [newOrder, ...prev]);
  };

  const filteredOrders = workOrders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.truckNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.mechanic.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return { bg: '#fee2e2', text: '#991b1b' };
      case 'Medium':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'Low':
        return { bg: '#f1f5f9', text: '#475569' };
      default:
        return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return { bg: '#dcfce7', text: '#15803d', icon: <CheckCircle2 size={12} /> };
      case 'In Progress':
        return { bg: '#dbeafe', text: '#1e40af', icon: <Clock size={12} /> };
      case 'Queued':
        return { bg: '#fef3c7', text: '#b45309', icon: <Clock size={12} /> };
      case 'Pending Parts':
        return { bg: '#fee2e2', text: '#b91c1c', icon: <AlertTriangle size={12} /> };
      default:
        return { bg: '#f1f5f9', text: '#475569', icon: null };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Maintenance & Repairs</h1>
          <p style={styles.subtitle}>Track active work orders, assigned mechanics, and repair costs.</p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Create Work Order</span>
        </button>
      </div>

      <AddWorkOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWorkOrder={handleAddWorkOrder}
      />

      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>Active Work Orders</span>
            <Wrench size={18} color="#1e293b" />
          </div>
          <div style={styles.cardValue}>{workOrders.length}</div>
          <p style={styles.cardSub}>
            {workOrders.filter((item) => item.priority === 'High').length} High Priority
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>Pending Spare Parts</span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={styles.cardValue}>
            {workOrders.filter((item) => item.status === 'Pending Parts').length}
          </div>
          <p style={{ ...styles.cardSub, color: '#ef4444' }}>Awaiting Component Delivery</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>Completed Jobs</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={styles.cardValue}>
            {workOrders.filter((item) => item.status === 'Completed').length}
          </div>
          <p style={{ ...styles.cardSub, color: '#10b981' }}>QC Verified</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>Est. Repair Expense</span>
            <DollarSign size={18} color="#0f172a" />
          </div>
          <div style={styles.cardValue}>
            ₹{workOrders
              .reduce((acc, curr) => acc + (parseInt(curr.cost.replace(/[^0-9]/g, '')) || 0), 0)
              .toLocaleString('en-IN')}
          </div>
          <p style={styles.cardSub}>Total Work Order Value</p>
        </div>
      </div>

      <div style={styles.filterCard}>
        <div style={styles.searchBox}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search Work Order ID, Truck No, Service, Mechanic..."
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
            <option value="In Progress">In Progress</option>
            <option value="Queued">Queued</option>
            <option value="Pending Parts">Pending Parts</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Work Order ID</th>
              <th style={styles.th}>Truck Reg Number</th>
              <th style={styles.th}>Service Type</th>
              <th style={styles.th}>Assigned Mechanic</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Est. Cost</th>
              <th style={styles.th}>Start Date</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const priorityBadge = getPriorityBadge(order.priority);
                const statusBadge = getStatusBadge(order.status);
                return (
                  <tr key={order.id} style={styles.tr}>
                    <td style={styles.td}><strong>{order.id}</strong></td>
                    <td style={styles.td}>{order.truckNo}</td>
                    <td style={styles.td}>{order.serviceType}</td>
                    <td style={styles.td}>{order.mechanic}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: priorityBadge.bg,
                        color: priorityBadge.text,
                      }}>
                        {order.priority}
                      </span>
                    </td>
                    <td style={styles.td}>{order.cost}</td>
                    <td style={styles.td}>{order.startDate}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: statusBadge.bg,
                        color: statusBadge.text,
                      }}>
                        {statusBadge.icon}
                        <span>{order.status}</span>
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
                  No matching work orders found.
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