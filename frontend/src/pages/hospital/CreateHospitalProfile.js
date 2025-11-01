import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateHospitalProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    type: 'general',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    zipCode: '',
    latitude: '',
    longitude: '',
    phone: '',
    emergencyPhone: '',
    email: '',
    totalBeds: '',
    icuBeds: '',
    departments: [],
    services: []
  });

  const hospitalTypes = [
    { value: 'general', label: 'General Hospital' },
    { value: 'specialty', label: 'Specialty Hospital' },
    { value: 'teaching', label: 'Teaching Hospital' },
    { value: 'trauma-center', label: 'Trauma Center' },
    { value: 'children', label: 'Children\'s Hospital' }
  ];

  const availableDepartments = [
    'Emergency',
    'ICU',
    'Surgery',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Oncology',
    'Radiology',
    'Laboratory'
  ];

  const availableServices = [
    '24/7 Emergency',
    'Blood Bank',
    'ICU',
    'NICU',
    'Operation Theater',
    'Ambulance',
    'Diagnostic Lab',
    'Pharmacy',
    'Dialysis',
    'Maternity'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleArrayChange = (item, arrayName) => {
    const array = formData[arrayName].includes(item)
      ? formData[arrayName].filter(i => i !== item)
      : [...formData[arrayName], item];
    
    setFormData({ ...formData, [arrayName]: array });
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
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode
        },
        contact: {
          phone: formData.phone,
          emergencyPhone: formData.emergencyPhone,
          email: formData.email
        },
        capacity: {
          totalBeds: parseInt(formData.totalBeds),
          icuBeds: parseInt(formData.icuBeds)
        },
        departments: formData.departments,
        services: formData.services
      };

      await axios.post('/api/hospitals', payload);
      toast.success('Hospital profile created successfully!');
      navigate('/hospital/profile');
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
          <h1 className="page-title">Create Hospital Profile</h1>
          <p className="page-subtitle">Complete your hospital information</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2 className="card-header">Basic Information</h2>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Hospital Name *</label>
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
                  {hospitalTypes.map(type => (
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
              📍 Use Current Location
            </button>

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
                <label className="form-label">Emergency Phone *</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  className="form-input"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  required
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
            </div>

            <h2 className="card-header" style={{ marginTop: '2rem' }}>Capacity</h2>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Total Beds *</label>
                <input
                  type="number"
                  name="totalBeds"
                  className="form-input"
                  value={formData.totalBeds}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">ICU Beds *</label>
                <input
                  type="number"
                  name="icuBeds"
                  className="form-input"
                  value={formData.icuBeds}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>

            <h2 className="card-header" style={{ marginTop: '2rem' }}>Departments</h2>
            
            <div className="form-group">
              <label className="form-label">Select Available Departments</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                {availableDepartments.map(dept => (
                  <label 
                    key={dept}
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
                      checked={formData.departments.includes(dept)}
                      onChange={() => handleArrayChange(dept, 'departments')}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>{dept}</span>
                  </label>
                ))}
              </div>
            </div>

            <h2 className="card-header" style={{ marginTop: '2rem' }}>Services</h2>
            
            <div className="form-group">
              <label className="form-label">Select Available Services</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                {availableServices.map(service => (
                  <label 
                    key={service}
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
                      checked={formData.services.includes(service)}
                      onChange={() => handleArrayChange(service, 'services')}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>{service}</span>
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

export default CreateHospitalProfile;

