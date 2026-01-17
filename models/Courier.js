import mongoose from 'mongoose';

const courierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'car', 'van', 'truck', 'bicycle'],
    default: 'bike'
  },
  vehicleNumber: {
    type: String,
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: true
  },
  nidNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'busy'],
    default: 'active'
  },
  salaryType: {
    type: String,
    enum: ['commission', 'fixed', 'mixed'],
    default: 'commission'
  },
  commissionRate: {
    type: Number,
    default: 15
  },
  baseSalary: {
    type: Number,
    default: 0
  },
  joiningDate: {
    type: Date,
    required: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  currentLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  successfulDeliveries: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.Courier || mongoose.model('Courier', courierSchema);