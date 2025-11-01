import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import DonorProfile from './pages/donor/DonorProfile';
import CreateDonorProfile from './pages/donor/CreateDonorProfile';
import BloodBankProfile from './pages/bloodbank/BloodBankProfile';
import CreateBloodBankProfile from './pages/bloodbank/CreateBloodBankProfile';
import HospitalProfile from './pages/hospital/HospitalProfile';
import CreateHospitalProfile from './pages/hospital/CreateHospitalProfile';
import SearchBlood from './pages/SearchBlood';
import Requests from './pages/requests/Requests';
import CreateRequest from './pages/requests/CreateRequest';
import RequestDetail from './pages/requests/RequestDetail';
import DonationCamps from './pages/camps/DonationCamps';
import CreateDonationCamp from './pages/camps/CreateDonationCamp';
import Inventory from './pages/inventory/Inventory';
import AddInventory from './pages/inventory/AddInventory';
import RecordDonation from './pages/inventory/RecordDonation';
import Analytics from './pages/analytics/Analytics';
import Notifications from './pages/Notifications';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import BloodBankManagement from './pages/admin/BloodBankManagement';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSettings from './pages/admin/AdminSettings';
import AdminInventory from './pages/admin/AdminInventory';
import APIIntegrations from './pages/admin/APIIntegrations';
import AuditLogs from './pages/admin/AuditLogs';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<SearchBlood />} />
                <Route path="/camps" element={<DonationCamps />} />
                
                <Route path="/camps/create" element={
                  <PrivateRoute>
                    <CreateDonationCamp />
                  </PrivateRoute>
                } />
                
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                
                <Route path="/donor/profile" element={
                  <PrivateRoute>
                    <DonorProfile />
                  </PrivateRoute>
                } />
                
                <Route path="/donor/profile/create" element={
                  <PrivateRoute>
                    <CreateDonorProfile />
                  </PrivateRoute>
                } />
                
                <Route path="/bloodbank/profile" element={
                  <PrivateRoute>
                    <BloodBankProfile />
                  </PrivateRoute>
                } />
                
                <Route path="/bloodbank/profile/create" element={
                  <PrivateRoute>
                    <CreateBloodBankProfile />
                  </PrivateRoute>
                } />
                
                <Route path="/hospital/profile" element={
                  <PrivateRoute>
                    <HospitalProfile />
                  </PrivateRoute>
                } />
                
                <Route path="/hospital/profile/create" element={
                  <PrivateRoute>
                    <CreateHospitalProfile />
                  </PrivateRoute>
                } />
                
                <Route path="/requests" element={
                  <PrivateRoute>
                    <Requests />
                  </PrivateRoute>
                } />
                
                <Route path="/requests/create" element={
                  <PrivateRoute>
                    <CreateRequest />
                  </PrivateRoute>
                } />
                
                <Route path="/requests/:id" element={
                  <PrivateRoute>
                    <RequestDetail />
                  </PrivateRoute>
                } />
                
                <Route path="/inventory" element={
                  <PrivateRoute>
                    <Inventory />
                  </PrivateRoute>
                } />
                
                <Route path="/inventory/add" element={
                  <PrivateRoute>
                    <AddInventory />
                  </PrivateRoute>
                } />
                
                <Route path="/inventory/record-donation" element={
                  <PrivateRoute>
                    <RecordDonation />
                  </PrivateRoute>
                } />
                
                <Route path="/analytics" element={
                  <PrivateRoute>
                    <Analytics />
                  </PrivateRoute>
                } />
                
                <Route path="/notifications" element={
                  <PrivateRoute>
                    <Notifications />
                  </PrivateRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <PrivateRoute>
                    <AdminLayout />
                  </PrivateRoute>
                }>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="bloodbanks" element={<BloodBankManagement />} />
                  <Route path="hospitals" element={<BloodBankManagement />} />
                  <Route path="donors" element={<UserManagement />} />
                  <Route path="requests" element={<Requests />} />
                  <Route path="camps" element={<DonationCamps />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="api-integrations" element={<APIIntegrations />} />
                  <Route path="audit-logs" element={<AuditLogs />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Routes>
            </main>
            <Footer />
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

