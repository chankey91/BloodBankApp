import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import './AdminPageHeader.css';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboard(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch dashboard');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  const { overview, distributions, recentActivity } = dashboard || {};

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>System Overview and Management</p>
      </div>

      {/* Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{overview?.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🩸</div>
          <div className="stat-info">
            <h3>{overview?.totalDonors || 0}</h3>
            <p>Registered Donors</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{overview?.eligibleDonors || 0}</h3>
            <p>Eligible Donors</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-info">
            <h3>{overview?.totalBloodBanks || 0}</h3>
            <p>Blood Banks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏨</div>
          <div className="stat-info">
            <h3>{overview?.totalHospitals || 0}</h3>
            <p>Hospitals</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{overview?.totalRequests || 0}</h3>
            <p>Total Requests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔓</div>
          <div className="stat-info">
            <h3>{overview?.openRequests || 0}</h3>
            <p>Open Requests</p>
          </div>
        </div>

        <div className="stat-card critical">
          <div className="stat-icon">🚨</div>
          <div className="stat-info">
            <h3>{overview?.criticalRequests || 0}</h3>
            <p>Critical Requests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎪</div>
          <div className="stat-info">
            <h3>{overview?.totalCamps || 0}</h3>
            <p>Total Camps</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{overview?.upcomingCamps || 0}</h3>
            <p>Upcoming Camps</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/users" className="action-btn">
            <span className="icon">👥</span>
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/bloodbanks" className="action-btn">
            <span className="icon">🏥</span>
            <span>Manage Blood Banks</span>
          </Link>
          <Link to="/admin/hospitals" className="action-btn">
            <span className="icon">🏨</span>
            <span>Manage Hospitals</span>
          </Link>
          <Link to="/admin/requests" className="action-btn">
            <span className="icon">📋</span>
            <span>View Requests</span>
          </Link>
          <Link to="/admin/inventory" className="action-btn">
            <span className="icon">📊</span>
            <span>System Inventory</span>
          </Link>
          <Link to="/admin/analytics" className="action-btn">
            <span className="icon">📈</span>
            <span>Analytics</span>
          </Link>
          <Link to="/admin/notifications" className="action-btn">
            <span className="icon">🔔</span>
            <span>Notifications</span>
          </Link>
          <Link to="/admin/settings" className="action-btn">
            <span className="icon">⚙️</span>
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Distributions */}
      <div className="distributions-section">
        <div className="distribution-card">
          <h3>Users by Role</h3>
          <div className="distribution-list">
            {distributions?.usersByRole?.map(item => (
              <div key={item._id} className="distribution-item">
                <span className="label">{item._id}</span>
                <span className="value">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="distribution-card">
          <h3>Blood Type Distribution</h3>
          <div className="distribution-list">
            {distributions?.bloodTypeDistribution?.map(item => (
              <div key={item._id} className="distribution-item">
                <span className="label">{item._id}</span>
                <span className="value">{item.count} donors</span>
              </div>
            ))}
          </div>
        </div>

        <div className="distribution-card">
          <h3>Requests by Status</h3>
          <div className="distribution-list">
            {distributions?.requestsByStatus?.map(item => (
              <div key={item._id} className="distribution-item">
                <span className="label">{item._id}</span>
                <span className="value">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="distribution-card">
          <h3>Inventory Summary</h3>
          <div className="distribution-list">
            {distributions?.inventorySummary?.map(item => (
              <div key={item._id} className="distribution-item">
                <span className="label">{item._id}</span>
                <span className="value">{item.totalUnits} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <div className="activity-card">
          <h3>Recent Users</h3>
          <div className="activity-list">
            {recentActivity?.recentUsers?.slice(0, 5).map(user => (
              <div key={user._id} className="activity-item">
                <div className="activity-icon">{user.role === 'donor' ? '🩸' : user.role === 'bloodbank' ? '🏥' : '🏨'}</div>
                <div className="activity-info">
                  <p className="activity-title">{user.name}</p>
                  <p className="activity-desc">{user.email} • {user.role}</p>
                </div>
                <div className="activity-time">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="activity-card">
          <h3>Recent Requests</h3>
          <div className="activity-list">
            {recentActivity?.recentRequests?.slice(0, 5).map(request => (
              <div key={request._id} className="activity-item">
                <div className="activity-icon">
                  {request.urgency === 'critical' ? '🚨' : request.urgency === 'urgent' ? '⚠️' : '📋'}
                </div>
                <div className="activity-info">
                  <p className="activity-title">{request.bloodType} - {request.component}</p>
                  <p className="activity-desc">{request.unitsRequired} units • {request.status}</p>
                </div>
                <div className="activity-time">
                  {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

