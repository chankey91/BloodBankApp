const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/donors
// @desc    Create donor profile
// @access  Private (Donor)
router.post('/', protect, authorize('donor'), async (req, res) => {
  try {
    const donorExists = await Donor.findOne({ user: req.user.id });
    if (donorExists) {
      return res.status(400).json({
        success: false,
        error: 'Donor profile already exists'
      });
    }

    const donor = await Donor.create({
      user: req.user.id,
      ...req.body
    });

    donor.calculateEligibility();
    await donor.save();

    res.status(201).json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/donors/profile
// @desc    Get current donor's profile
// @access  Private (Donor)
router.get('/profile', protect, authorize('donor'), async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id }).populate('user', 'name email phone');
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        error: 'Donor profile not found'
      });
    }

    res.json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/donors/profile
// @desc    Update donor profile
// @access  Private (Donor)
router.put('/profile', protect, authorize('donor'), async (req, res) => {
  try {
    let donor = await Donor.findOne({ user: req.user.id });
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        error: 'Donor profile not found'
      });
    }

    donor = await Donor.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    donor.calculateEligibility();
    await donor.save();

    res.json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/donors/search
// @desc    Search donors by blood type, location, or general query
// @access  Private (BloodBank, Hospital, Admin)
router.get('/search', protect, authorize('bloodbank', 'hospital', 'admin'), async (req, res) => {
  try {
    const { bloodType, latitude, longitude, radius = 10, query } = req.query;

    // If general query is provided (for name, email, phone search)
    if (query) {
      const User = require('../models/User');
      
      // Find users matching the query
      const users = await User.find({
        role: 'donor',
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } }
        ]
      });

      const userIds = users.map(u => u._id);

      // Find donors for these users
      const donors = await Donor.find({
        user: { $in: userIds }
      }).populate('user', 'name email phone');

      return res.json({
        success: true,
        count: donors.length,
        data: donors
      });
    }

    // Original blood type and location search
    let donorQuery = { isEligible: true, 'availability.isAvailable': true };

    if (bloodType) {
      donorQuery.bloodType = bloodType;
    }

    let donors;

    if (latitude && longitude) {
      // Geospatial query
      donors = await Donor.find({
        ...donorQuery,
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
    } else {
      donors = await Donor.find(donorQuery).populate('user', 'name email phone');
    }

    res.json({
      success: true,
      count: donors.length,
      data: donors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/donors/record-donation
// @desc    Record a donation
// @access  Private (Donor, BloodBank)
router.post('/record-donation', protect, async (req, res) => {
  try {
    const { donorId, bloodBankId, component, volume, certificateUrl, requestId } = req.body;

    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({
        success: false,
        error: 'Donor not found'
      });
    }

    // Add to donation history
    donor.donationHistory.push({
      date: new Date(),
      bloodBank: bloodBankId,
      component,
      volume,
      certificateUrl
    });

    donor.lastDonationDate = new Date();
    donor.calculateEligibility();

    // Add reward points
    donor.rewards.points += 10; // 10 points per donation

    // Check for badges
    const donationCount = donor.donationHistory.length;
    if (donationCount === 1) {
      donor.rewards.badges.push({
        name: 'First Donation',
        earnedDate: new Date(),
        icon: '🩸'
      });
    } else if (donationCount === 5) {
      donor.rewards.badges.push({
        name: 'Regular Donor',
        earnedDate: new Date(),
        icon: '⭐'
      });
    } else if (donationCount === 10) {
      donor.rewards.badges.push({
        name: 'Hero Donor',
        earnedDate: new Date(),
        icon: '🏆'
      });
    }

    await donor.save();

    // If this donation is related to a request, update the request fulfillment
    if (requestId) {
      const Request = require('../models/Request');
      const request = await Request.findById(requestId);
      
      if (request) {
        // Add to fulfillments
        request.fulfillments.push({
          donor: donor._id,
          bloodBank: bloodBankId,
          units: 1,
          status: 'collected', // Valid status: 'pledged', 'collected', or 'delivered'
          fulfilledAt: new Date()
        });

        // Increment unitsFulfilled
        request.unitsFulfilled += 1;

        // Update request status
        request.updateFulfillmentStatus();

        await request.save();

        console.log(`✅ Request ${requestId} updated: ${request.unitsFulfilled}/${request.unitsRequired} fulfilled`);
      }
    }

    res.json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/donors/eligible
// @desc    Get all eligible donors
// @access  Private (BloodBank, Hospital, Admin)
router.get('/eligible', protect, authorize('bloodbank', 'hospital', 'admin'), async (req, res) => {
  try {
    const donors = await Donor.find({ isEligible: true })
      .populate('user', 'name email phone');

    res.json({
      success: true,
      count: donors.length,
      data: donors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/donors/:id
// @desc    Get donor by ID
// @access  Private (BloodBank, Hospital, Admin)
router.get('/:id', protect, authorize('bloodbank', 'hospital', 'admin'), async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id).populate('user', 'name email phone');
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        error: 'Donor not found'
      });
    }

    res.json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

