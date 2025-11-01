import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminAnalytics.css';
import './AdminPageHeader.css';

const AdminAnalytics = () => {
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [donationAnalytics, setDonationAnalytics] = useState(null);
  const [requestAnalytics, setRequestAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, donationsRes, requestsRes] = await Promise.all([
        axios.get('/api/admin/analytics/users', { headers }),
        axios.get('/api/admin/analytics/donations', { headers }),
        axios.get('/api/admin/analytics/requests', { headers })
      ]);

      setUserAnalytics(usersRes.data);
      setDonationAnalytics(donationsRes.data);
      setRequestAnalytics(requestsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Analytics error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="admin-analytics">
      <div className="page-header">
        <h1>📈 System Analytics & Reports</h1>
        <p>Comprehensive system insights and statistics</p>
      </div>

      {/* User Analytics */}
      <div className="analytics-section">
        <h2>👥 User Analytics</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Users by Role</h3>
            <div className="data-list">
              {userAnalytics?.usersByRole?.map(item => (
                <div key={item._id} className="data-item">
                  <span className="label">{item._id}</span>
                  <span className="value">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <h3>Verification Status</h3>
            <div className="data-list">
              {userAnalytics?.usersByVerification?.map(item => (
                <div key={item._id.toString()} className="data-item">
                  <span className="label">{item._id ? 'Verified' : 'Unverified'}</span>
                  <span className="value">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card full-width">
          <h3>Registration Trend (Last 30 Days)</h3>
          <div className="trend-list">
            {userAnalytics?.registrationTrend?.map(item => (
              <div key={item._id} className="trend-item">
                <span className="date">{item._id}</span>
                <div className="trend-bar">
                  <div className="bar-fill" style={{ width: `${item.count * 10}%` }}></div>
                </div>
                <span className="count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Donation Analytics */}
      <div className="analytics-section">
        <h2>🩸 Donation Analytics</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Donations by Blood Type</h3>
            <div className="data-list">
              {donationAnalytics?.donationsByBloodType?.map(item => (
                <div key={item._id} className="data-item">
                  <span className="label">{item._id}</span>
                  <span className="value">{item.totalDonations} donations ({item.totalUnits} units)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <h3>Top Donors</h3>
            <div className="data-list">
              {donationAnalytics?.topDonors?.slice(0, 10).map((donor, index) => (
                <div key={donor._id} className="data-item">
                  <span className="label">
                    {index + 1}. {donor.user?.name || 'Unknown'}
                  </span>
                  <span className="value">{donor.rewards?.totalPoints || 0} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Request Analytics */}
      <div className="analytics-section">
        <h2>📋 Request Analytics</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Requests by Status</h3>
            <div className="data-list">
              {requestAnalytics?.requestsByStatus?.map(item => (
                <div key={item._id} className="data-item">
                  <span className="label">{item._id}</span>
                  <span className="value">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <h3>Requests by Urgency</h3>
            <div className="data-list">
              {requestAnalytics?.requestsByUrgency?.map(item => (
                <div key={item._id} className="data-item">
                  <span className="label">{item._id}</span>
                  <span className="value">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <h3>Requests by Blood Type</h3>
            <div className="data-list">
              {requestAnalytics?.requestsByBloodType?.map(item => (
                <div key={item._id} className="data-item">
                  <span className="label">{item._id}</span>
                  <span className="value">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <h3>Fulfillment Stats</h3>
            {requestAnalytics?.fulfillmentStats && (
              <div className="data-list">
                <div className="data-item">
                  <span className="label">Average Time</span>
                  <span className="value">
                    {Math.round((requestAnalytics.fulfillmentStats.avgTime || 0) / (1000 * 60 * 60))} hours
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">Fastest</span>
                  <span className="value">
                    {Math.round((requestAnalytics.fulfillmentStats.minTime || 0) / (1000 * 60 * 60))} hours
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">Slowest</span>
                  <span className="value">
                    {Math.round((requestAnalytics.fulfillmentStats.maxTime || 0) / (1000 * 60 * 60))} hours
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

