import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data.data);
    } catch (error) {
      console.error('Error fetching notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay updated with important alerts</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="card-header" style={{ marginBottom: 0 }}>All Notifications</h2>
            <button onClick={markAllAsRead} className="btn btn-outline">
              Mark All as Read
            </button>
          </div>

          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
                style={{
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  background: notification.isRead ? 'white' : 'var(--primary-light)',
                  cursor: notification.isRead ? 'default' : 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>{notification.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {notification.message}
                    </p>
                    <small style={{ color: 'var(--text-secondary)' }}>
                      {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                    </small>
                  </div>
                  <span className={`badge badge-${notification.priority === 'critical' ? 'danger' : 'info'}`}>
                    {notification.priority}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No notifications yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

