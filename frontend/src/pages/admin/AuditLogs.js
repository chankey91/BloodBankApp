import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AuditLogs.css';
import './AdminPageHeader.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: 'all',
    user: '',
    startDate: '',
    endDate: '',
    page: 1
  });
  const [totalPages, setTotalPages] = useState(1);

  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'user.created', label: 'User Created' },
    { value: 'user.updated', label: 'User Updated' },
    { value: 'user.deleted', label: 'User Deleted' },
    { value: 'user.verified', label: 'User Verified' },
    { value: 'bloodbank.created', label: 'Blood Bank Created' },
    { value: 'bloodbank.verified', label: 'Blood Bank Verified' },
    { value: 'bloodbank.updated', label: 'Blood Bank Updated' },
    { value: 'inventory.added', label: 'Inventory Added' },
    { value: 'inventory.updated', label: 'Inventory Updated' },
    { value: 'request.created', label: 'Request Created' },
    { value: 'request.fulfilled', label: 'Request Fulfilled' },
    { value: 'donation.created', label: 'Donation Created' },
    { value: 'settings.changed', label: 'Settings Changed' },
    { value: 'login', label: 'User Login' },
    { value: 'logout', label: 'User Logout' }
  ];

  useEffect(() => {
    fetchAuditLogs();
    // eslint-disable-next-line
  }, [filters.page, filters.action]);

  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // In production, fetch from backend
      // const params = new URLSearchParams({
      //   action: filters.action !== 'all' ? filters.action : '',
      //   user: filters.user,
      //   startDate: filters.startDate,
      //   endDate: filters.endDate,
      //   page: filters.page
      // });
      // const response = await axios.get(`/api/admin/audit-logs?${params}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      // Mock data for demonstration
      const mockLogs = [
        {
          _id: '1',
          action: 'user.verified',
          performedBy: { name: 'Admin User', email: 'admin@bloodbank.com' },
          targetUser: { name: 'John Doe', email: 'john@example.com' },
          details: 'User account verified',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
          status: 'success'
        },
        {
          _id: '2',
          action: 'bloodbank.verified',
          performedBy: { name: 'Admin User', email: 'admin@bloodbank.com' },
          targetUser: { name: 'City Blood Bank', email: 'city@bloodbank.com' },
          details: 'Blood bank verified and approved',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          status: 'success'
        },
        {
          _id: '3',
          action: 'settings.changed',
          performedBy: { name: 'Admin User', email: 'admin@bloodbank.com' },
          details: 'Updated system settings: Notification preferences',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
          status: 'success'
        },
        {
          _id: '4',
          action: 'user.deleted',
          performedBy: { name: 'Admin User', email: 'admin@bloodbank.com' },
          targetUser: { name: 'Spam User', email: 'spam@example.com' },
          details: 'User account deleted due to policy violation',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
          status: 'success'
        },
        {
          _id: '5',
          action: 'request.fulfilled',
          performedBy: { name: 'Blood Bank Admin', email: 'bb@bloodbank.com' },
          details: 'Blood request fulfilled - 2 units of A+',
          ipAddress: '192.168.1.5',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
          status: 'success'
        },
        {
          _id: '6',
          action: 'login',
          performedBy: { name: 'Admin User', email: 'admin@bloodbank.com' },
          details: 'Admin login successful',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          timestamp: new Date(Date.now() - 1000 * 60 * 480), // 8 hours ago
          status: 'success'
        }
      ];

      setLogs(mockLogs);
      setTotalPages(5);
      setLoading(false);
    } catch (error) {
      console.error('Fetch audit logs error:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value, page: 1 });
  };

  const handleSearch = () => {
    fetchAuditLogs();
  };

  const handleExport = () => {
    alert('Exporting audit logs... (Feature to be implemented)');
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleString();
  };

  const getActionIcon = (action) => {
    if (action.includes('created')) return '➕';
    if (action.includes('updated')) return '✏️';
    if (action.includes('deleted')) return '🗑️';
    if (action.includes('verified')) return '✅';
    if (action.includes('fulfilled')) return '✔️';
    if (action.includes('login')) return '🔓';
    if (action.includes('logout')) return '🔒';
    return '📝';
  };

  const getActionColor = (action) => {
    if (action.includes('deleted')) return 'danger';
    if (action.includes('verified') || action.includes('fulfilled')) return 'success';
    if (action.includes('updated') || action.includes('changed')) return 'warning';
    if (action.includes('created')) return 'info';
    return 'default';
  };

  if (loading) {
    return <div className="loading">Loading audit logs...</div>;
  }

  return (
    <div className="audit-logs">
      <div className="page-header">
        <div>
          <h1>📝 Audit Logs</h1>
          <p>Track all system activities and administrative actions</p>
        </div>
        <button className="btn-export" onClick={handleExport}>
          📥 Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Action Type</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              {actionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>User Email</label>
            <input
              type="text"
              value={filters.user}
              onChange={(e) => handleFilterChange('user', e.target.value)}
              placeholder="Search by email..."
            />
          </div>

          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <button className="btn-search" onClick={handleSearch}>
            🔍 Search
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="logs-container">
        {logs.length === 0 ? (
          <div className="no-logs">
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="logs-list">
            {logs.map(log => (
              <div key={log._id} className="log-card">
                <div className="log-header">
                  <div className="log-action">
                    <span className="action-icon">{getActionIcon(log.action)}</span>
                    <span className={`action-badge ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </div>
                  <div className="log-time">{formatTimestamp(log.timestamp)}</div>
                </div>

                <div className="log-body">
                  <div className="log-detail">
                    <span className="detail-label">Performed By:</span>
                    <span className="detail-value">
                      {log.performedBy.name} ({log.performedBy.email})
                    </span>
                  </div>

                  {log.targetUser && (
                    <div className="log-detail">
                      <span className="detail-label">Target:</span>
                      <span className="detail-value">
                        {log.targetUser.name} ({log.targetUser.email})
                      </span>
                    </div>
                  )}

                  <div className="log-detail">
                    <span className="detail-label">Details:</span>
                    <span className="detail-value">{log.details}</span>
                  </div>

                  <div className="log-meta">
                    <span>
                      <strong>IP:</strong> {log.ipAddress}
                    </span>
                    <span className={`status-badge ${log.status}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page === 1}
          >
            ← Previous
          </button>
          <span className="page-info">
            Page {filters.page} of {totalPages}
          </span>
          <button
            className="page-btn"
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;

