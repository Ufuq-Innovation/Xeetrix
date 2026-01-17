import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerAddress: {
    type: String,
    required: true
  },
  customerCity: {
    type: String,
    default: ''
  },
  customerZone: {
    type: String,
    default: ''
  },
  packageType: {
    type: String,
    enum: ['parcel', 'document', 'fragile', 'electronics', 'other'],
    default: 'parcel'
  },
  packageWeight: {
    type: Number,
    default: 0
  },
  packageValue: {
    type: Number,
    default: 0
  },
  deliveryCharge: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'online', 'card', 'mobile_banking'],
    default: 'cash_on_delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partially_paid', 'failed'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'delivered', 'returned', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['normal', 'express', 'urgent'],
    default: 'normal'
  },
  specialInstructions: {
    type: String,
    default: ''
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courier',
    default: null
  },
  assignedCourier: {
    name: String,
    phone: String
  },
  pickupLocation: {
    type: String,
    default: ''
  },
  trackingHistory: [{
    status: String,
    location: String,
    note: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
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

// Update updatedAt on save
deliverySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Auto-generate orderId if not provided
deliverySchema.pre('save', async function(next) {
  if (!this.orderId) {
    const count = await mongoose.models.Delivery.countDocuments();
    this.orderId = `ORD-${Date.now().toString().slice(-6)}-${count + 1}`;
  }
  next();
});

export default mongoose.models.Delivery || mongoose.model('Delivery', deliverySchema);