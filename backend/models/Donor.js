const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bloodType: {
    type: String,
    required: [true, 'Please specify blood type'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please provide date of birth']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  weight: {
    type: Number,
    required: [true, 'Please provide weight in kg'],
    min: 45 // Minimum weight requirement for donation
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  eligibleToDonateSince: {
    type: Date,
    default: Date.now
  },
  isEligible: {
    type: Boolean,
    default: true
  },
  healthConditions: [{
    condition: String,
    diagnosedDate: Date,
    notes: String
  }],
  medications: [{
    name: String,
    dosage: String,
    startDate: Date
  }],
  donationHistory: [{
    date: Date,
    bloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank'
    },
    component: {
      type: String,
      enum: ['whole blood', 'plasma', 'platelets', 'red blood cells']
    },
    volume: Number,
    certificateUrl: String
  }],
  testResults: [{
    testDate: Date,
    testType: String,
    result: String,
    validUntil: Date
  }],
  rewards: {
    points: {
      type: Number,
      default: 0
    },
    badges: [{
      name: String,
      earnedDate: Date,
      icon: String
    }],
    certificates: [{
      title: String,
      issuedDate: Date,
      url: String
    }]
  },
  notificationPreferences: {
    urgentRequests: {
      type: Boolean,
      default: true
    },
    nearbyDonationCamps: {
      type: Boolean,
      default: true
    },
    eligibilityReminders: {
      type: Boolean,
      default: true
    },
    radius: {
      type: Number,
      default: 10 // km
    }
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    nextAvailableDate: Date
  }
}, {
  timestamps: true
});

// Calculate eligibility based on last donation
donorSchema.methods.calculateEligibility = function() {
  if (!this.lastDonationDate) {
    this.isEligible = true;
    this.eligibleToDonateSince = Date.now();
    return true;
  }
  
  const daysSinceLastDonation = (Date.now() - this.lastDonationDate) / (1000 * 60 * 60 * 24);
  const minDaysBetweenDonations = 56; // 8 weeks for whole blood
  
  if (daysSinceLastDonation >= minDaysBetweenDonations) {
    this.isEligible = true;
    this.eligibleToDonateSince = Date.now();
  } else {
    this.isEligible = false;
    const nextEligibleDate = new Date(this.lastDonationDate);
    nextEligibleDate.setDate(nextEligibleDate.getDate() + minDaysBetweenDonations);
    this.eligibleToDonateSince = nextEligibleDate;
  }
  
  return this.isEligible;
};

// Index for geospatial queries
donorSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Donor', donorSchema);

