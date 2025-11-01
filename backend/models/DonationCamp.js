const mongoose = require('mongoose');

const donationCampSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodBank',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    address: {
      type: String,
      required: true
    },
    city: String,
    state: String,
    landmark: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: String,
  endTime: String,
  targetDonors: {
    type: Number,
    default: 50
  },
  registeredDonors: {
    type: [{
      donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donor'
      },
      registeredAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['registered', 'confirmed', 'attended', 'cancelled'],
        default: 'registered'
      },
      donatedAt: Date
    }],
    default: []
  },
  facilities: [String],
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  requirements: {
    bloodTypes: [{
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    }],
    components: [String]
  },
  imageUrl: String
}, {
  timestamps: true
});

donationCampSchema.index({ 'location.coordinates': '2dsphere' });
donationCampSchema.index({ startDate: 1, status: 1 });

module.exports = mongoose.model('DonationCamp', donationCampSchema);

