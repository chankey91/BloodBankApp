import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaHospital, FaBed } from 'react-icons/fa';

const HospitalProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/hospitals/me/profile');
      setProfile(res.data.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setProfile(null);
      } else {
        console.error('Error fetching profile', error);
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!profile) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>No Hospital Profile Found</h2>
          <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>
            Please create your hospital profile to access all features!
          </p>
          <Link to="/hospital/profile/create">
            <button className="btn btn-primary">Create Hospital Profile</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Hospital Profile</h1>
          <p className="page-subtitle">Manage your hospital information</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="grid grid-2">
          {/* Basic Information */}
          <div className="card">
            <h2 className="card-header">Basic Information</h2>
            
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '100px', 
                height: '100px', 
                background: 'var(--primary-light)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '3rem'
              }}>
                <FaHospital style={{ color: 'var(--primary-color)' }} />
              </div>
              <h3>{profile.name}</h3>
              <span className={`badge ${profile.verificationStatus === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                {profile.verificationStatus}
              </span>
            </div>

            <div>
              <p><strong>Registration Number:</strong> {profile.registrationNumber}</p>
              <p><strong>Type:</strong> {profile.type?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`badge ${profile.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {profile.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
              {profile.rating && (
                <p><strong>Rating:</strong> ⭐ {profile.rating.average.toFixed(1)} ({profile.rating.count} reviews)</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h2 className="card-header">Contact Information</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <FaPhone style={{ color: 'var(--primary-color)' }} />
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Primary Phone</div>
                <div>{profile.contact?.phone}</div>
              </div>
            </div>

            {profile.contact?.emergencyPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <FaPhone style={{ color: '#dc2626' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Emergency Phone</div>
                  <div>{profile.contact.emergencyPhone}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaEnvelope style={{ color: 'var(--primary-color)' }} />
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email</div>
                <div>{profile.contact?.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <h2 className="card-header">Location</h2>
          
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <FaMapMarkerAlt style={{ color: 'var(--primary-color)', marginTop: '0.25rem', fontSize: '1.25rem' }} />
            <div>
              <p style={{ marginBottom: '0.25rem' }}>{profile.location?.address}</p>
              <p style={{ marginBottom: '0.25rem' }}>{profile.location?.city}, {profile.location?.state} {profile.location?.zipCode}</p>
              <p>{profile.location?.country}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-2">
          {/* Capacity */}
          <div className="card">
            <h2 className="card-header">Capacity</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <FaBed style={{ fontSize: '2rem', color: 'var(--primary-color)' }} />
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  {profile.capacity?.totalBeds || 0}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>Total Beds</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FaBed style={{ fontSize: '2rem', color: 'var(--secondary-color)' }} />
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                  {profile.capacity?.icuBeds || 0}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>ICU Beds</div>
              </div>
            </div>
          </div>

          {/* Departments */}
          <div className="card">
            <h2 className="card-header">Departments</h2>
            
            {profile.departments && profile.departments.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {profile.departments.map((dept, index) => (
                  <span 
                    key={index} 
                    className="badge badge-info"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    {dept}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No departments listed</p>
            )}
          </div>
        </div>

        {/* Services */}
        {profile.services && profile.services.length > 0 && (
          <div className="card">
            <h2 className="card-header">Services</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {profile.services.map((service, index) => (
                <span 
                  key={index} 
                  className="badge badge-success"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/requests/create">
            <button className="btn btn-primary">Create Blood Request</button>
          </Link>
          <Link to="/requests">
            <button className="btn btn-secondary">View My Requests</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HospitalProfile;

