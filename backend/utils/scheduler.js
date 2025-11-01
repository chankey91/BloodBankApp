const cron = require('node-cron');
const Donor = require('../models/Donor');
const Notification = require('../models/Notification');
const Inventory = require('../models/Inventory');
const { sendEligibilityReminder } = require('./notifications');

// Run daily at 9 AM to check donor eligibility
exports.checkDonorEligibility = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running donor eligibility check...');

    try {
      const donors = await Donor.find().populate('user');

      for (const donor of donors) {
        const wasEligible = donor.isEligible;
        donor.calculateEligibility();

        // If newly eligible, send reminder
        if (!wasEligible && donor.isEligible) {
          if (donor.notificationPreferences.eligibilityReminders) {
            await sendEligibilityReminder(donor);

            await Notification.create({
              recipient: donor.user._id,
              type: 'eligibility-reminder',
              title: 'You\'re Eligible to Donate!',
              message: 'You can now donate blood again. Find a nearby donation center.',
              priority: 'medium',
              channels: ['in-app', 'email']
            });
          }
        }

        await donor.save();
      }

      console.log('Donor eligibility check completed');
    } catch (error) {
      console.error('Error in donor eligibility check:', error);
    }
  });
};

// Run daily at 10 AM to check for low inventory
exports.checkLowInventory = () => {
  cron.schedule('0 10 * * *', async () => {
    console.log('Running low inventory check...');

    try {
      const inventories = await Inventory.find().populate('bloodBank');

      for (const inventory of inventories) {
        if (inventory.units <= inventory.reorderLevel) {
          await Notification.create({
            recipient: inventory.bloodBank.user,
            type: 'low-inventory-alert',
            title: 'Low Inventory Alert',
            message: `${inventory.bloodType} ${inventory.component} is running low (${inventory.units} units remaining)`,
            data: {
              bloodBankId: inventory.bloodBank._id
            },
            priority: 'high',
            channels: ['in-app', 'email']
          });
        }
      }

      console.log('Low inventory check completed');
    } catch (error) {
      console.error('Error in low inventory check:', error);
    }
  });
};

// Run daily to check for expiring blood units
exports.checkExpiringUnits = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running expiring units check...');

    try {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const inventories = await Inventory.find().populate('bloodBank');

      for (const inventory of inventories) {
        const expiringUnits = inventory.unit.filter(
          u => u.status === 'available' && u.expiryDate <= sevenDaysFromNow
        );

        if (expiringUnits.length > 0) {
          await Notification.create({
            recipient: inventory.bloodBank.user,
            type: 'system',
            title: 'Units Expiring Soon',
            message: `${expiringUnits.length} units of ${inventory.bloodType} ${inventory.component} expiring within 7 days`,
            data: {
              bloodBankId: inventory.bloodBank._id
            },
            priority: 'high',
            channels: ['in-app', 'email']
          });
        }
      }

      console.log('Expiring units check completed');
    } catch (error) {
      console.error('Error in expiring units check:', error);
    }
  });
};

// Initialize all scheduled tasks
exports.initScheduler = () => {
  console.log('Initializing scheduled tasks...');
  this.checkDonorEligibility();
  this.checkLowInventory();
  this.checkExpiringUnits();
  console.log('Scheduled tasks initialized');
};

