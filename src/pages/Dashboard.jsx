import React, { useEffect, useState } from 'react';
import { Truck, Users, Fuel, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const buildMonthlyChartData = (records = []) => {
  const monthMap = new Map();

  records.forEach((record) => {
    const rawDate = record.deliveryDate || record.createdAt || record.date;
    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const monthLabel = date.toLocaleString('en-US', { month: 'short' });

    if (!monthMap.has(key)) {
      monthMap.set(key, {
        key,
        month: monthLabel,
        income: 0,
        expense: 0,
        profit: 0,
        deliveries: 0,
      });
    }

    const item = monthMap.get(key);
    const income = Number(record.deliveryCost || 0);
    const expense =
      Number(record.fuelCost || 0) +
      Number(record.tollCost || 0) +
      Number(record.maintenanceCost || 0);

    item.income += income;
    item.expense += expense;
    item.profit += Number(record.netIncome ?? income - expense);
    item.deliveries += 1;
  });

  return Array.from(monthMap.values())
    .sort((a, b) => new Date(`2024 ${a.month} 01`).getTime() - new Date(`2024 ${b.month} 01`).getTime())
    .slice(-6);
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    trucks: 0,
    drivers: 0,
    fuelLogs: 0,
    deliveries: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [trucksRes, driversRes, fuelRes, deliveriesRes] = await Promise.all([
          fetch('/api/trucks'),
          fetch('/api/drivers'),
          fetch('/api/fuel'),
          fetch('/api/deliveries'),
        ]);

        const [trucks, drivers, fuelLogs, deliveries] = await Promise.all([
          trucksRes.json(),
          driversRes.json(),
          fuelRes.json(),
          deliveriesRes.json(),
        ]);

        setStats({
          trucks: Array.isArray(trucks) ? trucks.length : 0,
          drivers: Array.isArray(drivers) ? drivers.length : 0,
          fuelLogs: Array.isArray(fuelLogs) ? fuelLogs.length : 0,
          deliveries: Array.isArray(deliveries) ? deliveries.length : 0,
        });

        setChartData(buildMonthlyChartData(Array.isArray(deliveries) ? deliveries : []));
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Truck ERP Overview</h1>
          <p style={styles.subtitle}>Real-time monitoring of fleet status, operations, and financial performance.</p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>Trucks</span>
            <Truck size={20} color="#1e293b" />
          </div>
          <div style={styles.cardValue}>{loading ? '...' : stats.trucks}</div>
          <p style={styles.cardSub}>{stats.trucks} total vehicles</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>Drivers</span>
            <Users size={20} color="#8b5cf6" />
          </div>
          <div style={styles.cardValue}>{loading ? '...' : stats.drivers}</div>
          <p style={{ ...styles.cardSub, color: '#7c3aed' }}>{stats.drivers} active profiles</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>Fuel Logs</span>
            <Fuel size={20} color="#f97316" />
          </div>
          <div style={styles.cardValue}>{loading ? '...' : stats.fuelLogs}</div>
          <p style={{ ...styles.cardSub, color: '#ea580c' }}>{stats.fuelLogs} entries saved</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>Deliveries</span>
            <CheckCircle2 size={20} color="#10b981" />
          </div>
          <div style={styles.cardValue}>{loading ? '...' : stats.deliveries}</div>
          <p style={{ ...styles.cardSub, color: '#16a34a' }}>{stats.deliveries} records booked</p>
        </div>
      </div>

      <div style={styles.middleSection}>
        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>Monthly Delivery Activity</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="deliveries" fill="#1e293b" radius={[4, 4, 0, 0]} name="Deliveries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>Monthly Profit &amp; Loss</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
                <Bar dataKey="profit" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '8px 0 4px 0',
  },
  cardSub: {
    fontSize: '12px',
    color: '#64748b',
  },
  middleSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '16px',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
  },
  sectionTitle: {
    fontSize: '15px',
    color: '#0f172a',
    fontWeight: '600',
    marginBottom: '12px',
  },
};