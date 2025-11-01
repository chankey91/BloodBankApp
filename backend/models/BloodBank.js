const mongoose = require('mongoose');

const bloodBankSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide blood bank name'],
    trim: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Please provide registration number'],
    unique: true
  },
  type: {
    type: String,
    enum: ['hospital-based', 'standalone', 'mobile-unit'],
    default: 'standalone'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    zipCode: String
  },
  contact: {
    phone: {
      type: String,
      required: true
    },
    alternatePhone: String,
    email: {
      type: String,
      required: true
    },
    emergencyContact: String
  },
  operatingHours: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    wednesday: { open: String, close: String, closed: Boolean },
    thursday: { open: String, close: String, closed: Boolean },
    friday: { open: String, close: String, closed: Boolean },
    saturday: { open: String, close: String, closed: Boolean },
    sunday: { open: String, close: String, closed: Boolean }
  },
  facilities: [{
    type: String,
    enum: [
      'whole-blood-collection',
      'plasma-collection',
      'platelet-collection',
      'blood-testing',
      'blood-storage',
      'mobile-collection-unit',
      'emergency-services'
    ]
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    certificateUrl: String
  }],
  capacity: {
    storage: Number, // in units
    dailyCollectionCapacity: Number
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for geospatial queries
bloodBankSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('BloodBank', bloodBankSchema);

