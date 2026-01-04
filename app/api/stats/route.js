import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("xeetrix");

    // ১. সব অর্ডার এবং সব খরচ (Expenses) নিয়ে আসা
    const orders = await db.collection("orders").find({}).toArray();
    const expenses = await db.collection("expenses").find({}).toArray(); // আমরা ফিন্যান্স থেকে এখানে ডাটা পাঠাবো

    // ২. বিক্রয় ও অর্ডারের লাভ হিসাব
    const totalSales = orders.reduce((sum, order) => sum + (Number(order.sellingPrice) * Number(order.quantity)), 0);
    const orderProfit = orders.reduce((sum, order) => sum + (Number(order.netProfit) || 0), 0);
    const totalOrders = orders.length;

    // ৩. মোট খরচ হিসাব
    const totalExpense = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    // ৪. প্রকৃত নিট লাভ (অর্ডারের লাভ - খরচ)
    const netProfit = orderProfit - totalExpense;

    return NextResponse.json({
      success: true,
      stats: {
        totalSales,
        totalProfit: netProfit, // এখানে আমরা খরচ বাদ দিয়ে আসল লাভ পাঠাচ্ছি
        totalOrders,
        totalExpense // ফিন্যান্স কার্ডে দেখানোর জন্য এটিও পাঠালাম
      }
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}