import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUsers, FaHandHoldingHeart, FaTint, FaCheckCircle } from 'react-icons/fa';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/analytics/dashboard');
      setDashboardData(res.data.data);
    } catch (error) {
      console.error('Error fetching analytics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const { overview, bloodTypeDistribution, recentDonations, inventorySummary } = dashboardData || {};

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Track trends and insights</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        {/* Overview Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <FaUsers style={{ fontSize: '2.5rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }} />
            <div className="stat-number">{overview?.totalDonors || 0}</div>
            <div className="stat-label">Total Donors</div>
          </div>

          <div className="stat-card">
            <FaHandHoldingHeart style={{ fontSize: '2.5rem', color: 'var(--secondary-color)', marginBottom: '0.5rem' }} />
            <div className="stat-number">{overview?.eligibleDonors || 0}</div>
            <div className="stat-label">Eligible Donors</div>
          </div>

          <div className="stat-card">
            <FaTint style={{ fontSize: '2.5rem', color: '#dc2626', marginBottom: '0.5rem' }} />
            <div className="stat-number">{overview?.activeRequests || 0}</div>
            <div className="stat-label">Active Requests</div>
          </div>

          <div className="stat-card">
            <FaCheckCircle style={{ fontSize: '2.5rem', color: '#059669', marginBottom: '0.5rem' }} />
            <div className="stat-number">{overview?.fulfilledRequests || 0}</div>
            <div className="stat-label">Fulfilled Requests</div>
          </div>
        </div>

        <div className="grid grid-2">
          {/* Blood Type Distribution */}
          <div className="card">
            <h2 className="card-header">Blood Type Distribution</h2>
            {bloodTypeDistribution && bloodTypeDistribution.length > 0 ? (
              <div>
                {bloodTypeDistribution.map((item) => (
                  <div 
                    key={item._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      background: 'var(--background)',
                      borderRadius: '0.5rem'
                    }}
                  >
                    <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                      {item._id}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div 
                        style={{
                          flex: 1,
                          height: '8px',
                          background: 'var(--border-color)',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          width: '150px'
                        }}
                      >
                        <div 
                          style={{
                            height: '100%',
                            background: 'var(--primary-color)',
                            width: `${(item.count / bloodTypeDistribution[0].count) * 100}%`
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 'bold', minWidth: '40px', textAlign: 'right' }}>
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                No data available
              </p>
            )}
          </div>

          {/* Recent Donations */}
          <div className="card">
            <h2 className="card-header">Recent Donations (Last 30 Days)</h2>
            {recentDonations && recentDonations.length > 0 ? (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {recentDonations.reduce((sum, item) => sum + item.count, 0)}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>Total Donations</div>
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {recentDonations.map((item, index) => (
                    <div 
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        borderBottom: '1px solid var(--border-color)'
                      }}
                    >
                      <span style={{ fontSize: '0.875rem' }}>{item._id}</span>
                      <span style={{ fontWeight: '600' }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                No donations in the last 30 days
              </p>
            )}
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 className="card-header">Current Inventory Summary</h2>
          {inventorySummary && inventorySummary.length > 0 ? (
            <div className="grid grid-3">
              {inventorySummary.map((item, index) => (
                <div 
                  key={index}
                  className="card"
                  style={{ background: 'var(--background)', textAlign: 'center' }}
                >
                  <h3 style={{ color: 'var(--primary-color)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {item._id.bloodType}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {item._id.component}
                  </p>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    {item.totalUnits}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    units
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
              No inventory data available
            </p>
          )}
        </div>

        {/* Quick Insights */}
        <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white' }}>
            <h3 style={{ marginBottom: '1rem' }}>💡 Quick Insights</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                • {Math.round((overview?.eligibleDonors / overview?.totalDonors * 100) || 0)}% of donors are currently eligible
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                • {overview?.fulfilledRequests || 0} requests fulfilled successfully
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                • {overview?.activeRequests || 0} requests awaiting fulfillment
              </li>
            </ul>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: 'white' }}>
            <h3 style={{ marginBottom: '1rem' }}>📊 System Health</h3>
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Donor Registration</span>
                <span>{overview?.totalDonors > 100 ? 'Excellent' : 'Good'}</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}>
                <div style={{ height: '100%', background: 'white', width: '85%', borderRadius: '2px' }} />
              </div>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Request Fulfillment</span>
                <span>{overview?.fulfilledRequests > 10 ? 'Excellent' : 'Good'}</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}>
                <div style={{ height: '100%', background: 'white', width: '75%', borderRadius: '2px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

