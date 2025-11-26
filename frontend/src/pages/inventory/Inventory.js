import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [bloodBankId, setBloodBankId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    fetchBloodBankProfile();
  }, []);

  useEffect(() => {
    if (bloodBankId) {
      fetchInventory();
      fetchLowStock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloodBankId]);

  const fetchBloodBankProfile = async () => {
    try {
      const res = await axios.get('/api/bloodbanks/me/profile');
      setBloodBankId(res.data.data._id);
    } catch (error) {
      console.error('Error fetching blood bank profile', error);
      toast.error('Please complete your blood bank profile first');
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`/api/inventory/bloodbank/${bloodBankId}`);
      setInventory(res.data.data);
    } catch (error) {
      console.error('Error fetching inventory', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      const res = await axios.get(`/api/inventory/low-stock?bloodBankId=${bloodBankId}`);
      setLowStock(res.data.data);
    } catch (error) {
      console.error('Error fetching low stock items', error);
    }
  };

  const getStockLevel = (units, reorderLevel) => {
    if (units === 0) return { label: 'Out of Stock', color: 'badge-danger' };
    if (units <= reorderLevel) return { label: 'Low Stock', color: 'badge-warning' };
    return { label: 'In Stock', color: 'badge-success' };
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Blood Inventory</h1>
          <p className="page-subtitle">Manage your blood bank inventory</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        {/* Low Stock Alerts */}
        {lowStock.length > 0 && (
          <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
            <strong>⚠️ Low Stock Alert!</strong> {lowStock.length} item(s) are running low on stock.
          </div>
        )}

        {/* Inventory Overview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="card-header" style={{ marginBottom: 0 }}>Inventory Overview</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link to="/inventory/record-donation">
                <button className="btn btn-secondary">
                  <FaPlus style={{ marginRight: '0.5rem' }} />
                  Record Donation
                </button>
              </Link>
              <Link to="/inventory/add">
                <button className="btn btn-primary">
                  <FaPlus style={{ marginRight: '0.5rem' }} />
                  Add Blood Unit
                </button>
              </Link>
            </div>
          </div>
          
          {inventory.length > 0 ? (
            <div className="grid grid-3">
              {inventory.map((item) => {
                const stockLevel = getStockLevel(item.units, item.reorderLevel);
                return (
                  <div 
                    key={item._id} 
                    className="card" 
                    style={{ 
                      background: 'var(--background)',
                      border: item.units <= item.reorderLevel ? '2px solid #fbbf24' : '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ color: 'var(--primary-color)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                          {item.bloodType}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {item.component}
                        </p>
                      </div>
                      <span className={`badge ${stockLevel.color}`}>
                        {stockLevel.label}
                      </span>
                    </div>

                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                      {item.units} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>units</span>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Reorder level: {item.reorderLevel} units
                    </p>

                    {item.unit && item.unit.length > 0 && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          <strong>Available:</strong> {item.unit.filter(u => u.status === 'available').length}
                        </p>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          <strong>Reserved:</strong> {item.unit.filter(u => u.status === 'reserved').length}
                        </p>
                        <p style={{ fontSize: '0.875rem' }}>
                          <strong>Issued:</strong> {item.unit.filter(u => u.status === 'issued').length}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No inventory data available. Start by adding blood units to your inventory.
            </p>
          )}
        </div>

        {/* Blood Type Summary */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 className="card-header">Summary by Blood Type</h2>
          
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bloodType => {
              const items = inventory.filter(item => item.bloodType === bloodType);
              const totalUnits = items.reduce((sum, item) => sum + item.units, 0);
              
              return (
                <div 
                  key={bloodType}
                  style={{
                    padding: '1rem',
                    background: 'var(--background)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.25rem' }}>{bloodType}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {items.length} component(s)
                    </p>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {totalUnits}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;

