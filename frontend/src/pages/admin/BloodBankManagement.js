import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminTable.css';
import './AdminPageHeader.css';

const BloodBankManagement = () => {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    verificationStatus: '',
    search: '',
    page: 1
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchBloodBanks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchBloodBanks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(`/api/admin/bloodbanks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBloodBanks(response.data.bloodBanks);
      setPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        total: response.data.total
      });
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch blood banks');
      setLoading(false);
    }
  };

  const handleVerification = async (id, status, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/admin/bloodbanks/${id}/verify`,
        { verificationStatus: status, rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Blood bank ${status} successfully`);
      fetchBloodBanks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update verification status');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>🏥 Blood Bank Management</h1>
        <p>Verify and manage blood bank registrations</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by name or registration number..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          className="search-input"
        />

        <select
          value={filters.verificationStatus}
          onChange={(e) => setFilters(prev => ({ ...prev, verificationStatus: e.target.value, page: 1 }))}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>

        <button onClick={fetchBloodBanks} className="refresh-btn">🔄 Refresh</button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-badge">Total: {pagination.total || 0}</div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading">Loading blood banks...</div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Registration No.</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bloodBanks.map(bank => (
                  <tr key={bank._id}>
                    <td className="font-weight-bold">{bank.name}</td>
                    <td>{bank.registrationNumber}</td>
                    <td>{bank.type}</td>
                    <td>
                      {bank.location?.city}, {bank.location?.state}
                    </td>
                    <td>
                      {bank.contact?.email}<br/>
                      {bank.contact?.phone}
                    </td>
                    <td>
                      <span className={`status-badge status-${bank.verificationStatus}`}>
                        {bank.verificationStatus}
                      </span>
                    </td>
                    <td className="actions">
                      {bank.verificationStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVerification(bank._id, 'verified')}
                            className="btn-success"
                            title="Verify"
                          >
                            ✓ Verify
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) handleVerification(bank._id, 'rejected', reason);
                            }}
                            className="btn-danger"
                            title="Reject"
                          >
                            ✗ Reject
                          </button>
                        </>
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
    </div>
  );
};

export default BloodBankManagement;

