const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'blood-request',
      'eligibility-reminder',
      'donation-camp',
      'donation-confirmed',
      'request-fulfilled',
      'low-inventory-alert',
      'reward-earned',
      'system',
      'announcement',
      'admin-alert'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request'
    },
    donationCampId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationCamp'
    },
    bloodBankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank'
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  channels: [{
    type: String,
    enum: ['in-app', 'push', 'email', 'sms']
  }],
  sentStatus: {
    inApp: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

