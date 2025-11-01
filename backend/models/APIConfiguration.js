const mongoose = require('mongoose');
const crypto = require('crypto');

// Encryption setup
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);
const IV_LENGTH = 16;

// Encryption function
function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decryption function
function decrypt(text) {
  if (!text) return '';
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const apiConfigurationSchema = new mongoose.Schema({
  // SMS Configuration
  sms: {
    enabled: { type: Boolean, default: false },
    provider: { type: String, enum: ['twilio', 'msg91'], default: 'twilio' },
    
    // Twilio credentials (encrypted)
    twilioAccountSid: { type: String, default: '' },
    twilioAuthToken: { type: String, default: '' },
    twilioPhoneNumber: { type: String, default: '' },
    
    // MSG91 credentials (encrypted)
    msg91AuthKey: { type: String, default: '' },
    msg91SenderId: { type: String, default: '' }
  },
  
  // Email Configuration
  email: {
    enabled: { type: Boolean, default: false },
    provider: { type: String, enum: ['smtp', 'gmail', 'sendgrid', 'mailgun'], default: 'smtp' },
    
    // SMTP/Gmail settings
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpSecure: { type: Boolean, default: false },
    smtpUser: { type: String, default: '' },
    smtpPassword: { type: String, default: '' }, // encrypted
    
    // SendGrid/Mailgun
    apiKey: { type: String, default: '' }, // encrypted
    
    // Common settings
    fromEmail: { type: String, default: '' },
    fromName: { type: String, default: 'Blood Bank Network' }
  },
  
  // WhatsApp Configuration
  whatsapp: {
    enabled: { type: Boolean, default: false },
    provider: { type: String, enum: ['twilio', 'waba'], default: 'twilio' },
    
    // Twilio WhatsApp
    twilioAccountSid: { type: String, default: '' },
    twilioAuthToken: { type: String, default: '' },
    twilioWhatsAppNumber: { type: String, default: '' },
    
    // WhatsApp Business API
    wabaPhoneNumberId: { type: String, default: '' },
    wabaAccessToken: { type: String, default: '' } // encrypted
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Encrypt sensitive fields before saving
apiConfigurationSchema.pre('save', function(next) {
  // SMS
  if (this.sms.twilioAuthToken && !this.sms.twilioAuthToken.includes(':')) {
    this.sms.twilioAuthToken = encrypt(this.sms.twilioAuthToken);
  }
  if (this.sms.msg91AuthKey && !this.sms.msg91AuthKey.includes(':')) {
    this.sms.msg91AuthKey = encrypt(this.sms.msg91AuthKey);
  }
  
  // Email
  if (this.email.smtpPassword && !this.email.smtpPassword.includes(':')) {
    this.email.smtpPassword = encrypt(this.email.smtpPassword);
  }
  if (this.email.apiKey && !this.email.apiKey.includes(':')) {
    this.email.apiKey = encrypt(this.email.apiKey);
  }
  
  // WhatsApp
  if (this.whatsapp.twilioAuthToken && !this.whatsapp.twilioAuthToken.includes(':')) {
    this.whatsapp.twilioAuthToken = encrypt(this.whatsapp.twilioAuthToken);
  }
  if (this.whatsapp.wabaAccessToken && !this.whatsapp.wabaAccessToken.includes(':')) {
    this.whatsapp.wabaAccessToken = encrypt(this.whatsapp.wabaAccessToken);
  }
  
  this.lastUpdated = Date.now();
  next();
});

// Method to get decrypted configuration
apiConfigurationSchema.methods.getDecrypted = function() {
  const config = this.toObject();
  
  // Decrypt SMS
  if (config.sms.twilioAuthToken) {
    config.sms.twilioAuthToken = decrypt(config.sms.twilioAuthToken);
  }
  if (config.sms.msg91AuthKey) {
    config.sms.msg91AuthKey = decrypt(config.sms.msg91AuthKey);
  }
  
  // Decrypt Email
  if (config.email.smtpPassword) {
    config.email.smtpPassword = decrypt(config.email.smtpPassword);
  }
  if (config.email.apiKey) {
    config.email.apiKey = decrypt(config.email.apiKey);
  }
  
  // Decrypt WhatsApp
  if (config.whatsapp.twilioAuthToken) {
    config.whatsapp.twilioAuthToken = decrypt(config.whatsapp.twilioAuthToken);
  }
  if (config.whatsapp.wabaAccessToken) {
    config.whatsapp.wabaAccessToken = decrypt(config.whatsapp.wabaAccessToken);
  }
  
  return config;
};

// Static method to get or create configuration
apiConfigurationSchema.statics.getConfiguration = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

module.exports = mongoose.model('APIConfiguration', apiConfigurationSchema);

