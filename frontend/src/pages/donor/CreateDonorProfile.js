import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateDonorProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    zipCode: '',
    latitude: '',
    longitude: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast.success('Location detected!');
        },
        (error) => {
          toast.error('Unable to get location');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        bloodType: formData.bloodType,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        weight: parseFloat(formData.weight),
        location: {
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode
        }
      };

      await axios.post('/api/donors', payload);
      toast.success('Donor profile created successfully!');
      navigate('/donor/profile');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Create Donor Profile</h1>
          <p className="page-subtitle">Complete your profile to start saving lives</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2 className="card-header">Personal Information</h2>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Blood Type *</label>
                <select
                  name="bloodType"
                  className="form-select"
                  value={formData.bloodType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Blood Type</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="form-input"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg) *</label>
                <input
                  type="number"
                  name="weight"
                  className="form-input"
                  value={formData.weight}
                  onChange={handleChange}
                  min="45"
                  required
                />
                <small style={{ color: 'var(--text-secondary)' }}>Minimum 45 kg required</small>
              </div>
            </div>

            <h2 className="card-header" style={{ marginTop: '2rem' }}>Location Information</h2>
            
            <div className="form-group">
              <label className="form-label">Address *</label>
              <input
                type="text"
                name="address"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country *</label>
                <input
                  type="text"
                  name="country"
                  className="form-input"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  className="form-input"
                  value={formData.zipCode}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Latitude *</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  className="form-input"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  className="form-input"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button 
              type="button" 
              onClick={getCurrentLocation} 
              className="btn btn-outline"
              style={{ marginBottom: '1rem' }}
            >
              📍 Use My Current Location
            </button>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating Profile...' : 'Create Profile'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/dashboard')} 
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDonorProfile;

