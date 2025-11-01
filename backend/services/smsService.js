const twilio = require('twilio');
const axios = require('axios');
const APIConfiguration = require('../models/APIConfiguration');

class SMSService {
  constructor() {
    this.config = null;
  }

  // Load configuration from database
  async loadConfig() {
    const apiConfig = await APIConfiguration.getConfiguration();
    this.config = apiConfig.getDecrypted().sms;
    return this.config;
  }

  // Send SMS via Twilio
  async sendViaTwilio(to, message) {
    if (!this.config) await this.loadConfig();
    
    const { twilioAccountSid, twilioAuthToken, twilioPhoneNumber } = this.config;
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio configuration is incomplete');
    }

    const client = twilio(twilioAccountSid, twilioAuthToken);
    
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    return {
      success: true,
      messageId: result.sid,
      status: result.status
    };
  }

  // Send SMS via MSG91
  async sendViaMSG91(to, message) {
    if (!this.config) await this.loadConfig();
    
    const { msg91AuthKey, msg91SenderId } = this.config;
    
    if (!msg91AuthKey || !msg91SenderId) {
      throw new Error('MSG91 configuration is incomplete');
    }

    const response = await axios.post('https://api.msg91.com/api/v5/flow/', {
      sender: msg91SenderId,
      route: '4',
      country: '91',
      sms: [{
        message: message,
        to: [to.replace('+', '')]
      }]
    }, {
      headers: {
        'authkey': msg91AuthKey,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      messageId: response.data.request_id,
      status: response.data.type
    };
  }

  // Main send method
  async sendSMS(to, message) {
    try {
      if (!this.config) await this.loadConfig();

      if (!this.config.enabled) {
        console.log('SMS service is disabled');
        return { success: false, message: 'SMS service is disabled' };
      }

      let result;
      if (this.config.provider === 'twilio') {
        result = await this.sendViaTwilio(to, message);
      } else if (this.config.provider === 'msg91') {
        result = await this.sendViaMSG91(to, message);
      } else {
        throw new Error('Invalid SMS provider');
      }

      console.log(`SMS sent successfully to ${to} via ${this.config.provider}`);
      return result;
    } catch (error) {
      console.error('SMS send error:', error.message);
      throw error;
    }
  }

  // Test connection
  async testConnection() {
    try {
      if (!this.config) await this.loadConfig();

      if (this.config.provider === 'twilio') {
        const { twilioAccountSid, twilioAuthToken } = this.config;
        const client = twilio(twilioAccountSid, twilioAuthToken);
        await client.api.accounts(twilioAccountSid).fetch();
        return { success: true, message: 'Twilio connection successful' };
      } else if (this.config.provider === 'msg91') {
        // MSG91 doesn't have a direct test endpoint, so we'll just validate credentials exist
        const { msg91AuthKey, msg91SenderId } = this.config;
        if (msg91AuthKey && msg91SenderId) {
          return { success: true, message: 'MSG91 credentials configured' };
        }
        throw new Error('MSG91 credentials missing');
      }
    } catch (error) {
      throw new Error(`SMS test failed: ${error.message}`);
    }
  }

  // Send bulk SMS
  async sendBulkSMS(recipients, message) {
    const results = [];
    for (const recipient of recipients) {
      try {
        const result = await this.sendSMS(recipient, message);
        results.push({ recipient, success: true, result });
      } catch (error) {
        results.push({ recipient, success: false, error: error.message });
      }
    }
    return results;
  }
}

module.exports = new SMSService();

