const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide hospital name'],
    trim: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Please provide registration number'],
    unique: true
  },
  type: {
    type: String,
    enum: ['general', 'specialty', 'teaching', 'trauma-center', 'children'],
    default: 'general'
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
    emergencyPhone: String,
    email: {
      type: String,
      required: true
    }
  },
  capacity: {
    totalBeds: {
      type: Number,
      required: true
    },
    icuBeds: {
      type: Number,
      default: 0
    },
    availableBeds: Number
  },
  departments: [{
    type: String
  }],
  services: [{
    type: String
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    certificateUrl: String
  }],
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
hospitalSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Hospital', hospitalSchema);

