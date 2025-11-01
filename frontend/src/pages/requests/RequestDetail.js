import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const RequestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [response, setResponse] = useState({
    response: 'willing',
    message: ''
  });

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await axios.get(`/api/requests/${id}`);
      setRequest(res.data.data);
    } catch (error) {
      toast.error('Failed to load request details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    setResponding(true);

    try {
      await axios.post(`/api/requests/${id}/respond`, response);
      toast.success('Response submitted successfully!');
      fetchRequest(); // Refresh data
      setResponse({ response: 'willing', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit response');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!request) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="card">
          <h2>Request not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Blood Request Details</h1>
          <p className="page-subtitle">Request ID: {request._id}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="grid grid-2">
          {/* Main Request Info */}
          <div className="card">
            <h2 className="card-header">Request Information</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <span className="request-blood-type">{request.bloodType}</span>
              <span className={`badge ${request.urgency === 'critical' ? 'badge-danger' : 'badge-warning'}`} style={{ marginLeft: '1rem' }}>
                {request.urgency}
              </span>
              <span className={`badge ${request.status === 'fulfilled' ? 'badge-success' : 'badge-info'}`} style={{ marginLeft: '0.5rem' }}>
                {request.status}
              </span>
            </div>

            <p><strong>Component:</strong> {request.component}</p>
            <p><strong>Units Required:</strong> {request.unitsRequired}</p>
            <p><strong>Units Fulfilled:</strong> {request.unitsFulfilled}</p>
            <p><strong>Required By:</strong> {format(new Date(request.requiredBy), 'MMM dd, yyyy')}</p>
            <p><strong>Posted On:</strong> {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}</p>
            
            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Location</h3>
            <p><strong>Address:</strong> {request.location?.address}</p>
            <p><strong>City:</strong> {request.location?.city}</p>
            <p><strong>State:</strong> {request.location?.state}</p>

            {request.notes && (
              <>
                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Notes</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{request.notes}</p>
              </>
            )}
          </div>

          {/* Patient Info */}
          <div className="card">
            <h2 className="card-header">Patient Information</h2>
            
            <p><strong>Name:</strong> {request.patient?.name}</p>
            {request.patient?.age && <p><strong>Age:</strong> {request.patient.age}</p>}
            {request.patient?.gender && <p><strong>Gender:</strong> {request.patient.gender}</p>}
            <p><strong>Blood Type:</strong> {request.patient?.bloodType}</p>
            {request.patient?.contact && <p><strong>Contact:</strong> {request.patient.contact}</p>}
            
            {request.patient?.medicalCondition && (
              <>
                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Medical Condition</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{request.patient.medicalCondition}</p>
              </>
            )}

            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Statistics</h3>
            <p><strong>Notifications Sent:</strong> {request.notificationsSent || 0}</p>
            <p><strong>Donors Notified:</strong> {request.donorsNotified?.length || 0}</p>
            <p><strong>Responses Received:</strong> {request.responses?.length || 0}</p>
          </div>
        </div>

        {/* Donor Response Form */}
        {user?.role === 'donor' && request.status === 'open' && (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h2 className="card-header">Respond to Request</h2>
            
            <form onSubmit={handleRespond}>
              <div className="form-group">
                <label className="form-label">Your Response</label>
                <select
                  className="form-select"
                  value={response.response}
                  onChange={(e) => setResponse({ ...response, response: e.target.value })}
                >
                  <option value="willing">I'm willing to donate</option>
                  <option value="not-available">Not available at this time</option>
                  <option value="not-eligible">Not eligible to donate</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message (Optional)</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={response.message}
                  onChange={(e) => setResponse({ ...response, message: e.target.value })}
                  placeholder="Add any additional information..."
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={responding}>
                {responding ? 'Submitting...' : 'Submit Response'}
              </button>
            </form>
          </div>
        )}

        {/* Workflow Status */}
        <div className="card" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
          <h2 className="card-header">📋 Request Workflow Status</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: 'var(--secondary-color)', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>✓</div>
              <div style={{ flex: 1 }}>
                <strong>1. Request Created</strong>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: request.notificationsSent > 0 ? 'var(--secondary-color)' : '#e5e7eb', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {request.notificationsSent > 0 ? '✓' : '2'}
              </div>
              <div style={{ flex: 1 }}>
                <strong>2. Donors Notified</strong>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {request.notificationsSent > 0 ? `${request.notificationsSent} donors notified` : 'Pending notification'}
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: request.responses?.length > 0 ? 'var(--secondary-color)' : '#e5e7eb', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {request.responses?.length > 0 ? '✓' : '3'}
              </div>
              <div style={{ flex: 1 }}>
                <strong>3. Donor Responses Received</strong>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {request.responses?.length > 0 ? `${request.responses.length} responses` : 'Waiting for responses'}
                </div>
              </div>
            </div>

            {/* Step 4 - Contact Donors */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: request.responses?.some(r => r.response === 'willing') ? 'var(--secondary-color)' : '#e5e7eb', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {request.responses?.some(r => r.response === 'willing') ? '✓' : '4'}
              </div>
              <div style={{ flex: 1 }}>
                <strong>4. Contact Willing Donors</strong>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Schedule appointments with willing donors
                </div>
              </div>
            </div>

            {/* Step 5 - Physical Donation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: '#e5e7eb', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>5</div>
              <div style={{ flex: 1 }}>
                <strong>5. Donor Arrives & Donates</strong>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Physical blood donation at facility
                </div>
              </div>
            </div>

            {/* Step 6 - Record Donation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: '#e5e7eb', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>6</div>
              <div style={{ flex: 1 }}>
                <strong>6. Record Donation in System</strong>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Use "Record Donation" to award points
                </div>
              </div>
            </div>

            {/* Step 7 - Add to Inventory */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: '#e5e7eb', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>7</div>
              <div style={{ flex: 1 }}>
                <strong>7. Add Blood to Inventory</strong>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Add collected unit to inventory
                </div>
              </div>
            </div>

            {/* Step 8 - Mark Fulfilled */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: request.status === 'fulfilled' ? 'var(--secondary-color)' : '#e5e7eb', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {request.status === 'fulfilled' ? '✓' : '8'}
              </div>
              <div style={{ flex: 1 }}>
                <strong>8. Request Fulfilled</strong>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {request.unitsFulfilled} / {request.unitsRequired} units fulfilled
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps Instructions - Only for Blood Bank/Hospital */}
        {user?.role !== 'donor' && request.responses?.some(r => r.response === 'willing') && request.status !== 'fulfilled' && (
          <div className="alert alert-success" style={{ marginTop: '1.5rem' }}>
            <strong>📞 Next Steps After Donor Donates:</strong>
            <ol style={{ marginTop: '0.5rem', marginBottom: '1rem', paddingLeft: '1.5rem' }}>
              <li><strong>Contact willing donors</strong> (see responses below) to schedule appointments</li>
              <li><strong>Coordinate blood collection</strong> at your facility</li>
              <li><strong>After physical donation</strong>, record it in the system:
                <ul style={{ marginTop: '0.25rem', marginLeft: '1rem' }}>
                  <li>Go to Inventory → Record Donation, OR</li>
                  <li>Use the "Record Donation" button below for each donor</li>
                </ul>
              </li>
              <li><strong>Add collected blood</strong> to inventory</li>
              <li><strong>Update request status</strong> once fulfilled</li>
            </ol>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <Link to="/inventory/record-donation">
                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  📝 Go to Record Donation
                </button>
              </Link>
              <Link to="/inventory/add">
                <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  📦 Add to Inventory
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Responses */}
        {request.responses && request.responses.length > 0 && (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h2 className="card-header">Donor Responses ({request.responses.length})</h2>
            
            {request.responses.map((resp, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: '1.5rem', 
                  border: `2px solid ${resp.response === 'willing' ? '#10b981' : 'var(--border-color)'}`, 
                  borderRadius: '0.5rem', 
                  marginBottom: '1rem',
                  background: resp.response === 'willing' ? '#f0fdf4' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <strong style={{ fontSize: '1.125rem' }}>
                    {resp.response === 'willing' ? '✓ ' : ''}Donor Response
                  </strong>
                  <span className={`badge ${resp.response === 'willing' ? 'badge-success' : 'badge-warning'}`}>
                    {resp.response}
                  </span>
                </div>
                
                {resp.response === 'willing' && (() => {
                  // Check if this donor has already been recorded in fulfillments
                  const donorId = resp.donor?._id || resp.donor;
                  const alreadyFulfilled = request.fulfillments?.some(f => {
                    const fulfillmentDonorId = f.donor?._id || f.donor;
                    return fulfillmentDonorId?.toString() === donorId?.toString();
                  });

                  return (
                    <div style={{ 
                      background: 'white', 
                      padding: '1rem', 
                      borderRadius: '0.5rem', 
                      marginTop: '1rem',
                      border: alreadyFulfilled ? '1px solid #d1fae5' : '1px solid #d1fae5'
                    }}>
                      {user?.role === 'donor' ? (
                        // For donors - just show thank you message
                        <div>
                          <strong style={{ color: 'var(--secondary-color)' }}>✓ Thank you for your response!</strong>
                          <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.875rem' }}>
                            The hospital/blood bank will contact you to schedule your donation appointment.
                          </p>
                        </div>
                      ) : alreadyFulfilled ? (
                        // For blood bank/hospital - donor already donated
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>✅</span>
                            <strong style={{ color: '#10b981' }}>Donation Recorded!</strong>
                          </div>
                          <p style={{ marginBottom: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            This donor's donation has been recorded in the system. Points awarded and eligibility updated.
                          </p>
                        </div>
                      ) : (
                        // For blood bank/hospital - show action buttons
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <strong style={{ color: 'var(--secondary-color)' }}>📞 Action Required:</strong>
                            <Link 
                              to="/inventory/record-donation" 
                              state={{ 
                                fromRequest: true,
                                requestId: request._id,
                                donorId: resp.donor?._id || resp.donor,
                                donorName: resp.donor?.user?.name || 'Unknown Donor',
                                donorEmail: resp.donor?.user?.email || '',
                                donorPhone: resp.donor?.user?.phone || '',
                                bloodType: request.bloodType,
                                component: request.component
                              }}
                            >
                              <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                📝 Record Donation for This Donor
                              </button>
                            </Link>
                          </div>
                          <ol style={{ marginBottom: 0, paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
                            <li><strong>Contact donor</strong> to schedule appointment</li>
                            <li><strong>After they donate</strong>, click "Record Donation" above</li>
                            <li>This will:
                              <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                                <li>Award +10 points to donor</li>
                                <li>Update their eligibility</li>
                                <li>Add to donation history</li>
                              </ul>
                            </li>
                          </ol>
                          <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                            💡 Tip: Record donation immediately after physical donation to ensure donor receives points!
                          </small>
                        </>
                      )}
                    </div>
                  );
                })()}
                
                {resp.message && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <strong>Message:</strong>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{resp.message}</p>
                  </div>
                )}
                
                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.75rem' }}>
                  Responded on {format(new Date(resp.respondedAt), 'MMM dd, yyyy HH:mm')}
                </small>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={() => navigate('/requests')} 
          className="btn btn-outline"
          style={{ marginTop: '1rem' }}
        >
          ← Back to Requests
        </button>
      </div>
    </div>
  );
};

export default RequestDetail;

