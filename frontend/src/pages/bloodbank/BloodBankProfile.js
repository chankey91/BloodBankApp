import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaHospital } from 'react-icons/fa';

const BloodBankProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/bloodbanks/me/profile');
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
          <h2>No Blood Bank Profile Found</h2>
          <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>
            Please create your blood bank profile to access all features!
          </p>
          <Link to="/bloodbank/profile/create">
            <button className="btn btn-primary">Create Blood Bank Profile</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Blood Bank Profile</h1>
          <p className="page-subtitle">Manage your blood bank information</p>
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
              <p><strong>Type:</strong> {profile.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
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

            {profile.contact?.alternatePhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <FaPhone style={{ color: 'var(--primary-color)' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Alternate Phone</div>
                  <div>{profile.contact.alternatePhone}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <FaEnvelope style={{ color: 'var(--primary-color)' }} />
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email</div>
                <div>{profile.contact?.email}</div>
              </div>
            </div>

            {profile.contact?.emergencyContact && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaPhone style={{ color: '#dc2626' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Emergency Contact</div>
                  <div>{profile.contact.emergencyContact}</div>
                </div>
              </div>
            )}
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
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {profile.capacity?.storage || 0}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Storage Capacity (units)</div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                {profile.capacity?.dailyCollectionCapacity || 0}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Daily Collection Capacity</div>
            </div>
          </div>

          {/* Facilities */}
          <div className="card">
            <h2 className="card-header">Facilities</h2>
            
            {profile.facilities && profile.facilities.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {profile.facilities.map((facility, index) => (
                  <span 
                    key={index} 
                    className="badge badge-info"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    {facility.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No facilities listed</p>
            )}
          </div>
        </div>

        {/* Certifications */}
        {profile.certifications && profile.certifications.length > 0 && (
          <div className="card">
            <h2 className="card-header">Certifications</h2>
            
            <div className="grid grid-2">
              {profile.certifications.map((cert, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: '1rem', 
                    background: 'var(--background)', 
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <h4 style={{ marginBottom: '0.5rem' }}>{cert.name}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    <strong>Issued by:</strong> {cert.issuedBy}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <strong>Valid until:</strong> {new Date(cert.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/inventory">
            <button className="btn btn-primary">Manage Inventory</button>
          </Link>
          <Link to="/analytics">
            <button className="btn btn-secondary">View Analytics</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BloodBankProfile;

