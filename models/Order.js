import mongoose from 'mongoose';

/**
 * Order Schema definition for E-commerce Business Control Room
 */
const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  courierCost: { type: Number, default: 0 },
  otherExpense: { type: Number, default: 0 },
  netProfit: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Pending', 'Delivered', 'Returned', 'Shipped'], 
    default: 'Pending' 
  },
  lang: { type: String, default: 'bn' }
}, { 
  timestamps: true // Automatically creates 'createdAt' and 'updatedAt'
});

/**
 * Model Export
 * Using PascalCase 'Order' as per industry standard for models.
 */
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;