import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminSettings.css';
import './AdminPageHeader.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    donationEligibilityDays: 56,
    reorderThreshold: 10,
    emergencyRadius: 10,
    maxSearchRadius: 100,
    pointsPerDonation: 50,
    pointsFirstDonation: 100,
    pointsEmergency: 150
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Settings error:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: parseFloat(value) || value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.put('/api/admin/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Settings saved successfully');
      setSaving(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="admin-settings">
      <div className="page-header">
        <h1>⚙️ System Settings</h1>
        <p>Configure system parameters and rules</p>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        <div className="settings-section">
          <h2>Donation Rules</h2>
          <div className="setting-item">
            <label>
              <span className="setting-label">Donation Eligibility Period (days)</span>
              <span className="setting-desc">Minimum days between donations</span>
            </label>
            <input
              type="number"
              name="donationEligibilityDays"
              value={settings.donationEligibilityDays}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Inventory Management</h2>
          <div className="setting-item">
            <label>
              <span className="setting-label">Reorder Threshold (units)</span>
              <span className="setting-desc">Trigger low stock alert when inventory falls below</span>
            </label>
            <input
              type="number"
              name="reorderThreshold"
              value={settings.reorderThreshold}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Geolocation Settings</h2>
          <div className="setting-item">
            <label>
              <span className="setting-label">Emergency Alert Radius (km)</span>
              <span className="setting-desc">Default radius for emergency donor alerts</span>
            </label>
            <input
              type="number"
              name="emergencyRadius"
              value={settings.emergencyRadius}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="setting-item">
            <label>
              <span className="setting-label">Maximum Search Radius (km)</span>
              <span className="setting-desc">Maximum distance for blood bank searches</span>
            </label>
            <input
              type="number"
              name="maxSearchRadius"
              value={settings.maxSearchRadius}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Reward Points System</h2>
          <div className="setting-item">
            <label>
              <span className="setting-label">Points per Donation</span>
              <span className="setting-desc">Points awarded for regular donation</span>
            </label>
            <input
              type="number"
              name="pointsPerDonation"
              value={settings.pointsPerDonation}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="setting-item">
            <label>
              <span className="setting-label">Points for First Donation</span>
              <span className="setting-desc">Bonus points for first-time donors</span>
            </label>
            <input
              type="number"
              name="pointsFirstDonation"
              value={settings.pointsFirstDonation}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="setting-item">
            <label>
              <span className="setting-label">Points for Emergency Response</span>
              <span className="setting-desc">Points for responding to critical requests</span>
            </label>
            <input
              type="number"
              name="pointsEmergency"
              value={settings.pointsEmergency}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" disabled={saving} className="save-btn">
            {saving ? 'Saving...' : '💾 Save Settings'}
          </button>
          <button type="button" onClick={fetchSettings} className="reset-btn">
            🔄 Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;

