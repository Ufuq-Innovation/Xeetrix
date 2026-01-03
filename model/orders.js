import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerName: String,
  customerPhone: String,
  productName: String,
  quantity: Number,
  costPrice: Number,      // কেনা দাম (৳)
  sellingPrice: Number,   // বিক্রি দাম (৳)
  courierCost: Number,    // কুরিয়ার খরচ (৳)
  otherExpense: Number,   // অন্যান্য খরচ (৳)
  netProfit: Number,      // নিট লাভ (অটো ক্যালকুলেটেড)
  status: { type: String, default: 'Pending' }, // Pending, Delivered, Returned
  lang: { type: String, default: 'bn' }
}, { timestamps: true });

// এখানে 'models' (বহুবচন) ব্যবহার করুন
export default mongoose.models.order || mongoose.model('order', orderSchema);