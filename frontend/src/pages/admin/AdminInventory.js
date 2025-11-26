import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminInventory.css';
import './AdminPageHeader.css';

const AdminInventory = () => {
  const [inventoryData, setInventoryData] = useState({
    inventory: [],
    summary: [],
    lowStock: []
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    bloodType: '',
    status: ''
  });

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(`/api/admin/inventory?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setInventoryData(response.data);
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch inventory');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getStatusColor = (units, reorderLevel) => {
    if (units === 0) return 'status-out';
    if (units < reorderLevel) return 'status-low';
    return 'status-good';
  };

  const getStatusText = (units, reorderLevel) => {
    if (units === 0) return 'Out of Stock';
    if (units < reorderLevel) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="admin-inventory-page">
      <div className="page-header">
        <h1>📦 System-Wide Inventory</h1>
        <p>Monitor blood inventory across all blood banks</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <select
          name="bloodType"
          value={filters.bloodType}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Blood Types</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>

        <button onClick={fetchInventory} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading inventory...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="summary-section">
            <h2>📊 Inventory Summary</h2>
            <div className="summary-grid">
              {inventoryData.summary && inventoryData.summary.length > 0 ? (
                inventoryData.summary.map(item => (
                  <div key={item._id} className="summary-card">
                    <div className="blood-type-icon">{item._id}</div>
                    <div className="summary-info">
                      <div className="total-units">{item.totalUnits || 0}</div>
                      <div className="unit-label">Total Units</div>
                      <div className="blood-bank-count">
                        {item.bloodBankCount || 0} Blood Banks
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No inventory data available</div>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          {inventoryData.lowStock && inventoryData.lowStock.length > 0 && (
            <div className="alert-section">
              <h2>⚠️ Low Stock Alerts</h2>
              <div className="alert-list">
                {inventoryData.lowStock.map(item => (
                  <div key={item._id} className="alert-item">
                    <div className="alert-icon">🚨</div>
                    <div className="alert-details">
                      <div className="alert-title">
                        {item.bloodType} - {item.component}
                      </div>
                      <div className="alert-info">
                        {item.bloodBank?.name} ({item.bloodBank?.location?.city})
                      </div>
                      <div className="alert-stats">
                        Current: {item.units} units | Reorder Level: {item.reorderLevel} units
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Inventory Table */}
          <div className="inventory-section">
            <h2>📋 Detailed Inventory</h2>
            <div className="table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Blood Bank</th>
                    <th>Location</th>
                    <th>Blood Type</th>
                    <th>Component</th>
                    <th>Units Available</th>
                    <th>Reorder Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.inventory && inventoryData.inventory.length > 0 ? (
                    inventoryData.inventory.map(item => (
                      <tr key={item._id}>
                        <td className="font-weight-bold">
                          {item.bloodBank?.name || 'Unknown'}
                        </td>
                        <td>{item.bloodBank?.location?.city || 'N/A'}</td>
                        <td>
                          <span className="blood-type-badge">{item.bloodType}</span>
                        </td>
                        <td>{item.component}</td>
                        <td className="units-cell">{item.units}</td>
                        <td>{item.reorderLevel}</td>
                        <td>
                          <span className={`status-badge ${getStatusColor(item.units, item.reorderLevel)}`}>
                            {getStatusText(item.units, item.reorderLevel)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data-cell">
                        No inventory records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminInventory;

