import React from 'react';
import { Truck,Users, Fuel, CheckCircle2 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const serviceData = [
  { month: 'Jan', completed: 42, ongoing: 12 },
  { month: 'Feb', completed: 50, ongoing: 15 },
  { month: 'Mar', completed: 38, ongoing: 8 },
  { month: 'Apr', completed: 65, ongoing: 20 },
  { month: 'May', completed: 58, ongoing: 14 },
  { month: 'Jun', completed: 72, ongoing: 18 },
];



export default function Dashboard() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Truck ERP Overview</h1>
          <p style={styles.subtitle}>Real-time monitoring of fleet status, repairs, and service schedules.</p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>Trucks</span>
            <Truck size={20} color="#1e293b" />
          </div>
          <div style={styles.cardValue}>124</div>
          <p style={styles.cardSub}>98 Active on Road</p>
        </div>

        {/* Drivers Card - Violet Theme */}
<div style={styles.card}>
  <div style={styles.cardHeader}>
    <span>Drivers</span>
    <Users size={20} color="#8b5cf6" />
  </div>
  <div style={styles.cardValue}>48</div>
  <p style={{ ...styles.cardSub, color: '#7c3aed' }}>42 On Duty</p>
</div>

{/* Fuel Card - Amber / Orange Theme */}
<div style={styles.card}>
  <div style={styles.cardHeader}>
    <span>Fuel Consumption</span>
    <Fuel size={20} color="#f97316" />
  </div>
  <div style={styles.cardValue}>1,450 L</div>
  <p style={{ ...styles.cardSub, color: '#ea580c' }}>Avg 3.8 km/L</p>
</div>

{/* Ready for Delivery Card - Emerald Theme */}
<div style={styles.card}>
  <div style={styles.cardHeader}>
    <span>Ready for Delivery</span>
    <CheckCircle2 size={20} color="#10b981" />
  </div>
  <div style={styles.cardValue}>9</div>
  <p style={{ ...styles.cardSub, color: '#16a34a' }}>QC Passed</p>
</div>
      </div>

      <div style={styles.middleSection}>
        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>Monthly Service Workloads</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={serviceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="completed" fill="#1e293b" radius={[4, 4, 0, 0]} name="Completed Repairs" />
                <Bar dataKey="ongoing" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Ongoing Service" />
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
    gridTemplateColumns: '2fr 1fr',
    gap: '16px',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
  },
  quickStatsCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '15px',
    color: '#0f172a',
    fontWeight: '600',
    marginBottom: '12px',
  },
  healthItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
  },
  healthInfo: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '12px',
    color: '#64748b',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
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
};