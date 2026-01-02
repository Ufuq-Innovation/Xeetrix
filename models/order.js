import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  symbol: { type: String, required: true }, // প্রোডাক্টের নাম
  lotSize: { type: Number, required: true }, // পরিমাণ (Quantity)
  direction: { type: String, default: 'Retail' }, // চ্যানেল (Retail/Wholesale)
  entryPrice: { type: Number, required: true }, // কেনা দাম (Cost Price)
  exitPrice: { type: Number, required: true }, // বিক্রি দাম (Selling Price)
  pnl: { type: Number }, // নিট লাভ (Net Profit)
  status: { type: String }, // লাভ না লস (Win/Loss)
  strategy: { type: String, default: 'Direct Sales' }, // বিক্রয় মাধ্যম
  entryDate: { type: Date, required: true },
  exitDate: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);