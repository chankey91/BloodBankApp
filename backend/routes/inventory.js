const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const BloodBank = require('../models/BloodBank');
const { protect, authorize } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// Low inventory threshold
const LOW_INVENTORY_THRESHOLD = 5;

// @route   POST /api/inventory
// @desc    Add blood inventory
// @access  Private (BloodBank)
router.post('/', protect, authorize('bloodbank', 'admin'), async (req, res) => {
  try {
    const { bloodBankId, bloodType, component, unitData } = req.body;

    let inventory = await Inventory.findOne({ bloodBank: bloodBankId, bloodType, component });

    if (inventory) {
      // Add new unit to existing inventory
      inventory.unit.push(unitData);
      inventory.units = inventory.unit.filter(u => u.status === 'available').length;
    } else {
      // Create new inventory entry
      inventory = await Inventory.create({
        bloodBank: bloodBankId,
        bloodType,
        component,
        unit: [unitData]
      });
    }

    await inventory.save();

    res.status(201).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/inventory/search
// @desc    Search blood inventory
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { bloodType, component, latitude, longitude, radius = 50 } = req.query;

    let query = {};

    if (bloodType) query.bloodType = bloodType;
    if (component) query.component = component;

    // Only show inventory with available units
    query.units = { $gt: 0 };

    let inventories;

    if (latitude && longitude) {
      // First, find nearby blood banks
      const nearbyBloodBanks = await BloodBank.find({
        isActive: true,
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: parseFloat(radius) * 1000
          }
        }
      });

      const bloodBankIds = nearbyBloodBanks.map(bb => bb._id);

      inventories = await Inventory.find({
        ...query,
        bloodBank: { $in: bloodBankIds }
      }).populate('bloodBank', 'name location contact');
    } else {
      inventories = await Inventory.find(query).populate('bloodBank', 'name location contact');
    }

    res.json({
      success: true,
      count: inventories.length,
      data: inventories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/inventory/bloodbank/:bloodBankId
// @desc    Get inventory for a specific blood bank
// @access  Private (BloodBank, Admin)
router.get('/bloodbank/:bloodBankId', protect, authorize('bloodbank', 'admin', 'hospital'), async (req, res) => {
  try {
    const inventories = await Inventory.find({ bloodBank: req.params.bloodBankId })
      .populate('bloodBank', 'name location');

    res.json({
      success: true,
      count: inventories.length,
      data: inventories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/inventory/:id/unit/:bagNumber
// @desc    Update unit status
// @access  Private (BloodBank)
router.put('/:id/unit/:bagNumber', protect, authorize('bloodbank', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const inventory = await Inventory.findById(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory not found'
      });
    }

    const unit = inventory.unit.find(u => u.bagNumber === req.params.bagNumber);
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found'
      });
    }

    unit.status = status;
    inventory.units = inventory.unit.filter(u => u.status === 'available').length;
    await inventory.save();

    // Check for low inventory and send alert
    if (inventory.units <= LOW_INVENTORY_THRESHOLD && inventory.units > 0) {
      try {
        await notificationService.sendLowInventoryAlert(
          `${inventory.bloodType} ${inventory.component}`,
          inventory.bloodBank,
          ['in-app', 'email']
        );
        console.log(`⚠️ Low inventory alert sent for ${inventory.bloodType} ${inventory.component}`);
      } catch (notifError) {
        console.error('Low inventory notification error:', notifError.message);
      }
    }

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/inventory/low-stock
// @desc    Get low stock alerts
// @access  Private (BloodBank, Admin)
router.get('/low-stock', protect, authorize('bloodbank', 'admin'), async (req, res) => {
  try {
    const { bloodBankId } = req.query;

    let query = {};
    if (bloodBankId) {
      query.bloodBank = bloodBankId;
    }

    const inventories = await Inventory.find(query).populate('bloodBank', 'name contact');

    const lowStockItems = inventories.filter(inv => inv.units <= inv.reorderLevel);

    res.json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/inventory/expiring-soon
// @desc    Get units expiring in next 7 days
// @access  Private (BloodBank, Admin)
router.get('/expiring-soon', protect, authorize('bloodbank', 'admin'), async (req, res) => {
  try {
    const { bloodBankId } = req.query;
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    let query = {};
    if (bloodBankId) {
      query.bloodBank = bloodBankId;
    }

    const inventories = await Inventory.find(query).populate('bloodBank', 'name contact');

    const expiringUnits = [];

    inventories.forEach(inv => {
      const expiring = inv.unit.filter(u => 
        u.status === 'available' && 
        u.expiryDate <= sevenDaysFromNow
      );
      
      if (expiring.length > 0) {
        expiringUnits.push({
          bloodBank: inv.bloodBank,
          bloodType: inv.bloodType,
          component: inv.component,
          units: expiring
        });
      }
    });

    res.json({
      success: true,
      count: expiringUnits.length,
      data: expiringUnits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

