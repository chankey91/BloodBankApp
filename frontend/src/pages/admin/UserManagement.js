import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './UserManagement.css';
import './AdminPageHeader.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    isVerified: '',
    page: 1
  });
  const [pagination, setPagination] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(response.data.users);
      setPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        totalUsers: response.data.totalUsers
      });
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/admin/users/${userId}/status`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/admin/users/${userId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('User verified successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(response.data);
      setShowModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch user details');
    }
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      donor: 'badge-donor',
      bloodbank: 'badge-bloodbank',
      hospital: 'badge-hospital',
      admin: 'badge-admin'
    };
    return classes[role] || '';
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>👥 User Management</h1>
        <p>Manage all system users</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <input
          type="text"
          name="search"
          placeholder="Search by name, email, or phone..."
          value={filters.search}
          onChange={handleFilterChange}
          className="search-input"
        />

        <select
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Roles</option>
          <option value="donor">Donor</option>
          <option value="bloodbank">Blood Bank</option>
          <option value="hospital">Hospital</option>
          <option value="admin">Admin</option>
        </select>

        <select
          name="isVerified"
          value={filters.isVerified}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>

        <button onClick={fetchUsers} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="user-stats">
        <div className="stat-item">
          <span className="stat-label">Total Users:</span>
          <span className="stat-value">{pagination.totalUsers || 0}</span>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="user-name">{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {user.isVerified ? (
                        <span className="verified-badge">✓ Verified</span>
                      ) : (
                        <span className="unverified-badge">✗ Unverified</span>
                      )}
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      <button
                        onClick={() => viewUserDetails(user._id)}
                        className="btn-view"
                        title="View Details"
                      >
                        👁️
                      </button>
                      {!user.isVerified && (
                        <button
                          onClick={() => handleVerifyUser(user._id)}
                          className="btn-verify"
                          title="Verify User"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusToggle(user._id, user.isActive)}
                        className={user.isActive ? 'btn-deactivate' : 'btn-activate'}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? '🚫' : '✓'}
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="btn-delete"
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedUser.user.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedUser.user.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{selectedUser.user.phone}</span>
                  </div>
                  <div className="detail-item">
                    <label>Role:</label>
                    <span className={`role-badge ${getRoleBadgeClass(selectedUser.user.role)}`}>
                      {selectedUser.user.role}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={selectedUser.user.isActive ? 'text-success' : 'text-danger'}>
                      {selectedUser.user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Verified:</label>
                    <span className={selectedUser.user.isVerified ? 'text-success' : 'text-danger'}>
                      {selectedUser.user.isVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Joined:</label>
                    <span>{new Date(selectedUser.user.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedUser.roleData && (
                <div className="detail-section">
                  <h3>Role-Specific Data</h3>
                  <pre className="role-data">{JSON.stringify(selectedUser.roleData, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

