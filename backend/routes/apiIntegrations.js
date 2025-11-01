const express = require('express');
const router = express.Router();
const APIConfiguration = require('../models/APIConfiguration');
const smsService = require('../services/smsService');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');
const { adminAuth } = require('../middleware/adminAuth');

// Apply admin authentication to all routes
router.use(adminAuth);

// Get all API configurations
router.get('/', async (req, res) => {
  try {
    const config = await APIConfiguration.getConfiguration();
    
    // Return config without sensitive data
    const safeConfig = {
      sms: {
        enabled: config.sms.enabled,
        provider: config.sms.provider,
        twilioAccountSid: config.sms.twilioAccountSid ? '***' + config.sms.twilioAccountSid.slice(-4) : '',
        twilioPhoneNumber: config.sms.twilioPhoneNumber,
        msg91SenderId: config.sms.msg91SenderId,
        hasAuthToken: !!config.sms.twilioAuthToken,
        hasMsg91Key: !!config.sms.msg91AuthKey
      },
      email: {
        enabled: config.email.enabled,
        provider: config.email.provider,
        smtpHost: config.email.smtpHost,
        smtpPort: config.email.smtpPort,
        smtpSecure: config.email.smtpSecure,
        smtpUser: config.email.smtpUser,
        fromEmail: config.email.fromEmail,
        fromName: config.email.fromName,
        hasPassword: !!config.email.smtpPassword,
        hasApiKey: !!config.email.apiKey
      },
      whatsapp: {
        enabled: config.whatsapp.enabled,
        provider: config.whatsapp.provider,
        twilioAccountSid: config.whatsapp.twilioAccountSid ? '***' + config.whatsapp.twilioAccountSid.slice(-4) : '',
        twilioWhatsAppNumber: config.whatsapp.twilioWhatsAppNumber,
        wabaPhoneNumberId: config.whatsapp.wabaPhoneNumberId,
        hasTwilioToken: !!config.whatsapp.twilioAuthToken,
        hasWabaToken: !!config.whatsapp.wabaAccessToken
      },
      lastUpdated: config.lastUpdated
    };

    res.json(safeConfig);
  } catch (error) {
    console.error('Get API config error:', error);
    res.status(500).json({ message: 'Failed to fetch API configurations', error: error.message });
  }
});

// Update SMS configuration
router.post('/sms', async (req, res) => {
  try {
    const config = await APIConfiguration.getConfiguration();
    
    // Update SMS configuration
    config.sms = {
      ...config.sms,
      ...req.body
    };
    
    config.updatedBy = req.user._id;
    await config.save();

    // Reload SMS service config
    await smsService.loadConfig();

    res.json({ 
      message: 'SMS configuration updated successfully',
      config: {
        enabled: config.sms.enabled,
        provider: config.sms.provider
      }
    });
  } catch (error) {
    console.error('Update SMS config error:', error);
    res.status(500).json({ message: 'Failed to update SMS configuration', error: error.message });
  }
});

// Update Email configuration
router.post('/email', async (req, res) => {
  try {
    const config = await APIConfiguration.getConfiguration();
    
    // Update Email configuration
    config.email = {
      ...config.email,
      ...req.body
    };
    
    config.updatedBy = req.user._id;
    await config.save();

    // Reload email service config
    await emailService.loadConfig();

    res.json({ 
      message: 'Email configuration updated successfully',
      config: {
        enabled: config.email.enabled,
        provider: config.email.provider
      }
    });
  } catch (error) {
    console.error('Update email config error:', error);
    res.status(500).json({ message: 'Failed to update email configuration', error: error.message });
  }
});

// Update WhatsApp configuration
router.post('/whatsapp', async (req, res) => {
  try {
    const config = await APIConfiguration.getConfiguration();
    
    // Update WhatsApp configuration
    config.whatsapp = {
      ...config.whatsapp,
      ...req.body
    };
    
    config.updatedBy = req.user._id;
    await config.save();

    // Reload WhatsApp service config
    await whatsappService.loadConfig();

    res.json({ 
      message: 'WhatsApp configuration updated successfully',
      config: {
        enabled: config.whatsapp.enabled,
        provider: config.whatsapp.provider
      }
    });
  } catch (error) {
    console.error('Update WhatsApp config error:', error);
    res.status(500).json({ message: 'Failed to update WhatsApp configuration', error: error.message });
  }
});

// Test SMS connection
router.post('/test/sms', async (req, res) => {
  try {
    // Temporarily update config for testing without saving
    if (req.body) {
      smsService.config = req.body;
    }

    const result = await smsService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('Test SMS error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Test Email connection
router.post('/test/email', async (req, res) => {
  try {
    // Temporarily update config for testing without saving
    if (req.body) {
      emailService.config = req.body;
    }

    const result = await emailService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Test WhatsApp connection
router.post('/test/whatsapp', async (req, res) => {
  try {
    // Temporarily update config for testing without saving
    if (req.body) {
      whatsappService.config = req.body;
    }

    const result = await whatsappService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('Test WhatsApp error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Send test SMS
router.post('/test/sms/send', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ message: 'Phone number and message are required' });
    }

    const result = await smsService.sendSMS(phoneNumber, message);
    res.json({ 
      success: true, 
      message: 'Test SMS sent successfully',
      result 
    });
  } catch (error) {
    console.error('Send test SMS error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Send test Email
router.post('/test/email/send', async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    
    if (!email || !subject || !message) {
      return res.status(400).json({ message: 'Email, subject and message are required' });
    }

    const html = emailService.generateEmailTemplate({
      title: subject,
      body: `<p>${message}</p>`
    });

    const result = await emailService.sendEmail(email, subject, html);
    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      result 
    });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Send test WhatsApp
router.post('/test/whatsapp/send', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ message: 'Phone number and message are required' });
    }

    const result = await whatsappService.sendWhatsApp(phoneNumber, message);
    res.json({ 
      success: true, 
      message: 'Test WhatsApp sent successfully',
      result 
    });
  } catch (error) {
    console.error('Send test WhatsApp error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;

