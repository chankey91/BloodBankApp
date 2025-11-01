import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'User Management' },
    { path: '/admin/bloodbanks', icon: '🏥', label: 'Blood Banks' },
    { path: '/admin/hospitals', icon: '🏨', label: 'Hospitals' },
    { path: '/admin/donors', icon: '🩸', label: 'Donors' },
    { path: '/admin/requests', icon: '📋', label: 'Blood Requests' },
    { path: '/admin/camps', icon: '🎪', label: 'Donation Camps' },
    { path: '/admin/inventory', icon: '📦', label: 'System Inventory' },
    { path: '/admin/analytics', icon: '📈', label: 'Analytics & Reports' },
    { path: '/admin/notifications', icon: '🔔', label: 'Notifications' },
    { path: '/admin/api-integrations', icon: '🔌', label: 'API Integrations' },
    { path: '/admin/audit-logs', icon: '📝', label: 'Audit Logs' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>🛡️ Admin Panel</h2>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="back-btn">
            <span className="nav-icon">🏠</span>
            {sidebarOpen && <span className="nav-label">Back to Home</span>}
          </Link>
        </div>
      </aside>

      <main className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="admin-topbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <div className="topbar-title">
            <h1>Blood Bank Network - Admin Portal</h1>
          </div>
          <div className="topbar-actions">
            <button className="topbar-btn" onClick={() => navigate('/notifications')}>
              🔔
            </button>
            <button className="topbar-btn" onClick={() => navigate('/dashboard')}>
              👤 Profile
            </button>
          </div>
        </div>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

