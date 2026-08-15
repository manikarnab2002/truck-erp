import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';

// Dummy views
const Overview = () => <div><h1>Dashboard Overview</h1><p>Active Trucks, Jobs, Service Alerts</p></div>;
const Fleet = () => <div><h1>Fleet Management</h1><p>Truck List, Status, Assignments</p></div>;
const Maintenance = () => <div><h1>Maintenance Logs</h1><p>Work Orders & Scheduled Service</p></div>;

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}