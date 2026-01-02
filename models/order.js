import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  lotSize: { type: Number, required: true },
  direction: { type: String, default: 'Retail' },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number, required: true },
  pnl: { type: Number },
  status: { type: String },
  strategy: { type: String, default: 'Direct Sales' },
  entryDate: { type: Date, required: true },
  exitDate: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);