const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const Request = require('../models/Request');
const Inventory = require('../models/Inventory');
const BloodBank = require('../models/BloodBank');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private (Admin, BloodBank)
router.get('/dashboard', protect, authorize('admin', 'bloodbank'), async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const eligibleDonors = await Donor.countDocuments({ isEligible: true });
    const activeRequests = await Request.countDocuments({ 
      status: { $in: ['open', 'partially-fulfilled'] }
    });
    const fulfilledRequests = await Request.countDocuments({ status: 'fulfilled' });

    // Blood type distribution
    const bloodTypeDistribution = await Donor.aggregate([
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Recent donations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDonations = await Donor.aggregate([
      {
        $unwind: '$donationHistory'
      },
      {
        $match: {
          'donationHistory.date': { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$donationHistory.date' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Request trends
    const requestTrends = await Request.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            urgency: '$urgency'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Inventory summary
    const inventorySummary = await Inventory.aggregate([
      {
        $group: {
          _id: {
            bloodType: '$bloodType',
            component: '$component'
          },
          totalUnits: { $sum: '$units' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalDonors,
          eligibleDonors,
          activeRequests,
          fulfilledRequests
        },
        bloodTypeDistribution,
        recentDonations,
        requestTrends,
        inventorySummary
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/analytics/inventory-trends
// @desc    Get inventory trends
// @access  Private (Admin, BloodBank)
router.get('/inventory-trends', protect, authorize('admin', 'bloodbank'), async (req, res) => {
  try {
    const { bloodBankId, days = 30 } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    let matchQuery = { lastUpdated: { $gte: daysAgo } };
    if (bloodBankId) {
      matchQuery.bloodBank = bloodBankId;
    }

    const trends = await Inventory.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$lastUpdated' } },
            bloodType: '$bloodType'
          },
          units: { $sum: '$units' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/analytics/donation-stats
// @desc    Get donation statistics
// @access  Private (Admin)
router.get('/donation-stats', protect, authorize('admin'), async (req, res) => {
  try {
    // Top donors
    const topDonors = await Donor.find()
      .sort({ 'rewards.points': -1 })
      .limit(10)
      .populate('user', 'name email');

    // Component-wise donations
    const componentStats = await Donor.aggregate([
      {
        $unwind: '$donationHistory'
      },
      {
        $group: {
          _id: '$donationHistory.component',
          count: { $sum: 1 },
          totalVolume: { $sum: '$donationHistory.volume' }
        }
      }
    ]);

    // City-wise distribution
    const cityDistribution = await Donor.aggregate([
      {
        $group: {
          _id: '$location.city',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        topDonors,
        componentStats,
        cityDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/analytics/demand-forecast
// @desc    Get blood demand forecast
// @access  Private (Admin, BloodBank)
router.get('/demand-forecast', protect, authorize('admin', 'bloodbank'), async (req, res) => {
  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Historical demand
    const historicalDemand = await Request.aggregate([
      {
        $match: {
          createdAt: { $gte: sixtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            bloodType: '$bloodType',
            week: { $week: '$createdAt' }
          },
          totalUnits: { $sum: '$unitsRequired' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.bloodType',
          avgWeeklyUnits: { $avg: '$totalUnits' },
          avgWeeklyRequests: { $avg: '$count' }
        }
      }
    ]);

    // Simple forecast (average-based)
    const forecast = historicalDemand.map(item => ({
      bloodType: item._id,
      forecastedWeeklyDemand: Math.ceil(item.avgWeeklyUnits),
      confidence: 'medium'
    }));

    res.json({
      success: true,
      data: {
        historicalDemand,
        forecast
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

