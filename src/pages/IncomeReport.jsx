import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  AlertCircle,
  PiggyBank,
  Truck,
  Package,
  Calendar,
  Search,
  Eye,
  Trash2,
  X,
  Download,
  CalendarDays,
  CalendarRange
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const normalizeDeliveryRecord = (item) => {
  const amountPaid = Number(item.amountPaid ?? item.received ?? 0);
  const deliveryCost = Number(item.deliveryCost ?? item.income ?? 0);
  const dueAmount = Number(item.dueAmount ?? item.due ?? Math.max(deliveryCost - amountPaid, 0));
  const totalExpense = Number(item.totalExpense ?? item.expense ?? 0);
  const quantityTonnes = Number(item.quantity ?? item.quantityTonnes ?? 0);
  const date = item.deliveryDate || item.date || '';
  const status = dueAmount > 0 ? (amountPaid > 0 ? 'Partial' : 'Pending') : 'Paid';

  return {
    id: item._id ? String(item._id) : (item.id || 'DEL-000'),
    invoiceNo: item.invoiceNo || `INV-${String(item._id || '').slice(-6) || '000001'}`,
    date,
    truckReg: item.truckNumber || item.truckReg || '',
    client: item.client || item.source || item.destination || item.material || 'Client',
    quantityTonnes,
    income: deliveryCost,
    received: amountPaid,
    due: dueAmount,
    expense: totalExpense,
    status,
    raw: item,
  };
};

