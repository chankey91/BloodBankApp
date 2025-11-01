import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateDonationCamp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bloodBankId, setBloodBankId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    latitude: '',
    longitude: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    targetDonors: 50,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    bloodTypes: [],
    notifyDonors: true
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchBloodBankProfile();
  }, []);

  const fetchBloodBankProfile = async () => {
    try {
      const res = await axios.get('/api/bloodbanks/me/profile');
      setBloodBankId(res.data.data._id);
    } catch (error) {
      console.error('Error fetching blood bank profile', error);
      toast.error('Please complete your blood bank profile first');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleBloodTypeToggle = (bloodType) => {
    const bloodTypes = formData.bloodTypes.includes(bloodType)
      ? formData.bloodTypes.filter(bt => bt !== bloodType)
      : [...formData.bloodTypes, bloodType];
    
    setFormData({ ...formData, bloodTypes });
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
    
    if (!bloodBankId) {
      toast.error('Please complete your blood bank profile first');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        organizerId: bloodBankId,
        name: formData.name,
        description: formData.description,
        location: {
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
          address: formData.address,
          city: formData.city,
          state: formData.state,
          landmark: formData.landmark
        },
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        targetDonors: parseInt(formData.targetDonors),
        contactPerson: {
          name: formData.contactName,
          phone: formData.contactPhone,
          email: formData.contactEmail
        },
        requirements: {
          bloodTypes: formData.bloodTypes.length > 0 ? formData.bloodTypes : bloodTypes
        },
        notifyDonors: formData.notifyDonors
      };

      await axios.post('/api/donation-camps', payload);
      toast.success('Donation camp created successfully!');
      
      if (formData.notifyDonors) {
        toast.info('Nearby donors will be notified about this camp!');
      }
      
      navigate('/camps');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create camp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Create Donation Camp</h1>
          <p className="page-subtitle">Organize a blood donation drive</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2 className="card-header">Camp Information</h2>
            
            <div className="form-group">
              <label className="form-label">Camp Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Community Blood Drive 2025"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Brief description about the camp..."
              />
            </div>

            <h2 className="card-header" style={{ marginTop: '2rem' }}>Location Details</h2>
            
            <div className="form-group">
              <label className="form-label">Address *</label>
              <input
                type="text"
                name="address"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address of camp venue"
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
                <label className="form-label">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  className="form-input"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="e.g., Near City Hall"
                />
              </div>

              <div className="form-group"></div>

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
              style={{ marginBottom: '1.5rem' }}
            >
              📍 Use Current Location
            </button>

            <h2 className="card-header" style={{ marginTop: '2rem' }}>Date & Time</h2>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-input"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-input"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input
                  type="time"
                  name="startTime"
                  className="form-input"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Time *</label>
                <input
                  type="time"
                  name="endTime"
                  className="form-input"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Donors *</label>
                <input
                  type="number"
                  name="targetDonors"
                  className="form-input"
                  value={formData.targetDonors}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <small style={{ color: 'var(--text-secondary)' }}>Expected number of donors</small>
              </div>
            </div>

            <h2 className="card-header" style={{ marginTop: '2rem' }}>Contact Person</h2>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="contactName"
                  className="form-input"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  name="contactPhone"
                  className="form-input"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="contactEmail"
                  className="form-input"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <h2 className="card-header" style={{ marginTop: '2rem' }}>Blood Type Requirements</h2>
            
            <div className="form-group">
              <label className="form-label">Select Required Blood Types (Leave empty for all types)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                {bloodTypes.map(type => (
                  <label 
                    key={type}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '0.75rem', 
                      background: formData.bloodTypes.includes(type) ? 'var(--primary-light)' : 'var(--background)', 
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      border: formData.bloodTypes.includes(type) ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      fontWeight: formData.bloodTypes.includes(type) ? 'bold' : 'normal'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.bloodTypes.includes(type)}
                      onChange={() => handleBloodTypeToggle(type)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="notifyDonors"
                  checked={formData.notifyDonors}
                  onChange={handleChange}
                  style={{ marginRight: '0.5rem' }}
                />
                <span>Notify nearby donors about this camp (Recommended)</span>
              </label>
              <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                Donors within 20km radius will receive notifications
              </small>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating Camp...' : 'Create Donation Camp'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/camps')} 
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

export default CreateDonationCamp;

