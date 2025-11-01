import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FaMapMarkerAlt, FaClock, FaCalendar, FaPlus } from 'react-icons/fa';

const DonationCamps = () => {
  const { user } = useAuth();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [donorProfile, setDonorProfile] = useState(null);

  useEffect(() => {
    fetchCamps();
  }, [filter]);

  useEffect(() => {
    if (user?.role === 'donor') {
      fetchDonorProfile();
    }
  }, [user]);

  const fetchDonorProfile = async () => {
    try {
      const res = await axios.get('/api/donors/profile');
      setDonorProfile(res.data.data);
    } catch (error) {
      console.error('Error fetching donor profile:', error);
      if (error.response?.status === 404) {
        toast.warning('Please create your donor profile to register for camps!');
      }
    }
  };

  const fetchCamps = async () => {
    try {
      let url = '/api/donation-camps';
      if (filter === 'upcoming') {
        url += '?upcoming=true';
      } else if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      const res = await axios.get(url);
      setCamps(res.data.data);
    } catch (error) {
      console.error('Error fetching camps', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (campId) => {
    try {
      await axios.post(`/api/donation-camps/${campId}/register`);
      toast.success('Successfully registered for the camp!');
      
      // Wait a bit then refresh data
      setTimeout(() => {
        fetchCamps();
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to register');
    }
  };

  const isRegistered = (camp) => {
    if (!user || !donorProfile) {
      return false;
    }
    
    if (!camp.registeredDonors || camp.registeredDonors.length === 0) {
      return false;
    }
    
    const myDonorId = donorProfile._id;
    
    return camp.registeredDonors.some(rd => {
      // Handle both cases: rd.donor as object or as string
      const campDonorId = typeof rd.donor === 'object' ? rd.donor._id : rd.donor;
      
      // Compare donor IDs as strings to handle ObjectId comparison
      return campDonorId?.toString() === myDonorId?.toString();
    });
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Blood Donation Camps</h1>
          <p className="page-subtitle">Find and register for nearby donation drives</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        {user?.role === 'donor' && !donorProfile && (
          <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
            <strong>⚠️ Profile Required:</strong> You need to create your donor profile before registering for camps.
            <Link to="/donor/profile/create" style={{ marginLeft: '1rem' }}>
              <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                Create Donor Profile
              </button>
            </Link>
          </div>
        )}
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
              onClick={() => setFilter('upcoming')}
              className={`btn ${filter === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setFilter('ongoing')}
              className={`btn ${filter === 'ongoing' ? 'btn-primary' : 'btn-outline'}`}
            >
              Ongoing
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
            >
              Completed
            </button>
              <button 
              onClick={() => setFilter('all')}
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              All
            </button>
            </div>
            
            {user?.role === 'bloodbank' && (
              <Link to="/camps/create">
                <button className="btn btn-primary">
                  <FaPlus style={{ marginRight: '0.5rem' }} />
                  Create Camp
                </button>
              </Link>
            )}
          </div>

          {camps.length > 0 ? (
            <div className="grid grid-2">
              {camps.map((camp) => (
                <div key={camp._id} className="card" style={{ background: 'var(--background)' }}>
                  {camp.imageUrl && (
                    <img 
                      src={camp.imageUrl} 
                      alt={camp.name}
                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }}
                    />
                  )}
                  
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                    {camp.name}
                  </h3>
                  
                  <span className={`badge ${
                    camp.status === 'upcoming' ? 'badge-info' : 
                    camp.status === 'ongoing' ? 'badge-success' : 
                    'badge-warning'
                  }`} style={{ marginBottom: '1rem' }}>
                    {camp.status}
                  </span>

                  {camp.description && (
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                      {camp.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FaCalendar />
                    <span>{format(new Date(camp.startDate), 'MMM dd, yyyy')}</span>
                  </div>

                  {camp.startTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FaClock />
                      <span>{camp.startTime} - {camp.endTime}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FaMapMarkerAlt />
                    <span>{camp.location?.city}</span>
                  </div>

                  <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <strong>Address:</strong> {camp.location?.address}
                  </p>

                  {camp.contactPerson && (
                    <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                      <strong>Contact:</strong> {camp.contactPerson.name} - {camp.contactPerson.phone}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {camp.registeredDonors?.length || 0} / {camp.targetDonors} registered
                    </span>

                    {user?.role === 'donor' && camp.status === 'upcoming' && (
                      <button
                        onClick={() => handleRegister(camp._id)}
                        className="btn btn-primary"
                        disabled={isRegistered(camp)}
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        {isRegistered(camp) ? 'Registered ✓' : 'Register'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No donation camps found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationCamps;

