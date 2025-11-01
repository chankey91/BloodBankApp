const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
const User = require('../models/User');
const Donor = require('../models/Donor');
const BloodBank = require('../models/BloodBank');
const Hospital = require('../models/Hospital');
const Request = require('../models/Request');
const Inventory = require('../models/Inventory');
const DonationCamp = require('../models/DonationCamp');
const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');

// ============================================
// DASHBOARD & OVERVIEW
// ============================================

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard overview with key metrics
// @access  Private (Admin only)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonors,
      eligibleDonors,
      totalBloodBanks,
      totalHospitals,
      totalRequests,
      openRequests,
      criticalRequests,
      totalCamps,
      upcomingCamps,
      recentUsers,
      recentRequests
    ] = await Promise.all([
      User.countDocuments(),
      Donor.countDocuments(),
      Donor.countDocuments({ isEligible: true }),
      BloodBank.countDocuments(),
      Hospital.countDocuments(),
      Request.countDocuments(),
      Request.countDocuments({ status: 'open' }),
      Request.countDocuments({ urgency: 'critical', status: 'open' }),
      DonationCamp.countDocuments(),
      DonationCamp.countDocuments({ status: 'upcoming' }),
      User.find().sort({ createdAt: -1 }).limit(10).select('name email role createdAt'),
      Request.find().sort({ createdAt: -1 }).limit(10).populate('requestedBy.user', 'name email')
    ]);

    // Get user distribution by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get blood type distribution
    const bloodTypeDistribution = await Donor.aggregate([
      { $group: { _id: '$bloodType', count: { $sum: 1 } } }
    ]);

    // Get inventory summary
    const inventorySummary = await Inventory.aggregate([
      { $group: { _id: '$bloodType', totalUnits: { $sum: '$units' } } }
    ]);

    // Get requests by status
    const requestsByStatus = await Request.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalDonors,
        eligibleDonors,
        totalBloodBanks,
        totalHospitals,
        totalRequests,
        openRequests,
        criticalRequests,
        totalCamps,
        upcomingCamps
      },
      distributions: {
        usersByRole,
        bloodTypeDistribution,
        inventorySummary,
        requestsByStatus
      },
      recentActivity: {
        recentUsers,
        recentRequests
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// USER MANAGEMENT
// ============================================

// @route   GET /api/admin/users
// @desc    Get all users with filtering and pagination
// @access  Private (Admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20, isVerified } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user details
// @access  Private (Admin only)
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get role-specific data
    let roleData = null;
    if (user.role === 'donor') {
      roleData = await Donor.findOne({ user: user._id });
    } else if (user.role === 'bloodbank') {
      roleData = await BloodBank.findOne({ user: user._id });
    } else if (user.role === 'hospital') {
      roleData = await Hospital.findOne({ user: user._id });
    }

    res.json({ user, roleData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify user account
// @access  Private (Admin only)
router.put('/users/:id/verify', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send verification success notification via email
    try {
      await notificationService.sendVerificationNotification(
        user._id, 
        ['in-app', 'email']
      );
      console.log(`✅ Sent verification notification to ${user.email}`);
    } catch (notifError) {
      console.error('Verification notification error:', notifError.message);
    }

    res.json({ message: 'User verified successfully', user });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admins from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Delete role-specific data
    if (user.role === 'donor') {
      await Donor.findOneAndDelete({ user: user._id });
    } else if (user.role === 'bloodbank') {
      await BloodBank.findOneAndDelete({ user: user._id });
    } else if (user.role === 'hospital') {
      await Hospital.findOneAndDelete({ user: user._id });
    }

    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role
// @access  Private (Admin only)
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['donor', 'bloodbank', 'hospital', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// BLOOD BANK MANAGEMENT
// ============================================

// @route   GET /api/admin/bloodbanks
// @desc    Get all blood banks with filtering
// @access  Private (Admin only)
router.get('/bloodbanks', adminAuth, async (req, res) => {
  try {
    const { verificationStatus, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const bloodBanks = await BloodBank.find(query)
      .populate('user', 'name email phone isVerified')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await BloodBank.countDocuments(query);

    res.json({
      bloodBanks,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get blood banks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/bloodbanks/:id/verify
// @desc    Verify blood bank
// @access  Private (Admin only)
router.put('/bloodbanks/:id/verify', adminAuth, async (req, res) => {
  try {
    const { verificationStatus, rejectionReason } = req.body;
    
    const bloodBank = await BloodBank.findByIdAndUpdate(
      req.params.id,
      { 
        verificationStatus,
        rejectionReason: verificationStatus === 'rejected' ? rejectionReason : undefined
      },
      { new: true }
    ).populate('user', 'name email');

    if (!bloodBank) {
      return res.status(404).json({ message: 'Blood bank not found' });
    }

    // Also update user verification status
    await User.findByIdAndUpdate(bloodBank.user._id, { isVerified: verificationStatus === 'verified' });

    // Send verification notification
    if (verificationStatus === 'verified') {
      try {
        await notificationService.sendNotification(
          bloodBank.user._id,
          {
            title: '✅ Blood Bank Verified',
            message: `Congratulations! Your blood bank "${bloodBank.name}" has been verified. You can now manage inventory and accept blood requests.`,
            type: 'system',
            priority: 'high'
          },
          ['in-app', 'email']
        );
        console.log(`✅ Sent verification notification to blood bank: ${bloodBank.name}`);
      } catch (notifError) {
        console.error('Blood bank verification notification error:', notifError.message);
      }
    }

    res.json({ message: `Blood bank ${verificationStatus} successfully`, bloodBank });
  } catch (error) {
    console.error('Verify blood bank error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// HOSPITAL MANAGEMENT
// ============================================

// @route   GET /api/admin/hospitals
// @desc    Get all hospitals with filtering
// @access  Private (Admin only)
router.get('/hospitals', adminAuth, async (req, res) => {
  try {
    const { verificationStatus, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const hospitals = await Hospital.find(query)
      .populate('user', 'name email phone isVerified')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Hospital.countDocuments(query);

    res.json({
      hospitals,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/hospitals/:id/verify
// @desc    Verify hospital
// @access  Private (Admin only)
router.put('/hospitals/:id/verify', adminAuth, async (req, res) => {
  try {
    const { verificationStatus, rejectionReason } = req.body;
    
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { 
        verificationStatus,
        rejectionReason: verificationStatus === 'rejected' ? rejectionReason : undefined
      },
      { new: true }
    ).populate('user', 'name email');

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Also update user verification status
    await User.findByIdAndUpdate(hospital.user._id, { isVerified: verificationStatus === 'verified' });

    res.json({ message: `Hospital ${verificationStatus} successfully`, hospital });
  } catch (error) {
    console.error('Verify hospital error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// DONOR MANAGEMENT
// ============================================

// @route   GET /api/admin/donors
// @desc    Get all donors with filtering
// @access  Private (Admin only)
router.get('/donors', adminAuth, async (req, res) => {
  try {
    const { bloodType, isEligible, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (bloodType) query.bloodType = bloodType;
    if (isEligible !== undefined) query.isEligible = isEligible === 'true';
    
    let donors = await Donor.find(query)
      .populate('user', 'name email phone isVerified')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter by search in populated user fields
    if (search) {
      donors = donors.filter(donor => 
        donor.user && (
          donor.user.name.toLowerCase().includes(search.toLowerCase()) ||
          donor.user.email.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    const count = await Donor.countDocuments(query);

    res.json({
      donors,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get donors error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/donors/:id/eligibility
// @desc    Update donor eligibility
// @access  Private (Admin only)
router.put('/donors/:id/eligibility', adminAuth, async (req, res) => {
  try {
    const { isEligible } = req.body;
    
    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { isEligible },
      { new: true }
    ).populate('user', 'name email');

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.json({ message: 'Donor eligibility updated successfully', donor });
  } catch (error) {
    console.error('Update donor eligibility error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// REQUEST MANAGEMENT
// ============================================

// @route   GET /api/admin/requests
// @desc    Get all blood requests with filtering
// @access  Private (Admin only)
router.get('/requests', adminAuth, async (req, res) => {
  try {
    const { status, urgency, bloodType, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (bloodType) query.bloodType = bloodType;

    const requests = await Request.find(query)
      .populate('requestedBy.user', 'name email')
      .populate('requestedBy.organization', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Request.countDocuments(query);

    res.json({
      requests,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/requests/:id/status
// @desc    Update request status
// @access  Private (Admin only)
router.put('/requests/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Request status updated successfully', request });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// DONATION CAMP MANAGEMENT
// ============================================

// @route   GET /api/admin/camps
// @desc    Get all donation camps with filtering
// @access  Private (Admin only)
router.get('/camps', adminAuth, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    const camps = await DonationCamp.find(query)
      .populate('organizer', 'name')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await DonationCamp.countDocuments(query);

    res.json({
      camps,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get camps error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/camps/:id/status
// @desc    Update camp status
// @access  Private (Admin only)
router.put('/camps/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const camp = await DonationCamp.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!camp) {
      return res.status(404).json({ message: 'Camp not found' });
    }

    res.json({ message: 'Camp status updated successfully', camp });
  } catch (error) {
    console.error('Update camp status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// INVENTORY MANAGEMENT
// ============================================

// @route   GET /api/admin/inventory
// @desc    Get system-wide inventory
// @access  Private (Admin only)
router.get('/inventory', adminAuth, async (req, res) => {
  try {
    const { bloodType, status } = req.query;
    
    const query = {};
    if (bloodType) query.bloodType = bloodType;
    if (status) query['units.status'] = status;

    const inventory = await Inventory.find(query)
      .populate('bloodBank', 'name location.city')
      .sort({ bloodType: 1 });

    // Get summary
    const summary = await Inventory.aggregate([
      {
        $group: {
          _id: '$bloodType',
          totalUnits: { $sum: '$units' },
          bloodBankCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get low stock alerts
    const lowStock = await Inventory.find({
      $expr: { $lt: ['$units', '$reorderLevel'] }
    }).populate('bloodBank', 'name location.city');

    res.json({
      inventory,
      summary,
      lowStock
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// NOTIFICATIONS MANAGEMENT
// ============================================

// @route   POST /api/admin/notifications/broadcast
// @desc    Send broadcast notification to all users or specific role
// @access  Private (Admin only)
router.post('/notifications/broadcast', adminAuth, async (req, res) => {
  try {
    const { title, message, priority, targetRole, type } = req.body;
    
    // Get target users
    let query = {};
    if (targetRole) query.role = targetRole;
    
    const users = await User.find(query);

    // Create notifications for all users
    const notifications = users.map(user => ({
      recipient: user._id,
      type: type || 'system',
      title,
      message,
      priority: priority || 'normal',
      channels: ['in-app', 'email']
    }));

    await Notification.insertMany(notifications);

    res.json({ 
      message: `Broadcast sent to ${users.length} users`,
      count: users.length 
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/notifications
// @desc    Get all notifications with filtering
// @access  Private (Admin only)
router.get('/notifications', adminAuth, async (req, res) => {
  try {
    const { type, priority, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const notifications = await Notification.find(query)
      .populate('recipient', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Notification.countDocuments(query);

    res.json({
      notifications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// ANALYTICS & REPORTS
// ============================================

// @route   GET /api/admin/analytics/users
// @desc    Get user analytics
// @access  Private (Admin only)
router.get('/analytics/users', adminAuth, async (req, res) => {
  try {
    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Users by verification status
    const usersByVerification = await User.aggregate([
      { $group: { _id: '$isVerified', count: { $sum: 1 } } }
    ]);

    // User registration trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      usersByRole,
      usersByVerification,
      registrationTrend
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/analytics/donations
// @desc    Get donation analytics
// @access  Private (Admin only)
router.get('/analytics/donations', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Donations by blood type
    const donationsByBloodType = await Donor.aggregate([
      {
        $unwind: '$donationHistory'
      },
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: { 'donationHistory.date': dateFilter } }] : []),
      {
        $group: {
          _id: '$bloodType',
          totalDonations: { $sum: 1 },
          totalUnits: { $sum: '$donationHistory.unitsCollected' }
        }
      }
    ]);

    // Top donors
    const topDonors = await Donor.find()
      .populate('user', 'name email')
      .sort({ 'rewards.totalPoints': -1 })
      .limit(10);

    res.json({
      donationsByBloodType,
      topDonors
    });
  } catch (error) {
    console.error('Donation analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/analytics/requests
// @desc    Get request analytics
// @access  Private (Admin only)
router.get('/analytics/requests', adminAuth, async (req, res) => {
  try {
    // Requests by status
    const requestsByStatus = await Request.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Requests by urgency
    const requestsByUrgency = await Request.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);

    // Requests by blood type
    const requestsByBloodType = await Request.aggregate([
      { $group: { _id: '$bloodType', count: { $sum: 1 } } }
    ]);

    // Average fulfillment time
    const fulfillmentStats = await Request.aggregate([
      { $match: { status: 'fulfilled' } },
      {
        $project: {
          fulfillmentTime: {
            $subtract: ['$updatedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$fulfillmentTime' },
          minTime: { $min: '$fulfillmentTime' },
          maxTime: { $max: '$fulfillmentTime' }
        }
      }
    ]);

    res.json({
      requestsByStatus,
      requestsByUrgency,
      requestsByBloodType,
      fulfillmentStats: fulfillmentStats[0] || {}
    });
  } catch (error) {
    console.error('Request analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// AUDIT LOGS
// ============================================

// @route   GET /api/admin/audit-logs
// @desc    Get system audit logs
// @access  Private (Admin only)
router.get('/audit-logs', adminAuth, async (req, res) => {
  try {
    // This would require an AuditLog model
    // For now, return recent activities from various models
    
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('name email role createdAt');

    const recentRequests = await Request.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('requestedBy.user', 'name');

    const recentCamps = await DonationCamp.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('organizer', 'name');

    res.json({
      recentUsers,
      recentRequests,
      recentCamps
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// SYSTEM SETTINGS
// ============================================

// @route   GET /api/admin/settings
// @desc    Get system settings
// @access  Private (Admin only)
router.get('/settings', adminAuth, async (req, res) => {
  try {
    // Return system configuration
    // This could be stored in a Settings model
    const settings = {
      donationEligibilityDays: 56,
      reorderThreshold: 10,
      emergencyRadius: 10,
      maxSearchRadius: 100,
      pointsPerDonation: 50,
      pointsFirstDonation: 100,
      pointsEmergency: 150
    };

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update system settings
// @access  Private (Admin only)
router.put('/settings', adminAuth, async (req, res) => {
  try {
    const settings = req.body;
    
    // Save settings (implement Settings model for persistence)
    // For now, just return the updated settings
    
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