export default function IncomeReport() {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModalData, setActiveModalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIncomeData = async () => {
      try {
        const response = await fetch('/api/income');
        if (!response.ok) {
          throw new Error('Failed to fetch income data');
        }

        const data = await response.json();
        const records = Array.isArray(data?.records) ? data.records : Array.isArray(data) ? data : [];
        setDeliveries(records.map(normalizeDeliveryRecord));
      } catch (error) {
        console.error('Income report load error:', error);
        setDeliveries([]);
      } finally {
        setLoading(false);
      }
    };

    loadIncomeData();
  }, []);

  const truckOptions = useMemo(() => {
    return Array.from(new Set(deliveries.map((item) => item.truckReg))).filter(Boolean);
  }, [deliveries]);

  const timePeriodStats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return deliveries.reduce(
      (acc, item) => {
        const itemDate = new Date(item.date);

        if (item.date === todayStr) {
          acc.todayIncome += item.income;
        }

        if (itemDate >= sevenDaysAgo && itemDate <= now) {
          acc.weekIncome += item.income;
        }

        if (itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth) {
          acc.monthIncome += item.income;
        }

        return acc;
      },
      { todayIncome: 0, weekIncome: 0, monthIncome: 0 }
    );
  }, [deliveries]);

  const filteredData = useMemo(() => {
    return deliveries.filter((item) => {
      const matchTruck = selectedTruck === 'All' || item.truckReg === selectedTruck;
      const matchSearch =
        (item.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.invoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.client || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.truckReg || '').toLowerCase().includes(searchTerm.toLowerCase());

      const itemDate = item.date ? new Date(item.date) : null;
      const matchStart = !startDate || (itemDate && itemDate >= new Date(startDate));
      const matchEnd = !endDate || (itemDate && itemDate <= new Date(endDate));

      return matchTruck && matchSearch && matchStart && matchEnd;
    });
  }, [deliveries, selectedTruck, searchTerm, startDate, endDate]);

  const metrics = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => {
        acc.totalIncome += item.income;
        acc.totalReceived += item.received;
        acc.totalDue += item.due;
        acc.totalExpenses += item.expense;
        acc.netIncome += item.income - item.expense;
        acc.totalQty += item.quantityTonnes;
        acc.deliveryCount += 1;
        return acc;
      },
      { totalIncome: 0, totalReceived: 0, totalDue: 0, totalExpenses: 0, netIncome: 0, totalQty: 0, deliveryCount: 0 }
    );
  }, [filteredData]);

  const handleExportExcel = () => {
    if (filteredData.length === 0) return;

    const headers = [
      'Delivery ID',
      'Invoice No',
      'Date',
      'Truck Reg',
      'Client',
      'Quantity (Tonnes)',
      'Income (INR)',
      'Received (INR)',
      'Due (INR)',
      'Expense (INR)',
      'Status',
    ];

    const escapeCsvValue = (value) => {
      const safeValue = String(value ?? '').replace(/\r?\n/g, ' ');
      return /[",]/.test(safeValue) ? `"${safeValue.replace(/"/g, '""')}"` : safeValue;
    };

    const rows = filteredData.map((item) => [
      item.id,
      item.invoiceNo,
      item.date,
      item.truckReg,
      item.client,
      item.quantityTonnes,
      item.income,
      item.received,
      item.due,
      item.expense,
      item.status,
    ]);

    const csvContent = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map((row) => row.map(escapeCsvValue).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Income_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/deliveries?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete delivery');
      }

      setDeliveries((prev) => prev.filter((item) => item.id !== id));
      setActiveModalData(null);
    } catch (error) {
      console.error('Delete delivery error:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return { bg: '#dcfce7', text: '#15803d' };
      case 'Partial':
        return { bg: '#fef3c7', text: '#b45309' };
      case 'Pending':
        return { bg: '#fee2e2', text: '#b91c1c' };
      default:
        return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Income & Revenue Report</h1>
          <p style={styles.subtitle}>Analyze fleet billing, client balances, transport volume, and net profit margins.</p>
        </div>
        <button style={styles.exportBtn} onClick={handleExportExcel}>
          <Download size={16} />
          <span>Export to Excel</span>
        </button>
      </div>

      {/* 3 Quick Timeframe Cards */}
      <div style={styles.timeframeGrid}>
        <div style={styles.timeCard}>
          <div style={styles.cardHeader}>
            <span>Today's Total Income</span>
            <Calendar size={18} color="#2563eb" />
          </div>
          <div style={styles.cardValue}>₹{timePeriodStats.todayIncome.toLocaleString()}</div>
          <p style={styles.cardSub}>Generated today</p>
        </div>

        <div style={styles.timeCard}>
          <div style={styles.cardHeader}>
            <span>This Week's Total Income</span>
            <CalendarDays size={18} color="#0891b2" />
          </div>
          <div style={styles.cardValue}>₹{timePeriodStats.weekIncome.toLocaleString()}</div>
          <p style={styles.cardSub}>Past 7 rolling days</p>
        </div>

        <div style={styles.timeCard}>
          <div style={styles.cardHeader}>
            <span>This Month's Total Income</span>
            <CalendarRange size={18} color="#7c3aed" />
          </div>
          <div style={styles.cardValue}>₹{timePeriodStats.monthIncome.toLocaleString()}</div>
          <p style={styles.cardSub}>Current calendar month</p>
        </div>
      </div>

      {/* Primary KPI Cards */}
      

      {/* Filter Toolbar */}
      <div style={styles.filterCard}>
        <div style={styles.searchBox}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search delivery ID, invoice, truck, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <select
            value={selectedTruck}
            onChange={(e) => setSelectedTruck(e.target.value)}
            style={styles.select}
          >
            <option value="All">All Trucks</option>
            {truckOptions.map((truck) => (
              <option key={truck} value={truck}>{truck}</option>
            ))}
          </select>

          <div style={styles.dateGroup}>
            <Calendar size={14} color="#64748b" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.dateInput}
            />
            <span style={{ color: '#94a3b8' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>
        </div>
      </div>

      {/* Delivery Records Ledger */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Delivery / Inv</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Truck</th>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Gross Income</th>
              <th style={styles.th}>Received</th>
              <th style={styles.th}>Due</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const statusStyle = getStatusBadge(item.status);
                return (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{item.id}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{item.invoiceNo}</div>
                    </td>
                    <td style={styles.td}>{item.date}</td>
                    <td style={styles.td}>{item.truckReg}</td>
                    <td style={styles.td}>{item.client}</td>
                    <td style={styles.td}>{item.quantityTonnes} MT</td>
                    <td style={styles.td}><strong>₹{item.income.toLocaleString()}</strong></td>
                    <td style={{ ...styles.td, color: '#15803d' }}>₹{item.received.toLocaleString()}</td>
                    <td style={{ ...styles.td, color: item.due > 0 ? '#b91c1c' : '#64748b' }}>
                      ₹{item.due.toLocaleString()}
                    </td>
                    {/*  */}
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          style={{ ...styles.actionBtn, color: '#2563eb' }}
                          title="View Details"
                          onClick={() => setActiveModalData(item)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          style={{ ...styles.actionBtn, color: '#ef4444' }}
                          title="Delete Record"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" style={{ ...styles.td, textAlign: 'center', color: '#64748b', padding: '32px' }}>
                  No revenue or delivery records found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record View Modal */}
      {activeModalData && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Delivery Details: {activeModalData.id}</h3>
              <button style={styles.closeBtn} onClick={() => setActiveModalData(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.detailRow}><span>Invoice No:</span><strong>{activeModalData.invoiceNo}</strong></div>
              <div style={styles.detailRow}><span>Date:</span><strong>{activeModalData.date}</strong></div>
              <div style={styles.detailRow}><span>Assigned Truck:</span><strong>{activeModalData.truckReg}</strong></div>
              <div style={styles.detailRow}><span>Client Name:</span><strong>{activeModalData.client}</strong></div>
              <div style={styles.detailRow}><span>Load Weight:</span><strong>{activeModalData.quantityTonnes} Tonnes</strong></div>
              <div style={styles.detailRow}><span>Billed Income:</span><strong>₹{activeModalData.income.toLocaleString()}</strong></div>
              <div style={styles.detailRow}><span>Trip Expenses:</span><strong style={{ color: '#ea580c' }}>₹{activeModalData.expense.toLocaleString()}</strong></div>
              <div style={styles.detailRow}><span>Net Earnings:</span><strong style={{ color: '#16a34a' }}>₹{(activeModalData.income - activeModalData.expense).toLocaleString()}</strong></div>
              <div style={styles.detailRow}><span>Amount Paid:</span><strong style={{ color: '#15803d' }}>₹{activeModalData.received.toLocaleString()}</strong></div>
              <div style={styles.detailRow}><span>Outstanding Due:</span><strong style={{ color: '#b91c1c' }}>₹{activeModalData.due.toLocaleString()}</strong></div>
            </div>
          </div>
        </div>
      )}
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
    flexWrap: 'wrap',
    gap: '12px',
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
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#047857',
    color: '#ffffff',
    padding: '9px 15px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
  timeframeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  timeCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderLeft: '4px solid #2563eb',
    borderRadius: '8px',
    padding: '16px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
    fontSize: '22px',
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
    flexWrap: 'wrap',
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
    flex: '1 1 240px',
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
    flexWrap: 'wrap',
    gap: '12px',
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
  dateGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '6px 12px',
  },
  dateInput: {
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '12px',
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
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '16px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
  },
  modalBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '13px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px dashed #f1f5f9',
    paddingBottom: '6px',
    color: '#475569',
  },
};