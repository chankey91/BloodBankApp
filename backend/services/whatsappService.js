const twilio = require('twilio');
const axios = require('axios');
const APIConfiguration = require('../models/APIConfiguration');

class WhatsAppService {
  constructor() {
    this.config = null;
  }

  // Load configuration from database
  async loadConfig() {
    const apiConfig = await APIConfiguration.getConfiguration();
    this.config = apiConfig.getDecrypted().whatsapp;
    return this.config;
  }

  // Send WhatsApp via Twilio
  async sendViaTwilio(to, message) {
    if (!this.config) await this.loadConfig();
    
    const { twilioAccountSid, twilioAuthToken, twilioWhatsAppNumber } = this.config;
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      throw new Error('Twilio WhatsApp configuration is incomplete');
    }

    const client = twilio(twilioAccountSid, twilioAuthToken);
    
    // Ensure phone numbers have the correct format
    const formattedFrom = twilioWhatsAppNumber.startsWith('whatsapp:') 
      ? twilioWhatsAppNumber 
      : `whatsapp:${twilioWhatsAppNumber}`;
    
    const formattedTo = to.startsWith('whatsapp:')
      ? to
      : `whatsapp:${to}`;
    
    const result = await client.messages.create({
      body: message,
      from: formattedFrom,
      to: formattedTo
    });

    return {
      success: true,
      messageId: result.sid,
      status: result.status
    };
  }

  // Send WhatsApp via WhatsApp Business API (WABA)
  async sendViaWABA(to, message) {
    if (!this.config) await this.loadConfig();
    
    const { wabaPhoneNumberId, wabaAccessToken } = this.config;
    
    if (!wabaPhoneNumberId || !wabaAccessToken) {
      throw new Error('WABA configuration is incomplete');
    }

    // Remove 'whatsapp:' prefix and '+' if present
    const cleanTo = to.replace('whatsapp:', '').replace('+', '');

    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${wabaPhoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: cleanTo,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${wabaAccessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      messageId: response.data.messages[0].id,
      status: 'sent'
    };
  }

  // Main send method
  async sendWhatsApp(to, message) {
    try {
      if (!this.config) await this.loadConfig();

      if (!this.config.enabled) {
        console.log('WhatsApp service is disabled');
        return { success: false, message: 'WhatsApp service is disabled' };
      }

      let result;
      if (this.config.provider === 'twilio') {
        result = await this.sendViaTwilio(to, message);
      } else if (this.config.provider === 'waba') {
        result = await this.sendViaWABA(to, message);
      } else {
        throw new Error('Invalid WhatsApp provider');
      }

      console.log(`WhatsApp sent successfully to ${to} via ${this.config.provider}`);
      return result;
    } catch (error) {
      console.error('WhatsApp send error:', error.message);
      throw error;
    }
  }

  // Send WhatsApp with media (images, documents)
  async sendWhatsAppMedia(to, message, mediaUrl, mediaType = 'image') {
    try {
      if (!this.config) await this.loadConfig();

      if (!this.config.enabled) {
        return { success: false, message: 'WhatsApp service is disabled' };
      }

      if (this.config.provider === 'twilio') {
        const { twilioAccountSid, twilioAuthToken, twilioWhatsAppNumber } = this.config;
        const client = twilio(twilioAccountSid, twilioAuthToken);
        
        const formattedFrom = twilioWhatsAppNumber.startsWith('whatsapp:') 
          ? twilioWhatsAppNumber 
          : `whatsapp:${twilioWhatsAppNumber}`;
        
        const formattedTo = to.startsWith('whatsapp:')
          ? to
          : `whatsapp:${to}`;
        
        const result = await client.messages.create({
          body: message,
          from: formattedFrom,
          to: formattedTo,
          mediaUrl: [mediaUrl]
        });

        return {
          success: true,
          messageId: result.sid,
          status: result.status
        };
      } else if (this.config.provider === 'waba') {
        const { wabaPhoneNumberId, wabaAccessToken } = this.config;
        const cleanTo = to.replace('whatsapp:', '').replace('+', '');

        const response = await axios.post(
          `https://graph.facebook.com/v17.0/${wabaPhoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            to: cleanTo,
            type: mediaType,
            [mediaType]: {
              link: mediaUrl,
              caption: message
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${wabaAccessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        return {
          success: true,
          messageId: response.data.messages[0].id,
          status: 'sent'
        };
      }
    } catch (error) {
      console.error('WhatsApp media send error:', error.message);
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
        return { success: true, message: 'Twilio WhatsApp connection successful' };
      } else if (this.config.provider === 'waba') {
        const { wabaPhoneNumberId, wabaAccessToken } = this.config;
        
        if (!wabaPhoneNumberId || !wabaAccessToken) {
          throw new Error('WABA credentials missing');
        }

        // Test WABA connection by fetching phone number info
        const response = await axios.get(
          `https://graph.facebook.com/v17.0/${wabaPhoneNumberId}`,
          {
            headers: {
              'Authorization': `Bearer ${wabaAccessToken}`
            }
          }
        );

        return { 
          success: true, 
          message: 'WhatsApp Business API connection successful',
          phoneNumber: response.data.display_phone_number
        };
      }
    } catch (error) {
      throw new Error(`WhatsApp test failed: ${error.message}`);
    }
  }

  // Send bulk WhatsApp messages
  async sendBulkWhatsApp(recipients, message) {
    const results = [];
    for (const recipient of recipients) {
      try {
        const result = await this.sendWhatsApp(recipient, message);
        results.push({ recipient, success: true, result });
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({ recipient, success: false, error: error.message });
      }
    }
    return results;
  }
}

module.exports = new WhatsAppService();

