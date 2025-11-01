import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddInventory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodBankId: '',
    bloodType: '',
    component: 'whole blood',
    bagNumber: '',
    collectionDate: '',
    expiryDate: '',
    volume: '',
    donorId: '',
    storageLocation: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const components = [
    { value: 'whole blood', label: 'Whole Blood' },
    { value: 'plasma', label: 'Plasma' },
    { value: 'platelets', label: 'Platelets' },
    { value: 'red blood cells', label: 'Red Blood Cells' },
    { value: 'cryoprecipitate', label: 'Cryoprecipitate' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-calculate expiry date based on component type
    if (name === 'component' || name === 'collectionDate') {
      const collection = name === 'collectionDate' ? value : formData.collectionDate;
      const component = name === 'component' ? value : formData.component;
      
      if (collection) {
        const expiryDate = calculateExpiryDate(collection, component);
        setFormData({
          ...formData,
          [name]: value,
          expiryDate: expiryDate
        });
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const calculateExpiryDate = (collectionDate, component) => {
    const date = new Date(collectionDate);
    
    // Standard expiry periods for different components
    switch (component) {
      case 'whole blood':
        date.setDate(date.getDate() + 35); // 35 days
        break;
      case 'red blood cells':
        date.setDate(date.getDate() + 42); // 42 days
        break;
      case 'plasma':
        date.setFullYear(date.getFullYear() + 1); // 1 year
        break;
      case 'platelets':
        date.setDate(date.getDate() + 5); // 5 days
        break;
      case 'cryoprecipitate':
        date.setFullYear(date.getFullYear() + 1); // 1 year
        break;
      default:
        date.setDate(date.getDate() + 35);
    }
    
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, get blood bank profile to get the blood bank ID
      const profileRes = await axios.get('/api/bloodbanks/me/profile');
      const bloodBankId = profileRes.data.data._id;

      const unitData = {
        bagNumber: formData.bagNumber,
        collectionDate: formData.collectionDate,
        expiryDate: formData.expiryDate,
        volume: parseFloat(formData.volume),
        status: 'available',
        testResults: {
          hiv: 'pending',
          hepatitisB: 'pending',
          hepatitisC: 'pending',
          syphilis: 'pending',
          malaria: 'pending'
        },
        storageLocation: formData.storageLocation
      };

      if (formData.donorId) {
        unitData.donor = formData.donorId;
      }

      const payload = {
        bloodBankId: bloodBankId,
        bloodType: formData.bloodType,
        component: formData.component,
        unitData: unitData
      };

      await axios.post('/api/inventory', payload);
      toast.success('Blood unit added to inventory successfully!');
      navigate('/inventory');
    } catch (error) {
      console.error('Error adding inventory:', error);
      toast.error(error.response?.data?.error || 'Failed to add inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Add Blood Inventory</h1>
          <p className="page-subtitle">Add new blood unit to your inventory</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2 className="card-header">Blood Unit Information</h2>
            
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
                <label className="form-label">Component *</label>
                <select
                  name="component"
                  className="form-select"
                  value={formData.component}
                  onChange={handleChange}
                  required
                >
                  {components.map(comp => (
                    <option key={comp.value} value={comp.value}>{comp.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bag Number *</label>
                <input
                  type="text"
                  name="bagNumber"
                  className="form-input"
                  value={formData.bagNumber}
                  onChange={handleChange}
                  placeholder="e.g., BAG-2025-001"
                  required
                />
                <small style={{ color: 'var(--text-secondary)' }}>Unique identifier for this unit</small>
              </div>

              <div className="form-group">
                <label className="form-label">Volume (ml) *</label>
                <input
                  type="number"
                  name="volume"
                  className="form-input"
                  value={formData.volume}
                  onChange={handleChange}
                  min="1"
                  placeholder="e.g., 450"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Collection Date *</label>
                <input
                  type="date"
                  name="collectionDate"
                  className="form-input"
                  value={formData.collectionDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date *</label>
                <input
                  type="date"
                  name="expiryDate"
                  className="form-input"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <small style={{ color: 'var(--text-secondary)' }}>Auto-calculated based on component type</small>
              </div>

              <div className="form-group">
                <label className="form-label">Storage Location</label>
                <input
                  type="text"
                  name="storageLocation"
                  className="form-input"
                  value={formData.storageLocation}
                  onChange={handleChange}
                  placeholder="e.g., Refrigerator-A, Shelf-3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Donor ID (Optional)</label>
                <input
                  type="text"
                  name="donorId"
                  className="form-input"
                  value={formData.donorId}
                  onChange={handleChange}
                  placeholder="MongoDB ObjectId"
                />
                <small style={{ color: 'var(--text-secondary)' }}>If you know the donor's ID</small>
              </div>
            </div>

            <div className="alert alert-warning" style={{ marginTop: '1.5rem' }}>
              <strong>📋 Expiry Periods:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Whole Blood: 35 days</li>
                <li>Red Blood Cells: 42 days</li>
                <li>Platelets: 5 days</li>
                <li>Plasma: 1 year</li>
                <li>Cryoprecipitate: 1 year</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add to Inventory'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/inventory')} 
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

export default AddInventory;

