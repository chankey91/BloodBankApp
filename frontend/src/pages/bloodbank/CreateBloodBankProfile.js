import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateBloodBankProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    type: 'standalone',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    zipCode: '',
    latitude: '',
    longitude: '',
    phone: '',
    alternatePhone: '',
    email: '',
    emergencyContact: '',
    storageCapacity: '',
    dailyCollectionCapacity: '',
    facilities: []
  });

  const bloodBankTypes = [
    { value: 'hospital-based', label: 'Hospital-Based' },
    { value: 'standalone', label: 'Standalone' },
    { value: 'mobile-unit', label: 'Mobile Unit' }
  ];

  const availableFacilities = [
    'whole-blood-collection',
    'plasma-collection',
    'platelet-collection',
    'blood-testing',
    'blood-storage',
    'mobile-collection-unit',
    'emergency-services'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFacilityChange = (facility) => {
    const facilities = formData.facilities.includes(facility)
      ? formData.facilities.filter(f => f !== facility)
      : [...formData.facilities, facility];
    
    setFormData({ ...formData, facilities });
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
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        type: formData.type,
        location: {
          coordinates: formData.latitude && formData.longitude 
            ? [parseFloat(formData.longitude), parseFloat(formData.latitude)]
            : [0, 0],
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode
        },
        contact: {
          phone: formData.phone,
          alternatePhone: formData.alternatePhone,
          email: formData.email,
          emergencyContact: formData.emergencyContact
        },
        capacity: {
          storage: parseFloat(formData.storageCapacity),
          dailyCollectionCapacity: parseFloat(formData.dailyCollectionCapacity)
        },
        facilities: formData.facilities
      };

      await axios.post('/api/bloodbanks', payload);
      toast.success('Blood bank profile created successfully!');
      navigate('/bloodbank/profile');
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
          <h1 className="page-title">Create Blood Bank Profile</h1>
          <p className="page-subtitle">Complete your blood bank information</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2 className="card-header">Basic Information</h2>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Blood Bank Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  className="form-input"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type *</label>
                <select
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  {bloodBankTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
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
                <label className="form-label">Latitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  className="form-input"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g., 28.6139"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Longitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  className="form-input"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g., 77.2090"
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <button 
                type="button" 
                onClick={getCurrentLocation} 
                className="btn btn-outline"
              >
                📍 Use Current Location
              </button>
              <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                💡 Coordinates help donors find your blood bank. You can skip this if location detection doesn't work.
              </small>
            </div>

            <h2 className="card-header" style={{ marginTop: '2rem' }}>Contact Information</h2>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Primary Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alternate Phone</label>
                <input
                  type="tel"
                  name="alternatePhone"
                  className="form-input"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact</label>
                <input
                  type="tel"
                  name="emergencyContact"
                  className="form-input"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h2 className="card-header" style={{ marginTop: '2rem' }}>Capacity Information</h2>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Storage Capacity (units) *</label>
                <input
                  type="number"
                  name="storageCapacity"
                  className="form-input"
                  value={formData.storageCapacity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Daily Collection Capacity *</label>
                <input
                  type="number"
                  name="dailyCollectionCapacity"
                  className="form-input"
                  value={formData.dailyCollectionCapacity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>

            <h2 className="card-header" style={{ marginTop: '2rem' }}>Facilities</h2>
            
            <div className="form-group">
              <label className="form-label">Select Available Facilities</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                {availableFacilities.map(facility => (
                  <label 
                    key={facility}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '0.5rem', 
                      background: 'var(--background)', 
                      borderRadius: '0.25rem',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.facilities.includes(facility)}
                      onChange={() => handleFacilityChange(facility)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>
                      {facility.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
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

export default CreateBloodBankProfile;

