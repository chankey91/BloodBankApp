import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrophy } from 'react-icons/fa';
import { format } from 'date-fns';

const DonorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/donors/profile');
      setProfile(res.data.data);
    } catch (error) {
      if (error.response?.status === 404) {
        // No profile found
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
          <h2>No Donor Profile Found</h2>
          <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>
            Please create your donor profile to start saving lives!
          </p>
          <Link to="/donor/profile/create">
            <button className="btn btn-primary">Create Donor Profile</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Donor Profile</h1>
          <p className="page-subtitle">Manage your donation history and preferences</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="grid grid-2">
          {/* Profile Info */}
          <div className="card">
            <h2 className="card-header">Profile Information</h2>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div className="donor-avatar">{profile.user?.name?.charAt(0)}</div>
              <h3>{profile.user?.name}</h3>
              <p className="donor-blood-type">{profile.bloodType}</p>
            </div>
            
            <div>
              <p><strong>Email:</strong> {profile.user?.email}</p>
              <p><strong>Phone:</strong> {profile.user?.phone}</p>
              <p><strong>Gender:</strong> {profile.gender}</p>
              <p><strong>Date of Birth:</strong> {profile.dateOfBirth ? format(new Date(profile.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}</p>
              <p><strong>Weight:</strong> {profile.weight} kg</p>
              <p><strong>Location:</strong> {profile.location?.city}, {profile.location?.state}</p>
              {profile.lastDonationDate && (
                <p><strong>Last Donation:</strong> {format(new Date(profile.lastDonationDate), 'MMM dd, yyyy')}</p>
              )}
              <p>
                <strong>Status:</strong>{' '}
                <span className={`badge ${profile.isEligible ? 'badge-success' : 'badge-warning'}`}>
                  {profile.isEligible ? 'Eligible to Donate' : 'Not Eligible Yet'}
                </span>
              </p>
              {!profile.isEligible && profile.eligibleToDonateSince && (
                <p><strong>Next Eligible:</strong> {format(new Date(profile.eligibleToDonateSince), 'MMM dd, yyyy')}</p>
              )}
            </div>
          </div>

          {/* Rewards */}
          <div className="card">
            <h2 className="card-header">Rewards & Achievements</h2>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <FaTrophy style={{ fontSize: '3rem', color: '#fbbf24', marginBottom: '1rem' }} />
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {profile.rewards?.points || 0} Points
              </div>
            </div>

            <h3 style={{ marginBottom: '1rem' }}>Badges</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {profile.rewards?.badges && profile.rewards.badges.length > 0 ? (
                profile.rewards.badges.map((badge, index) => (
                  <div key={index} className="card" style={{ background: 'var(--primary-light)', padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem' }}>{badge.icon}</div>
                    <p style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>{badge.name}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No badges earned yet. Start donating to earn badges!</p>
              )}
            </div>
          </div>
        </div>

        {/* Donation History */}
        <div className="card">
          <h2 className="card-header">Donation History</h2>
          {profile.donationHistory && profile.donationHistory.length > 0 ? (
            <div className="grid">
              {profile.donationHistory.map((donation, index) => (
                <div key={index} className="card" style={{ background: 'var(--background)' }}>
                  <p><strong>Date:</strong> {new Date(donation.date).toLocaleDateString()}</p>
                  <p><strong>Component:</strong> {donation.component}</p>
                  <p><strong>Volume:</strong> {donation.volume} ml</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
              No donations yet. Make your first donation today!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorProfile;

