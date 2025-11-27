# API Integrations Guide

## Overview
The Blood Bank Application now supports real-time notifications via SMS, Email, and WhatsApp! This guide explains how to configure and use these integrations.

---

## 🔧 Setup Instructions

### 1. Environment Variables
Add an encryption key to your `.env` file for secure credential storage:

```env
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

Generate a random 32-character key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').slice(0, 32))"
```

### 2. Access Admin Panel
1. Login as an admin user
2. Navigate to **Admin Panel** → **API Integrations**
3. Configure your desired services

---

## 📱 SMS Configuration

### Option 1: Twilio
1. Sign up at [https://www.twilio.com](https://www.twilio.com)
2. Get your credentials:
   - Account SID
   - Auth Token
   - Phone Number
3. Enter credentials in SMS API tab
4. Test the connection

### Option 2: MSG91
1. Sign up at [https://msg91.com](https://msg91.com)
2. Get your credentials:
   - Auth Key
   - Sender ID
3. Enter credentials in SMS API tab
4. Test the connection

**Use Cases:**
- Blood request notifications
- Appointment reminders
- Verification OTPs
- Urgent alerts

---

## 📧 Email Configuration

### Option 1: SMTP / Gmail
1. Use your email provider's SMTP settings:
   - Host: `smtp.gmail.com` (for Gmail)
   - Port: `587` (TLS) or `465` (SSL)
   - Username: Your email
   - Password: App-specific password (for Gmail)

2. For Gmail:
   - Enable 2FA
   - Generate App Password at [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

### Option 2: SendGrid
1. Sign up at [https://sendgrid.com](https://sendgrid.com)
2. Generate API Key
3. Enter in Email Server tab

**Use Cases:**
- Welcome emails
- Donation receipts
- Monthly reports
- Password resets

---

## 💬 WhatsApp Configuration

### Option 1: Twilio WhatsApp
1. Request WhatsApp access in Twilio Console
2. Get credentials:
   - Account SID
   - Auth Token
   - WhatsApp Number (format: `whatsapp:+1234567890`)
3. Configure in WhatsApp API tab

### Option 2: WhatsApp Business API (WABA)
1. Apply for WABA access via Facebook Business
2. Get credentials:
   - Phone Number ID
   - Access Token
3. Configure in WhatsApp API tab

**Use Cases:**
- Instant blood requests
- Rich media messages
- Two-way communication
- Emergency alerts

---

## 🚀 Using the Notification Service

### Basic Usage

```javascript
const notificationService = require('./services/notificationService');

// Send to single user
await notificationService.sendNotification(
  userId,
  {
    title: 'Blood Request',
    message: 'Urgent: O+ blood needed',
    type: 'blood-request',
    priority: 'critical'
  },
  ['in-app', 'sms', 'email']
);
```

### Send Blood Request Notification
```javascript
await notificationService.sendBloodRequestNotification(
  {
    bloodType: 'O+',
    unitsRequired: 2,
    hospitalName: 'City Hospital',
    priority: 'emergency'
  },
  ['in-app', 'sms', 'whatsapp']
);
```

### Send Broadcast
```javascript
await notificationService.sendBroadcast(
  {
    title: 'Donation Camp',
    message: 'Join us at Community Center',
    type: 'announcement'
  },
  ['donor'],
  ['in-app', 'email']
);
```

### Send Appointment Reminder
```javascript
await notificationService.sendAppointmentReminder(
  userId,
  {
    date: '2024-02-15',
    time: '10:00 AM',
    location: 'Blood Bank Center'
  },
  ['in-app', 'sms', 'email']
);
```

### Send Donation Confirmation
```javascript
await notificationService.sendDonationConfirmation(
  userId,
  {
    bloodType: 'A+',
    nextEligibleDate: '2024-05-15'
  },
  ['in-app', 'email', 'sms']
);
```

### Send Low Inventory Alert
```javascript
await notificationService.sendLowInventoryAlert(
  'O-',
  bloodBankId,
  ['in-app', 'email']
);
```

---

## 📊 API Endpoints

### Get Configurations
```http
GET /api/admin/integrations
Authorization: Bearer <token>
```

### Update SMS Config
```http
POST /api/admin/integrations/sms
Authorization: Bearer <token>
Content-Type: application/json

{
  "enabled": true,
  "provider": "twilio",
  "twilioAccountSid": "AC...",
  "twilioAuthToken": "...",
  "twilioPhoneNumber": "+1234567890"
}
```

### Update Email Config
```http
POST /api/admin/integrations/email
Authorization: Bearer <token>
Content-Type: application/json

{
  "enabled": true,
  "provider": "smtp",
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "smtpUser": "your-email@gmail.com",
  "smtpPassword": "app-password",
  "fromEmail": "notifications@bloodbank.com",
  "fromName": "Blood Bank Network"
}
```

### Update WhatsApp Config
```http
POST /api/admin/integrations/whatsapp
Authorization: Bearer <token>
Content-Type: application/json

{
  "enabled": true,
  "provider": "twilio",
  "twilioAccountSid": "AC...",
  "twilioAuthToken": "...",
  "twilioWhatsAppNumber": "whatsapp:+1234567890"
}
```

### Test Connection
```http
POST /api/admin/integrations/test/sms
POST /api/admin/integrations/test/email
POST /api/admin/integrations/test/whatsapp
Authorization: Bearer <token>
Content-Type: application/json

{
  // Configuration to test
}
```

---

## 🔒 Security Features

1. **Encryption**: All sensitive credentials (auth tokens, passwords, API keys) are encrypted using AES-256-CBC before storage
2. **Admin Only**: API configuration endpoints are protected by admin authentication
3. **Masked Display**: Sensitive data is partially masked in API responses
4. **Secure Headers**: All API requests require authentication tokens

---

## 🐛 Troubleshooting

### SMS Issues
- **Twilio**: Verify Account SID and Auth Token are correct
- **MSG91**: Ensure Sender ID is approved for your region
- **Format**: Phone numbers should include country code (e.g., +1234567890)

### Email Issues
- **Gmail**: Use App Password, not regular password
- **SMTP**: Check port (587 for TLS, 465 for SSL)
- **SendGrid**: Verify API key has send permissions

### WhatsApp Issues
- **Twilio**: WhatsApp number must be in format `whatsapp:+1234567890`
- **WABA**: Ensure Business verification is complete
- **Templates**: Some regions require pre-approved message templates

---

## 📝 Testing

1. **Test Connection**: Use the "Test Connection" button in Admin Panel
2. **Send Test Message**: After saving config, send a test message to verify
3. **Monitor Logs**: Check backend console for error messages
4. **Check Status**: Review notification delivery status in admin dashboard

---

## 💡 Best Practices

1. **Multi-Channel**: Use multiple channels for critical notifications
2. **Fallback**: If SMS fails, system will still create in-app notification
3. **Rate Limiting**: Implement delays for bulk messages to avoid rate limits
4. **Opt-out**: Respect user preferences for notification channels
5. **Cost Management**: Monitor API usage to control costs

---

## 📈 Features

✅ **Real-time notifications** via SMS, Email, and WhatsApp
✅ **Encrypted credential storage** with AES-256
✅ **Multiple provider support** (Twilio, MSG91, SendGrid, SMTP, WABA)
✅ **Test connections** before going live
✅ **Beautiful admin UI** for easy configuration
✅ **Integrated with existing notification system**
✅ **Template-based emails** with customization
✅ **Bulk messaging support** with rate limiting
✅ **Error handling and logging**

---

## 🆘 Support

For issues or questions:
1. Check the backend console logs
2. Verify your API credentials
3. Test with simple messages first
4. Review provider documentation for specific errors

---

**🎉 Congratulations! Your notification system is now fully functional with SMS, Email, and WhatsApp support!**

