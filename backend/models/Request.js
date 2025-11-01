const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requestedBy: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'requestedBy.organizationType'
    },
    organizationType: {
      type: String,
      enum: ['BloodBank', 'Hospital']
    }
  },
  patient: {
    name: {
      type: String,
      required: true
    },
    age: Number,
    gender: String,
    bloodType: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    contact: String,
    medicalCondition: String
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
  unitsRequired: {
    type: Number,
    required: true,
    min: 1
  },
  urgency: {
    type: String,
    enum: ['critical', 'urgent', 'normal'],
    default: 'normal'
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
    state: String
  },
  requiredBy: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'partially-fulfilled', 'fulfilled', 'cancelled', 'expired'],
    default: 'open'
  },
  fulfillments: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor'
    },
    bloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank'
    },
    units: Number,
    fulfilledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pledged', 'collected', 'delivered'],
      default: 'pledged'
    }
  }],
  unitsFulfilled: {
    type: Number,
    default: 0
  },
  notificationsSent: {
    type: Number,
    default: 0
  },
  donorsNotified: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor'
  }],
  responses: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor'
    },
    respondedAt: Date,
    response: {
      type: String,
      enum: ['willing', 'not-available', 'not-eligible']
    },
    message: String
  }],
  notes: String,
  isEmergency: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for geospatial queries
requestSchema.index({ 'location.coordinates': '2dsphere' });
requestSchema.index({ status: 1, urgency: 1 });

// Update status based on fulfillment
requestSchema.methods.updateFulfillmentStatus = function() {
  if (this.unitsFulfilled >= this.unitsRequired) {
    this.status = 'fulfilled';
  } else if (this.unitsFulfilled > 0) {
    this.status = 'partially-fulfilled';
  }
  
  if (this.requiredBy < new Date() && this.status === 'open') {
    this.status = 'expired';
  }
};

module.exports = mongoose.model('Request', requestSchema);

