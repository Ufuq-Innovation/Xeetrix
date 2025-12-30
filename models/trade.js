import mongoose from 'mongoose';

const TradeSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  direction: { type: String, enum: ['Buy', 'Sell'], required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number, required: true },
  lotSize: { type: Number, required: true },
  sl: { type: Number, default: 0 },
  tp: { type: Number, default: 0 },
  pnl: { type: Number, default: 0 },
  status: { type: String, enum: ['Win', 'Loss', 'Breakeven'] },
  rrr: { type: Number, default: 0 },
  duration: { type: String },
  session: { type: String },
  closeType: { type: String },
  strategy: { type: String, default: 'SMC' },
  entryDate: { type: Date, required: true },
  exitDate: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.Trade || mongoose.model('Trade', TradeSchema);
