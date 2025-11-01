const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  bloodBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodBank',
    required: true
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  component: {
    type: String,
    required: true,
    enum: ['whole blood', 'plasma', 'platelets', 'red blood cells', 'cryoprecipitate']
  },
  units: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  unit: [{
    bagNumber: {
      type: String,
      required: true,
      unique: true
    },
    collectionDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor'
    },
    volume: {
      type: Number,
      required: true // in ml
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'issued', 'expired', 'discarded'],
      default: 'available'
    },
    testResults: {
      hiv: { type: String, enum: ['negative', 'positive', 'pending'] },
      hepatitisB: { type: String, enum: ['negative', 'positive', 'pending'] },
      hepatitisC: { type: String, enum: ['negative', 'positive', 'pending'] },
      syphilis: { type: String, enum: ['negative', 'positive', 'pending'] },
      malaria: { type: String, enum: ['negative', 'positive', 'pending'] }
    },
    storageLocation: String
  }],
  reorderLevel: {
    type: Number,
    default: 5 // Minimum units before alert
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for faster queries
inventorySchema.index({ bloodBank: 1, bloodType: 1, component: 1 });

// Update lastUpdated on save
inventorySchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  this.units = this.unit.filter(u => u.status === 'available').length;
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);

