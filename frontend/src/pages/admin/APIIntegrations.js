import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './APIIntegrations.css';
import './AdminPageHeader.css';

const APIIntegrations = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sms');
  const [testStatus, setTestStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // SMS Configuration
  const [smsConfig, setSmsConfig] = useState({
    provider: 'twilio',
    enabled: false,
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    msg91AuthKey: '',
    msg91SenderId: ''
  });

  // Email Configuration
  const [emailConfig, setEmailConfig] = useState({
    enabled: false,
    provider: 'smtp',
    smtpHost: '',
    smtpPort: '587',
    smtpSecure: false,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Blood Bank Network'
  });

  // WhatsApp Configuration
  const [whatsappConfig, setWhatsappConfig] = useState({
    enabled: false,
    provider: 'twilio',
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioWhatsAppNumber: '',
    wabaPhoneNumberId: '',
    wabaAccessToken: ''
  });

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/integrations', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        // Update SMS config
        if (response.data.sms) {
          setSmsConfig(prev => ({
            ...prev,
            enabled: response.data.sms.enabled,
            provider: response.data.sms.provider,
            twilioAccountSid: response.data.sms.twilioAccountSid || '',
            twilioPhoneNumber: response.data.sms.twilioPhoneNumber || '',
            msg91SenderId: response.data.sms.msg91SenderId || ''
          }));
        }
        
        // Update Email config
        if (response.data.email) {
          setEmailConfig(prev => ({
            ...prev,
            enabled: response.data.email.enabled,
            provider: response.data.email.provider,
            smtpHost: response.data.email.smtpHost || '',
            smtpPort: response.data.email.smtpPort || 587,
            smtpSecure: response.data.email.smtpSecure || false,
            smtpUser: response.data.email.smtpUser || '',
            fromEmail: response.data.email.fromEmail || '',
            fromName: response.data.email.fromName || 'Blood Bank Network'
          }));
        }
        
        // Update WhatsApp config
        if (response.data.whatsapp) {
          setWhatsappConfig(prev => ({
            ...prev,
            enabled: response.data.whatsapp.enabled,
            provider: response.data.whatsapp.provider,
            twilioAccountSid: response.data.whatsapp.twilioAccountSid || '',
            twilioWhatsAppNumber: response.data.whatsapp.twilioWhatsAppNumber || '',
            wabaPhoneNumberId: response.data.whatsapp.wabaPhoneNumberId || ''
          }));
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Fetch configurations error:', error);
      toast.error('Failed to fetch configurations');
      setLoading(false);
    }
  };

  const handleSaveSMS = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/integrations/sms', smsConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('SMS settings saved successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Save SMS config error:', error);
      toast.error(error.response?.data?.message || 'Failed to save SMS settings');
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/integrations/email', emailConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Email settings saved successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Save email config error:', error);
      toast.error(error.response?.data?.message || 'Failed to save email settings');
      setSaving(false);
    }
  };

  const handleSaveWhatsApp = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/integrations/whatsapp', whatsappConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('WhatsApp settings saved successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Save WhatsApp config error:', error);
      toast.error(error.response?.data?.message || 'Failed to save WhatsApp settings');
      setSaving(false);
    }
  };

  const handleTestConnection = async (type) => {
    setTestStatus('Testing...');
    try {
      const token = localStorage.getItem('token');
      
      let config;
      if (type === 'sms') config = smsConfig;
      else if (type === 'email') config = emailConfig;
      else if (type === 'whatsapp') config = whatsappConfig;
      
      const response = await axios.post(`/api/admin/integrations/test/${type}`, config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setTestStatus(`✅ ${response.data.message}`);
        toast.success(`${type.toUpperCase()} connection successful!`);
      } else {
        setTestStatus(`❌ Connection failed`);
        toast.error('Connection test failed');
      }
      
      setTimeout(() => setTestStatus(''), 5000);
    } catch (error) {
      console.error(`Test ${type} error:`, error);
      setTestStatus(`❌ ${error.response?.data?.message || 'Connection failed'}`);
      toast.error(error.response?.data?.message || 'Connection test failed');
      setTimeout(() => setTestStatus(''), 5000);
    }
  };

  if (loading) {
    return <div className="loading">Loading integration settings...</div>;
  }

  return (
    <div className="api-integrations">
      <div className="page-header">
        <h1>🔌 Notification API Integrations</h1>
        <p>Configure SMS, Email, and WhatsApp APIs for sending notifications to users</p>
      </div>

      {/* Tabs */}
      <div className="integration-tabs">
        <button 
          className={`tab ${activeTab === 'sms' ? 'active' : ''}`}
          onClick={() => setActiveTab('sms')}
        >
          📱 SMS API
        </button>
        <button 
          className={`tab ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          📧 Email Server
        </button>
        <button 
          className={`tab ${activeTab === 'whatsapp' ? 'active' : ''}`}
          onClick={() => setActiveTab('whatsapp')}
        >
          💬 WhatsApp API
        </button>
      </div>

      {/* SMS Configuration */}
      {activeTab === 'sms' && (
        <div className="config-panel">
          <div className="panel-header">
            <h2>📱 SMS API Configuration</h2>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={smsConfig.enabled}
                onChange={(e) => setSmsConfig({ ...smsConfig, enabled: e.target.checked })}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">{smsConfig.enabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          <div className="config-form">
            <div className="form-group">
              <label>SMS Provider</label>
              <select
                value={smsConfig.provider}
                onChange={(e) => setSmsConfig({ ...smsConfig, provider: e.target.value })}
              >
                <option value="twilio">Twilio</option>
                <option value="msg91">MSG91</option>
              </select>
            </div>

            {smsConfig.provider === 'twilio' && (
              <>
                <div className="form-group">
                  <label>Twilio Account SID</label>
                  <input
                    type="text"
                    value={smsConfig.twilioAccountSid}
                    onChange={(e) => setSmsConfig({ ...smsConfig, twilioAccountSid: e.target.value })}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>

                <div className="form-group">
                  <label>Twilio Auth Token</label>
                  <input
                    type="password"
                    value={smsConfig.twilioAuthToken}
                    onChange={(e) => setSmsConfig({ ...smsConfig, twilioAuthToken: e.target.value })}
                    placeholder="Your auth token"
                  />
                </div>

                <div className="form-group">
                  <label>Twilio Phone Number</label>
                  <input
                    type="text"
                    value={smsConfig.twilioPhoneNumber}
                    onChange={(e) => setSmsConfig({ ...smsConfig, twilioPhoneNumber: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
              </>
            )}

            {smsConfig.provider === 'msg91' && (
              <>
                <div className="form-group">
                  <label>MSG91 Auth Key</label>
                  <input
                    type="password"
                    value={smsConfig.msg91AuthKey}
                    onChange={(e) => setSmsConfig({ ...smsConfig, msg91AuthKey: e.target.value })}
                    placeholder="Your MSG91 auth key"
                  />
                </div>

                <div className="form-group">
                  <label>Sender ID</label>
                  <input
                    type="text"
                    value={smsConfig.msg91SenderId}
                    onChange={(e) => setSmsConfig({ ...smsConfig, msg91SenderId: e.target.value })}
                    placeholder="TXTLCL"
                  />
                </div>
              </>
            )}

            <div className="form-actions">
              <button className="btn-primary" onClick={handleSaveSMS} disabled={saving}>
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
              <button className="btn-secondary" onClick={() => handleTestConnection('sms')}>
                Test Connection
              </button>
            </div>

            {testStatus && <div className="test-status">{testStatus}</div>}
          </div>

          <div className="info-box">
            <h3>📋 SMS Use Cases</h3>
            <ul>
              <li>Blood request notifications to donors</li>
              <li>Donation appointment reminders</li>
              <li>Verification OTPs</li>
              <li>Urgent blood shortage alerts</li>
              <li>Donation camp announcements</li>
            </ul>
          </div>
        </div>
      )}

      {/* Email Configuration */}
      {activeTab === 'email' && (
        <div className="config-panel">
          <div className="panel-header">
            <h2>📧 Email Server Configuration</h2>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={emailConfig.enabled}
                onChange={(e) => setEmailConfig({ ...emailConfig, enabled: e.target.checked })}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">{emailConfig.enabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          <div className="config-form">
            <div className="form-group">
              <label>Email Provider</label>
              <select
                value={emailConfig.provider}
                onChange={(e) => setEmailConfig({ ...emailConfig, provider: e.target.value })}
              >
                <option value="smtp">SMTP Server</option>
                <option value="gmail">Gmail</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>SMTP Host</label>
                <input
                  type="text"
                  value={emailConfig.smtpHost}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="form-group">
                <label>SMTP Port</label>
                <input
                  type="text"
                  value={emailConfig.smtpPort}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                  placeholder="587"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={emailConfig.smtpSecure}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtpSecure: e.target.checked })}
                />
                Use TLS/SSL
              </label>
            </div>

            <div className="form-group">
              <label>SMTP Username</label>
              <input
                type="text"
                value={emailConfig.smtpUser}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                placeholder="your-email@example.com"
              />
            </div>

            <div className="form-group">
              <label>SMTP Password</label>
              <input
                type="password"
                value={emailConfig.smtpPassword}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                placeholder="Your password or app password"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>From Email</label>
                <input
                  type="email"
                  value={emailConfig.fromEmail}
                  onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                  placeholder="noreply@bloodbank.com"
                />
              </div>

              <div className="form-group">
                <label>From Name</label>
                <input
                  type="text"
                  value={emailConfig.fromName}
                  onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                  placeholder="Blood Bank Network"
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-primary" onClick={handleSaveEmail} disabled={saving}>
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
              <button className="btn-secondary" onClick={() => handleTestConnection('email')}>
                Test Connection
              </button>
            </div>

            {testStatus && <div className="test-status">{testStatus}</div>}
          </div>

          <div className="info-box">
            <h3>📋 Email Use Cases</h3>
            <ul>
              <li>Welcome emails to new users</li>
              <li>Detailed donation receipts</li>
              <li>Blood request notifications</li>
              <li>Monthly reports and newsletters</li>
              <li>Account verification emails</li>
              <li>Password reset emails</li>
            </ul>
          </div>
        </div>
      )}

      {/* WhatsApp Configuration */}
      {activeTab === 'whatsapp' && (
        <div className="config-panel">
          <div className="panel-header">
            <h2>💬 WhatsApp API Configuration</h2>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={whatsappConfig.enabled}
                onChange={(e) => setWhatsappConfig({ ...whatsappConfig, enabled: e.target.checked })}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">{whatsappConfig.enabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          <div className="config-form">
            <div className="form-group">
              <label>WhatsApp Provider</label>
              <select
                value={whatsappConfig.provider}
                onChange={(e) => setWhatsappConfig({ ...whatsappConfig, provider: e.target.value })}
              >
                <option value="twilio">Twilio WhatsApp</option>
                <option value="waba">WhatsApp Business API</option>
              </select>
            </div>

            {whatsappConfig.provider === 'twilio' && (
              <>
                <div className="form-group">
                  <label>Twilio Account SID</label>
                  <input
                    type="text"
                    value={whatsappConfig.twilioAccountSid}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, twilioAccountSid: e.target.value })}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>

                <div className="form-group">
                  <label>Twilio Auth Token</label>
                  <input
                    type="password"
                    value={whatsappConfig.twilioAuthToken}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, twilioAuthToken: e.target.value })}
                    placeholder="Your auth token"
                  />
                </div>

                <div className="form-group">
                  <label>Twilio WhatsApp Number</label>
                  <input
                    type="text"
                    value={whatsappConfig.twilioWhatsAppNumber}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, twilioWhatsAppNumber: e.target.value })}
                    placeholder="whatsapp:+14155238886"
                  />
                </div>
              </>
            )}

            {whatsappConfig.provider === 'waba' && (
              <>
                <div className="form-group">
                  <label>Phone Number ID</label>
                  <input
                    type="text"
                    value={whatsappConfig.wabaPhoneNumberId}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, wabaPhoneNumberId: e.target.value })}
                    placeholder="Your phone number ID"
                  />
                </div>

                <div className="form-group">
                  <label>Access Token</label>
                  <input
                    type="password"
                    value={whatsappConfig.wabaAccessToken}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, wabaAccessToken: e.target.value })}
                    placeholder="Your WhatsApp Business API token"
                  />
                </div>
              </>
            )}

            <div className="form-actions">
              <button className="btn-primary" onClick={handleSaveWhatsApp} disabled={saving}>
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
              <button className="btn-secondary" onClick={() => handleTestConnection('whatsapp')}>
                Test Connection
              </button>
            </div>

            {testStatus && <div className="test-status">{testStatus}</div>}
          </div>

          <div className="info-box">
            <h3>📋 WhatsApp Use Cases</h3>
            <ul>
              <li>Instant blood request notifications</li>
              <li>Donation appointment reminders with location</li>
              <li>Rich media messages with images and documents</li>
              <li>Emergency blood shortage alerts</li>
              <li>Two-way communication with donors</li>
              <li>Automated responses to common queries</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIIntegrations;
