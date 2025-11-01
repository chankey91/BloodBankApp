const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Donor = require('../models/Donor');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { notifyNearbyDonors } = require('../utils/notifications');
const notificationService = require('../services/notificationService');

// @route   POST /api/requests
// @desc    Create blood request
// @access  Private (Hospital, BloodBank)
router.post('/', protect, authorize('hospital', 'bloodbank', 'admin'), async (req, res) => {
  try {
    const request = await Request.create({
      ...req.body,
      'requestedBy.user': req.user.id
    });

    // Get io instance
    const io = req.app.get('io');

    // Notify nearby eligible donors if urgent
    if (request.urgency === 'critical' || request.isEmergency) {
      const donors = await Donor.find({
        bloodType: request.bloodType,
        isEligible: true,
        'availability.isAvailable': true,
        'notificationPreferences.urgentRequests': true,
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: request.location.coordinates
            },
            $maxDistance: 50000 // 50 km
          }
        }
      }).populate('user');

      // Send multi-channel notifications using the notification service
      try {
        const donorUserIds = donors.map(d => d.user._id.toString());
        
        await notificationService.sendBloodRequestNotification({
          bloodType: request.bloodType,
          unitsRequired: request.unitsRequired,
          hospitalName: req.user.name || 'Hospital',
          priority: request.urgency
        }, ['in-app', 'sms']); // SMS for urgent requests
        
        // Emit socket event for real-time updates
        donors.forEach(donor => {
          io.to(donor.user._id.toString()).emit('urgent-request', request);
        });

        request.notificationsSent = donors.length;
        request.donorsNotified = donors.map(d => d._id);
        await request.save();
        
        console.log(`✅ Sent blood request notifications to ${donors.length} eligible donors`);
      } catch (notifError) {
        console.error('Notification error:', notifError.message);
        // Don't fail the request creation if notification fails
      }
    }

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/requests
// @desc    Get all blood requests
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, urgency, bloodType } = req.query;

    let query = {};
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (bloodType) query.bloodType = bloodType;

    const requests = await Request.find(query)
      .populate('requestedBy.user', 'name email phone')
      .populate('requestedBy.organization')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/requests/nearby
// @desc    Get nearby blood requests
// @access  Private (Donor)
router.get('/nearby', protect, authorize('donor'), async (req, res) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide latitude and longitude'
      });
    }

    const requests = await Request.find({
      status: { $in: ['open', 'partially-fulfilled'] },
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius) * 1000
        }
      }
    })
      .populate('requestedBy.user', 'name phone')
      .sort({ urgency: -1, createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/requests/:id
// @desc    Get single request
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requestedBy.user', 'name email phone')
      .populate('requestedBy.organization')
      .populate('fulfillments.donor')
      .populate('fulfillments.bloodBank')
      .populate('responses.donor');

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/requests/:id/respond
// @desc    Respond to blood request
// @access  Private (Donor)
router.post('/:id/respond', protect, authorize('donor'), async (req, res) => {
  try {
    const { response, message } = req.body;
    
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const donor = await Donor.findOne({ user: req.user.id });

    if (!donor) {
      return res.status(404).json({
        success: false,
        error: 'Donor profile not found'
      });
    }

    request.responses.push({
      donor: donor._id,
      respondedAt: new Date(),
      response,
      message
    });

    // Note: Don't update fulfillments here - only when donation is actually recorded
    // Willing response is just an intent, not a completed donation

    await request.save();

    // Notify requester
    await Notification.create({
      recipient: request.requestedBy.user,
      type: 'request-fulfilled',
      title: 'Donor Response',
      message: `A donor has responded to your blood request`,
      data: {
        requestId: request._id
      },
      priority: 'high',
      channels: ['in-app', 'push']
    });

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/requests/:id
// @desc    Update request
// @access  Private (Request owner)
router.put('/:id', protect, async (req, res) => {
  try {
    let request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Check ownership
    if (request.requestedBy.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this request'
      });
    }

    request = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/requests/:id/cancel
// @desc    Cancel request
// @access  Private (Request owner)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    if (request.requestedBy.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this request'
      });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

