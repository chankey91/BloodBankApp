const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/hospitals
// @desc    Create hospital profile
// @access  Private (Hospital, Admin)
router.post('/', protect, authorize('hospital', 'admin'), async (req, res) => {
  try {
    const hospitalExists = await Hospital.findOne({ user: req.user.id });
    if (hospitalExists) {
      return res.status(400).json({
        success: false,
        error: 'Hospital profile already exists'
      });
    }

    const hospital = await Hospital.create({
      user: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/hospitals
// @desc    Get all hospitals
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, state, verified } = req.query;
    
    let query = { isActive: true };
    
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (state) query['location.state'] = new RegExp(state, 'i');
    if (verified === 'true') query.verificationStatus = 'verified';

    const hospitals = await Hospital.find(query).populate('user', 'name email phone');

    res.json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/hospitals/nearby
// @desc    Get nearby hospitals
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

    const hospitals = await Hospital.find({
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
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/hospitals/:id
// @desc    Get single hospital
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).populate('user', 'name email phone');

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      data: hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/hospitals/me/profile
// @desc    Get current hospital profile
// @access  Private (Hospital)
router.get('/me/profile', protect, authorize('hospital'), async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ user: req.user.id }).populate('user', 'name email phone');
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital profile not found'
      });
    }

    res.json({
      success: true,
      data: hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/hospitals/:id
// @desc    Update hospital
// @access  Private (Hospital owner, Admin)
router.put('/:id', protect, authorize('hospital', 'admin'), async (req, res) => {
  try {
    let hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    // Check ownership
    if (hospital.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this hospital'
      });
    }

    hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: hospital
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

