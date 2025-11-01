import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificationCount();
    }
  }, [isAuthenticated]);

  const fetchNotificationCount = async () => {
    try {
      const res = await axios.get('/api/notifications/unread-count');
      setNotificationCount(res.data.count);
    } catch (error) {
      console.error('Error fetching notification count', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          🩸 Blood Bank Network
        </Link>
        
        <ul className="navbar-menu">
          <li>
            <Link to="/search" className="navbar-link">Search Blood</Link>
          </li>
          
          {/* Show Donation Camps for non-authenticated users and donors only */}
          {(!isAuthenticated || (user?.role === 'donor' || user?.role === 'hospital')) && (
            <li>
              <Link to="/camps" className="navbar-link">Donation Camps</Link>
            </li>
          )}
          
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              </li>
              {user?.role === 'admin' && (
                <li>
                  <Link to="/admin/dashboard" className="navbar-link admin-panel-link">
                    🛡️ Admin Panel
                  </Link>
                </li>
              )}
              {user?.role === 'donor' && (
                <li>
                  <Link to="/donor/profile" className="navbar-link">My Profile</Link>
                </li>
              )}
          {user?.role === 'bloodbank' && (
            <>
              <li>
                <Link to="/bloodbank/profile" className="navbar-link">My Profile</Link>
              </li>
              <li>
                <Link to="/inventory" className="navbar-link">Inventory</Link>
              </li>
              <li>
                <Link to="/camps" className="navbar-link">Donation Camps</Link>
              </li>
              <li>
                <Link to="/analytics" className="navbar-link">Analytics</Link>
              </li>
            </>
          )}
              {user?.role === 'hospital' && (
                <>
                  <li>
                    <Link to="/hospital/profile" className="navbar-link">My Profile</Link>
                  </li>
                  <li>
                    <Link to="/requests" className="navbar-link">Blood Requests</Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/notifications" className="navbar-link" style={{ position: 'relative' }}>
                  <FaBell />
                  {notificationCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-10px',
                      background: 'red',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '2px 6px',
                      fontSize: '0.75rem'
                    }}>
                      {notificationCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="navbar-link">Login</Link>
              </li>
              <li>
                <Link to="/register">
                  <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    Register
                  </button>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

