import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Processes from './pages/Processes';
import Services from './pages/Services';
import Logs from './pages/Logs';
import Files from './pages/Files';
import Network from './pages/Network';
import System from './pages/System';
import ServerControl from './pages/ServerControl';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
            {/* Adding placeholders for rest of routes to prevent 404s before they are created */}
            <Route path="process" element={<Processes />} />
            <Route path="services" element={<Services />} />
            <Route path="logs" element={<Logs />} />
            <Route path="files" element={<Files />} />
            <Route path="network" element={<Network />} />
            <Route path="system" element={<System />} />
            <Route path="server-control" element={<ServerControl />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)'
          }
        }} 
      />
    </BrowserRouter>
  );
}

export default App;
