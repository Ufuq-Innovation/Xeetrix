import mongoose from 'mongoose';

const TradeSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  direction: { type: String, enum: ['Buy', 'Sell'], required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number, required: true },
  sl: { type: Number },
  tp: { type: Number },
  lotSize: { type: Number, required: true },
  pnl: { type: Number },
  status: { type: String, enum: ['Win', 'Loss', 'Breakeven'] },
  rrr: { type: Number },
  duration: { type: String },
  entryDate: { type: Date, required: true },
  exitDate: { type: Date, required: true },
  notes: { type: String },
  strategy: { type: String },
}, { timestamps: true });

export default mongoose.models.Trade || mongoose.model('Trade', TradeSchema);