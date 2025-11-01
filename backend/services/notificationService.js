const smsService = require('./smsService');
const emailService = require('./emailService');
const whatsappService = require('./whatsappService');
const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  /**
   * Send notification via multiple channels
   * @param {String|Array} recipients - User ID(s) or phone/email
   * @param {Object} notificationData - { title, message, type, priority }
   * @param {Array} channels - ['in-app', 'sms', 'email', 'whatsapp']
   */
  async sendNotification(recipients, notificationData, channels = ['in-app']) {
    const results = {
      inApp: [],
      sms: [],
      email: [],
      whatsapp: []
    };

    // Ensure recipients is an array
    const recipientArray = Array.isArray(recipients) ? recipients : [recipients];

    for (const recipient of recipientArray) {
      try {
        let user;
        
        // If recipient is a User ID (MongoDB ObjectId format)
        if (typeof recipient === 'string' && recipient.match(/^[0-9a-fA-F]{24}$/)) {
          user = await User.findById(recipient);
        } else {
          // Otherwise treat as direct contact info
          user = { phone: recipient, email: recipient };
        }

        // Send in-app notification
        if (channels.includes('in-app') && user._id) {
          const notification = await Notification.create({
            recipient: user._id,
            type: notificationData.type || 'system',
            title: notificationData.title,
            message: notificationData.message,
            priority: notificationData.priority || 'medium',
            channels: ['in-app']
          });
          results.inApp.push({ success: true, notificationId: notification._id });
        }

        // Send SMS
        if (channels.includes('sms') && user.phone) {
          try {
            const smsResult = await smsService.sendSMS(
              user.phone,
              `${notificationData.title}\n\n${notificationData.message}`
            );
            results.sms.push({ recipient: user.phone, success: true, ...smsResult });
          } catch (error) {
            results.sms.push({ recipient: user.phone, success: false, error: error.message });
          }
        }

        // Send Email
        if (channels.includes('email') && user.email) {
          try {
            const emailResult = await emailService.sendTemplateEmail(
              user.email,
              notificationData.title,
              {
                title: notificationData.title,
                body: `<p>${notificationData.message}</p>`,
                buttonText: notificationData.buttonText,
                buttonUrl: notificationData.buttonUrl
              }
            );
            results.email.push({ recipient: user.email, success: true, ...emailResult });
          } catch (error) {
            results.email.push({ recipient: user.email, success: false, error: error.message });
          }
        }

        // Send WhatsApp
        if (channels.includes('whatsapp') && user.phone) {
          try {
            const whatsappResult = await whatsappService.sendWhatsApp(
              user.phone,
              `*${notificationData.title}*\n\n${notificationData.message}`
            );
            results.whatsapp.push({ recipient: user.phone, success: true, ...whatsappResult });
          } catch (error) {
            results.whatsapp.push({ recipient: user.phone, success: false, error: error.message });
          }
        }

      } catch (error) {
        console.error('Send notification error for recipient:', recipient, error.message);
      }
    }

    return results;
  }

  /**
   * Send broadcast notification to all users of a specific role
   */
  async sendBroadcast(notificationData, targetRoles = ['donor'], channels = ['in-app']) {
    try {
      const users = await User.find({
        role: { $in: targetRoles },
        isActive: true
      }).select('_id phone email');

      const userIds = users.map(u => u._id.toString());
      
      return await this.sendNotification(userIds, notificationData, channels);
    } catch (error) {
      console.error('Send broadcast error:', error);
      throw error;
    }
  }

  /**
   * Send blood request notification
   */
  async sendBloodRequestNotification(requestData, channels = ['in-app', 'sms']) {
    const notificationData = {
      type: 'blood-request',
      title: `🩸 Urgent: ${requestData.bloodType} Blood Needed`,
      message: `${requestData.unitsRequired} units of ${requestData.bloodType} blood urgently required at ${requestData.hospitalName}. Priority: ${requestData.priority}`,
      priority: requestData.priority === 'emergency' ? 'critical' : 'high'
    };

    // Find eligible donors
    const eligibleDonors = await User.find({
      role: 'donor',
      bloodType: requestData.bloodType,
      isActive: true
    }).select('_id');

    return await this.sendNotification(
      eligibleDonors.map(d => d._id.toString()),
      notificationData,
      channels
    );
  }

  /**
   * Send donation appointment reminder
   */
  async sendAppointmentReminder(userId, appointmentData, channels = ['in-app', 'email', 'sms']) {
    const notificationData = {
      type: 'eligibility-reminder',
      title: '📅 Donation Appointment Reminder',
      message: `Reminder: Your blood donation appointment is scheduled for ${appointmentData.date} at ${appointmentData.time}. Location: ${appointmentData.location}`,
      priority: 'medium'
    };

    return await this.sendNotification(userId, notificationData, channels);
  }

  /**
   * Send donation camp notification
   */
  async sendDonationCampNotification(campData, channels = ['in-app', 'email']) {
    const notificationData = {
      type: 'donation-camp',
      title: '🎪 Donation Camp Alert',
      message: `A blood donation camp is being organized at ${campData.location} on ${campData.date}. Join us to save lives!`,
      priority: 'medium'
    };

    const donors = await User.find({ role: 'donor', isActive: true }).select('_id');
    
    return await this.sendNotification(
      donors.map(d => d._id.toString()),
      notificationData,
      channels
    );
  }

  /**
   * Send low inventory alert
   */
  async sendLowInventoryAlert(bloodType, bloodBankId, channels = ['in-app', 'email']) {
    const notificationData = {
      type: 'low-inventory-alert',
      title: `⚠️ Low Stock Alert: ${bloodType}`,
      message: `Critical: ${bloodType} blood stock is running low. Immediate donations needed!`,
      priority: 'critical'
    };

    // Send to admins and the specific blood bank
    const recipients = await User.find({
      $or: [
        { role: 'admin' },
        { _id: bloodBankId }
      ],
      isActive: true
    }).select('_id');

    return await this.sendNotification(
      recipients.map(r => r._id.toString()),
      notificationData,
      channels
    );
  }

  /**
   * Send verification success notification
   */
  async sendVerificationNotification(userId, channels = ['in-app', 'email']) {
    const notificationData = {
      type: 'system',
      title: '✅ Account Verified',
      message: 'Congratulations! Your account has been verified. You can now access all features.',
      priority: 'medium'
    };

    return await this.sendNotification(userId, notificationData, channels);
  }

  /**
   * Send donation confirmation
   */
  async sendDonationConfirmation(userId, donationData, channels = ['in-app', 'email', 'sms']) {
    const notificationData = {
      type: 'donation-confirmed',
      title: '🎉 Thank You for Donating!',
      message: `Your donation of ${donationData.bloodType} blood has been successfully recorded. You've saved lives today! Next eligible donation date: ${donationData.nextEligibleDate}`,
      priority: 'medium'
    };

    return await this.sendNotification(userId, notificationData, channels);
  }
}

module.exports = new NotificationService();

