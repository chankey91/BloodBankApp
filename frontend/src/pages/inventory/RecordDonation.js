import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const RecordDonation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [bloodBankProfile, setBloodBankProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [donors, setDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [formData, setFormData] = useState({
    component: 'whole blood',
    volume: 450,
    collectionDate: new Date().toISOString().split('T')[0]
  });

  // Check if we're coming from a request with donor info
  const fromRequestData = location.state;

  const components = [
    'whole blood',
    'plasma',
    'platelets',
    'red blood cells',
    'cryoprecipitate'
  ];

  useEffect(() => {
    fetchBloodBankProfile();
    
    // If coming from request page with donor info, fetch that specific donor
    if (fromRequestData?.fromRequest && fromRequestData?.donorId) {
      fetchSpecificDonor(fromRequestData.donorId);
      
      // Pre-fill form data if provided
      if (fromRequestData.component) {
        setFormData(prev => ({
          ...prev,
          component: fromRequestData.component
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const fetchBloodBankProfile = async () => {
    try {
      const res = await axios.get('/api/bloodbanks/me/profile');
      setBloodBankProfile(res.data.data);
    } catch (error) {
      console.error('Error fetching blood bank profile', error);
      toast.error('Please complete your blood bank profile first');
    }
  };

  const fetchSpecificDonor = async (donorId) => {
    try {
      setLoading(true);
      // Fetch donor by ID
      const res = await axios.get(`/api/donors/${donorId}`);
      const donor = res.data.data;
      
      // Set as selected donor
      setSelectedDonor(donor);
      setDonors([donor]);
      
      toast.success(`Donor ${donor.user?.name} loaded from request!`);
    } catch (error) {
      console.error('Error fetching specific donor', error);
      toast.error('Could not load donor information. Please search manually.');
    } finally {
      setLoading(false);
    }
  };

  const searchDonors = async () => {
    if (!searchQuery.trim()) {
      toast.warning('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      // Search by name, email, or phone
      const res = await axios.get(`/api/donors/search?query=${searchQuery}`);
      setDonors(res.data.data);
      
      if (res.data.data.length === 0) {
        toast.info('No donors found');
      }
    } catch (error) {
      console.error('Error searching donors', error);
      toast.error('Failed to search donors');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDonor = (donor) => {
    setSelectedDonor(donor);
    console.log('Selected donor:', donor);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDonor) {
      toast.error('Please select a donor');
      return;
    }

    if (!bloodBankProfile) {
      toast.error('Blood bank profile not found');
      return;
    }

    setLoading(true);

    try {
      // Record the donation
      const donationPayload = {
        donorId: selectedDonor._id,
        bloodBankId: bloodBankProfile._id,
        component: formData.component,
        volume: parseInt(formData.volume)
      };

      // If coming from a request, include the requestId
      if (fromRequestData?.requestId) {
        donationPayload.requestId = fromRequestData.requestId;
      }

      const donationResponse = await axios.post('/api/donors/record-donation', donationPayload);

      console.log('Donation recorded:', donationResponse.data);

      toast.success(`Donation recorded! Donor earned +10 points! 🎉`);
      
      if (fromRequestData?.requestId) {
        toast.success('Blood request updated with fulfillment!');
      }
      
      // Optionally add to inventory
      toast.info('Don\'t forget to add this blood unit to your inventory!');
      
      // Reset form
      setSelectedDonor(null);
      setSearchQuery('');
      setDonors([]);
      setFormData({
        component: 'whole blood',
        volume: 450,
        collectionDate: new Date().toISOString().split('T')[0]
      });

      // Navigate based on where we came from
      setTimeout(() => {
        if (fromRequestData?.requestId) {
          navigate(`/requests/${fromRequestData.requestId}`);
        } else {
          navigate('/inventory');
        }
      }, 2000);
    } catch (error) {
      console.error('Error recording donation:', error);
      toast.error(error.response?.data?.error || 'Failed to record donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Record Blood Donation</h1>
          <p className="page-subtitle">Record a completed donation and award donor points</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        {fromRequestData?.fromRequest && (
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <strong>📋 Recording donation for blood request</strong>
            <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              Request ID: {fromRequestData.requestId} | Blood Type: {fromRequestData.bloodType}
            </p>
          </div>
        )}
        
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Step 1: Search for Donor */}
          {!selectedDonor && (
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <h2 className="card-header" style={{ marginTop: 0 }}>Step 1: Find Donor</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Search by donor name, email, or phone number
              </p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchDonors()}
                style={{ flex: 1 }}
              />
              <button 
                onClick={searchDonors} 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              </div>

              {/* Search Results */}
              {donors.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h3>Search Results:</h3>
                  {donors.map((donor) => (
                    <div
                      key={donor._id}
                      onClick={() => handleSelectDonor(donor)}
                      style={{
                        padding: '1rem',
                        margin: '0.5rem 0',
                        border: selectedDonor?._id === donor._id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        background: selectedDonor?._id === donor._id ? 'var(--primary-light)' : 'white'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{donor.user?.name}</strong>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {donor.user?.email} | {donor.user?.phone}
                          </div>
                          <div style={{ marginTop: '0.25rem' }}>
                            <span className="badge badge-primary">{donor.bloodType}</span>
                            {donor.isEligible ? (
                              <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>Eligible</span>
                            ) : (
                              <span className="badge badge-danger" style={{ marginLeft: '0.5rem' }}>Not Eligible</span>
                            )}
                          </div>
                        </div>
                        {selectedDonor?._id === donor._id && (
                          <span style={{ fontSize: '1.5rem' }}>✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Donation Details */}
          {selectedDonor && (
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                <h2 className="card-header" style={{ marginTop: 0 }}>Step 2: Donation Details</h2>
                
                <div style={{ padding: '1rem', background: 'white', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                  <strong>Selected Donor:</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    <div><strong>{selectedDonor.user?.name}</strong></div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Blood Type: {selectedDonor.bloodType} | Phone: {selectedDonor.user?.phone}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Component Type *</label>
                  <select
                    name="component"
                    className="form-input"
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
                  <label className="form-label">Volume (ml) *</label>
                  <input
                    type="number"
                    name="volume"
                    className="form-input"
                    value={formData.volume}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                  <small style={{ color: 'var(--text-secondary)' }}>
                    Standard: 450ml for whole blood, 200ml for plasma/platelets
                  </small>
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
              </div>

              {/* Rewards Preview */}
              <div className="alert alert-success" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>🎁 Rewards to be Awarded:</h3>
                <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
                  <li><strong>+10 Reward Points</strong></li>
                  <li>Donation added to history</li>
                  <li>Eligibility status updated (next donation after 56 days)</li>
                  <li>Badges earned (if milestones reached)</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Recording...' : '✓ Record Donation & Award Points'}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordDonation;

