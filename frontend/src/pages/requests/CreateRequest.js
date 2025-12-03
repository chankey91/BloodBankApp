import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientBloodType: '',
    patientContact: '',
    medicalCondition: '',
    bloodType: '',
    component: 'whole blood',
    unitsRequired: 1,
    urgency: 'normal',
    requiredBy: '',
    address: '',
    city: '',
    state: '',
    latitude: '',
    longitude: '',
    notes: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const components = ['whole blood', 'plasma', 'platelets', 'red blood cells'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
        patient: {
          name: formData.patientName,
          age: parseInt(formData.patientAge),
          gender: formData.patientGender,
          bloodType: formData.patientBloodType,
          contact: formData.patientContact,
          medicalCondition: formData.medicalCondition
        },
        bloodType: formData.bloodType,
        component: formData.component,
        unitsRequired: parseInt(formData.unitsRequired),
        urgency: formData.urgency,
        requiredBy: formData.requiredBy,
        location: {
          coordinates: formData.latitude && formData.longitude 
            ? [parseFloat(formData.longitude), parseFloat(formData.latitude)]
            : [0, 0],
          address: formData.address,
          city: formData.city,
          state: formData.state
        },
        notes: formData.notes,
        isEmergency: formData.urgency === 'critical'
      };

      const res = await axios.post('/api/requests', payload);
      toast.success('Blood request created successfully!');
      navigate(`/requests/${res.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Create Blood Request</h1>
          <p className="page-subtitle">Request blood for a patient in need</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2 className="card-header">Patient Information</h2>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Patient Name *</label>
                <input
                  type="text"
                  name="patientName"
                  className="form-input"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age *</label>
                <input
                  type="number"
                  name="patientAge"
                  className="form-input"
                  value={formData.patientAge}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="patientGender"
                  className="form-select"
                  value={formData.patientGender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Patient Blood Type *</label>
                <select
                  name="patientBloodType"
                  className="form-select"
                  value={formData.patientBloodType}
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
                <label className="form-label">Contact Number</label>
                <input
                  type="tel"
                  name="patientContact"
                  className="form-input"
                  value={formData.patientContact}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Medical Condition</label>
              <textarea
                name="medicalCondition"
                className="form-input"
                value={formData.medicalCondition}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <h2 className="card-header" style={{ marginTop: '2rem' }}>Blood Requirement</h2>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Blood Type Required *</label>
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
                <label className="form-label">Component *</label>
                <select
                  name="component"
                  className="form-select"
                  value={formData.component}
                  onChange={handleChange}
                  required
                >
                  {components.map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Units Required *</label>
                <input
                  type="number"
                  name="unitsRequired"
                  className="form-input"
                  value={formData.unitsRequired}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Urgency *</label>
                <select
                  name="urgency"
                  className="form-select"
                  value={formData.urgency}
                  onChange={handleChange}
                  required
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Required By *</label>
                <input
                  type="date"
                  name="requiredBy"
                  className="form-input"
                  value={formData.requiredBy}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <h2 className="card-header" style={{ marginTop: '2rem' }}>Location</h2>
            
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
                💡 Coordinates help notify nearby donors. You can skip this if location detection doesn't work.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea
                name="notes"
                className="form-input"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating Request...' : 'Create Request'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/requests')} 
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

export default CreateRequest;
