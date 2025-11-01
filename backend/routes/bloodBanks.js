const express = require('express');
const router = express.Router();
const BloodBank = require('../models/BloodBank');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/bloodbanks
// @desc    Create blood bank profile
// @access  Private (BloodBank)
router.post('/', protect, authorize('bloodbank', 'admin'), async (req, res) => {
  try {
    const bloodBankExists = await BloodBank.findOne({ user: req.user.id });
    if (bloodBankExists) {
      return res.status(400).json({
        success: false,
        error: 'Blood bank profile already exists'
      });
    }

    const bloodBank = await BloodBank.create({
      user: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: bloodBank
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/bloodbanks
// @desc    Get all blood banks
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, state, verified } = req.query;
    
    let query = { isActive: true };
    
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (state) query['location.state'] = new RegExp(state, 'i');
    if (verified === 'true') query.verificationStatus = 'verified';

    const bloodBanks = await BloodBank.find(query).populate('user', 'name email phone');

    res.json({
      success: true,
      count: bloodBanks.length,
      data: bloodBanks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/bloodbanks/nearby
// @desc    Get nearby blood banks
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

    const bloodBanks = await BloodBank.find({
      isActive: true,
      verificationStatus: 'verified',
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      }
    }).populate('user', 'name email phone');

    res.json({
      success: true,
      count: bloodBanks.length,
      data: bloodBanks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/bloodbanks/:id
// @desc    Get single blood bank
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id).populate('user', 'name email phone');

    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        error: 'Blood bank not found'
      });
    }

    res.json({
      success: true,
      data: bloodBank
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/bloodbanks/:id
// @desc    Update blood bank
// @access  Private (BloodBank owner, Admin)
router.put('/:id', protect, authorize('bloodbank', 'admin'), async (req, res) => {
  try {
    let bloodBank = await BloodBank.findById(req.params.id);

    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        error: 'Blood bank not found'
      });
    }

    // Check ownership
    if (bloodBank.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this blood bank'
      });
    }

    bloodBank = await BloodBank.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: bloodBank
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/bloodbanks/me/profile
// @desc    Get current blood bank profile
// @access  Private (BloodBank)
router.get('/me/profile', protect, authorize('bloodbank'), async (req, res) => {
  try {
    const bloodBank = await BloodBank.findOne({ user: req.user.id }).populate('user', 'name email phone');
    
    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        error: 'Blood bank profile not found'
      });
    }

    res.json({
      success: true,
      data: bloodBank
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

