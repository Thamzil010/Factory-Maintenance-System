import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Machines from './pages/Machines';
import SpareParts from './pages/SpareParts';
import Maintenance from './pages/Maintenance';
import Suppliers from './pages/Suppliers';
import Warranties from './pages/Warranties';
import Register from './pages/Register';
import ServiceHistory from './pages/ServiceHistory';
import Users from './pages/Users';
import Alerts from './pages/Alerts';
import Layout from './layouts/Layout';

const queryClient = new QueryClient();

function App() {
  const token = localStorage.getItem('token');

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
          
          <Route path="/" element={token ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            <Route path="machines" element={<Machines />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="spare-parts" element={<SpareParts />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="warranties" element={<Warranties />} />
            <Route path="service-history" element={<ServiceHistory />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="users" element={<Users />} />
          </Route>
          
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
