const express = require('express');
const router = express.Router();
const DonationCamp = require('../models/DonationCamp');
const Donor = require('../models/Donor');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// @route   POST /api/donation-camps
// @desc    Create donation camp
// @access  Private (BloodBank, Admin)
router.post('/', protect, authorize('bloodbank', 'admin'), async (req, res) => {
  try {
    const donationCamp = await DonationCamp.create({
      organizer: req.body.organizerId,
      ...req.body
    });

    // Notify donors about new camp using notification service
    if (req.body.notifyDonors) {
      try {
        await notificationService.sendDonationCampNotification({
          name: req.body.name,
          location: req.body.location.address || req.body.location.city,
          date: new Date(req.body.startDate).toLocaleDateString()
        }, ['in-app', 'email']); // Email notifications for donation camps
        
        console.log(`✅ Sent donation camp notifications for: ${req.body.name}`);
      } catch (notifError) {
        console.error('Donation camp notification error:', notifError.message);
        // Don't fail camp creation if notification fails
      }
    }

    res.status(201).json({
      success: true,
      data: donationCamp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/donation-camps
// @desc    Get all donation camps
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, city, upcoming } = req.query;

    let query = {};
    if (status) query.status = status;
    if (city) query['location.city'] = new RegExp(city, 'i');

    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
      query.status = 'upcoming';
    }

    const camps = await DonationCamp.find(query)
      .populate('organizer', 'name contact')
      .lean() // Convert to plain JavaScript objects for better JSON serialization
      .sort({ startDate: 1 });

    res.json({
      success: true,
      count: camps.length,
      data: camps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/donation-camps/nearby
// @desc    Get nearby donation camps
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide latitude and longitude'
      });
    }

    const camps = await DonationCamp.find({
      status: { $in: ['upcoming', 'ongoing'] },
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius) * 1000
        }
      }
    }).populate('organizer', 'name contact');

    res.json({
      success: true,
      count: camps.length,
      data: camps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/donation-camps/:id/register
// @desc    Register for a donation camp
// @access  Private (Donor)
router.post('/:id/register', protect, authorize('donor'), async (req, res) => {
  try {
    const camp = await DonationCamp.findById(req.params.id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        error: 'Donation camp not found'
      });
    }

    const donor = await Donor.findOne({ user: req.user.id });

    if (!donor) {
      return res.status(404).json({
        success: false,
        error: 'Donor profile not found'
      });
    }

    // Check if already registered
    const alreadyRegistered = camp.registeredDonors.some(
      rd => rd.donor.toString() === donor._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        error: 'Already registered for this camp'
      });
    }

    camp.registeredDonors.push({
      donor: donor._id,
      status: 'registered'
    });

    await camp.save();

    // Send confirmation notification
    await Notification.create({
      recipient: req.user.id,
      type: 'donation-camp',
      title: 'Camp Registration Confirmed',
      message: `You've successfully registered for ${camp.name}`,
      data: {
        donationCampId: camp._id
      },
      priority: 'medium',
      channels: ['in-app', 'email']
    });

    res.json({
      success: true,
      data: camp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/donation-camps/:id
// @desc    Get single donation camp
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const camp = await DonationCamp.findById(req.params.id)
      .populate('organizer')
      .populate('registeredDonors.donor');

    if (!camp) {
      return res.status(404).json({
        success: false,
        error: 'Donation camp not found'
      });
    }

    res.json({
      success: true,
      data: camp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/donation-camps/:id
// @desc    Update donation camp
// @access  Private (Organizer, Admin)
router.put('/:id', protect, authorize('bloodbank', 'admin'), async (req, res) => {
  try {
    let camp = await DonationCamp.findById(req.params.id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        error: 'Donation camp not found'
      });
    }

    camp = await DonationCamp.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: camp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

