import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchRequests = async () => {
    try {
      let url = '/api/requests';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      const res = await axios.get(url);
      setRequests(res.data.data);
    } catch (error) {
      console.error('Error fetching requests', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'badge-danger';
      case 'urgent':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'fulfilled':
        return 'badge-success';
      case 'partially-fulfilled':
        return 'badge-warning';
      case 'cancelled':
      case 'expired':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Blood Requests</h1>
          <p className="page-subtitle">View and respond to blood requests</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setFilter('all')}
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('open')}
                className={`btn ${filter === 'open' ? 'btn-primary' : 'btn-outline'}`}
              >
                Open
              </button>
              <button 
                onClick={() => setFilter('fulfilled')}
                className={`btn ${filter === 'fulfilled' ? 'btn-primary' : 'btn-outline'}`}
              >
                Fulfilled
              </button>
            </div>
            
            {(user?.role === 'hospital' || user?.role === 'bloodbank') && (
              <Link to="/requests/create">
                <button className="btn btn-primary">+ Create Request</button>
              </Link>
            )}
          </div>

          {requests.length > 0 ? (
            requests.map((request) => (
              <div key={request._id} className="request-card">
                <div className="request-header">
                  <span className="request-blood-type">{request.bloodType}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className={`badge ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency}
                    </span>
                    <span className={`badge ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>

                <div className="request-info">
                  <div className="request-info-item">
                    <strong>Patient:</strong> {request.patient?.name}
                  </div>
                  <div className="request-info-item">
                    <strong>Units:</strong> {request.unitsRequired} ({request.unitsFulfilled} fulfilled)
                  </div>
                  <div className="request-info-item">
                    <strong>Component:</strong> {request.component}
                  </div>
                  <div className="request-info-item">
                    <strong>Location:</strong> {request.location?.city}, {request.location?.state}
                  </div>
                  <div className="request-info-item">
                    <strong>Required By:</strong> {format(new Date(request.requiredBy), 'MMM dd, yyyy')}
                  </div>
                  <div className="request-info-item">
                    <strong>Posted:</strong> {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>

                {request.patient?.medicalCondition && (
                  <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                    <strong>Condition:</strong> {request.patient.medicalCondition}
                  </p>
                )}

                <div className="request-actions">
                  <Link to={`/requests/${request._id}`}>
                    <button className="btn btn-primary">View Details</button>
                  </Link>
                  {user?.role === 'donor' && request.status === 'open' && (
                    <Link to={`/requests/${request._id}`}>
                      <button className="btn btn-secondary">Respond</button>
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No requests found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;

