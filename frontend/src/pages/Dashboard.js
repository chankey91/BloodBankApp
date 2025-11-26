import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaHandHoldingHeart, FaTint, FaCalendarAlt } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [requestsRes] = await Promise.all([
        axios.get('/api/requests?status=open')
      ]);

      setRecentRequests(requestsRes.data.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Welcome, {user?.name}!</h1>
          <p className="page-subtitle">Your dashboard for saving lives</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        {/* Admin Panel Access */}
        {user?.role === 'admin' && (
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            marginBottom: '2rem',
            border: 'none',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem' }}>
              <div>
                <h2 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                  🛡️ Admin Control Panel
                </h2>
                <p style={{ opacity: '0.95', fontSize: '1.1rem' }}>
                  Manage users, blood banks, system settings and more
                </p>
              </div>
              <Link 
                to="/admin/dashboard" 
                className="btn" 
                style={{ 
                  background: 'white',
                  color: '#667eea',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}
              >
                Go to Admin Panel →
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card">
          <h2 className="card-header">Quick Actions</h2>
          <div className="grid grid-3">
            {user?.role === 'donor' && (
              <>
                <Link to="/donor/profile" className="btn btn-primary">
                  <FaHandHoldingHeart /> View My Profile
                </Link>
                <Link to="/requests" className="btn btn-secondary">
                  <FaTint /> View Requests
                </Link>
                <Link to="/camps" className="btn btn-outline">
                  <FaCalendarAlt /> Find Camps
                </Link>
              </>
            )}
            
            {user?.role === 'admin' && (
              <>
                <Link to="/admin/users" className="btn btn-primary">
                  👥 User Management
                </Link>
                <Link to="/admin/bloodbanks" className="btn btn-secondary">
                  🏥 Blood Banks
                </Link>
                <Link to="/admin/analytics" className="btn btn-outline">
                  📈 Analytics
                </Link>
              </>
            )}
            
            {(user?.role === 'bloodbank' || user?.role === 'hospital') && (
              <>
                <Link to="/requests/create" className="btn btn-primary">
                  Create Request
                </Link>
                <Link to="/inventory" className="btn btn-secondary">
                  Manage Inventory
                </Link>
                <Link to="/analytics" className="btn btn-outline">
                  View Analytics
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="card-header" style={{ marginBottom: 0 }}>Recent Blood Requests</h2>
            <Link to="/requests" style={{ color: 'var(--primary-color)' }}>View All</Link>
          </div>
          
          {recentRequests.length > 0 ? (
            recentRequests.map((request) => (
              <div key={request._id} className="request-card">
                <div className="request-header">
                  <span className="request-blood-type">{request.bloodType}</span>
                  <span className={`badge badge-${request.urgency === 'critical' ? 'danger' : 'warning'}`}>
                    {request.urgency}
                  </span>
                </div>
                <div className="request-info">
                  <div className="request-info-item">
                    <strong>Units:</strong> {request.unitsRequired}
                  </div>
                  <div className="request-info-item">
                    <strong>Component:</strong> {request.component}
                  </div>
                  <div className="request-info-item">
                    <strong>Location:</strong> {request.location?.city || 'N/A'}
                  </div>
                </div>
                <Link to={`/requests/${request._id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              No active requests at the moment
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

