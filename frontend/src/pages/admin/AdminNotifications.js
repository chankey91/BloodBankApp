import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminTable.css';
import './AdminPageHeader.css';

const AdminNotifications = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal',
    targetRole: '',
    type: 'system'
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/admin/notifications/broadcast',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message);
      setFormData({
        title: '',
        message: '',
        priority: 'normal',
        targetRole: '',
        type: 'system'
      });
      setSending(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
      setSending(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>🔔 Notification Management</h1>
        <p>Send broadcast messages to users</p>
      </div>

      <div className="notification-form-container">
        <form onSubmit={handleSend} className="notification-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Notification title"
              required
            />
          </div>

          <div className="form-group">
            <label>Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Notification message"
              rows="5"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Role</label>
              <select name="targetRole" value={formData.targetRole} onChange={handleChange}>
                <option value="">All Users</option>
                <option value="donor">Donors Only</option>
                <option value="bloodbank">Blood Banks Only</option>
                <option value="hospital">Hospitals Only</option>
              </select>
            </div>

            <div className="form-group">
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="system">System</option>
                <option value="announcement">Announcement</option>
                <option value="alert">Alert</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={sending} className="send-btn">
            {sending ? 'Sending...' : '📤 Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminNotifications;

