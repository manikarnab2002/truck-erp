import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Maintenance from './pages/Maintenance';
import Drivers from './pages/Drivers';
import Fuel from './pages/Fuel';
import Logout from './components/LogoutModal';
import Login from './pages/Login';

// Simple local views kept for routing structure
const Overview = () => (
  <div>
    <h1>Dashboard Overview</h1>
    <p>Active Trucks, Jobs, Service Alerts</p>
  </div>
);
const Fleets = () => (
  <div>
    <h1>Fleet Management</h1>
    <p>Truck List, Status, Assignments</p>
  </div>
);
const Maintenance1 = () => (
  <div>
    <h1>Maintenance Logs</h1>
    <p>Work Orders & Scheduled Service</p>
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
        <Route path="login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="fleet" element={<Fleet />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="fuel" element={<Fuel />} />
        <Route path="logout" element={<Logout />} />
        
      </Route>
    </Routes>
  );
}
